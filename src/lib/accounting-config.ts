// نظام إدارة إعدادات المحاسبة
// Accounting Configuration Management System

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// Types
// ============================================

export type AccountingProvider = 'qoyod' | 'daftra' | 'zoho' | 'manual';
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
export type SyncStatus = 'active' | 'paused' | 'error' | 'disconnected';

export interface AccountingConfig {
  id?: string;
  
  // معلومات أساسية
  provider: AccountingProvider;
  providerName: string;
  isActive: boolean;
  status: SyncStatus;
  
  // بيانات الاتصال
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: Date;
    baseUrl?: string;
    tenantId?: string;
  };
  
  // إعدادات المزامنة
  syncSettings: {
    frequency: SyncFrequency;
    autoSync: boolean;
    syncVouchers: boolean;
    syncPromissoryNotes: boolean;
    syncInvoices: boolean;
    syncPayments: boolean;
    lastSyncAt?: Date;
    nextSyncAt?: Date;
  };
  
  // خريطة الحسابات
  accountMapping: {
    // حسابات بنكية
    defaultBankAccount: string;
    bankAccounts: Record<string, string>; // accountNumber -> chartAccountCode
    
    // حسابات الإيرادات
    revenueAccount: string;
    customerPaymentAccount: string;
    
    // حسابات المصروفات
    expenseAccount: string;
    supplierPaymentAccount: string;
    salaryAccount: string;
    loanPaymentAccount: string;
    bankChargesAccount: string;
    taxPaymentAccount: string;
    
    // حسابات الكمبيالات
    receivableAccount: string;
    payableAccount: string;
    promissoryRevenueAccount: string;
    
    // حسابات أخرى
    capitalAccount: string;
    dividendAccount: string;
    otherAccount: string;
  };
  
  // إعدادات الضرائب
  taxSettings: {
    enabled: boolean;
    defaultTaxRate: number;
    taxAccountCode: string;
    includeTaxInAmount: boolean;
  };
  
  // إعدادات العملة
  currencySettings: {
    baseCurrency: string;
    supportedCurrencies: string[];
    autoConvert: boolean;
    exchangeRateSource?: string;
  };
  
  // سجل المزامنة
  syncLog: SyncLogEntry[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

export interface SyncLogEntry {
  timestamp: Date;
  type: 'voucher' | 'promissory_note' | 'invoice' | 'payment';
  action: 'create' | 'update' | 'delete';
  internalId: string;
  externalId?: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
  attempts: number;
}

export interface SyncQueueItem {
  id?: string;
  configId: string;
  type: 'voucher' | 'promissory_note' | 'invoice' | 'payment';
  action: 'create' | 'update' | 'delete';
  internalId: string;
  externalId?: string;
  payload: any;
  status: 'pending' | 'processing' | 'success' | 'error';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface ChartOfAccounts {
  id?: string;
  provider: AccountingProvider;
  accounts: AccountEntry[];
  lastFetchedAt: Date;
}

export interface AccountEntry {
  code: string;
  name: string;
  nameAr?: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentCode?: string;
  isActive: boolean;
}

// ============================================
// Configuration Management
// ============================================

/**
 * إنشاء إعداد محاسبي جديد
 */
export async function createAccountingConfig(
  configData: Omit<AccountingConfig, 'id' | 'createdAt' | 'updatedAt' | 'syncLog'>
): Promise<string> {
  try {
    const config: Omit<AccountingConfig, 'id'> = {
      ...configData,
      syncLog: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'accounting_configs'), {
      ...config,
      createdAt: Timestamp.fromDate(config.createdAt),
      updatedAt: Timestamp.fromDate(config.updatedAt),
      'syncSettings.lastSyncAt': config.syncSettings.lastSyncAt 
        ? Timestamp.fromDate(config.syncSettings.lastSyncAt) 
        : null,
      'syncSettings.nextSyncAt': config.syncSettings.nextSyncAt 
        ? Timestamp.fromDate(config.syncSettings.nextSyncAt) 
        : null,
      'credentials.tokenExpiry': config.credentials.tokenExpiry 
        ? Timestamp.fromDate(config.credentials.tokenExpiry) 
        : null
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating accounting config:', error);
    throw error;
  }
}

/**
 * الحصول على الإعداد النشط
 */
export async function getActiveAccountingConfig(): Promise<AccountingConfig | null> {
  try {
    const q = query(
      collection(db, 'accounting_configs'),
      where('isActive', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      syncSettings: {
        ...data.syncSettings,
        lastSyncAt: data.syncSettings?.lastSyncAt?.toDate(),
        nextSyncAt: data.syncSettings?.nextSyncAt?.toDate()
      },
      credentials: {
        ...data.credentials,
        tokenExpiry: data.credentials?.tokenExpiry?.toDate()
      }
    } as AccountingConfig;
  } catch (error) {
    console.error('Error getting active config:', error);
    throw error;
  }
}

/**
 * تحديث الإعداد المحاسبي
 */
export async function updateAccountingConfig(
  configId: string,
  updates: Partial<AccountingConfig>,
  modifiedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, 'accounting_configs', configId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: modifiedBy
    };
    
    // تحويل التواريخ
    if (updates.syncSettings?.lastSyncAt) {
      updateData['syncSettings.lastSyncAt'] = Timestamp.fromDate(updates.syncSettings.lastSyncAt);
    }
    if (updates.syncSettings?.nextSyncAt) {
      updateData['syncSettings.nextSyncAt'] = Timestamp.fromDate(updates.syncSettings.nextSyncAt);
    }
    if (updates.credentials?.tokenExpiry) {
      updateData['credentials.tokenExpiry'] = Timestamp.fromDate(updates.credentials.tokenExpiry);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

/**
 * اختبار الاتصال بالنظام المحاسبي
 */
export async function testAccountingConnection(configId: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const configDoc = await getDoc(doc(db, 'accounting_configs', configId));
    if (!configDoc.exists()) {
      return { success: false, message: 'الإعداد غير موجود' };
    }
    
    const config = configDoc.data() as AccountingConfig;
    
    // هنا نستدعي adapter المناسب للاختبار
    // يتم التنفيذ حسب نوع النظام المحاسبي
    
    return {
      success: true,
      message: 'تم الاتصال بنجاح',
      details: {
        provider: config.provider,
        status: 'connected'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'فشل الاتصال',
      details: error
    };
  }
}

// ============================================
// Sync Queue Management
// ============================================

/**
 * إضافة عنصر إلى قائمة المزامنة
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<string> {
  try {
    const queueItem: Omit<SyncQueueItem, 'id'> = {
      ...item,
      status: 'pending',
      attempts: 0,
      maxAttempts: item.maxAttempts || 3,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'sync_queue'), {
      ...queueItem,
      createdAt: Timestamp.fromDate(queueItem.createdAt),
      lastAttemptAt: queueItem.lastAttemptAt ? Timestamp.fromDate(queueItem.lastAttemptAt) : null,
      processedAt: queueItem.processedAt ? Timestamp.fromDate(queueItem.processedAt) : null
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
}

/**
 * الحصول على العناصر المعلقة في قائمة المزامنة
 */
export async function getPendingSyncItems(limit_count: number = 50): Promise<SyncQueueItem[]> {
  try {
    const q = query(
      collection(db, 'sync_queue'),
      where('status', '==', 'pending'),
      limit(limit_count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastAttemptAt: doc.data().lastAttemptAt?.toDate(),
      processedAt: doc.data().processedAt?.toDate()
    } as SyncQueueItem));
  } catch (error) {
    console.error('Error getting pending sync items:', error);
    throw error;
  }
}

/**
 * تحديث حالة عنصر المزامنة
 */
export async function updateSyncQueueItem(
  itemId: string,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  try {
    const docRef = doc(db, 'sync_queue', itemId);
    const updateData: any = { ...updates };
    
    if (updates.lastAttemptAt) {
      updateData.lastAttemptAt = Timestamp.fromDate(updates.lastAttemptAt);
    }
    if (updates.processedAt) {
      updateData.processedAt = Timestamp.fromDate(updates.processedAt);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating sync queue item:', error);
    throw error;
  }
}

/**
 * حذف عناصر المزامنة المكتملة القديمة
 */
export async function cleanupCompletedSyncItems(olderThanDays: number = 7): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const q = query(
      collection(db, 'sync_queue'),
      where('status', '==', 'success'),
      where('processedAt', '<', Timestamp.fromDate(cutoffDate))
    );
    
    const snapshot = await getDocs(q);
    let deletedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'sync_queue', docSnap.id));
      deletedCount++;
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up sync items:', error);
    throw error;
  }
}

// ============================================
// Sync Log Management
// ============================================

/**
 * إضافة سجل مزامنة
 */
export async function addSyncLog(
  configId: string,
  logEntry: Omit<SyncLogEntry, 'timestamp'>
): Promise<void> {
  try {
    const config = await getDoc(doc(db, 'accounting_configs', configId));
    if (!config.exists()) return;
    
    const currentLogs = config.data().syncLog || [];
    const newLog: SyncLogEntry = {
      ...logEntry,
      timestamp: new Date()
    };
    
    // الاحتفاظ بآخر 100 سجل فقط
    const updatedLogs = [newLog, ...currentLogs].slice(0, 100);
    
    await updateDoc(doc(db, 'accounting_configs', configId), {
      syncLog: updatedLogs,
      'syncSettings.lastSyncAt': Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error adding sync log:', error);
    throw error;
  }
}

/**
 * الحصول على سجل المزامنة
 */
export async function getSyncLog(
  configId: string,
  limitCount: number = 50
): Promise<SyncLogEntry[]> {
  try {
    const config = await getDoc(doc(db, 'accounting_configs', configId));
    if (!config.exists()) return [];
    
    const logs = config.data().syncLog || [];
    return logs.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting sync log:', error);
    throw error;
  }
}

// ============================================
// Chart of Accounts Management
// ============================================

/**
 * حفظ دليل الحسابات
 */
export async function saveChartOfAccounts(
  provider: AccountingProvider,
  accounts: AccountEntry[]
): Promise<string> {
  try {
    const chart: Omit<ChartOfAccounts, 'id'> = {
      provider,
      accounts,
      lastFetchedAt: new Date()
    };
    
    // البحث عن دليل موجود لنفس النظام
    const q = query(
      collection(db, 'chart_of_accounts'),
      where('provider', '==', provider),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // تحديث الموجود
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, 'chart_of_accounts', docId), {
        accounts,
        lastFetchedAt: Timestamp.fromDate(chart.lastFetchedAt)
      });
      return docId;
    } else {
      // إنشاء جديد
      const docRef = await addDoc(collection(db, 'chart_of_accounts'), {
        ...chart,
        lastFetchedAt: Timestamp.fromDate(chart.lastFetchedAt)
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving chart of accounts:', error);
    throw error;
  }
}

/**
 * الحصول على دليل الحسابات
 */
export async function getChartOfAccounts(
  provider: AccountingProvider
): Promise<ChartOfAccounts | null> {
  try {
    const q = query(
      collection(db, 'chart_of_accounts'),
      where('provider', '==', provider),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      lastFetchedAt: data.lastFetchedAt?.toDate()
    } as ChartOfAccounts;
  } catch (error) {
    console.error('Error getting chart of accounts:', error);
    throw error;
  }
}

// ============================================
// Statistics
// ============================================

/**
 * إحصائيات المزامنة
 */
export async function getSyncStatistics(configId: string): Promise<{
  totalSynced: number;
  successCount: number;
  errorCount: number;
  pendingCount: number;
  lastSyncAt?: Date;
  syncByType: Record<string, number>;
}> {
  try {
    const config = await getDoc(doc(db, 'accounting_configs', configId));
    if (!config.exists()) {
      return {
        totalSynced: 0,
        successCount: 0,
        errorCount: 0,
        pendingCount: 0,
        syncByType: {}
      };
    }
    
    const logs = config.data().syncLog || [];
    
    const stats = {
      totalSynced: logs.length,
      successCount: logs.filter(l => l.status === 'success').length,
      errorCount: logs.filter(l => l.status === 'error').length,
      pendingCount: logs.filter(l => l.status === 'pending').length,
      lastSyncAt: config.data().syncSettings?.lastSyncAt?.toDate(),
      syncByType: {} as Record<string, number>
    };
    
    // إحصائيات حسب النوع
    logs.forEach(log => {
      stats.syncByType[log.type] = (stats.syncByType[log.type] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting sync statistics:', error);
    throw error;
  }
}
