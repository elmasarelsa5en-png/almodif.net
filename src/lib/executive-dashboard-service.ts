/**
 * @file executive-dashboard-service.ts
 * @description نظام لوحات التحكم التنفيذية - Phase 2.7
 * 
 * يوفر KPIs متقدمة وتحليلات للمديرين التنفيذيين:
 * - GM Dashboard: مؤشرات أداء شاملة
 * - CFO Dashboard: تقارير مالية متعمقة
 * - Sales Dashboard: أداء المبيعات والحجوزات
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
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore';

// ====================================
// Types & Interfaces
// ====================================

/**
 * مؤشر أداء رئيسي (KPI)
 */
export interface KPI {
  label: string;
  value: number | string;
  change?: number; // نسبة التغيير مقارنة بالفترة السابقة
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: number[]; // بيانات الرسم البياني
  icon?: string;
  unit?: 'SAR' | 'percentage' | 'number' | 'days';
  target?: number; // الهدف المطلوب
  status?: 'good' | 'warning' | 'critical';
}

/**
 * بيانات لوحة المدير العام
 */
export interface GMDashboardData {
  overview: {
    totalRevenue: KPI;
    occupancyRate: KPI;
    averageRating: KPI;
    totalGuests: KPI;
  };
  financial: {
    netProfit: KPI;
    operatingExpenses: KPI;
    revPAR: KPI; // Revenue Per Available Room
    cashFlow: KPI;
  };
  operations: {
    checkInsToday: KPI;
    checkOutsToday: KPI;
    pendingMaintenance: KPI;
    activeStaff: KPI;
  };
  trends: {
    revenueByMonth: { month: string; value: number }[];
    occupancyByMonth: { month: string; value: number }[];
    guestSatisfaction: { date: string; rating: number }[];
  };
}

/**
 * بيانات لوحة المدير المالي (CFO)
 */
export interface CFODashboardData {
  financial: {
    revenue: KPI;
    expenses: KPI;
    profit: KPI;
    profitMargin: KPI;
  };
  cashFlow: {
    operatingCashFlow: KPI;
    investingCashFlow: KPI;
    financingCashFlow: KPI;
    netCashFlow: KPI;
  };
  accountsReceivable: {
    totalReceivable: KPI;
    averageCollectionPeriod: KPI;
    overdueAmount: KPI;
    collectionRate: KPI;
  };
  accountsPayable: {
    totalPayable: KPI;
    averagePaymentPeriod: KPI;
    overdueAmount: KPI;
  };
  breakdown: {
    revenueByCategory: { category: string; amount: number }[];
    expensesByCategory: { category: string; amount: number }[];
    profitByMonth: { month: string; profit: number }[];
  };
}

/**
 * بيانات لوحة المبيعات
 */
export interface SalesDashboardData {
  overview: {
    totalBookings: KPI;
    totalRevenue: KPI;
    averageBookingValue: KPI;
    conversionRate: KPI;
  };
  channels: {
    bookingByChannel: { channel: string; count: number; revenue: number }[];
    channelPerformance: { channel: string; conversion: number }[];
  };
  rooms: {
    occupancyByRoomType: { type: string; occupancy: number }[];
    revenueByRoomType: { type: string; revenue: number }[];
  };
  trends: {
    bookingsByMonth: { month: string; count: number }[];
    revenueByMonth: { month: string; revenue: number }[];
    cancellationRate: { month: string; rate: number }[];
  };
}

/**
 * فلتر الفترة الزمنية
 */
export interface DateRangeFilter {
  start: Date;
  end: Date;
  compareWith?: 'previous-period' | 'previous-year' | 'none';
}

// ====================================
// Helper Functions
// ====================================

/**
 * حساب نسبة التغيير
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * تحديد نوع التغيير
 */
function getChangeType(change: number): 'increase' | 'decrease' | 'neutral' {
  if (change > 0) return 'increase';
  if (change < 0) return 'decrease';
  return 'neutral';
}

