/**
 * @file page.tsx - GM Dashboard
 * @description لوحة تحكم المدير العام
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
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
  const { user } = useAuth();
  const { t, language } = useLanguage();
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
      const dashboardData = await getGMDashboardData(user?.email || 'default', {
        start: range.start,
        end: range.end,
        compareWith: 'previous-period'
      });
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading GM dashboard:', error);
      // استخدام بيانات تجريبية في حالة الخطأ
      setData(getMockGMData());
    } finally {
      setLoading(false);
    }
  };

  const getMockGMData = (): GMDashboardData => {
    return {
      overview: {
        totalRevenue: {
          label: 'إجمالي الإيرادات',
          value: 458750,
          change: 12.5,
          changeType: 'increase',
          unit: 'SAR',
          target: 500000,
          status: 'good'
        },
        occupancyRate: {
          label: 'معدل الإشغال',
          value: '78.5',
          change: 5.2,
          changeType: 'increase',
          unit: 'percentage',
          target: 80,
          status: 'warning'
        },
        averageRating: {
          label: 'متوسط التقييم',
          value: '4.6',
          change: 0.3,
          changeType: 'increase',
          unit: 'number',
          target: 4.5,
          status: 'good'
        },
        totalGuests: {
          label: 'إجمالي الضيوف',
          value: 1247,
          change: 8.7,
          changeType: 'increase',
          unit: 'number',
          target: 1000,
          status: 'good'
        }
      },
      financial: {
        netProfit: {
          label: 'صافي الربح',
          value: 285000,
          change: 15.3,
          changeType: 'increase',
          unit: 'SAR',
          target: 300000,
          status: 'good'
        },
        operatingExpenses: {
          label: 'المصروفات التشغيلية',
          value: 173750,
          change: -3.2,
          changeType: 'decrease',
          unit: 'SAR',
          target: 150000,
          status: 'warning'
        },
        revPAR: {
          label: 'الإيراد لكل غرفة متاحة',
          value: 425,
          change: 10.5,
          changeType: 'increase',
          unit: 'SAR',
          target: 500,
          status: 'good'
        },
        cashFlow: {
          label: 'التدفق النقدي',
          value: 320000,
          change: 18.2,
          changeType: 'increase',
          unit: 'SAR',
          target: 350000,
          status: 'good'
        }
      },
      operations: {
        checkInsToday: {
          label: 'وصول اليوم',
          value: 12,
          unit: 'number',
          status: 'good'
        },
        checkOutsToday: {
          label: 'مغادرة اليوم',
          value: 8,
          unit: 'number',
          status: 'good'
        },
        pendingMaintenance: {
          label: 'صيانة معلقة',
          value: 3,
          unit: 'number',
          status: 'warning'
        },
        activeStaff: {
          label: 'الموظفون النشطون',
          value: 24,
          unit: 'number',
          status: 'good'
        }
      },
      trends: {
        revenueByMonth: [
          { month: 'يناير', value: 380000 },
          { month: 'فبراير', value: 420000 },
          { month: 'مارس', value: 450000 },
          { month: 'أبريل', value: 485000 },
          { month: 'مايو', value: 458750 }
        ],
        occupancyByMonth: [
          { month: 'يناير', value: 72 },
          { month: 'فبراير', value: 75 },
          { month: 'مارس', value: 78 },
          { month: 'أبريل', value: 82 },
          { month: 'مايو', value: 78.5 }
        ],
        guestSatisfaction: [
          { date: '2024-01', rating: 4.2 },
          { date: '2024-02', rating: 4.4 },
          { date: '2024-03', rating: 4.5 },
          { date: '2024-04', rating: 4.6 },
          { date: '2024-05', rating: 4.6 }
        ]
      }
    };
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
            {language === 'ar' ? 'لوحة المدير العام' : 'GM Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === 'ar' ? 'نظرة شاملة على أداء المنشأة' : 'Comprehensive property performance overview'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
            <option value="week">{language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
            <option value="month">{language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="quarter">{language === 'ar' ? 'آخر 3 أشهر' : 'Last Quarter'}</option>
            <option value="year">{language === 'ar' ? 'آخر سنة' : 'Last Year'}</option>
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
          {language === 'ar' ? 'المؤشرات المالية' : 'Financial Metrics'}
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
          {language === 'ar' ? 'العمليات اليومية' : 'Daily Operations'}
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
            {language === 'ar' ? 'اتجاه الإيرادات (شهري)' : 'Revenue Trend (Monthly)'}
          </h3>
          <Line
            data={{
              labels: data.trends.revenueByMonth.map(d => d.month),
              datasets: [
                {
                  label: language === 'ar' ? 'الإيرادات' : 'Revenue',
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
            {language === 'ar' ? 'معدل الإشغال (شهري)' : 'Occupancy Rate (Monthly)'}
          </h3>
          <Bar
            data={{
              labels: data.trends.occupancyByMonth.map(d => d.month),
              datasets: [
                {
                  label: language === 'ar' ? 'الإشغال %' : 'Occupancy %',
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
            {language === 'ar' ? 'رضا الضيوف (آخر 30 يوم)' : 'Guest Satisfaction (Last 30 Days)'}
          </h3>
          <Line
            data={{
              labels: data.trends.guestSatisfaction.map(d => d.date),
              datasets: [
                {
                  label: language === 'ar' ? 'التقييم' : 'Rating',
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
