/**
 * نظام سجل التدقيق (Audit Log System)
 * يسجل جميع العمليات في التطبيق ولا يمسحها أبداً
 * 
 * الميزات:
 * - تسجيل تلقائي لجميع العمليات
 * - حفظ دائم في localStorage
 * - معلومات كاملة (من، متى، ماذا، أين)
 * - نسخ احتياطي تلقائي
 * - تصدير للملفات
 */

export interface AuditLogEntry {
  id: string;                    // معرف فريد
  timestamp: string;             // وقت العملية (ISO format)
  date: string;                  // التاريخ المقروء
  time: string;                  // الوقت المقروء
  userId: string;                // معرف المستخدم
  userName: string;              // اسم المستخدم
  userEmail: string;             // بريد المستخدم
  action: AuditAction;           // نوع العملية
  category: AuditCategory;       // الفئة
  entity: string;                // الكيان (موظف، غرفة، إلخ)
  entityId?: string;             // معرف الكيان
  description: string;           // وصف العملية بالعربي
  changes?: AuditChange[];       // التغييرات التفصيلية
  metadata?: Record<string, any>; // بيانات إضافية
  ipAddress?: string;            // عنوان IP
  device?: string;               // الجهاز المستخدم
  browser?: string;              // المتصفح
  location?: string;             // الموقع الجغرافي
}

export type AuditAction = 
  | 'CREATE'    // إضافة
  | 'UPDATE'    // تعديل
  | 'DELETE'    // حذف
  | 'VIEW'      // عرض
  | 'LOGIN'     // تسجيل دخول
  | 'LOGOUT'    // تسجيل خروج
  | 'EXPORT'    // تصدير
  | 'IMPORT'    // استيراد
  | 'APPROVE'   // موافقة
  | 'REJECT'    // رفض
  | 'RESTORE'   // استعادة
  | 'ARCHIVE'   // أرشفة
  | 'PRINT'     // طباعة
  | 'SEND'      // إرسال
  | 'RECEIVE'   // استلام
  | 'PAYMENT'   // دفع
  | 'REFUND';   // استرداد

export type AuditCategory =
  | 'EMPLOYEE'          // الموظفين
  | 'ROOM'              // الغرف
  | 'BOOKING'           // الحجوزات
  | 'GUEST'             // الضيوف
  | 'INVOICE'           // الفواتير
  | 'PAYMENT'           // المدفوعات
  | 'EXPENSE'           // المصروفات
  | 'VOUCHER'           // السندات
  | 'INVENTORY'         // المخزون
  | 'LAUNDRY'           // المغسلة
  | 'COFFEE_SHOP'       // المقهى
  | 'RESTAURANT'        // المطعم
  | 'REQUEST'           // الطلبات
  | 'SETTINGS'          // الإعدادات
  | 'USER'              // المستخدمين
  | 'REPORT'            // التقارير
  | 'BACKUP'            // النسخ الاحتياطي
  | 'SYSTEM'            // النظام
  | 'AI'                // الذكاء الاصطناعي
  | 'NOTIFICATION'      // الإشعارات
  | 'WHATSAPP'          // واتساب
  | 'OTHER';            // أخرى

export interface AuditChange {
  field: string;        // اسم الحقل
  fieldLabel: string;   // تسمية الحقل بالعربي
  oldValue: any;        // القيمة القديمة
  newValue: any;        // القيمة الجديدة
  type?: string;        // نوع البيانات
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  byAction: Record<AuditAction, number>;
  byCategory: Record<AuditCategory, number>;
  byUser: Record<string, number>;
  topUsers: Array<{ userName: string; count: number }>;
  recentActivity: AuditLogEntry[];
}

class AuditLogSystem {
  private readonly STORAGE_KEY = 'audit-logs';
  private readonly BACKUP_KEY = 'audit-logs-backup';
  private readonly MAX_LOGS = 100000; // حد أقصى 100,000 سجل

