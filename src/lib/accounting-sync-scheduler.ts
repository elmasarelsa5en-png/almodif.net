/**
 * نظام جدولة المزامنة التلقائية
 * Automated Sync Scheduler & Queue Processor
 * 
 * المهام:
 * 1. معالجة قائمة المزامنة (Sync Queue)
 * 2. جدولة المزامنة التلقائية
 * 3. إعادة المحاولة للعمليات الفاشلة
 * 4. تنظيف السجلات القديمة
 */

import {
  getActiveAccountingConfig,
  getPendingSyncItems,
  updateSyncQueueItem,
  addSyncLog,
  updateAccountingConfig,
  cleanupCompletedSyncItems,
  type SyncQueueItem,
  type AccountingConfig
} from './accounting-config';

import {
  QoyodAdapter,
  DaftraAdapter,
  pushBankVoucherToAccounting,
  pushPromissoryNoteToAccounting,
  type AccountingAdapter
} from './accounting-integration';

import { getBankVoucherById } from './bank-vouchers-system';
import { getPromissoryNoteById } from './promissory-notes-system';

// ============================================
// Types
// ============================================

interface ProcessResult {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{ itemId: string; error: string }>;
}

interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxItemsPerRun: number;
  retryDelayMinutes: number;
  cleanupOlderThanDays: number;
}

// ============================================
// Scheduler State
// ============================================

let isRunning = false;
let schedulerInterval: NodeJS.Timeout | null = null;
let lastRunAt: Date | null = null;
let totalProcessed = 0;
let totalErrors = 0;

// ============================================
// Core Functions
// ============================================

/**
 * معالجة عنصر واحد من قائمة المزامنة
 */
async function processSyncItem(
  item: SyncQueueItem,
  config: AccountingConfig,
  adapter: AccountingAdapter
): Promise<{ success: boolean; error?: string; externalId?: string }> {
  try {
    let result;

    switch (item.type) {
      case 'voucher':
        const voucher = await getBankVoucherById(item.internalId);
        if (!voucher) {
          throw new Error('سند البنك غير موجود');
        }
        result = await pushBankVoucherToAccounting(
          voucher,
          adapter,
          config.accountMapping as any
        );
        break;

      case 'promissory_note':
        const note = await getPromissoryNoteById(item.internalId);
        if (!note) {
          throw new Error('الكمبيالة غير موجودة');
        }
        result = await pushPromissoryNoteToAccounting(
          note,
          adapter,
          config.accountMapping as any
        );
        break;

      case 'invoice':
      case 'payment':
        // سيتم التنفيذ لاحقاً
        throw new Error('هذا النوع غير مدعوم حالياً');

      default:
        throw new Error('نوع غير معروف');
    }

    return {
      success: result.success,
      error: result.error ? JSON.stringify(result.error) : undefined,
      externalId: result.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطأ غير معروف'
    };
  }
}

/**
 * معالجة قائمة المزامنة
 */
export async function processQueueBatch(
  maxItems: number = 50
): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  try {
    // الحصول على الإعداد النشط
    const config = await getActiveAccountingConfig();
    if (!config || !config.isActive) {
      console.log('لا يوجد إعداد محاسبي نشط');
      return result;
    }

    // إنشاء adapter المناسب
    let adapter: AccountingAdapter;
    if (config.provider === 'qoyod') {
      adapter = new QoyodAdapter({
        provider: 'qoyod',
        baseUrl: config.credentials.baseUrl || 'https://api.qoyod.com/v1',
        apiKey: config.credentials.apiKey,
        defaultAccountMap: config.accountMapping as any
      });
    } else if (config.provider === 'daftra') {
      adapter = new DaftraAdapter({
        provider: 'daftra',
        baseUrl: config.credentials.baseUrl || 'https://api.daftra.com',
        apiKey: config.credentials.apiKey,
        defaultAccountMap: config.accountMapping as any
      });
    } else {
      console.log('نظام محاسبي غير مدعوم:', config.provider);
      return result;
    }

    // الحصول على العناصر المعلقة
    const pendingItems = await getPendingSyncItems(maxItems);
    console.log(`معالجة ${pendingItems.length} عنصر من قائمة المزامنة...`);

    // معالجة كل عنصر
    for (const item of pendingItems) {
      result.processed++;

      // تحديث الحالة إلى "processing"
      await updateSyncQueueItem(item.id!, {
        status: 'processing',
        lastAttemptAt: new Date()
      });

      // معالجة العنصر
      const processResult = await processSyncItem(item, config, adapter);

      if (processResult.success) {
        // نجاح
        result.successful++;

        await updateSyncQueueItem(item.id!, {
          status: 'success',
          externalId: processResult.externalId,
          processedAt: new Date()
        });

        // تسجيل في السجل
        await addSyncLog(config.id!, {
          type: item.type,
          action: item.action,
          internalId: item.internalId,
          externalId: processResult.externalId,
          status: 'success',
          attempts: item.attempts + 1
        });
      } else {
        // فشل
        result.failed++;
        const newAttempts = item.attempts + 1;

        // تحديث الحالة
        if (newAttempts >= item.maxAttempts) {
          // تجاوز الحد الأقصى من المحاولات
          await updateSyncQueueItem(item.id!, {
            status: 'error',
            attempts: newAttempts,
            error: processResult.error,
            processedAt: new Date()
          });

          result.errors.push({
            itemId: item.id!,
            error: processResult.error || 'فشل بعد عدة محاولات'
          });
        } else {
          // إعادة للحالة pending لمحاولة أخرى
          await updateSyncQueueItem(item.id!, {
            status: 'pending',
            attempts: newAttempts,
            error: processResult.error
          });
        }

        // تسجيل في السجل
        await addSyncLog(config.id!, {
          type: item.type,
          action: item.action,
          internalId: item.internalId,
          status: 'error',
          error: processResult.error,
          attempts: newAttempts
        });
      }

      // تأخير صغير بين العناصر لتجنب Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // تحديث آخر وقت مزامنة
    if (result.processed > 0) {
      await updateAccountingConfig(
        config.id!,
        {
          syncSettings: {
            ...config.syncSettings,
            lastSyncAt: new Date()
          }
        },
        'system'
      );
    }

    totalProcessed += result.processed;
    totalErrors += result.failed;

    console.log(`✅ تمت معالجة ${result.successful}/${result.processed} عنصر بنجاح`);
    if (result.failed > 0) {
      console.log(`❌ فشل ${result.failed} عنصر`);
    }
  } catch (error: any) {
    console.error('خطأ في معالجة القائمة:', error);
  }

  return result;
}

