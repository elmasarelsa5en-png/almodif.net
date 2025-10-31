/**
 * @file page.tsx - GM Dashboard
 * @description لوحة تحكم المدير العام
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
  BedDouble,
  Activity,
  AlertCircle,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getGMDashboardData, type GMDashboardData, type KPI } from '@/lib/executive-dashboard-service';
import { t } from '@/lib/translations';

// تسجيل Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function GMDashboardPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GMDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const range = getDateRange(dateRange);
      const dashboardData = await getGMDashboardData(user?.propertyId || 'default', {
        start: range.start,
        end: range.end,
        compareWith: 'previous-period'
      });
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading GM dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  };

  const exportToPDF = () => {
    // TODO: تصدير إلى PDF
    console.log('Export to PDF');
  };

  const exportToExcel = () => {
    // TODO: تصدير إلى Excel
    console.log('Export to Excel');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {locale === 'ar' ? 'لوحة المدير العام' : 'GM Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'نظرة شاملة على أداء المنشأة' : 'Comprehensive property performance overview'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">{locale === 'ar' ? 'اليوم' : 'Today'}</option>
            <option value="week">{locale === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
            <option value="month">{locale === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="quarter">{locale === 'ar' ? 'آخر 3 أشهر' : 'Last Quarter'}</option>
            <option value="year">{locale === 'ar' ? 'آخر سنة' : 'Last Year'}</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          kpi={data.overview.totalRevenue}
          icon={<DollarSign className="w-8 h-8" />}
          color="blue"
        />
        <KPICard
          kpi={data.overview.occupancyRate}
          icon={<BedDouble className="w-8 h-8" />}
          color="green"
        />
        <KPICard
          kpi={data.overview.averageRating}
          icon={<Star className="w-8 h-8" />}
          color="yellow"
        />
        <KPICard
          kpi={data.overview.totalGuests}
          icon={<Users className="w-8 h-8" />}
          color="purple"
        />
      </div>

      {/* Financial KPIs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          {locale === 'ar' ? 'المؤشرات المالية' : 'Financial Metrics'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniKPICard kpi={data.financial.netProfit} />
          <MiniKPICard kpi={data.financial.operatingExpenses} />
          <MiniKPICard kpi={data.financial.revPAR} />
          <MiniKPICard kpi={data.financial.cashFlow} />
        </div>
      </div>

      {/* Operations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-600" />
          {locale === 'ar' ? 'العمليات اليومية' : 'Daily Operations'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniKPICard kpi={data.operations.checkInsToday} />
          <MiniKPICard kpi={data.operations.checkOutsToday} />
          <MiniKPICard kpi={data.operations.pendingMaintenance} />
          <MiniKPICard kpi={data.operations.activeStaff} />
        </div>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'اتجاه الإيرادات (شهري)' : 'Revenue Trend (Monthly)'}
          </h3>
          <Line
            data={{
              labels: data.trends.revenueByMonth.map(d => d.month),
              datasets: [
                {
                  label: locale === 'ar' ? 'الإيرادات' : 'Revenue',
                  data: data.trends.revenueByMonth.map(d => d.value),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>

        {/* Occupancy Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'معدل الإشغال (شهري)' : 'Occupancy Rate (Monthly)'}
          </h3>
          <Bar
            data={{
              labels: data.trends.occupancyByMonth.map(d => d.month),
              datasets: [
                {
                  label: locale === 'ar' ? 'الإشغال %' : 'Occupancy %',
                  data: data.trends.occupancyByMonth.map(d => d.value),
                  backgroundColor: 'rgba(34, 197, 94, 0.7)'
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>

        {/* Guest Satisfaction */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'رضا الضيوف (آخر 30 يوم)' : 'Guest Satisfaction (Last 30 Days)'}
          </h3>
          <Line
            data={{
              labels: data.trends.guestSatisfaction.map(d => d.date),
              datasets: [
                {
                  label: locale === 'ar' ? 'التقييم' : 'Rating',
                  data: data.trends.guestSatisfaction.map(d => d.rating),
                  borderColor: 'rgb(234, 179, 8)',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  fill: true,
                  tension: 0.4
                }
              ]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  min: 0,
                  max: 5
                }
              },
              plugins: {
                legend: { display: false }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ====================================
// KPI Card Component
// ====================================

interface KPICardProps {
  kpi: KPI;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function KPICard({ kpi, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number') {
      if (unit === 'SAR') {
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
          maximumFractionDigits: 0
        }).format(value);
      }
      if (unit === 'percentage') {
        return `${value}%`;
      }
      return value.toLocaleString('ar-SA');
    }
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>

      {/* Icon */}
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
        {icon}
      </div>

      {/* Label */}
      <p className="text-gray-600 text-sm mb-2">{kpi.label}</p>

      {/* Value */}
      <p className="text-3xl font-bold mb-2">{formatValue(kpi.value, kpi.unit)}</p>

      {/* Change */}
      {kpi.change !== undefined && (
        <div className="flex items-center gap-2">
          {kpi.changeType === 'increase' ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(kpi.change).toFixed(1)}%
          </span>
        </div>
      )}

      {/* Status Badge */}
      {kpi.status && (
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              kpi.status === 'good'
                ? 'bg-green-100 text-green-700'
                : kpi.status === 'warning'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {kpi.status === 'good' ? '✓ ممتاز' : kpi.status === 'warning' ? '⚠ جيد' : '✗ يحتاج تحسين'}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ====================================
// Mini KPI Card Component
// ====================================

function MiniKPICard({ kpi }: { kpi: KPI }) {
  const formatValue = (value: number | string, unit?: string) => {
    if (typeof value === 'number') {
      if (unit === 'SAR') {
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
          maximumFractionDigits: 0
        }).format(value);
      }
      if (unit === 'percentage') {
        return `${value}%`;
      }
      return value.toLocaleString('ar-SA');
    }
    return value;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-gray-600 text-sm mb-2">{kpi.label}</p>
      <p className="text-2xl font-bold">{formatValue(kpi.value, kpi.unit)}</p>
      {kpi.status && (
        <span
          className={`inline-block mt-2 w-2 h-2 rounded-full ${
            kpi.status === 'good' ? 'bg-green-500' : kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        ></span>
      )}
    </div>
  );
}
