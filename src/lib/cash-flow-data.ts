// بيانات الحركة النقدية - تم المسح للبدء من الصفر
export const cashFlowData: Array<{id: number; date: string; receipts: number; expenses: number; balance: number; notes: string}> = [];

// بيانات بدل الإيجار - تم المسح
export const rentSubsidyData: Array<{date: string; apartment: string; amount: number}> = [];

// التقرير الشهري - تم التصفير
export const monthlyReport = {
  august: 0,
  september: 0,
  october: 0,
  november: 0,
  december: 0,
  january: 0,
  february: 0,
  march: 0,
  april: 0,
  may: 0,
  june: 0,
  july: 0
};

// الإحصائيات المحسوبة - تم التصفير
export const cashFlowStats = {
  totalReceipts: 0,
  totalExpenses: 0,
  finalBalance: 0,
  entriesCount: 0,
  netFlow: 0,
  averageDaily: 0
};

// تصنيف المعاملات
export const transactionCategories = {
  income: [
    'إيرادات الغرف',
    'خدمات إضافية', 
    'المطعم',
    'الغسيل',
    'إيجارات',
    'أخرى'
  ],
  expense: [
    'رواتب',
    'فواتير',
    'صيانة',
    'تنظيف',
    'إيجارات',
    'مصروفات عامة',
    'أخرى'
  ]
};

// دالة للحصول على معاملات الفترة المحددة
export const getTransactionsByPeriod = (startDate: string, endDate: string) => {
  return cashFlowData.filter(item => {
    // تحويل التاريخ العربي إلى تاريخ قابل للمقارنة
    const itemDateFormatted = convertArabicDateToEnglish(item.date);
    return itemDateFormatted >= startDate && itemDateFormatted <= endDate;
  });
};

// دالة مساعدة لتحويل التاريخ العربي إلى إنجليزي
export const convertArabicDateToEnglish = (arabicDate: string): string => {
  const monthMap: { [key: string]: string } = {
    'يناير': '01',
    'فبراير': '02', 
    'مارس': '03',
    'أبريل': '04',
    'مايو': '05',
    'يونيو': '06',
    'يوليو': '07',
    'أغسطس': '08',
    'سبتمبر': '09',
    'أكتوبر': '10',
    'نوفمبر': '11',
    'ديسمبر': '12'
  };

  const [day, month] = arabicDate.split('-');
  const monthNumber = monthMap[month];
  const year = '2025'; // افتراض السنة

  return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
};

// دالة للحصول على إحصائيات شهر معين
export const getMonthlyStats = (month: string) => {
  const monthTransactions = cashFlowData.filter(item => item.date.includes(month));
  
  return {
    receipts: monthTransactions.reduce((sum, item) => sum + item.receipts, 0),
    expenses: monthTransactions.reduce((sum, item) => sum + item.expenses, 0),
    netFlow: monthTransactions.reduce((sum, item) => sum + (item.receipts - item.expenses), 0),
    transactionCount: monthTransactions.length,
    averageDaily: monthTransactions.length > 0 ? 
      monthTransactions.reduce((sum, item) => sum + (item.receipts - item.expenses), 0) / monthTransactions.length : 0
  };
};

export default {
  cashFlowData,
  rentSubsidyData,
  monthlyReport,
  cashFlowStats,
  transactionCategories,
  getTransactionsByPeriod,
  convertArabicDateToEnglish,
  getMonthlyStats
};