/**
 * تشغيل المزامنة التلقائية
 */
export async function runAutoSync(): Promise<ProcessResult> {
  if (isRunning) {
    console.log('المزامنة قيد التشغيل بالفعل');
    return {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  isRunning = true;
  lastRunAt = new Date();

  try {
    console.log('🔄 بدء المزامنة التلقائية...');
    const result = await processQueueBatch(50);
    console.log('✅ انتهت المزامنة التلقائية');
    return result;
  } catch (error: any) {
    console.error('❌ خطأ في المزامنة التلقائية:', error);
    return {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [{ itemId: 'unknown', error: error.message }]
    };
  } finally {
    isRunning = false;
  }
}

/**
 * بدء الجدولة التلقائية
 */
export function startScheduler(config: SchedulerConfig = {
  enabled: true,
  intervalMinutes: 60,
  maxItemsPerRun: 50,
  retryDelayMinutes: 15,
  cleanupOlderThanDays: 7
}): void {
  if (schedulerInterval) {
    console.log('الجدولة قيد التشغيل بالفعل');
    return;
  }

  if (!config.enabled) {
    console.log('الجدولة معطلة');
    return;
  }

  console.log(`🚀 بدء جدولة المزامنة كل ${config.intervalMinutes} دقيقة`);

  // تشغيل فوري
  runAutoSync();

  // تشغيل دوري
  schedulerInterval = setInterval(async () => {
    await runAutoSync();
    
    // تنظيف السجلات القديمة (مرة واحدة يومياً)
    const hoursSinceLastCleanup = lastRunAt 
      ? (Date.now() - lastRunAt.getTime()) / (1000 * 60 * 60)
      : 24;
    
    if (hoursSinceLastCleanup >= 24) {
      console.log('🧹 تنظيف السجلات القديمة...');
      const deleted = await cleanupCompletedSyncItems(config.cleanupOlderThanDays);
      console.log(`✅ تم حذف ${deleted} سجل قديم`);
    }
  }, config.intervalMinutes * 60 * 1000);

  console.log('✅ الجدولة نشطة');
}

/**
 * إيقاف الجدولة
 */
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏸️ تم إيقاف الجدولة');
  }
}

/**
 * الحصول على حالة الجدولة
 */
export function getSchedulerStatus() {
  return {
    isRunning,
    isScheduled: schedulerInterval !== null,
    lastRunAt,
    totalProcessed,
    totalErrors,
    successRate: totalProcessed > 0 
      ? ((totalProcessed - totalErrors) / totalProcessed * 100).toFixed(2) + '%'
      : 'N/A'
  };
}

/**
 * مزامنة يدوية فورية
 */
export async function syncNow(): Promise<ProcessResult> {
  console.log('🔄 مزامنة يدوية فورية...');
  return await runAutoSync();
}

/**
 * إعادة محاولة العناصر الفاشلة
 */
export async function retryFailedItems(): Promise<ProcessResult> {
  console.log('🔁 إعادة محاولة العناصر الفاشلة...');
  
  // إعادة تعيين حالة العناصر الفاشلة إلى pending
  const pendingItems = await getPendingSyncItems(100);
  const failedItems = pendingItems.filter(item => item.status === 'error');
  
  for (const item of failedItems) {
    await updateSyncQueueItem(item.id!, {
      status: 'pending',
      attempts: 0, // إعادة تعيين المحاولات
      error: undefined
    });
  }
  
  console.log(`✅ تم إعادة تعيين ${failedItems.length} عنصر فاشل`);
  
  return await runAutoSync();
}

// ============================================
// Webhook Handler للمزامنة الفورية
// ============================================

/**
 * استقبال تحديثات من الأنظمة المحاسبية
 */
export async function handleAccountingWebhook(event: any): Promise<void> {
  try {
    console.log('📨 استلام webhook من النظام المحاسبي:', event.type);
    
    const config = await getActiveAccountingConfig();
    if (!config) return;
    
    // معالجة الحدث حسب النوع
    switch (event.type) {
      case 'invoice.paid':
      case 'payment.received':
        // تحديث حالة الدفع في النظام
        console.log('✅ تم استلام دفعة:', event.data);
        break;
        
      case 'journal.posted':
        // تم ترحيل القيد
        console.log('✅ تم ترحيل القيد:', event.data);
        break;
        
      default:
        console.log('⚠️ نوع حدث غير معروف:', event.type);
    }
    
    // تسجيل الحدث
    await addSyncLog(config.id!, {
      type: 'payment',
      action: 'update',
      internalId: event.data?.reference || 'webhook',
      externalId: event.data?.id,
      status: 'success',
      attempts: 1
    });
  } catch (error: any) {
    console.error('❌ خطأ في معالجة webhook:', error);
  }
}

// ============================================
// Export All
// ============================================

export default {
  processQueueBatch,
  runAutoSync,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  syncNow,
  retryFailedItems,
  handleAccountingWebhook
};