/**
 * تحديد حالة KPI بناءً على الهدف
 */
function getKPIStatus(value: number, target: number): 'good' | 'warning' | 'critical' {
  const percentage = (value / target) * 100;
  if (percentage >= 100) return 'good';
  if (percentage >= 80) return 'warning';
  return 'critical';
}

/**
 * تحويل Timestamp إلى Date
 */
function toDate(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

/**
 * الحصول على نطاق التاريخ للفترة السابقة
 */
function getPreviousPeriodRange(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() - duration),
    end: new Date(start.getTime())
  };
}

// ====================================
// GM Dashboard Functions
// ====================================

/**
 * الحصول على بيانات لوحة المدير العام
 */
export async function getGMDashboardData(
  propertyId: string,
  dateRange: DateRangeFilter
): Promise<GMDashboardData> {
  const [overview, financial, operations, trends] = await Promise.all([
    getGMOverview(propertyId, dateRange),
    getGMFinancial(propertyId, dateRange),
    getGMOperations(propertyId, dateRange),
    getGMTrends(propertyId, dateRange)
  ]);

  return {
    overview,
    financial,
    operations,
    trends
  };
}

/**
 * نظرة عامة للمدير العام
 */
async function getGMOverview(propertyId: string, dateRange: DateRangeFilter) {
  // جلب الحجوزات
  const bookingsRef = collection(db, 'bookings');
  const bookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(dateRange.start)),
    where('checkIn', '<=', Timestamp.fromDate(dateRange.end))
  );
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());

  // حساب الإيرادات
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // حساب معدل الإشغال
  const totalRooms = 50; // يجب جلبه من الإعدادات
  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const roomNights = bookings.reduce((sum, b) => {
    const checkIn = toDate(b.checkIn);
    const checkOut = toDate(b.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return sum + nights;
  }, 0);
  const occupancyRate = (roomNights / (totalRooms * totalDays)) * 100;

  // حساب متوسط التقييم
  const ratingsRef = collection(db, 'ratings');
  const ratingsQuery = query(
    ratingsRef,
    where('propertyId', '==', propertyId),
    where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
    where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
  );
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map(d => d.data());
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / ratings.length
    : 0;

  // عدد الضيوف
  const totalGuests = bookings.reduce((sum, b) => sum + (b.guestCount || 1), 0);

  // حساب البيانات السابقة للمقارنة
  let prevRevenue = 0;
  let prevOccupancy = 0;
  let prevRating = 0;
  let prevGuests = 0;

  if (dateRange.compareWith && dateRange.compareWith !== 'none') {
    const prevRange = getPreviousPeriodRange(dateRange.start, dateRange.end);
    const prevBookingsQuery = query(
      bookingsRef,
      where('propertyId', '==', propertyId),
      where('checkIn', '>=', Timestamp.fromDate(prevRange.start)),
      where('checkIn', '<=', Timestamp.fromDate(prevRange.end))
    );
    const prevBookingsSnap = await getDocs(prevBookingsQuery);
    const prevBookings = prevBookingsSnap.docs.map(d => d.data());

    prevRevenue = prevBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const prevRoomNights = prevBookings.reduce((sum, b) => {
      const checkIn = toDate(b.checkIn);
      const checkOut = toDate(b.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    prevOccupancy = (prevRoomNights / (totalRooms * totalDays)) * 100;
    prevGuests = prevBookings.reduce((sum, b) => sum + (b.guestCount || 1), 0);

    const prevRatingsQuery = query(
      ratingsRef,
      where('propertyId', '==', propertyId),
      where('createdAt', '>=', Timestamp.fromDate(prevRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(prevRange.end))
    );
    const prevRatingsSnap = await getDocs(prevRatingsQuery);
    const prevRatings = prevRatingsSnap.docs.map(d => d.data());
    prevRating = prevRatings.length > 0
      ? prevRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / prevRatings.length
      : 0;
  }

  return {
    totalRevenue: {
      label: 'إجمالي الإيرادات',
      value: totalRevenue,
      change: calculateChange(totalRevenue, prevRevenue),
      changeType: getChangeType(calculateChange(totalRevenue, prevRevenue)),
      unit: 'SAR' as const,
      target: 500000,
      status: getKPIStatus(totalRevenue, 500000)
    },
    occupancyRate: {
      label: 'معدل الإشغال',
      value: occupancyRate.toFixed(1),
      change: calculateChange(occupancyRate, prevOccupancy),
      changeType: getChangeType(calculateChange(occupancyRate, prevOccupancy)),
      unit: 'percentage' as const,
      target: 80,
      status: getKPIStatus(occupancyRate, 80)
    },
    averageRating: {
      label: 'متوسط التقييم',
      value: averageRating.toFixed(1),
      change: calculateChange(averageRating, prevRating),
      changeType: getChangeType(calculateChange(averageRating, prevRating)),
      unit: 'number' as const,
      target: 4.5,
      status: getKPIStatus(averageRating, 4.5)
    },
    totalGuests: {
      label: 'إجمالي الضيوف',
      value: totalGuests,
      change: calculateChange(totalGuests, prevGuests),
      changeType: getChangeType(calculateChange(totalGuests, prevGuests)),
      unit: 'number' as const,
      target: 1000,
      status: getKPIStatus(totalGuests, 1000)
    }
  };
}

/**
 * المؤشرات المالية للمدير العام
 */
async function getGMFinancial(propertyId: string, dateRange: DateRangeFilter) {
  // جلب المصروفات
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
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // جلب الإيرادات
  const bookingsRef = collection(db, 'bookings');
  const bookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(dateRange.start)),
    where('checkIn', '<=', Timestamp.fromDate(dateRange.end))
  );
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // حساب صافي الربح
  const netProfit = totalRevenue - totalExpenses;

  // حساب RevPAR (Revenue Per Available Room)
  const totalRooms = 50;
  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const revPAR = totalRevenue / (totalRooms * totalDays);

  // جلب التدفق النقدي (مبسط)
  const cashFlow = netProfit; // يجب حسابه بدقة أكبر لاحقاً

  return {
    netProfit: {
      label: 'صافي الربح',
      value: netProfit,
      unit: 'SAR' as const,
      target: 200000,
      status: getKPIStatus(netProfit, 200000)
    },
    operatingExpenses: {
      label: 'المصروفات التشغيلية',
      value: totalExpenses,
      unit: 'SAR' as const,
      target: 300000,
      status: totalExpenses <= 300000 ? 'good' : 'warning'
    },
    revPAR: {
      label: 'RevPAR',
      value: revPAR.toFixed(2),
      unit: 'SAR' as const,
      target: 350,
      status: getKPIStatus(revPAR, 350)
    },
    cashFlow: {
      label: 'التدفق النقدي',
      value: cashFlow,
      unit: 'SAR' as const,
      target: 150000,
      status: getKPIStatus(cashFlow, 150000)
    }
  };
}

/**
 * العمليات اليومية للمدير العام
 */
async function getGMOperations(propertyId: string, dateRange: DateRangeFilter) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check-ins اليوم
  const checkInsRef = collection(db, 'bookings');
  const checkInsQuery = query(
    checkInsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(today)),
    where('checkIn', '<', Timestamp.fromDate(tomorrow))
  );
  const checkInsSnap = await getDocs(checkInsQuery);
  const checkInsToday = checkInsSnap.size;

  // Check-outs اليوم
  const checkOutsQuery = query(
    checkInsRef,
    where('propertyId', '==', propertyId),
    where('checkOut', '>=', Timestamp.fromDate(today)),
    where('checkOut', '<', Timestamp.fromDate(tomorrow))
  );
  const checkOutsSnap = await getDocs(checkOutsQuery);
  const checkOutsToday = checkOutsSnap.size;

  // الصيانة المعلقة
  const maintenanceRef = collection(db, 'maintenance_requests');
  const maintenanceQuery = query(
    maintenanceRef,
    where('propertyId', '==', propertyId),
    where('status', 'in', ['pending', 'in-progress'])
  );
  const maintenanceSnap = await getDocs(maintenanceQuery);
  const pendingMaintenance = maintenanceSnap.size;

  // الموظفين النشطين (مبسط)
  const activeStaff = 25; // يجب جلبه من نظام الموظفين

  return {
    checkInsToday: {
      label: 'وصول اليوم',
      value: checkInsToday,
      unit: 'number' as const
    },
    checkOutsToday: {
      label: 'مغادرة اليوم',
      value: checkOutsToday,
      unit: 'number' as const
    },
    pendingMaintenance: {
      label: 'صيانة معلقة',
      value: pendingMaintenance,
      unit: 'number' as const,
      status: pendingMaintenance > 10 ? 'warning' : 'good'
    },
    activeStaff: {
      label: 'الموظفين النشطين',
      value: activeStaff,
      unit: 'number' as const
    }
  };
}

