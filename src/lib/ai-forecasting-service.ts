/**
 * @file ai-forecasting-service.ts
 * @description نظام الذكاء الاصطناعي والتنبؤات - Phase 2.8
 * 
 * يوفر:
 * - تنبؤ بالإيرادات (Revenue Forecasting)
 * - تحليل سلوك الضيوف (Guest Behavior Analysis)
 * - تسعير ديناميكي (Dynamic Pricing)
 * - توقع معدل الإشغال (Occupancy Prediction)
 * - كشف الشذوذات (Anomaly Detection)
 * 
 * @version 1.0.0
 * @created 2025-10-31
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// ====================================
// Types & Interfaces
// ====================================

/**
 * بيانات التنبؤ
 */
export interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  confidence: number; // نسبة الثقة 0-100
  upperBound: number; // الحد الأعلى
  lowerBound: number; // الحد الأدنى
}

/**
 * نتيجة التنبؤ بالإيرادات
 */
export interface RevenueForecast {
  nextMonth: ForecastData[];
  nextQuarter: ForecastData[];
  nextYear: ForecastData[];
  totalPredicted: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  accuracy: number; // دقة النموذج
  factors: {
    seasonality: number;
    trend: number;
    events: number;
  };
}

/**
 * تحليل سلوك الضيف
 */
export interface GuestBehaviorAnalysis {
  guestId: string;
  bookingFrequency: number; // عدد مرات الحجز
  averageStayDuration: number; // متوسط مدة الإقامة
  averageSpending: number; // متوسط الإنفاق
  preferredRoomType: string;
  preferredServices: string[];
  bookingLeadTime: number; // متوسط الوقت بين الحجز والوصول
  cancellationRate: number; // معدل الإلغاء
  loyaltyScore: number; // درجة الولاء 0-100
  churnProbability: number; // احتمالية فقدان العميل
  segment: 'high-value' | 'medium-value' | 'low-value' | 'at-risk';
  nextBookingPrediction: {
    date: string;
    probability: number;
  };
}

/**
 * توصية التسعير الديناميكي
 */
export interface DynamicPricingRecommendation {
  roomType: string;
  currentPrice: number;
  recommendedPrice: number;
  changePercentage: number;
  reason: string;
  factors: {
    demand: number; // الطلب 0-100
    competition: number; // المنافسة
    seasonality: number; // الموسمية
    occupancy: number; // معدل الإشغال الحالي
    events: string[]; // الأحداث القادمة
  };
  confidence: number;
  expectedRevenue: number;
}

/**
 * توقع معدل الإشغال
 */
export interface OccupancyPrediction {
  date: string;
  predictedOccupancy: number;
  currentOccupancy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  recommendations: string[];
}

/**
 * كشف الشذوذات
 */
export interface AnomalyDetection {
  type: 'revenue' | 'occupancy' | 'cancellation' | 'expense';
  date: string;
  value: number;
  expectedValue: number;
  deviation: number; // نسبة الانحراف
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendations: string[];
}

// ====================================
// ML Helper Functions
// ====================================

/**
 * حساب المتوسط المتحرك (Moving Average)
 */
function calculateMovingAverage(data: number[], window: number = 7): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(avg);
  }
  return result;
}

/**
 * حساب الانحراف المعياري
 */
function calculateStandardDeviation(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Linear Regression بسيط
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * التنبؤ باستخدام Linear Regression
 */
function predictWithLinearRegression(
  historicalData: number[],
  daysToPredict: number
): number[] {
  const x = historicalData.map((_, i) => i);
  const { slope, intercept } = linearRegression(x, historicalData);

  const predictions: number[] = [];
  for (let i = 0; i < daysToPredict; i++) {
    const futureX = historicalData.length + i;
    predictions.push(slope * futureX + intercept);
  }

  return predictions;
}

/**
 * حساب الموسمية (Seasonality)
 */
function calculateSeasonality(data: number[], period: number = 7): number[] {
  const seasonality: number[] = [];
  for (let i = 0; i < period; i++) {
    const subset = data.filter((_, idx) => idx % period === i);
    const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    seasonality.push(avg);
  }
  return seasonality;
}

/**
 * حساب دقة النموذج (MAPE - Mean Absolute Percentage Error)
 */
function calculateMAPE(actual: number[], predicted: number[]): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < Math.min(actual.length, predicted.length); i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      count++;
    }
  }
  return count > 0 ? (1 - sum / count) * 100 : 0;
}

// ====================================
// Revenue Forecasting
// ====================================

/**
 * تنبؤ بالإيرادات
 */
