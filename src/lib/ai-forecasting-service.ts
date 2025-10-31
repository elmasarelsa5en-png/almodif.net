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
// Occupancy Prediction
// ====================================

/**
 * توقع معدل الإشغال
 */
export async function predictOccupancy(
  propertyId: string,
  targetDate: Date,
  totalRooms: number = 50
): Promise<OccupancyPrediction> {
  // جلب البيانات التاريخية
  const bookingsRef = collection(db, 'bookings');
  
  // نفس اليوم من العام الماضي
  const lastYearDate = new Date(targetDate);
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  
  const historicalQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(new Date(lastYearDate.getTime() - 14 * 24 * 60 * 60 * 1000))),
    where('checkIn', '<=', Timestamp.fromDate(new Date(lastYearDate.getTime() + 14 * 24 * 60 * 60 * 1000)))
  );
  
  const historicalSnap = await getDocs(historicalQuery);
  const historicalBookings = historicalSnap.docs.map(d => d.data());
  
  // حساب معدل الإشغال التاريخي
  const historicalOccupancy = (historicalBookings.length / totalRooms) * 100;
  
  // حساب معدل الإشغال الحالي
  const today = new Date();
  const currentQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '<=', Timestamp.fromDate(today)),
    where('checkOut', '>=', Timestamp.fromDate(today))
  );
  
  const currentSnap = await getDocs(currentQuery);
  const currentOccupancy = (currentSnap.size / totalRooms) * 100;
  
  // التنبؤ (مبسط - يمكن تحسينه)
  const month = targetDate.getMonth();
  const seasonalFactor = [0.8, 0.85, 1.0, 1.1, 1.2, 1.15, 1.1, 1.2, 1.0, 0.95, 0.9, 1.3][month];
  
  // حساب الاتجاه
  const recentBookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
    orderBy('checkIn', 'desc')
  );
  
  const recentSnap = await getDocs(recentBookingsQuery);
  const recentOccupancy = (recentSnap.size / (totalRooms * 30)) * 100;
  
  let trendMultiplier = 1.0;
  if (recentOccupancy > currentOccupancy * 1.1) {
    trendMultiplier = 1.1;
  } else if (recentOccupancy < currentOccupancy * 0.9) {
    trendMultiplier = 0.9;
  }
  
  // التنبؤ النهائي
  const predictedOccupancy = Math.min(100, Math.max(0, 
    historicalOccupancy * seasonalFactor * trendMultiplier
  ));
  
  // تحديد الاتجاه
  const trend = predictedOccupancy > currentOccupancy * 1.05 ? 'increasing' :
                predictedOccupancy < currentOccupancy * 0.95 ? 'decreasing' : 'stable';
  
  // مستوى الثقة
  const confidence = 85 - Math.abs(predictedOccupancy - historicalOccupancy);
  
  // التوصيات
  const recommendations: string[] = [];
  if (predictedOccupancy < 60) {
    recommendations.push('تفعيل عروض ترويجية لزيادة الحجوزات');
    recommendations.push('التواصل مع العملاء السابقين');
  } else if (predictedOccupancy > 90) {
    recommendations.push('رفع الأسعار لزيادة الإيرادات');
    recommendations.push('التحضير لاستقبال عدد كبير من الضيوف');
  }
  
  if (trend === 'decreasing') {
    recommendations.push('مراجعة استراتيجية التسعير');
  }
  
  return {
    date: targetDate.toISOString().split('T')[0],
    predictedOccupancy,
    currentOccupancy,
    trend,
    confidence: Math.max(0, Math.min(100, confidence)),
    recommendations
  };
}

// ====================================
// Anomaly Detection
// ====================================

/**
 * كشف الشذوذات في البيانات
 */
