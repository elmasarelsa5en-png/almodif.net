/**
 * @file page.tsx - Sales Dashboard
 * @description لوحة تحكم المبيعات
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getSalesDashboardData, type SalesDashboardData, type KPI } from '@/lib/executive-dashboard-service';

export default function SalesDashboardPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const range = getDateRange(dateRange);
      const dashboardData = await getSalesDashboardData(user?.propertyId || 'default', {
        start: range.start,
        end: range.end,
        compareWith: 'previous-period'
      });
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading Sales dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const end = new Date();
    const start = new Date();

    switch (period) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {locale === 'ar' ? 'لوحة المبيعات' : 'Sales Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'أداء الحجوزات والإيرادات' : 'Bookings & Revenue Performance'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">{locale === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
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

      {/* Sales Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesKPICard
          kpi={data.overview.totalBookings}
          icon={<Calendar className="w-8 h-8" />}
          color="purple"
        />
        <SalesKPICard
          kpi={data.overview.totalRevenue}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
        />
        <SalesKPICard
          kpi={data.overview.averageBookingValue}
          icon={<BarChart3 className="w-8 h-8" />}
          color="blue"
        />
        <SalesKPICard
          kpi={data.overview.conversionRate}
          icon={<TrendingUp className="w-8 h-8" />}
          color="yellow"
        />
      </div>

      {/* Booking Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Channel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            {locale === 'ar' ? 'الحجوزات حسب القناة' : 'Bookings by Channel'}
          </h3>
          <Doughnut
            data={{
              labels: data.channels.bookingByChannel.map(d => d.channel),
              datasets: [
                {
                  data: data.channels.bookingByChannel.map(d => d.count),
                  backgroundColor: [
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
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

        {/* Revenue by Channel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'الإيرادات حسب القناة' : 'Revenue by Channel'}
          </h3>
          <Bar
            data={{
              labels: data.channels.bookingByChannel.map(d => d.channel),
              datasets: [
                {
                  label: locale === 'ar' ? 'الإيرادات' : 'Revenue',
                  data: data.channels.bookingByChannel.map(d => d.revenue),
                  backgroundColor: 'rgba(168, 85, 247, 0.7)'
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

      {/* Channel Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">
          {locale === 'ar' ? 'أداء القنوات (معدل التحويل)' : 'Channel Performance (Conversion Rate)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.channels.channelPerformance.map((channel, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2">{channel.channel}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${channel.conversion}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-lg font-bold">{channel.conversion}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Type Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy by Room Type */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'الإشغال حسب نوع الغرفة' : 'Occupancy by Room Type'}
          </h3>
          <Bar
            data={{
              labels: data.rooms.occupancyByRoomType.map(d => d.type),
              datasets: [
                {
                  label: locale === 'ar' ? 'الإشغال %' : 'Occupancy %',
                  data: data.rooms.occupancyByRoomType.map(d => d.occupancy),
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

        {/* Revenue by Room Type */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'الإيرادات حسب نوع الغرفة' : 'Revenue by Room Type'}
          </h3>
          <Doughnut
            data={{
              labels: data.rooms.revenueByRoomType.map(d => d.type),
              datasets: [
                {
                  data: data.rooms.revenueByRoomType.map(d => d.revenue),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(234, 179, 8, 0.7)',
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
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'اتجاه الحجوزات (شهري)' : 'Bookings Trend (Monthly)'}
          </h3>
          <Line
            data={{
              labels: data.trends.bookingsByMonth.map(d => d.month),
              datasets: [
                {
                  label: locale === 'ar' ? 'الحجوزات' : 'Bookings',
                  data: data.trends.bookingsByMonth.map(d => d.count),
                  borderColor: 'rgb(168, 85, 247)',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
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
                  data: data.trends.revenueByMonth.map(d => d.revenue),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
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

        {/* Cancellation Rate */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'معدل الإلغاء (شهري)' : 'Cancellation Rate (Monthly)'}
          </h3>
          <Line
            data={{
              labels: data.trends.cancellationRate.map(d => d.month),
              datasets: [
                {
                  label: locale === 'ar' ? 'معدل الإلغاء %' : 'Cancellation Rate %',
                  data: data.trends.cancellationRate.map(d => d.rate),
                  borderColor: 'rgb(239, 68, 68)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
      </div>
    </div>
  );
}

// ====================================
// Sales KPI Card Component
// ====================================

interface SalesKPICardProps {
  kpi: KPI;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function SalesKPICard({ kpi, icon, color }: SalesKPICardProps) {
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