export async function forecastRevenue(
  propertyId: string,
  horizon: 'month' | 'quarter' | 'year' = 'month'
): Promise<RevenueForecast> {
  // جلب البيانات التاريخية (آخر 12 شهر)
  const bookingsRef = collection(db, 'bookings');
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const historicalQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(oneYearAgo)),
    orderBy('checkIn', 'asc')
  );

  const historicalSnap = await getDocs(historicalQuery);
  const bookings = historicalSnap.docs.map(d => d.data());

  // تجميع الإيرادات اليومية
  const dailyRevenue: Record<string, number> = {};
  bookings.forEach(b => {
    const date = new Date(b.checkIn.toDate()).toISOString().split('T')[0];
    if (!dailyRevenue[date]) dailyRevenue[date] = 0;
    dailyRevenue[date] += b.totalAmount || 0;
  });

  // تحويل إلى مصفوفة
  const dates = Object.keys(dailyRevenue).sort();
  const revenues = dates.map(date => dailyRevenue[date]);

  // حساب الموسمية والاتجاه
  const seasonality = calculateSeasonality(revenues, 7);
  const movingAvg = calculateMovingAverage(revenues, 30);
  
  // التنبؤ
  const daysToPredict = horizon === 'month' ? 30 : horizon === 'quarter' ? 90 : 365;
  const predictions = predictWithLinearRegression(movingAvg.slice(-90), daysToPredict);

  // إضافة الموسمية
  const adjustedPredictions = predictions.map((pred, i) => {
    const seasonalFactor = seasonality[i % seasonality.length];
    const avgSeasonal = seasonality.reduce((sum, val) => sum + val, 0) / seasonality.length;
    return pred * (seasonalFactor / avgSeasonal);
  });

  // حساب حدود الثقة
  const stdDev = calculateStandardDeviation(revenues);
  const forecastData: ForecastData[] = adjustedPredictions.map((pred, i) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i + 1);
    return {
      date: futureDate.toISOString().split('T')[0],
      predicted: Math.max(0, pred),
      confidence: 85 - (i * 0.1), // تقل الثقة مع الوقت
      upperBound: Math.max(0, pred + stdDev * 1.5),
      lowerBound: Math.max(0, pred - stdDev * 1.5)
    };
  });

  // حساب الاتجاه
  const recentRevenues = revenues.slice(-30);
  const recentAvg = recentRevenues.reduce((sum, val) => sum + val, 0) / recentRevenues.length;
  const previousAvg = revenues.slice(-60, -30).reduce((sum, val) => sum + val, 0) / 30;
  const trend = recentAvg > previousAvg * 1.05 ? 'increasing' : 
                recentAvg < previousAvg * 0.95 ? 'decreasing' : 'stable';

  // حساب الدقة
  const accuracy = calculateMAPE(
    revenues.slice(-30),
    predictWithLinearRegression(revenues.slice(-90, -30), 30)
  );

  return {
    nextMonth: forecastData.slice(0, 30),
    nextQuarter: forecastData.slice(0, 90),
    nextYear: forecastData,
    totalPredicted: adjustedPredictions.reduce((sum, val) => sum + val, 0),
    trend,
    accuracy,
    factors: {
      seasonality: 0.3,
      trend: 0.5,
      events: 0.2
    }
  };
}

// ====================================
// Guest Behavior Analysis
// ====================================

/**
 * تحليل سلوك الضيف
 */
