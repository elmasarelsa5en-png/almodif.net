/**
 * نظام تسجيل النشاطات - Activity Log System
 * يسجل كل الحركات على التطبيق ولا تُمسح إلا بإذن المستخدم
 */

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  deviceInfo?: string;
  dataChanged?: {
    before?: any;
    after?: any;
  };
}

// مفاتيح التخزين
const ACTIVITY_LOG_KEY = 'app_activity_logs';
const LOG_SETTINGS_KEY = 'app_log_settings';

/**
 * حفظ نشاط جديد
 */
export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  try {
    // التحقق من تفعيل التسجيل
    const settings = getLogSettings();
    if (!settings.enabled) return;

    const logs = getActivityLogs();
    
    const newLog: ActivityLog = {
      ...activity,
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      ipAddress: getIPAddress(),
      deviceInfo: getDeviceInfo()
    };

    logs.unshift(newLog); // إضافة في البداية (الأحدث أولاً)
    
    // حفظ في LocalStorage
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
    
    // إرسال إلى السيرفر إذا كان متاح
    if (settings.syncToServer) {
      syncLogToServer(newLog);
    }
  } catch (error) {
    console.error('خطأ في تسجيل النشاط:', error);
  }
}

/**
 * الحصول على جميع السجلات
 */
export function getActivityLogs(filters?: {
  userId?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
}): ActivityLog[] {
  try {
    const logsJson = localStorage.getItem(ACTIVITY_LOG_KEY);
    let logs: ActivityLog[] = logsJson ? JSON.parse(logsJson) : [];

    // تطبيق الفلاتر
    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.module) {
        logs = logs.filter(log => log.module === filters.module);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action.includes(filters.action!));
      }
    }

    return logs;
  } catch (error) {
    console.error('خطأ في قراءة السجلات:', error);
    return [];
  }
}

/**
 * حذف سجلات محددة (يحتاج صلاحيات إدارية)
 */
export function deleteActivityLogs(logIds: string[], adminUserId: string): boolean {
  try {
    // تسجيل عملية الحذف نفسها
    logActivity({
      userId: adminUserId,
      userName: 'Admin',
      action: 'حذف سجلات',
      module: 'Activity Log',
      details: `تم حذف ${logIds.length} سجل`
    });

    const logs = getActivityLogs();
    const filteredLogs = logs.filter(log => !logIds.includes(log.id));
    
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(filteredLogs));
    return true;
  } catch (error) {
    console.error('خطأ في حذف السجلات:', error);
    return false;
  }
}

/**
 * حذف جميع السجلات (يحتاج تأكيد)
 */
export function clearAllLogs(adminUserId: string, confirmationCode: string): boolean {
  if (confirmationCode !== 'DELETE_ALL_LOGS') {
    throw new Error('كود التأكيد غير صحيح');
  }

  try {
    const count = getActivityLogs().length;
    
    // حفظ سجل واحد قبل المسح
    const finalLog: ActivityLog = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      userId: adminUserId,
      userName: 'Admin',
      action: 'مسح جميع السجلات',
      module: 'Activity Log',
      details: `تم مسح ${count} سجل`
    };

    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify([finalLog]));
    return true;
  } catch (error) {
    console.error('خطأ في مسح السجلات:', error);
    return false;
  }
}

/**
 * تصدير السجلات إلى ملف
 */
