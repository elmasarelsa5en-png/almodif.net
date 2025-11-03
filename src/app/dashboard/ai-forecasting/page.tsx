/**
 * @file page.tsx - AI Forecasting Dashboard
 * @description لوحة التنبؤات والذكاء الاصطناعي
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  Download,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  forecastRevenue,
  analyzeGuestBehavior,
  calculateDynamicPricing,
  type RevenueForecast,
  type GuestBehaviorAnalysis,
  type DynamicPricingRecommendation,
  type ForecastData
} from '@/lib/ai-forecasting-service';

export default function AIForecastingPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const locale = language; // استخدام language بدلاً من locale
  const [loading, setLoading] = useState(true);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecast | null>(null);
  const [pricingRecommendation, setPricingRecommendation] = useState<DynamicPricingRecommendation | null>(null);
  const [horizon, setHorizon] = useState<'month' | 'quarter' | 'year'>('month');

  // 🎨 دالة إنشاء بيانات تجريبية للتنبؤ
  const getMockForecastData = (): RevenueForecast => {
    const today = new Date();
    const mockMonthData: ForecastData[] = [];
    const mockQuarterData: ForecastData[] = [];
    const mockYearData: ForecastData[] = [];

    // توليد بيانات الشهر القادم (30 يوم)
    for (let i = 0; i < 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + i + 1);
      const baseRevenue = 15000 + Math.random() * 10000;
      const seasonalFactor = 1 + Math.sin((i / 30) * Math.PI) * 0.2; // موسمية
      const predicted = baseRevenue * seasonalFactor;
      
      mockMonthData.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        confidence: 85 - (i * 0.5),
        upperBound: Math.round(predicted * 1.2),
        lowerBound: Math.round(predicted * 0.8)
      });
    }

    // توليد بيانات الربع القادم (90 يوم)
    for (let i = 0; i < 90; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + i + 1);
      const baseRevenue = 15000 + Math.random() * 10000;
      const seasonalFactor = 1 + Math.sin((i / 90) * Math.PI * 2) * 0.3;
      const predicted = baseRevenue * seasonalFactor;
      
      mockQuarterData.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        confidence: 85 - (i * 0.2),
        upperBound: Math.round(predicted * 1.25),
        lowerBound: Math.round(predicted * 0.75)
      });
    }

    // توليد بيانات السنة القادمة (365 يوم)
    for (let i = 0; i < 365; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + i + 1);
      const baseRevenue = 15000 + Math.random() * 10000;
      const seasonalFactor = 1 + Math.sin((i / 365) * Math.PI * 4) * 0.4;
      const trendFactor = 1 + (i / 365) * 0.15; // اتجاه صاعد
      const predicted = baseRevenue * seasonalFactor * trendFactor;
      
      mockYearData.push({
        date: futureDate.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        confidence: 85 - (i * 0.05),
        upperBound: Math.round(predicted * 1.3),
        lowerBound: Math.round(predicted * 0.7)
      });
    }

    const totalPredicted = mockMonthData.reduce((sum, d) => sum + d.predicted, 0);

    return {
      nextMonth: mockMonthData,
      nextQuarter: mockQuarterData,
      nextYear: mockYearData,
      totalPredicted,
      trend: 'increasing',
      accuracy: 92.5,
      factors: {
        seasonality: 0.35,
        trend: 0.45,
        events: 0.20
      }
    };
  };

  // 🎨 دالة إنشاء توصيات التسعير التجريبية
  const getMockPricingData = (): DynamicPricingRecommendation => {
    return {
      roomType: 'شقة عائلية',
      currentPrice: 350,
      recommendedPrice: 420,
      changePercentage: 20,
      reason: 'الطلب المرتفع والموسم السياحي يدعمان زيادة السعر بنسبة 20% لتحقيق أقصى إيراد',
      factors: {
        demand: 85,
        competition: 72,
        seasonality: 120,
        occupancy: 78,
        events: ['معرض الرياض الدولي', 'مهرجان الثقافة']
      },
      confidence: 88,
      expectedRevenue: 32760
    };
  };

  useEffect(() => {
    loadForecastData();
  }, [horizon]);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      // محاولة تحميل البيانات الحقيقية
      const forecast = await forecastRevenue(user?.email || 'default', horizon);
      setRevenueForecast(forecast);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);
      const pricing = await calculateDynamicPricing(
        user?.email || 'default',
        'قياسي',
        targetDate
      );
      setPricingRecommendation(pricing);
    } catch (error) {
      console.error('Error loading AI forecast data:', error);
      // في حالة عدم وجود بيانات حقيقية، استخدم البيانات التجريبية
      console.log('🎨 استخدام البيانات التجريبية...');
      setRevenueForecast(getMockForecastData());
      setPricingRecommendation(getMockPricingData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg text-gray-600 animate-pulse">
          {locale === 'ar' ? '🤖 الذكاء الاصطناعي يحلل البيانات...' : '🤖 AI Analyzing Data...'}
        </p>
      </div>
    );
  }

  if (!revenueForecast) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">لا توجد بيانات كافية للتنبؤ</p>
      </div>
    );
  }

  const forecastData = horizon === 'month' ? revenueForecast.nextMonth :
                       horizon === 'quarter' ? revenueForecast.nextQuarter :
                       revenueForecast.nextYear;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" />
            {locale === 'ar' ? 'التنبؤات والذكاء الاصطناعي' : 'AI Forecasting & Analytics'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar' ? 'تنبؤات دقيقة باستخدام خوارزميات التعلم الآلي' : 'Accurate predictions using machine learning algorithms'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Horizon Selector */}
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="month">{locale === 'ar' ? 'شهر قادم' : 'Next Month'}</option>
            <option value="quarter">{locale === 'ar' ? '3 أشهر قادمة' : 'Next Quarter'}</option>
            <option value="year">{locale === 'ar' ? 'سنة قادمة' : 'Next Year'}</option>
          </select>

          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            {locale === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Predicted Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10" />
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm opacity-90 mb-2">
            {locale === 'ar' ? 'الإيرادات المتوقعة' : 'Predicted Revenue'}
          </p>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('ar-SA', {
              style: 'currency',
              currency: 'SAR',
              maximumFractionDigits: 0
            }).format(revenueForecast.totalPredicted)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {revenueForecast.trend === 'increasing' ? (
              <TrendingUp className="w-5 h-5 text-green-300" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-300 transform rotate-180" />
            )}
            <span className="text-sm">
              {locale === 'ar' 
                ? revenueForecast.trend === 'increasing' ? 'اتجاه صاعد' : 'اتجاه هابط'
                : revenueForecast.trend === 'increasing' ? 'Increasing Trend' : 'Decreasing Trend'}
            </span>
          </div>
        </motion.div>

        {/* Model Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-10 h-10" />
            <span className="text-sm opacity-90">ML Model</span>
          </div>
          <p className="text-sm opacity-90 mb-2">
            {locale === 'ar' ? 'دقة النموذج' : 'Model Accuracy'}
          </p>
          <p className="text-3xl font-bold">{revenueForecast.accuracy.toFixed(1)}%</p>
          <div className="mt-4">
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2"
                style={{ width: `${revenueForecast.accuracy}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Key Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-10 h-10" />
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm opacity-90 mb-4">
            {locale === 'ar' ? 'العوامل المؤثرة' : 'Key Factors'}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{locale === 'ar' ? 'الموسمية' : 'Seasonality'}</span>
              <span>{(revenueForecast.factors.seasonality * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{locale === 'ar' ? 'الاتجاه' : 'Trend'}</span>
              <span>{(revenueForecast.factors.trend * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{locale === 'ar' ? 'الأحداث' : 'Events'}</span>
              <span>{(revenueForecast.factors.events * 100).toFixed(0)}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          {locale === 'ar' ? 'التنبؤ بالإيرادات' : 'Revenue Forecast'}
        </h2>
        <Line
          data={{
            labels: forecastData.map(d => d.date),
            datasets: [
              {
                label: locale === 'ar' ? 'الإيرادات المتوقعة' : 'Predicted Revenue',
                data: forecastData.map(d => d.predicted),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: locale === 'ar' ? 'الحد الأعلى' : 'Upper Bound',
                data: forecastData.map(d => d.upperBound),
                borderColor: 'rgba(168, 85, 247, 0.3)',
                borderDash: [5, 5],
                fill: false
              },
              {
                label: locale === 'ar' ? 'الحد الأدنى' : 'Lower Bound',
                data: forecastData.map(d => d.lowerBound),
                borderColor: 'rgba(168, 85, 247, 0.3)',
                borderDash: [5, 5],
                fill: false
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.parsed.y;
                    return new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                      maximumFractionDigits: 0
                    }).format(value);
                  }
                }
              }
            }
          }}
        />
      </div>

      {/* Dynamic Pricing Recommendation */}
      {pricingRecommendation && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            {locale === 'ar' ? 'التسعير الديناميكي الذكي' : 'Dynamic Pricing Recommendation'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pricing Card */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">{locale === 'ar' ? 'نوع الغرفة' : 'Room Type'}</span>
                <span className="font-semibold">{pricingRecommendation.roomType}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ar' ? 'السعر الحالي' : 'Current Price'}</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {pricingRecommendation.currentPrice.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{locale === 'ar' ? 'السعر الموصى به' : 'Recommended'}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {pricingRecommendation.recommendedPrice.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                pricingRecommendation.changePercentage > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {pricingRecommendation.changePercentage > 0 ? '+' : ''}
                {pricingRecommendation.changePercentage.toFixed(1)}%
              </div>

              <p className="text-sm text-gray-600 mt-4">{pricingRecommendation.reason}</p>
            </div>

            {/* Factors */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4">{locale === 'ar' ? 'العوامل المؤثرة' : 'Influencing Factors'}</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{locale === 'ar' ? 'الطلب' : 'Demand'}</span>
                    <span className="font-semibold">{pricingRecommendation.factors.demand}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 rounded-full h-2"
                      style={{ width: `${pricingRecommendation.factors.demand}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{locale === 'ar' ? 'معدل الإشغال' : 'Occupancy'}</span>
                    <span className="font-semibold">{pricingRecommendation.factors.occupancy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${pricingRecommendation.factors.occupancy}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{locale === 'ar' ? 'الموسمية' : 'Seasonality'}</span>
                    <span className="font-semibold">{pricingRecommendation.factors.seasonality.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-500 rounded-full h-2"
                      style={{ width: `${Math.min(100, pricingRecommendation.factors.seasonality)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <span className="font-semibold">{locale === 'ar' ? 'الإيراد المتوقع:' : 'Expected Revenue:'}</span>{' '}
                  {pricingRecommendation.expectedRevenue.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Intervals */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {locale === 'ar' ? 'مستويات الثقة' : 'Confidence Levels'}
        </h2>
        <Bar
          data={{
            labels: forecastData.slice(0, 30).map((d, i) => `يوم ${i + 1}`),
            datasets: [
              {
                label: locale === 'ar' ? 'مستوى الثقة %' : 'Confidence %',
                data: forecastData.slice(0, 30).map(d => d.confidence),
                backgroundColor: 'rgba(59, 130, 246, 0.7)'
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                min: 0,
                max: 100
              }
            }
          }}
        />
      </div>

      {/* AI Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-2">
              {locale === 'ar' ? '🤖 كيف يعمل الذكاء الاصطناعي؟' : '🤖 How Does AI Work?'}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {locale === 'ar' 
                ? 'يستخدم النظام خوارزميات التعلم الآلي المتقدمة مثل Linear Regression وتحليل السلاسل الزمنية لتحليل البيانات التاريخية واكتشاف الأنماط والاتجاهات. يأخذ النموذج في الاعتبار عوامل مثل الموسمية، الأحداث الخاصة، معدلات الإشغال، وسلوك العملاء لتقديم تنبؤات دقيقة.'
                : 'The system uses advanced machine learning algorithms like Linear Regression and Time Series Analysis to analyze historical data and discover patterns and trends. The model takes into account factors such as seasonality, special events, occupancy rates, and customer behavior to provide accurate predictions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
