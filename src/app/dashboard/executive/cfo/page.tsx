/**
 * @file page.tsx - CFO Dashboard
 * @description لوحة تحكم المدير المالي
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { getCFODashboardData, type CFODashboardData, type KPI } from '@/lib/executive-dashboard-service';
import { t } from '@/lib/translations';

export default function CFODashboardPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CFODashboardData | null>(null);
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const range = getDateRange(dateRange);
      const dashboardData = await getCFODashboardData(user?.propertyId || 'default', {
        start: range.start,
        end: range.end,
        compareWith: 'previous-period'
      });
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading CFO dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();

    switch (period) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {locale === 'ar' ? 'لوحة المدير المالي' : 'CFO Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'تحليل مالي متعمق وتقارير تفصيلية' : 'Deep financial analysis and detailed reports'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="month">{locale === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="quarter">{locale === 'ar' ? 'آخر 3 أشهر' : 'Last Quarter'}</option>
            <option value="year">{locale === 'ar' ? 'آخر سنة' : 'Last Year'}</option>
          </select>

          {/* Export Buttons */}
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          {locale === 'ar' ? 'النظرة المالية' : 'Financial Overview'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialKPICard kpi={data.financial.revenue} color="green" />
          <FinancialKPICard kpi={data.financial.expenses} color="red" />
          <FinancialKPICard kpi={data.financial.profit} color="blue" />
          <FinancialKPICard kpi={data.financial.profitMargin} color="purple" />
        </div>
      </div>

      {/* Cash Flow */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          {locale === 'ar' ? 'التدفق النقدي' : 'Cash Flow'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MiniKPICard kpi={data.cashFlow.operatingCashFlow} />
          <MiniKPICard kpi={data.cashFlow.investingCashFlow} />
          <MiniKPICard kpi={data.cashFlow.financingCashFlow} />
          <MiniKPICard kpi={data.cashFlow.netCashFlow} />
        </div>
      </div>

      {/* Accounts Receivable & Payable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            {locale === 'ar' ? 'الذمم المدينة' : 'Accounts Receivable'}
          </h3>
          <div className="space-y-4">
            <MiniKPICard kpi={data.accountsReceivable.totalReceivable} />
            <MiniKPICard kpi={data.accountsReceivable.averageCollectionPeriod} />
            <MiniKPICard kpi={data.accountsReceivable.overdueAmount} />
            <MiniKPICard kpi={data.accountsReceivable.collectionRate} />
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            {locale === 'ar' ? 'الذمم الدائنة' : 'Accounts Payable'}
          </h3>
          <div className="space-y-4">
            <MiniKPICard kpi={data.accountsPayable.totalPayable} />
            <MiniKPICard kpi={data.accountsPayable.averagePaymentPeriod} />
            <MiniKPICard kpi={data.accountsPayable.overdueAmount} />
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'الإيرادات حسب الفئة' : 'Revenue by Category'}
          </h3>
          <Pie
            data={{
              labels: data.breakdown.revenueByCategory.map(d => d.category),
              datasets: [
                {
                  data: data.breakdown.revenueByCategory.map(d => d.amount),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'المصروفات حسب الفئة' : 'Expenses by Category'}
          </h3>
          <Doughnut
            data={{
              labels: data.breakdown.expensesByCategory.map(d => d.category),
              datasets: [
                {
                  data: data.breakdown.expensesByCategory.map(d => d.amount),
                  backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(34, 197, 94, 0.7)'
                  ]
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>

        {/* Profit by Month */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'صافي الربح الشهري' : 'Monthly Net Profit'}
          </h3>
          <Bar
            data={{
              labels: data.breakdown.profitByMonth.map(d => d.month),
              datasets: [
                {
                  label: locale === 'ar' ? 'صافي الربح' : 'Net Profit',
                  data: data.breakdown.profitByMonth.map(d => d.profit),
                  backgroundColor: data.breakdown.profitByMonth.map(d =>
                    d.profit >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                  )
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
      </div>
    </div>
  );
}

// ====================================
// Financial KPI Card Component
// ====================================

interface FinancialKPICardProps {
  kpi: KPI;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function FinancialKPICard({ kpi, color }: FinancialKPICardProps) {
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
      className="relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200"
    >
      {/* Icon/Indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">{kpi.label}</span>
        {kpi.change !== undefined && (
          <div className="flex items-center gap-1">
            {kpi.changeType === 'increase' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(kpi.change || 0).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {formatValue(kpi.value, kpi.unit)}
      </p>

      {/* Target Progress */}
      {kpi.target && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{locale === 'ar' ? 'الهدف' : 'Target'}</span>
            <span>{formatValue(kpi.target, kpi.unit)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]}`}
              style={{ width: `${Math.min(100, ((typeof kpi.value === 'number' ? kpi.value : 0) / kpi.target) * 100)}%` }}
            ></div>
          </div>
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
      if (unit === 'days') {
        return `${value} ${locale === 'ar' ? 'يوم' : 'days'}`;
      }
      return value.toLocaleString('ar-SA');
    }
    return value;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