export function exportLogs(format: 'json' | 'csv' = 'json'): string {
  const logs = getActivityLogs();
  
  if (format === 'json') {
    return JSON.stringify(logs, null, 2);
  } else {
    // CSV format
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Module', 'Details'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.userName,
      log.action,
      log.module,
      log.details
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

/**
 * الحصول على إحصائيات السجلات
 */
export function getLogStatistics(): {
  totalLogs: number;
  byModule: Record<string, number>;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
} {
  const logs = getActivityLogs();
  const now = new Date();
  
  const stats = {
    totalLogs: logs.length,
    byModule: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    last24Hours: 0,
    last7Days: 0,
    last30Days: 0
  };

  logs.forEach(log => {
    // حسب الموديول
    stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
    
    // حسب العملية
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    
    // حسب المستخدم
    stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
    
    // حسب الوقت
    const logDate = new Date(log.timestamp);
    const hoursDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff <= 24) stats.last24Hours++;
    if (hoursDiff <= 24 * 7) stats.last7Days++;
    if (hoursDiff <= 24 * 30) stats.last30Days++;
  });

  return stats;
}

// ============= إعدادات التسجيل =============

interface LogSettings {
  enabled: boolean;
  syncToServer: boolean;
  retentionDays: number;
  modules: string[];
}

export function getLogSettings(): LogSettings {
  try {
    const settingsJson = localStorage.getItem(LOG_SETTINGS_KEY);
    return settingsJson ? JSON.parse(settingsJson) : {
      enabled: true,
      syncToServer: false,
      retentionDays: 90,
      modules: ['all']
    };
  } catch {
    return {
      enabled: true,
      syncToServer: false,
      retentionDays: 90,
      modules: ['all']
    };
  }
}

export function updateLogSettings(settings: Partial<LogSettings>): void {
  const current = getLogSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(LOG_SETTINGS_KEY, JSON.stringify(updated));
}

// ============= دوال مساعدة =============

function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getIPAddress(): string {
  // يمكن الحصول عليه من API خارجي
  return 'N/A';
}

function getDeviceInfo(): string {
  return navigator.userAgent;
}

function syncLogToServer(log: ActivityLog): void {
  // يمكن إضافة API call هنا
  // fetch('/api/logs', { method: 'POST', body: JSON.stringify(log) })
}

// ============= أمثلة على الاستخدام =============

// تسجيل إنشاء فاتورة جديدة
export function logInvoiceCreated(userId: string, userName: string, invoiceData: any): void {
  logActivity({
    userId,
    userName,
    action: 'إنشاء فاتورة',
    module: 'الفواتير',
    details: `تم إنشاء فاتورة رقم ${invoiceData.number} للعميل ${invoiceData.customerName} بمبلغ ${invoiceData.amount} ر.س`,
    dataChanged: {
      after: invoiceData
    }
  });
}

// تسجيل تعديل فاتورة
export function logInvoiceUpdated(userId: string, userName: string, oldData: any, newData: any): void {
  logActivity({
    userId,
    userName,
    action: 'تعديل فاتورة',
    module: 'الفواتير',
    details: `تم تعديل فاتورة رقم ${newData.number}`,
    dataChanged: {
      before: oldData,
      after: newData
    }
  });
}

// تسجيل حذف فاتورة
export function logInvoiceDeleted(userId: string, userName: string, invoiceData: any): void {
  logActivity({
    userId,
    userName,
    action: 'حذف فاتورة',
    module: 'الفواتير',
    details: `تم حذف فاتورة رقم ${invoiceData.number} للعميل ${invoiceData.customerName}`,
    dataChanged: {
      before: invoiceData
    }
  });
}

// تسجيل طباعة فاتورة
export function logInvoicePrinted(userId: string, userName: string, invoiceNumber: string): void {
  logActivity({
    userId,
    userName,
    action: 'طباعة فاتورة',
    module: 'الفواتير',
    details: `تم طباعة فاتورة رقم ${invoiceNumber}`
  });
}

// تسجيل تسجيل الدخول
export function logUserLogin(userId: string, userName: string): void {
  logActivity({
    userId,
    userName,
    action: 'تسجيل دخول',
    module: 'المصادقة',
    details: `تسجيل دخول ناجح للمستخدم ${userName}`
  });
}

// تسجيل تسجيل الخروج
export function logUserLogout(userId: string, userName: string): void {
  logActivity({
    userId,
    userName,
    action: 'تسجيل خروج',
    module: 'المصادقة',
    details: `تسجيل خروج للمستخدم ${userName}`
  });
}