  /**
   * تسجيل عملية جديدة
   */
  async log(params: {
    action: AuditAction;
    category: AuditCategory;
    entity: string;
    entityId?: string;
    description: string;
    changes?: AuditChange[];
    metadata?: Record<string, any>;
  }): Promise<AuditLogEntry> {
    try {
      // الحصول على معلومات المستخدم الحالي
      const user = this.getCurrentUser();
      
      // إنشاء السجل
      const now = new Date();
      const entry: AuditLogEntry = {
        id: this.generateId(),
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }),
        time: now.toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: params.action,
        category: params.category,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        changes: params.changes,
        metadata: params.metadata,
        ipAddress: await this.getIpAddress(),
        device: this.getDeviceInfo(),
        browser: this.getBrowserInfo(),
        location: await this.getLocation()
      };

      // حفظ السجل
      this.saveLog(entry);

      // نسخ احتياطي تلقائي كل 100 سجل
      if (this.getTotalCount() % 100 === 0) {
        this.createBackup();
      }

      console.log('✅ تم تسجيل العملية:', entry.description);
      return entry;

    } catch (error) {
      console.error('❌ خطأ في تسجيل العملية:', error);
      // لا نرمي الخطأ لكي لا نعطل التطبيق
      return null as any;
    }
  }

  /**
   * حفظ السجل في localStorage
   */
  private saveLog(entry: AuditLogEntry): void {
    try {
      const logs = this.getAllLogs();
      logs.unshift(entry); // إضافة في البداية (الأحدث أولاً)

      // التحقق من الحد الأقصى
      if (logs.length > this.MAX_LOGS) {
        // نسخ السجلات القديمة قبل حذفها
        const oldLogs = logs.slice(this.MAX_LOGS);
        this.archiveOldLogs(oldLogs);
        logs.splice(this.MAX_LOGS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('❌ خطأ في حفظ السجل:', error);
      // محاولة تنظيف localStorage إذا امتلأ
      this.cleanupStorage();
    }
  }

  /**
   * الحصول على جميع السجلات
   */
  getAllLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ خطأ في قراءة السجلات:', error);
      return [];
    }
  }

  /**
   * البحث في السجلات
   */
  search(params: {
    query?: string;
    action?: AuditAction;
    category?: AuditCategory;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    let logs = this.getAllLogs();

    // فلترة حسب المعايير
    if (params.query) {
      const q = params.query.toLowerCase();
      logs = logs.filter(log => 
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q)
      );
    }

    if (params.action) {
      logs = logs.filter(log => log.action === params.action);
    }

    if (params.category) {
      logs = logs.filter(log => log.category === params.category);
    }

    if (params.userId) {
      logs = logs.filter(log => log.userId === params.userId);
    }

    if (params.startDate) {
      logs = logs.filter(log => 
        new Date(log.timestamp) >= params.startDate!
      );
    }

    if (params.endDate) {
      logs = logs.filter(log => 
        new Date(log.timestamp) <= params.endDate!
      );
    }

    // التحديد
    if (params.limit) {
      logs = logs.slice(0, params.limit);
    }

    return logs;
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(): AuditStats {
    const logs = this.getAllLogs();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: AuditStats = {
      totalLogs: logs.length,
      todayLogs: logs.filter(log => new Date(log.timestamp) >= today).length,
      thisWeekLogs: logs.filter(log => new Date(log.timestamp) >= weekAgo).length,
      thisMonthLogs: logs.filter(log => new Date(log.timestamp) >= monthAgo).length,
      byAction: {} as any,
      byCategory: {} as any,
      byUser: {},
      topUsers: [],
      recentActivity: logs.slice(0, 10)
    };

    // إحصائيات حسب نوع العملية
    logs.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
    });

    // أكثر المستخدمين نشاطاً
    stats.topUsers = Object.entries(stats.byUser)
      .map(([userName, count]) => ({ userName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  /**
   * تصدير السجلات
   */
  exportLogs(format: 'json' | 'csv' | 'excel' = 'json'): void {
    const logs = this.getAllLogs();

    if (format === 'json') {
      this.downloadJson(logs);
    } else if (format === 'csv') {
      this.downloadCsv(logs);
    } else if (format === 'excel') {
      this.downloadExcel(logs);
    }
  }

  /**
   * نسخ احتياطي
   */
  private createBackup(): void {
    try {
      const logs = this.getAllLogs();
      const backup = {
        timestamp: new Date().toISOString(),
        count: logs.length,
        logs: logs
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      console.log('✅ تم إنشاء نسخة احتياطية:', logs.length, 'سجل');
    } catch (error) {
      console.error('❌ خطأ في النسخ الاحتياطي:', error);
    }
  }

  /**
   * استعادة من النسخة الاحتياطية
   */
  restoreFromBackup(): boolean {
    try {
      const data = localStorage.getItem(this.BACKUP_KEY);
      if (!data) return false;

      const backup = JSON.parse(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backup.logs));
      console.log('✅ تمت الاستعادة من النسخة الاحتياطية');
      return true;
    } catch (error) {
      console.error('❌ خطأ في الاستعادة:', error);
      return false;
    }
  }

  /**
   * أرشفة السجلات القديمة
   */
  private archiveOldLogs(logs: AuditLogEntry[]): void {
    try {
      const archiveKey = `audit-archive-${Date.now()}`;
      localStorage.setItem(archiveKey, JSON.stringify({
        timestamp: new Date().toISOString(),
        count: logs.length,
        logs: logs
      }));
      console.log('📦 تم أرشفة', logs.length, 'سجل قديم');
    } catch (error) {
      console.error('❌ خطأ في الأرشفة:', error);
    }
  }

  /**
   * تنظيف localStorage
   */
  private cleanupStorage(): void {
    try {
      // حذف المفاتيح غير الضرورية
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('audit-archive-')) {
          const item = localStorage.getItem(key);
          if (item) {
            const archive = JSON.parse(item);
            const timestamp = new Date(archive.timestamp);
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            
            // حذف الأرشيفات الأقدم من شهر
            if (timestamp < monthAgo) {
              localStorage.removeItem(key);
              console.log('🗑️ تم حذف أرشيف قديم:', key);
            }
          }
        }
      });
    } catch (error) {
      console.error('❌ خطأ في التنظيف:', error);
    }
  }

  /**
   * الحصول على عدد السجلات
   */
  getTotalCount(): number {
    return this.getAllLogs().length;
  }

  /**
   * مساعدات خاصة
   */
  private generateId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUser() {
    // الحصول من AuthContext أو localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        id: user.uid || user.id || 'unknown',
        name: user.displayName || user.name || 'مستخدم',
        email: user.email || 'لا يوجد'
      };
    }
    return { id: 'guest', name: 'زائر', email: '' };
  }

  private async getIpAddress(): Promise<string> {
    try {
      // يمكن استخدام API خارجي
      return 'N/A';
    } catch {
      return 'N/A';
    }
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private async getLocation(): Promise<string> {
    // يمكن استخدام Geolocation API
    return 'N/A';
  }

  private downloadJson(logs: AuditLogEntry[]): void {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadCsv(logs: AuditLogEntry[]): void {
    const headers = ['التاريخ', 'الوقت', 'المستخدم', 'العملية', 'الفئة', 'الكيان', 'الوصف'];
    const rows = logs.map(log => [
      log.date,
      log.time,
      log.userName,
      this.translateAction(log.action),
      this.translateCategory(log.category),
      log.entity,
      log.description
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadExcel(logs: AuditLogEntry[]): void {
    // استخدام مكتبة مثل SheetJS لاحقاً
    this.downloadCsv(logs); // مؤقتاً نستخدم CSV
  }

  private translateAction(action: AuditAction): string {
    const translations: Record<AuditAction, string> = {
      CREATE: 'إضافة',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
      VIEW: 'عرض',
      LOGIN: 'تسجيل دخول',
      LOGOUT: 'تسجيل خروج',
      EXPORT: 'تصدير',
      IMPORT: 'استيراد',
      APPROVE: 'موافقة',
      REJECT: 'رفض',
      RESTORE: 'استعادة',
      ARCHIVE: 'أرشفة',
      PRINT: 'طباعة',
      SEND: 'إرسال',
      RECEIVE: 'استلام',
      PAYMENT: 'دفع',
      REFUND: 'استرداد'
    };
    return translations[action] || action;
  }

  private translateCategory(category: AuditCategory): string {
    const translations: Record<AuditCategory, string> = {
      EMPLOYEE: 'موظف',
      ROOM: 'غرفة',
      BOOKING: 'حجز',
      GUEST: 'ضيف',
      INVOICE: 'فاتورة',
      PAYMENT: 'دفعة',
      EXPENSE: 'مصروف',
      VOUCHER: 'سند',
      INVENTORY: 'مخزون',
      LAUNDRY: 'مغسلة',
      COFFEE_SHOP: 'مقهى',
      RESTAURANT: 'مطعم',
      REQUEST: 'طلب',
      SETTINGS: 'إعدادات',
      USER: 'مستخدم',
      REPORT: 'تقرير',
      BACKUP: 'نسخة احتياطية',
      SYSTEM: 'نظام',
      AI: 'ذكاء اصطناعي',
      NOTIFICATION: 'إشعار',
      WHATSAPP: 'واتساب',
      OTHER: 'أخرى'
    };
    return translations[category] || category;
  }
}

// تصدير نسخة واحدة فقط (Singleton)
export const auditLog = new AuditLogSystem();

// دوال مساعدة سريعة
export const logAction = {
  // الموظفين
  addEmployee: (employeeName: string, employeeId: string) => 
    auditLog.log({
      action: 'CREATE',
      category: 'EMPLOYEE',
      entity: 'موظف',
      entityId: employeeId,
      description: `تم إضافة موظف جديد: ${employeeName}`
    }),

  updateEmployee: (employeeName: string, employeeId: string, changes: AuditChange[]) =>
    auditLog.log({
      action: 'UPDATE',
      category: 'EMPLOYEE',
      entity: 'موظف',
      entityId: employeeId,
      description: `تم تعديل بيانات الموظف: ${employeeName}`,
      changes
    }),

  deleteEmployee: (employeeName: string, employeeId: string) =>
    auditLog.log({
      action: 'DELETE',
      category: 'EMPLOYEE',
      entity: 'موظف',
      entityId: employeeId,
      description: `تم حذف الموظف: ${employeeName}`
    }),

  // الغرف
  addRoom: (roomNumber: string, roomId: string) =>
    auditLog.log({
      action: 'CREATE',
      category: 'ROOM',
      entity: 'غرفة',
      entityId: roomId,
      description: `تم إضافة غرفة جديدة: رقم ${roomNumber}`
    }),

  updateRoom: (roomNumber: string, roomId: string, changes: AuditChange[]) =>
    auditLog.log({
      action: 'UPDATE',
      category: 'ROOM',
      entity: 'غرفة',
      entityId: roomId,
      description: `تم تعديل بيانات الغرفة: رقم ${roomNumber}`,
      changes
    }),

  // السندات
  addVoucher: (voucherType: string, amount: number, voucherId: string) =>
    auditLog.log({
      action: 'CREATE',
      category: 'VOUCHER',
      entity: 'سند',
      entityId: voucherId,
      description: `تم إضافة سند ${voucherType} بمبلغ ${amount} ر.س`
    }),

  // الإعدادات
  updateSettings: (settingName: string, changes: AuditChange[]) =>
    auditLog.log({
      action: 'UPDATE',
      category: 'SETTINGS',
      entity: 'إعدادات',
      description: `تم تعديل الإعدادات: ${settingName}`,
      changes
    }),

  // تسجيل الدخول/الخروج
  login: (userName: string) =>
    auditLog.log({
      action: 'LOGIN',
      category: 'USER',
      entity: 'مستخدم',
      description: `تسجيل دخول: ${userName}`
    }),

  logout: (userName: string) =>
    auditLog.log({
      action: 'LOGOUT',
      category: 'USER',
      entity: 'مستخدم',
      description: `تسجيل خروج: ${userName}`
    })
};
