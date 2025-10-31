/**
 * @file page.tsx - Guest Segmentation Dashboard
 * @description لوحة تحليل شرائح العملاء
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Crown,
  Target,
  Mail,
  Phone,
  MessageSquare,
  Gift,
  BarChart3,
  Download,
  Filter
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';
import { analyzeGuestSegments, analyzeGuestBehavior } from '@/lib/ai-forecasting-service';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface GuestSegment {
  name: string;
  count: number;
  percentage: number;
  avgRevenue: number;
  characteristics: string[];
  recommendations: string[];
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
}

export default function GuestSegmentationPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [segmentData, setSegmentData] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const propertyId = user?.propertyId || 'default';
      const segments = await analyzeGuestSegments(propertyId);
      setSegmentData(segments);
    } catch (error) {
      console.error('Error loading segment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg text-gray-600 animate-pulse">
          {locale === 'ar' ? '📊 جاري تحليل شرائح العملاء...' : '📊 Analyzing Guest Segments...'}
        </p>
      </div>
    );
  }

  const segmentColors = {
    VIP: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-600', border: 'border-yellow-500' },
    Regular: { bg: 'from-blue-500 to-indigo-500', text: 'text-blue-600', border: 'border-blue-500' },
    'Low-Value': { bg: 'from-gray-400 to-gray-500', text: 'text-gray-600', border: 'border-gray-500' },
    'At-Risk': { bg: 'from-red-500 to-pink-500', text: 'text-red-600', border: 'border-red-500' }
  };

  // تجهيز بيانات الرسم البياني
  const doughnutData = {
    labels: segmentData?.segments.map((s: any) => s.name) || [],
    datasets: [{
      data: segmentData?.segments.map((s: any) => s.count) || [],
      backgroundColor: [
        'rgba(234, 179, 8, 0.8)',   // VIP - Yellow
        'rgba(59, 130, 246, 0.8)',  // Regular - Blue
        'rgba(156, 163, 175, 0.8)', // Low-Value - Gray
        'rgba(239, 68, 68, 0.8)'    // At-Risk - Red
      ],
      borderColor: [
        'rgba(234, 179, 8, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(156, 163, 175, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  const revenueBarData = {
    labels: segmentData?.segments.map((s: any) => s.name) || [],
    datasets: [{
      label: locale === 'ar' ? 'متوسط الإيراد (ر.س)' : 'Avg Revenue (SAR)',
      data: segmentData?.segments.map((s: any) => s.avgRevenue) || [],
      backgroundColor: [
        'rgba(234, 179, 8, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(156, 163, 175, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderColor: [
        'rgba(234, 179, 8, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(156, 163, 175, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-600" />
            {locale === 'ar' ? 'تحليل شرائح العملاء' : 'Guest Segmentation Analysis'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'تصنيف ذكي للعملاء واستراتيجيات تسويقية مستهدفة' : 'Smart guest classification and targeted marketing strategies'}
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="30">{locale === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value="90">{locale === 'ar' ? 'آخر 3 أشهر' : 'Last 3 Months'}</option>
            <option value="180">{locale === 'ar' ? 'آخر 6 أشهر' : 'Last 6 Months'}</option>
            <option value="365">{locale === 'ar' ? 'آخر سنة' : 'Last Year'}</option>
          </select>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {locale === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title={locale === 'ar' ? 'إجمالي العملاء' : 'Total Guests'}
          value={segmentData?.totalGuests || 0}
          icon={<Users className="w-8 h-8" />}
          color="purple"
        />
        <OverviewCard
          title={locale === 'ar' ? 'عملاء VIP' : 'VIP Guests'}
          value={segmentData?.segments.find((s: any) => s.name === 'VIP')?.count || 0}
          icon={<Crown className="w-8 h-8" />}
          color="yellow"
          percentage={segmentData?.segments.find((s: any) => s.name === 'VIP')?.percentage || 0}
        />
        <OverviewCard
          title={locale === 'ar' ? 'عملاء في خطر' : 'At-Risk Guests'}
          value={segmentData?.segments.find((s: any) => s.name === 'At-Risk')?.count || 0}
          icon={<AlertCircle className="w-8 h-8" />}
          color="red"
          percentage={segmentData?.segments.find((s: any) => s.name === 'At-Risk')?.percentage || 0}
        />
        <OverviewCard
          title={locale === 'ar' ? 'متوسط الإيراد' : 'Avg Revenue'}
          value={`${(segmentData?.totalRevenue / segmentData?.totalGuests || 0).toLocaleString('ar-SA')} ر.س`}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            {locale === 'ar' ? 'توزيع الشرائح' : 'Segment Distribution'}
          </h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: { size: 12 },
                      padding: 15
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Revenue Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            {locale === 'ar' ? 'متوسط الإيراد لكل شريحة' : 'Avg Revenue per Segment'}
          </h2>
          <div className="h-80">
            <Bar
              data={revenueBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.parsed.y.toLocaleString('ar-SA')} ر.س`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString('ar-SA') + ' ر.س';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segmentData?.segments.map((segment: any, idx: number) => (
          <SegmentCard
            key={idx}
            segment={segment}
            locale={locale}
            colors={segmentColors[segment.name as keyof typeof segmentColors]}
            onSelect={() => setSelectedSegment(segment.name)}
          />
        ))}
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          {locale === 'ar' ? 'التوصيات الاستراتيجية' : 'Strategic Recommendations'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VIP Strategy */}
          <StrategyCard
            title={locale === 'ar' ? 'استراتيجية عملاء VIP' : 'VIP Strategy'}
            icon={<Crown className="w-6 h-6 text-yellow-600" />}
            recommendations={[
              locale === 'ar' ? '🎁 برنامج ولاء حصري مع مكافآت فاخرة' : '🎁 Exclusive loyalty program with luxury rewards',
              locale === 'ar' ? '📧 رسائل بريدية شخصية بعروض خاصة' : '📧 Personalized emails with special offers',
              locale === 'ar' ? '🏆 ترقيات مجانية للغرف تلقائياً' : '🏆 Automatic free room upgrades',
              locale === 'ar' ? '☎️ خط ساخن مخصص 24/7' : '☎️ Dedicated 24/7 hotline',
              locale === 'ar' ? '🍾 هدايا ترحيبية فاخرة' : '🍾 Luxury welcome gifts'
            ]}
            color="yellow"
          />

          {/* Regular Strategy */}
          <StrategyCard
            title={locale === 'ar' ? 'استراتيجية العملاء المنتظمين' : 'Regular Guests Strategy'}
            icon={<Star className="w-6 h-6 text-blue-600" />}
            recommendations={[
              locale === 'ar' ? '⭐ تحفيزهم للانضمام لبرنامج الولاء' : '⭐ Encourage loyalty program enrollment',
              locale === 'ar' ? '💳 عروض الحزم الموسمية' : '💳 Seasonal package deals',
              locale === 'ar' ? '📱 تطبيق جوال مع نقاط مكافآت' : '📱 Mobile app with reward points',
              locale === 'ar' ? '🎉 خصومات على المناسبات الخاصة' : '🎉 Special occasion discounts',
              locale === 'ar' ? '📧 نشرة شهرية بالعروض' : '📧 Monthly newsletter with deals'
            ]}
            color="blue"
          />

          {/* At-Risk Strategy */}
          <StrategyCard
            title={locale === 'ar' ? 'استراتيجية استعادة العملاء' : 'Win-Back Strategy'}
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            recommendations={[
              locale === 'ar' ? '🔔 حملة استعادة بخصم 30%' : '🔔 Win-back campaign with 30% discount',
              locale === 'ar' ? '📞 مكالمات شخصية للاستفسار' : '📞 Personal calls to inquire',
              locale === 'ar' ? '📧 رسالة "نحن نفتقدك" مع عرض خاص' : '📧 "We miss you" email with special offer',
              locale === 'ar' ? '🎁 كوبون هدية للزيارة القادمة' : '🎁 Gift coupon for next visit',
              locale === 'ar' ? '⚡ عروض محدودة الوقت' : '⚡ Limited-time flash offers'
            ]}
            color="red"
          />

          {/* Low-Value Strategy */}
          <StrategyCard
            title={locale === 'ar' ? 'استراتيجية تطوير القيمة' : 'Value Development Strategy'}
            icon={<TrendingUp className="w-6 h-6 text-gray-600" />}
            recommendations={[
              locale === 'ar' ? '📈 عروض Upselling للغرف الأعلى' : '📈 Upselling offers for premium rooms',
              locale === 'ar' ? '🍽️ باقات إضافية (سبا، مطعم)' : '🍽️ Add-on packages (spa, dining)',
              locale === 'ar' ? '🎯 حملات تسويقية مستهدفة' : '🎯 Targeted marketing campaigns',
              locale === 'ar' ? '💎 برامج تعريفية بالخدمات الراقية' : '💎 Introduction to premium services',
              locale === 'ar' ? '🏅 حوافز للحجوزات الأطول' : '🏅 Incentives for longer stays'
            ]}
            color="gray"
          />
        </div>
      </div>

      {/* Marketing Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          {locale === 'ar' ? 'إجراءات تسويقية سريعة' : 'Quick Marketing Actions'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={<Mail className="w-5 h-5" />}
            label={locale === 'ar' ? 'إرسال حملة بريدية' : 'Send Email Campaign'}
            description={locale === 'ar' ? 'استهدف شريحة معينة' : 'Target specific segment'}
            color="blue"
          />
          <ActionButton
            icon={<MessageSquare className="w-5 h-5" />}
            label={locale === 'ar' ? 'رسائل WhatsApp' : 'WhatsApp Messages'}
            description={locale === 'ar' ? 'تواصل فوري ومباشر' : 'Instant direct communication'}
            color="green"
          />
          <ActionButton
            icon={<Gift className="w-5 h-5" />}
            label={locale === 'ar' ? 'إنشاء عرض خاص' : 'Create Special Offer'}
            description={locale === 'ar' ? 'عروض حصرية مخصصة' : 'Exclusive custom offers'}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

// ====================================
// Overview Card Component
// ====================================

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'purple' | 'yellow' | 'red' | 'green';
  percentage?: number;
}

function OverviewCard({ title, value, icon, color, percentage }: OverviewCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-indigo-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
        {icon}
      </div>

      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {percentage !== undefined && (
        <p className="text-sm text-gray-500">
          {percentage.toFixed(1)}% من الإجمالي
        </p>
      )}
    </motion.div>
  );
}

// ====================================
// Segment Card Component
// ====================================

interface SegmentCardProps {
  segment: any;
  locale: string;
  colors: any;
  onSelect: () => void;
}

function SegmentCard({ segment, locale, colors, onSelect }: SegmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-2 ${colors.border} cursor-pointer`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`text-2xl font-bold ${colors.text}`}>{segment.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{segment.count} {locale === 'ar' ? 'عميل' : 'guests'}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{segment.percentage.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">{locale === 'ar' ? 'من الإجمالي' : 'of total'}</p>
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">{locale === 'ar' ? 'متوسط الإيراد' : 'Avg Revenue'}</p>
        <p className="text-2xl font-bold text-green-600">
          {segment.avgRevenue.toLocaleString('ar-SA')} {locale === 'ar' ? 'ر.س' : 'SAR'}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">{locale === 'ar' ? 'الخصائص:' : 'Characteristics:'}</p>
        <div className="flex flex-wrap gap-2">
          {segment.characteristics.map((char: string, i: number) => (
            <span key={i} className={`inline-block text-xs bg-gradient-to-r ${colors.bg} text-white px-3 py-1 rounded-full`}>
              {char}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">{locale === 'ar' ? 'التوصيات:' : 'Recommendations:'}</p>
        <ul className="space-y-1">
          {segment.recommendations.slice(0, 3).map((rec: string, i: number) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
              <CheckCircle className={`w-3 h-3 ${colors.text} flex-shrink-0 mt-0.5`} />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ====================================
// Strategy Card Component
// ====================================

interface StrategyCardProps {
  title: string;
  icon: React.ReactNode;
  recommendations: string[];
  color: 'yellow' | 'blue' | 'red' | 'gray';
}

function StrategyCard({ title, icon, recommendations, color }: StrategyCardProps) {
  const colorClasses = {
    yellow: 'border-yellow-500 bg-yellow-50',
    blue: 'border-blue-500 bg-blue-50',
    red: 'border-red-500 bg-red-50',
    gray: 'border-gray-500 bg-gray-50'
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="flex-shrink-0">{rec.split(' ')[0]}</span>
            <span>{rec.split(' ').slice(1).join(' ')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ====================================
// Action Button Component
// ====================================

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

function ActionButton({ icon, label, description, color }: ActionButtonProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
    green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    purple: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-r ${colorClasses[color]} text-white rounded-lg p-4 shadow-lg flex items-start gap-3 text-left transition-all`}
    >
      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-xs opacity-90">{description}</p>
      </div>
    </motion.button>
  );
}