export async function detectAnomalies(
  propertyId: string,
  dateRange: { start: Date; end: Date }
): Promise<AnomalyDetection[]> {
  const anomalies: AnomalyDetection[] = [];
  
  // جلب البيانات التاريخية للمقارنة
  const bookingsRef = collection(db, 'bookings');
  const bookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(dateRange.start)),
    where('checkIn', '<=', Timestamp.fromDate(dateRange.end)),
    orderBy('checkIn', 'asc')
  );
  
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());
  
  // تجميع الإيرادات اليومية
  const dailyRevenue: Record<string, number> = {};
  const dailyBookings: Record<string, number> = {};
  
  bookings.forEach(b => {
    const date = new Date(b.checkIn.toDate()).toISOString().split('T')[0];
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = 0;
      dailyBookings[date] = 0;
    }
    dailyRevenue[date] += b.totalAmount || 0;
    dailyBookings[date]++;
  });
  
  const revenues = Object.values(dailyRevenue);
  const avgRevenue = revenues.reduce((sum, val) => sum + val, 0) / revenues.length;
  const stdDevRevenue = calculateStandardDeviation(revenues);
  
  // كشف شذوذات الإيرادات
  Object.keys(dailyRevenue).forEach(date => {
    const revenue = dailyRevenue[date];
    const deviation = ((revenue - avgRevenue) / avgRevenue) * 100;
    
    if (Math.abs(deviation) > 30) { // انحراف أكثر من 30%
      let severity: 'low' | 'medium' | 'high' | 'critical';
      if (Math.abs(deviation) > 50) severity = 'critical';
      else if (Math.abs(deviation) > 40) severity = 'high';
      else severity = 'medium';
      
      const possibleCauses: string[] = [];
      const recommendations: string[] = [];
      
      if (deviation < 0) {
        possibleCauses.push('انخفاض في عدد الحجوزات');
        possibleCauses.push('مشاكل تقنية في نظام الحجز');
        possibleCauses.push('منافسة قوية في السوق');
        recommendations.push('مراجعة استراتيجية التسويق');
        recommendations.push('فحص نظام الحجز الإلكتروني');
      } else {
        possibleCauses.push('حدث خاص أو مناسبة');
        possibleCauses.push('عرض ترويجي ناجح');
        recommendations.push('تحليل أسباب النجاح للاستفادة منها');
        recommendations.push('التحضير لاستيعاب الطلب المرتفع');
      }
      
      anomalies.push({
        type: 'revenue',
        date,
        value: revenue,
        expectedValue: avgRevenue,
        deviation,
        severity,
        description: `إيرادات ${deviation > 0 ? 'أعلى' : 'أقل'} من المتوقع بنسبة ${Math.abs(deviation).toFixed(1)}%`,
        possibleCauses,
        recommendations
      });
    }
  });
  
  // كشف شذوذات معدل الإلغاء
  const cancellations = bookings.filter(b => b.status === 'cancelled');
  const cancellationRate = (cancellations.length / bookings.length) * 100;
  
  if (cancellationRate > 15) { // معدل إلغاء أعلى من 15%
    anomalies.push({
      type: 'cancellation',
      date: new Date().toISOString().split('T')[0],
      value: cancellationRate,
      expectedValue: 10,
      deviation: ((cancellationRate - 10) / 10) * 100,
      severity: cancellationRate > 25 ? 'critical' : cancellationRate > 20 ? 'high' : 'medium',
      description: `معدل إلغاء مرتفع: ${cancellationRate.toFixed(1)}%`,
      possibleCauses: [
        'سياسة إلغاء غير مرضية',
        'مشاكل في جودة الخدمة',
        'تغييرات في ظروف السفر'
      ],
      recommendations: [
        'مراجعة سياسة الإلغاء',
        'تحسين تجربة العملاء',
        'التواصل مع العملاء الملغيين لمعرفة الأسباب'
      ]
    });
  }
  
  // كشف شذوذات المصروفات
  const expensesRef = collection(db, 'expense_vouchers');
  const expensesQuery = query(
    expensesRef,
    where('propertyId', '==', propertyId),
    where('date', '>=', Timestamp.fromDate(dateRange.start)),
    where('date', '<=', Timestamp.fromDate(dateRange.end)),
    where('status', '==', 'approved')
  );
  
  const expensesSnap = await getDocs(expensesQuery);
  const expenses = expensesSnap.docs.map(d => d.data());
  
  // تجميع المصروفات اليومية
  const dailyExpenses: Record<string, number> = {};
  expenses.forEach(e => {
    const date = new Date(e.date.toDate()).toISOString().split('T')[0];
    if (!dailyExpenses[date]) dailyExpenses[date] = 0;
    dailyExpenses[date] += e.amount || 0;
  });
  
  const expenseValues = Object.values(dailyExpenses);
  if (expenseValues.length > 0) {
    const avgExpense = expenseValues.reduce((sum, val) => sum + val, 0) / expenseValues.length;
    
    Object.keys(dailyExpenses).forEach(date => {
      const expense = dailyExpenses[date];
      const deviation = ((expense - avgExpense) / avgExpense) * 100;
      
      if (deviation > 40) { // مصروفات أعلى بـ 40%
        anomalies.push({
          type: 'expense',
          date,
          value: expense,
          expectedValue: avgExpense,
          deviation,
          severity: deviation > 60 ? 'critical' : 'high',
          description: `مصروفات غير متوقعة: ${expense.toLocaleString('ar-SA')} ر.س`,
          possibleCauses: [
            'صيانة طارئة',
            'شراء معدات جديدة',
            'خطأ في التسجيل'
          ],
          recommendations: [
            'مراجعة سند الصرف',
            'التحقق من الموافقات',
            'تحليل أسباب الإنفاق المرتفع'
          ]
        });
      }
    });
  }
  
  return anomalies.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// ====================================
