'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Clock, Calendar, TrendingUp } from 'lucide-react';

// دالة لتنسيق الأرقام بشكل آمن (تتجنب مشكلة Hydration)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

interface HRStatsProps {
  employees: any[];
  attendances: any[];
  leaves: any[];
}

export function HRStats({ employees, attendances, leaves }: HRStatsProps) {
  const totalEmployees = employees.length;
  const presentToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return attendances.filter(a => a.date === today && a.checkIn).length;
  }, [attendances]);

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;

  const departmentCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    employees.forEach(emp => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [employees]);

  const attendancePercentage = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const StatCard = ({ title, value, icon: Icon, color, bgColor, children }: any) => (
    <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur-md overflow-hidden group relative`}>
      <div className="p-5 transition-all duration-300 group-hover:-translate-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-white">{title}</CardTitle>
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-700/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4">
        {children}
      </div>
    </Card>
  );

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-20 h-20">
        <svg className="w-full h-full" viewBox="0 0 80 80">
          <circle
            className="text-slate-600"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
          />
          <circle
            className="text-green-400"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="40"
            cy="40"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="إجمالي الموظفين"
        value={formatNumber(totalEmployees)}
        icon={Users}
        color="text-blue-400"
        bgColor="bg-blue-500/20"
      >
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-white">الأقسام الرئيسية:</h4>
          {departmentCounts.map(([dept, count]) => (
            <div key={dept} className="flex justify-between text-xs text-slate-300">
              <span>{dept}</span>
              <span>{count} موظفين</span>
            </div>
          ))}
        </div>
      </StatCard>

      <StatCard
        title="الحضور اليوم"
        value={formatNumber(presentToday)}
        icon={Clock}
        color="text-green-400"
        bgColor="bg-green-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-semibold">نسبة الحضور</p>
            <p className="text-xs text-slate-300">{presentToday} من {totalEmployees}</p>
          </div>
          <CircularProgress percentage={attendancePercentage} />
        </div>
      </StatCard>

      <StatCard
        title="طلبات الإجازة"
        value={formatNumber(pendingLeaves)}
        icon={Calendar}
        color="text-orange-400"
        bgColor="bg-orange-500/20"
      >
        <div className="space-y-1 text-white">
          <h4 className="text-sm font-semibold">تفاصيل الطلبات:</h4>
          <div className="flex justify-between text-xs"><span>معلقة:</span> <span>{pendingLeaves}</span></div>
          <div className="flex justify-between text-xs"><span>موافق عليها:</span> <span>{approvedLeaves}</span></div>
        </div>
      </StatCard>

      <StatCard
        title="إجمالي الرواتب"
        value={`${formatNumber(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / 1000)}k`}
        icon={DollarSign}
        color="text-purple-400"
        bgColor="bg-purple-500/20"
      >
        <p className="text-sm text-slate-300">هذا الرقم يمثل إجمالي الرواتب الأساسية الشهرية لجميع الموظفين النشطين.</p>
      </StatCard>
    </div>
  );
}