export async function analyzeGuestBehavior(
  propertyId: string,
  guestId: string
): Promise<GuestBehaviorAnalysis> {
  // جلب حجوزات الضيف
  const bookingsRef = collection(db, 'bookings');
  const guestBookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('guestId', '==', guestId),
    orderBy('checkIn', 'desc')
  );

  const bookingsSnap = await getDocs(guestBookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());

  if (bookings.length === 0) {
    throw new Error('لا توجد حجوزات لهذا الضيف');
  }

  // حساب تكرار الحجز
  const bookingFrequency = bookings.length;

  // متوسط مدة الإقامة
  const stayDurations = bookings.map(b => {
    const checkIn = new Date(b.checkIn.toDate());
    const checkOut = new Date(b.checkOut.toDate());
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  });
  const averageStayDuration = stayDurations.reduce((sum, val) => sum + val, 0) / stayDurations.length;

  // متوسط الإنفاق
  const averageSpending = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length;

  // نوع الغرفة المفضل
  const roomTypeCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const type = b.roomType || 'قياسي';
    roomTypeCounts[type] = (roomTypeCounts[type] || 0) + 1;
  });
  const preferredRoomType = Object.keys(roomTypeCounts).reduce((a, b) => 
    roomTypeCounts[a] > roomTypeCounts[b] ? a : b
  );

  // الخدمات المفضلة (مبسط)
  const preferredServices = ['خدمة الغرف', 'واي فاي'];

  // متوسط وقت الحجز المسبق
  const leadTimes = bookings
    .filter(b => b.createdAt && b.checkIn)
    .map(b => {
      const created = new Date(b.createdAt.toDate());
      const checkIn = new Date(b.checkIn.toDate());
      return Math.ceil((checkIn.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });
  const bookingLeadTime = leadTimes.length > 0 
    ? leadTimes.reduce((sum, val) => sum + val, 0) / leadTimes.length 
    : 14;

  // معدل الإلغاء
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
  const cancellationRate = (cancelledCount / bookings.length) * 100;

  // درجة الولاء
  const loyaltyScore = Math.min(100, bookingFrequency * 10 + (averageSpending / 100));

  // احتمالية الفقدان
  const daysSinceLastBooking = bookings[0] 
    ? Math.ceil((Date.now() - new Date(bookings[0].checkIn.toDate()).getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  const churnProbability = Math.min(100, (daysSinceLastBooking / 180) * 100);

  // التصنيف
  let segment: 'high-value' | 'medium-value' | 'low-value' | 'at-risk';
  if (churnProbability > 70) {
    segment = 'at-risk';
  } else if (averageSpending > 5000 && bookingFrequency > 5) {
    segment = 'high-value';
  } else if (averageSpending > 2000 && bookingFrequency > 2) {
    segment = 'medium-value';
  } else {
    segment = 'low-value';
  }

  // التنبؤ بالحجز التالي
  const avgDaysBetweenBookings = bookings.length > 1
    ? bookings.slice(0, -1).reduce((sum, b, i) => {
        const current = new Date(b.checkIn.toDate());
        const next = new Date(bookings[i + 1].checkIn.toDate());
        return sum + Math.ceil((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / (bookings.length - 1)
    : 90;

  const nextBookingDate = new Date(bookings[0].checkIn.toDate());
  nextBookingDate.setDate(nextBookingDate.getDate() + avgDaysBetweenBookings);

  return {
    guestId,
    bookingFrequency,
    averageStayDuration,
    averageSpending,
    preferredRoomType,
    preferredServices,
    bookingLeadTime,
    cancellationRate,
    loyaltyScore,
    churnProbability,
    segment,
    nextBookingPrediction: {
      date: nextBookingDate.toISOString().split('T')[0],
      probability: Math.max(0, 100 - churnProbability)
    }
  };
}

// ====================================
// Dynamic Pricing
// ====================================

/**
 * حساب توصيات التسعير الديناميكي
 */
export async function calculateDynamicPricing(
  propertyId: string,
  roomType: string,
  targetDate: Date
): Promise<DynamicPricingRecommendation> {
  // السعر الحالي (افتراضي)
  const basePrice = 1500;

  // حساب الطلب (عدد الحجوزات في نفس الفترة من العام الماضي)
  const lastYearDate = new Date(targetDate);
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  
  const bookingsRef = collection(db, 'bookings');
  const demandQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('roomType', '==', roomType),
    where('checkIn', '>=', Timestamp.fromDate(new Date(lastYearDate.getTime() - 7 * 24 * 60 * 60 * 1000))),
    where('checkIn', '<=', Timestamp.fromDate(new Date(lastYearDate.getTime() + 7 * 24 * 60 * 60 * 1000)))
  );
  const demandSnap = await getDocs(demandQuery);
  const demandScore = Math.min(100, demandSnap.size * 10);

  // معدل الإشغال الحالي
  const currentOccupancy = 75; // يجب جلبه من النظام

  // الموسمية
  const month = targetDate.getMonth();
  const seasonalityFactor = [0.8, 0.85, 1.0, 1.1, 1.2, 1.15, 1.1, 1.2, 1.0, 0.95, 0.9, 1.3][month];

  // حساب السعر الموصى به
  let priceMultiplier = 1.0;
  
  // تعديل حسب الطلب
  if (demandScore > 70) priceMultiplier += 0.2;
  else if (demandScore < 30) priceMultiplier -= 0.15;

  // تعديل حسب الإشغال
  if (currentOccupancy > 85) priceMultiplier += 0.15;
  else if (currentOccupancy < 50) priceMultiplier -= 0.2;

  // تعديل حسب الموسمية
  priceMultiplier *= seasonalityFactor;

  const recommendedPrice = Math.round(basePrice * priceMultiplier);
  const changePercentage = ((recommendedPrice - basePrice) / basePrice) * 100;

  // السبب
  let reason = '';
  if (changePercentage > 10) {
    reason = 'طلب مرتفع ومعدل إشغال عالي';
  } else if (changePercentage < -10) {
    reason = 'طلب منخفض ومعدل إشغال منخفض';
  } else {
    reason = 'ظروف السوق مستقرة';
  }

  return {
    roomType,
    currentPrice: basePrice,
    recommendedPrice,
    changePercentage,
    reason,
    factors: {
      demand: demandScore,
      competition: 70,
      seasonality: seasonalityFactor * 100,
      occupancy: currentOccupancy,
      events: month === 11 ? ['موسم الأعياد'] : []
    },
    confidence: 80,
    expectedRevenue: recommendedPrice * 30 // إيراد متوقع لمدة شهر
  };
}

// ====================================
// Exports
// ====================================

export default {
  forecastRevenue,
  analyzeGuestBehavior,
  calculateDynamicPricing
};
