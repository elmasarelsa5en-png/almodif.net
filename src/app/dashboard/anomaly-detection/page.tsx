/**
 * @file page.tsx - Anomaly Detection Dashboard
 * @description لوحة كشف الشذوذات
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  XCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  Users,
  Download
} from 'lucide-react';
import {
  detectAnomalies,
  predictOccupancy,
  analyzeGuestSegments,
  type AnomalyDetection,
  type OccupancyPrediction
} from '@/lib/ai-forecasting-service';

export default function AnomalyDetectionPage() {
  const { user, locale } = useAuth();
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [occupancyPrediction, setOccupancyPrediction] = useState<OccupancyPrediction | null>(null);
  const [guestSegments, setGuestSegments] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const propertyId = user?.propertyId || 'default';
      
      // كشف الشذوذات (آخر 30 يوم)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const anomaliesData = await detectAnomalies(propertyId, {
        start: startDate,
        end: endDate
      });
      setAnomalies(anomaliesData);

      // توقع الإشغال (30 يوم قادمة)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);
      const occupancy = await predictOccupancy(propertyId, targetDate);
      setOccupancyPrediction(occupancy);

      // تحليل شرائح الضيوف
      const segments = await analyzeGuestSegments(propertyId);
      setGuestSegments(segments);
    } catch (error) {
      console.error('Error loading anomaly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mb-4"></div>
        <p className="text-lg text-gray-600 animate-pulse">
          {locale === 'ar' ? '🔍 جاري كشف الشذوذات...' : '🔍 Detecting Anomalies...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-600" />
            {locale === 'ar' ? 'كشف الشذوذات والتحليل الذكي' : 'Anomaly Detection & Smart Analysis'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'رصد تلقائي للأنماط غير الطبيعية والتوصيات الذكية' : 'Automatic detection of abnormal patterns and smart recommendations'}
          </p>
        </div>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          {locale === 'ar' ? 'تصدير التقرير' : 'Export Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title={locale === 'ar' ? 'الشذوذات الحرجة' : 'Critical Anomalies'}
          value={anomalies.filter(a => a.severity === 'critical').length}
          icon={<XCircle className="w-8 h-8" />}
          color="red"
        />
        <SummaryCard
          title={locale === 'ar' ? 'تحذيرات عالية' : 'High Warnings'}
          value={anomalies.filter(a => a.severity === 'high').length}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="orange"
        />
        <SummaryCard
          title={locale === 'ar' ? 'تنبيهات متوسطة' : 'Medium Alerts'}
          value={anomalies.filter(a => a.severity === 'medium').length}
          icon={<Activity className="w-8 h-8" />}
          color="yellow"
        />
        <SummaryCard
          title={locale === 'ar' ? 'كل شيء طبيعي' : 'All Normal'}
          value={anomalies.length === 0 ? 1 : 0}
          icon={<CheckCircle className="w-8 h-8" />}
          color="green"
        />
      </div>

      {/* Occupancy Prediction */}
      {occupancyPrediction && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            {locale === 'ar' ? 'توقع معدل الإشغال (30 يوم)' : 'Occupancy Prediction (30 days)'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'ar' ? 'الإشغال الحالي' : 'Current Occupancy'}</p>
              <p className="text-4xl font-bold text-gray-700">
                {occupancyPrediction.currentOccupancy.toFixed(1)}%
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
              <p className="text-sm text-gray-600 mb-2">{locale === 'ar' ? 'الإشغال المتوقع' : 'Predicted Occupancy'}</p>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold text-blue-600">
                  {occupancyPrediction.predictedOccupancy.toFixed(1)}%
                </p>
                {occupancyPrediction.trend === 'increasing' ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : occupancyPrediction.trend === 'decreasing' ? (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                ) : null}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'ar' ? 'مستوى الثقة' : 'Confidence Level'}</p>
              <p className="text-4xl font-bold text-purple-600">
                {occupancyPrediction.confidence.toFixed(0)}%
              </p>
            </div>
          </div>

          {occupancyPrediction.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">{locale === 'ar' ? 'التوصيات' : 'Recommendations'}</h3>
              <ul className="space-y-2">
                {occupancyPrediction.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Anomalies List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          {locale === 'ar' ? 'الشذوذات المكتشفة' : 'Detected Anomalies'}
          <span className="text-sm font-normal text-gray-500">
            ({anomalies.length} {locale === 'ar' ? 'شذوذ' : 'anomalies'})
          </span>
        </h2>

        {anomalies.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl text-gray-600">
              {locale === 'ar' ? '✅ لا توجد شذوذات - كل شيء يعمل بشكل طبيعي!' : '✅ No anomalies - Everything is running normally!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly, idx) => (
              <AnomalyCard key={idx} anomaly={anomaly} locale={locale} />
            ))}
          </div>
        )}
      </div>

      {/* Guest Segments */}
      {guestSegments && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            {locale === 'ar' ? 'شرائح العملاء' : 'Guest Segments'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {guestSegments.segments.map((segment: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{segment.name}</h3>
                <p className="text-3xl font-bold text-purple-600 mb-2">{segment.count}</p>
                <p className="text-sm text-gray-600 mb-3">{segment.percentage.toFixed(1)}% من العملاء</p>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  متوسط الإيراد: {segment.avgRevenue.toLocaleString('ar-SA')} ر.س
                </p>
                <div className="space-y-1">
                  {segment.characteristics.map((char: string, i: number) => (
                    <span key={i} className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mr-1">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold mb-3">{locale === 'ar' ? 'التوصيات الاستراتيجية' : 'Strategic Recommendations'}</h3>
            <ul className="space-y-2">
              {guestSegments.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================
// Summary Card Component
// ====================================

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'orange' | 'yellow' | 'green';
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorClasses = {
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600'
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
      <p className="text-4xl font-bold">{value}</p>
    </motion.div>
  );
}

// ====================================
// Anomaly Card Component
// ====================================

function AnomalyCard({ anomaly, locale }: { anomaly: AnomalyDetection; locale: string }) {
  const severityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-gray-300 bg-gray-50'
  };

  const severityIcons = {
    critical: <XCircle className="w-6 h-6 text-red-600" />,
    high: <AlertTriangle className="w-6 h-6 text-orange-600" />,
    medium: <Activity className="w-6 h-6 text-yellow-600" />,
    low: <CheckCircle className="w-6 h-6 text-gray-600" />
  };

  const typeLabels = {
    revenue: locale === 'ar' ? 'الإيرادات' : 'Revenue',
    occupancy: locale === 'ar' ? 'الإشغال' : 'Occupancy',
    cancellation: locale === 'ar' ? 'الإلغاءات' : 'Cancellations',
    expense: locale === 'ar' ? 'المصروفات' : 'Expenses'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-2 rounded-lg p-6 ${severityColors[anomaly.severity]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {severityIcons[anomaly.severity]}
          <div>
            <h3 className="font-bold text-lg">{anomaly.description}</h3>
            <p className="text-sm text-gray-600">
              {typeLabels[anomaly.type]} • {anomaly.date}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          anomaly.severity === 'critical' ? 'bg-red-200 text-red-800' :
          anomaly.severity === 'high' ? 'bg-orange-200 text-orange-800' :
          anomaly.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
          'bg-gray-200 text-gray-800'
        }`}>
          {anomaly.severity.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">{locale === 'ar' ? 'القيمة الفعلية' : 'Actual Value'}</p>
          <p className="font-bold">
            {anomaly.type === 'revenue' || anomaly.type === 'expense'
              ? `${anomaly.value.toLocaleString('ar-SA')} ر.س`
              : `${anomaly.value.toFixed(1)}%`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">{locale === 'ar' ? 'القيمة المتوقعة' : 'Expected Value'}</p>
          <p className="font-bold">
            {anomaly.type === 'revenue' || anomaly.type === 'expense'
              ? `${anomaly.expectedValue.toLocaleString('ar-SA')} ر.س`
              : `${anomaly.expectedValue.toFixed(1)}%`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">{locale === 'ar' ? 'الانحراف' : 'Deviation'}</p>
          <p className={`font-bold ${anomaly.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-2">{locale === 'ar' ? 'الأسباب المحتملة:' : 'Possible Causes:'}</h4>
          <ul className="space-y-1">
            {anomaly.possibleCauses.map((cause, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-red-500">•</span>
                {cause}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">{locale === 'ar' ? 'التوصيات:' : 'Recommendations:'}</h4>
          <ul className="space-y-1">
            {anomaly.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