/**
 * الاتجاهات والرسوم البيانية
 */
async function getGMTrends(propertyId: string, dateRange: DateRangeFilter) {
  // بيانات شهرية (آخر 12 شهر)
  const months = [];
  const revenueByMonth = [];
  const occupancyByMonth = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthName = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
    months.push(monthName);

    // جلب الإيرادات الشهرية
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsRef,
      where('propertyId', '==', propertyId),
      where('checkIn', '>=', Timestamp.fromDate(monthStart)),
      where('checkIn', '<=', Timestamp.fromDate(monthEnd))
    );
    const bookingsSnap = await getDocs(bookingsQuery);
    const bookings = bookingsSnap.docs.map(d => d.data());
    const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    revenueByMonth.push({ month: monthName, value: revenue });

    // حساب معدل الإشغال الشهري
    const totalRooms = 50;
    const totalDays = monthEnd.getDate();
    const roomNights = bookings.reduce((sum, b) => {
      const checkIn = toDate(b.checkIn);
      const checkOut = toDate(b.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    const occupancy = (roomNights / (totalRooms * totalDays)) * 100;

    occupancyByMonth.push({ month: monthName, value: occupancy });
  }

  // رضا الضيوف (آخر 30 يوم)
  const guestSatisfaction = [];
  const ratingsRef = collection(db, 'ratings');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ratingsQuery = query(
    ratingsRef,
    where('propertyId', '==', propertyId),
    where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
    orderBy('createdAt', 'asc')
  );
  const ratingsSnap = await getDocs(ratingsQuery);
  const ratings = ratingsSnap.docs.map(d => d.data());

  // تجميع التقييمات يومياً
  const ratingsByDay: Record<string, number[]> = {};
  ratings.forEach(r => {
    const date = toDate(r.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (!ratingsByDay[date]) ratingsByDay[date] = [];
    ratingsByDay[date].push(r.overallRating || 0);
  });

  Object.keys(ratingsByDay).forEach(date => {
    const avg = ratingsByDay[date].reduce((sum, r) => sum + r, 0) / ratingsByDay[date].length;
    guestSatisfaction.push({ date, rating: avg });
  });

  return {
    revenueByMonth,
    occupancyByMonth,
    guestSatisfaction
  };
}

// ====================================
// CFO Dashboard Functions
// ====================================

/**
 * الحصول على بيانات لوحة المدير المالي
 */
export async function getCFODashboardData(
  propertyId: string,
  dateRange: DateRangeFilter
): Promise<CFODashboardData> {
  // جلب الإيرادات
  const bookingsRef = collection(db, 'bookings');
  const bookingsQuery = query(
    bookingsRef,
    where('propertyId', '==', propertyId),
    where('checkIn', '>=', Timestamp.fromDate(dateRange.start)),
    where('checkIn', '<=', Timestamp.fromDate(dateRange.end))
  );
  const bookingsSnap = await getDocs(bookingsQuery);
  const bookings = bookingsSnap.docs.map(d => d.data());
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // جلب المصروفات
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
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // حساب صافي الربح
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // التدفق النقدي (مبسط)
  const operatingCashFlow = netProfit;
  const investingCashFlow = 0; // يجب جلبه من نظام الأصول
  const financingCashFlow = 0; // يجب جلبه من نظام القروض
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

  // الذمم المدينة
  const promissoryNotesRef = collection(db, 'promissory_notes');
  const receivableQuery = query(
    promissoryNotesRef,
    where('propertyId', '==', propertyId),
    where('type', '==', 'receivable'),
    where('status', 'in', ['pending', 'partially_paid'])
  );
  const receivableSnap = await getDocs(receivableQuery);
  const receivables = receivableSnap.docs.map(d => d.data());
  const totalReceivable = receivables.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  // متوسط فترة التحصيل (مبسط)
  const averageCollectionPeriod = 30; // يجب حسابه من البيانات الفعلية
  
  // المبالغ المتأخرة
  const today = new Date();
  const overdueReceivable = receivables
    .filter(r => toDate(r.dueDate) < today)
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  
  // معدل التحصيل
  const collectionRate = totalReceivable > 0 
    ? ((totalReceivable - overdueReceivable) / totalReceivable) * 100 
    : 100;

  // الذمم الدائنة
  const payableQuery = query(
    promissoryNotesRef,
    where('propertyId', '==', propertyId),
    where('type', '==', 'payable'),
    where('status', 'in', ['pending', 'partially_paid'])
  );
  const payableSnap = await getDocs(payableQuery);
  const payables = payableSnap.docs.map(d => d.data());
  const totalPayable = payables.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // متوسط فترة السداد
  const averagePaymentPeriod = 45;
  
  // المبالغ المتأخرة
  const overduePayable = payables
    .filter(p => toDate(p.dueDate) < today)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // تفصيل الإيرادات
  const revenueByCategory = [
    { category: 'الحجوزات', amount: bookings.reduce((sum, b) => sum + (b.roomCharges || 0), 0) },
    { category: 'خدمة الغرف', amount: bookings.reduce((sum, b) => sum + (b.roomServiceCharges || 0), 0) },
    { category: 'المطعم', amount: 0 }, // يجب جلبه من نظام المطعم
    { category: 'المغسلة', amount: 0 }, // يجب جلبه من نظام المغسلة
    { category: 'أخرى', amount: bookings.reduce((sum, b) => sum + (b.otherCharges || 0), 0) }
  ].filter(item => item.amount > 0);

  // تفصيل المصروفات
  const expensesByCategory = expenses.reduce((acc, e) => {
    const category = e.category || 'أخرى';
    const existing = acc.find(item => item.category === category);
    if (existing) {
      existing.amount += e.amount || 0;
    } else {
      acc.push({ category, amount: e.amount || 0 });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  // صافي الربح الشهري (آخر 12 شهر)
  const profitByMonth = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthName = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });

    // جلب إيرادات الشهر
    const monthBookingsQuery = query(
      bookingsRef,
      where('propertyId', '==', propertyId),
      where('checkIn', '>=', Timestamp.fromDate(monthStart)),
      where('checkIn', '<=', Timestamp.fromDate(monthEnd))
    );
    const monthBookingsSnap = await getDocs(monthBookingsQuery);
    const monthBookings = monthBookingsSnap.docs.map(d => d.data());
    const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // جلب مصروفات الشهر
    const monthExpensesQuery = query(
      expensesRef,
      where('propertyId', '==', propertyId),
      where('date', '>=', Timestamp.fromDate(monthStart)),
      where('date', '<=', Timestamp.fromDate(monthEnd)),
      where('status', '==', 'approved')
    );
    const monthExpensesSnap = await getDocs(monthExpensesQuery);
    const monthExpenses = monthExpensesSnap.docs.map(d => d.data());
    const monthExpensesTotal = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const monthProfit = monthRevenue - monthExpensesTotal;
    profitByMonth.push({ month: monthName, profit: monthProfit });
  }

  return {
    financial: {
      revenue: {
        label: 'إجمالي الإيرادات',
        value: totalRevenue,
        unit: 'SAR' as const,
        target: 500000,
        status: getKPIStatus(totalRevenue, 500000)
      },
      expenses: {
        label: 'إجمالي المصروفات',
        value: totalExpenses,
        unit: 'SAR' as const,
        target: 300000,
        status: totalExpenses <= 300000 ? 'good' : 'warning'
      },
      profit: {
        label: 'صافي الربح',
        value: netProfit,
        unit: 'SAR' as const,
        target: 200000,
        status: getKPIStatus(netProfit, 200000)
      },
      profitMargin: {
        label: 'هامش الربح',
        value: profitMargin.toFixed(1),
        unit: 'percentage' as const,
        target: 40,
        status: getKPIStatus(profitMargin, 40)
      }
    },
    cashFlow: {
      operatingCashFlow: {
        label: 'التدفق التشغيلي',
        value: operatingCashFlow,
        unit: 'SAR' as const
      },
      investingCashFlow: {
        label: 'التدفق الاستثماري',
        value: investingCashFlow,
        unit: 'SAR' as const
      },
      financingCashFlow: {
        label: 'التدفق التمويلي',
        value: financingCashFlow,
        unit: 'SAR' as const
      },
      netCashFlow: {
        label: 'صافي التدفق النقدي',
        value: netCashFlow,
        unit: 'SAR' as const,
        status: netCashFlow >= 0 ? 'good' : 'critical'
      }
    },
    accountsReceivable: {
      totalReceivable: {
        label: 'إجمالي الذمم المدينة',
        value: totalReceivable,
        unit: 'SAR' as const
      },
      averageCollectionPeriod: {
        label: 'متوسط فترة التحصيل',
        value: averageCollectionPeriod,
        unit: 'days' as const,
        target: 30,
        status: averageCollectionPeriod <= 30 ? 'good' : 'warning'
      },
      overdueAmount: {
        label: 'المبالغ المتأخرة',
        value: overdueReceivable,
        unit: 'SAR' as const,
        status: overdueReceivable === 0 ? 'good' : 'warning'
      },
      collectionRate: {
        label: 'معدل التحصيل',
        value: collectionRate.toFixed(1),
        unit: 'percentage' as const,
        target: 95,
        status: getKPIStatus(collectionRate, 95)
      }
    },
    accountsPayable: {
      totalPayable: {
        label: 'إجمالي الذمم الدائنة',
        value: totalPayable,
        unit: 'SAR' as const
      },
      averagePaymentPeriod: {
        label: 'متوسط فترة السداد',
        value: averagePaymentPeriod,
        unit: 'days' as const,
        target: 45,
        status: averagePaymentPeriod <= 45 ? 'good' : 'warning'
      },
      overdueAmount: {
        label: 'المبالغ المتأخرة',
        value: overduePayable,
        unit: 'SAR' as const,
        status: overduePayable === 0 ? 'good' : 'warning'
      }
    },
    breakdown: {
      revenueByCategory,
      expensesByCategory,
      profitByMonth
    }
  };
}

// ====================================
// Export Functions
// ====================================

export default {
  getGMDashboardData,
  getGMOverview,
  getGMFinancial,
  getGMOperations,
  getGMTrends,
  getCFODashboardData
};