// Guest Segments Analysis
// ====================================

/**
 * تحليل شرائح الضيوف
 */
export async function analyzeGuestSegments(propertyId: string): Promise<{
  segments: {
    name: string;
    count: number;
    percentage: number;
    avgRevenue: number;
    characteristics: string[];
  }[];
  recommendations: string[];
}> {
  const bookingsRef = collection(db, 'bookings');
  const bookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    orderBy('checkIn', 'desc'),
    limit(500)
  );
  
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());
  
  // تجميع حسب الضيف
  const guestData: Record<string, { bookings: any[]; revenue: number }> = {};
  
  bookings.forEach(b => {
    const guestId = b.guestId || 'unknown';
    if (!guestData[guestId]) {
      guestData[guestId] = { bookings: [], revenue: 0 };
    }
    guestData[guestId].bookings.push(b);
    guestData[guestId].revenue += b.totalAmount || 0;
  });
  
  // تصنيف الضيوف
  const highValue = [];
  const mediumValue = [];
  const lowValue = [];
  const atRisk = [];
  
  Object.keys(guestData).forEach(guestId => {
    const data = guestData[guestId];
    const bookingCount = data.bookings.length;
    const avgSpending = data.revenue / bookingCount;
    const lastBooking = data.bookings[0];
    const daysSinceLastBooking = Math.ceil(
      (Date.now() - new Date(lastBooking.checkIn.toDate()).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastBooking > 180) {
      atRisk.push({ guestId, ...data, avgSpending });
    } else if (avgSpending > 5000 && bookingCount > 3) {
      highValue.push({ guestId, ...data, avgSpending });
    } else if (avgSpending > 2000 && bookingCount > 1) {
      mediumValue.push({ guestId, ...data, avgSpending });
    } else {
      lowValue.push({ guestId, ...data, avgSpending });
    }
  });
  
  const totalGuests = Object.keys(guestData).length;
  
  const segments = [
    {
      name: 'عملاء VIP',
      count: highValue.length,
      percentage: (highValue.length / totalGuests) * 100,
      avgRevenue: highValue.reduce((sum, g) => sum + g.avgSpending, 0) / (highValue.length || 1),
      characteristics: ['إنفاق مرتفع', 'حجوزات متكررة', 'ولاء عالي']
    },
    {
      name: 'عملاء منتظمون',
      count: mediumValue.length,
      percentage: (mediumValue.length / totalGuests) * 100,
      avgRevenue: mediumValue.reduce((sum, g) => sum + g.avgSpending, 0) / (mediumValue.length || 1),
      characteristics: ['إنفاق متوسط', 'حجوزات دورية']
    },
    {
      name: 'عملاء عاديون',
      count: lowValue.length,
      percentage: (lowValue.length / totalGuests) * 100,
      avgRevenue: lowValue.reduce((sum, g) => sum + g.avgSpending, 0) / (lowValue.length || 1),
      characteristics: ['إنفاق منخفض', 'حجوزات قليلة']
    },
    {
      name: 'معرضون للفقدان',
      count: atRisk.length,
      percentage: (atRisk.length / totalGuests) * 100,
      avgRevenue: atRisk.reduce((sum, g) => sum + g.avgSpending, 0) / (atRisk.length || 1),
      characteristics: ['لم يحجزوا منذ 6 أشهر', 'يحتاجون لإعادة استهداف']
    }
  ];
  
  const recommendations = [
    `التركيز على عملاء VIP (${highValue.length}) - يمثلون ${((highValue.length / totalGuests) * 100).toFixed(1)}% من العملاء`,
    `إعادة استهداف ${atRisk.length} عميل معرض للفقدان بعروض خاصة`,
    `تطوير برنامج ولاء لتحويل العملاء المنتظمين إلى VIP`
  ];
  
  return { segments, recommendations };
}

// ====================================
// Exports
// ====================================

export default {
  forecastRevenue,
  analyzeGuestBehavior,
  calculateDynamicPricing,
  predictOccupancy,
  detectAnomalies,
  analyzeGuestSegments
};
