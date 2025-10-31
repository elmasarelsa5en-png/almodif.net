/**
 * @file scheduled-reports-service.ts - Scheduled Reports Service
 * @description خدمة جدولة التقارير التلقائية
 * @version 1.0.0
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  generateReport,
  getReportTemplate,
  exportToCSV,
  type ReportTemplate
} from '@/lib/report-builder-service';

// ====================================
// Types & Interfaces
// ====================================

export interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) للأسبوعي
  dayOfMonth?: number; // 1-31 للشهري
  month?: number; // 1-12 للسنوي
  time: string; // HH:mm (24-hour format)
  recipients: string[]; // email addresses
  format: 'pdf' | 'excel' | 'csv' | 'json';
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  runHistory: ReportRun[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  propertyId: string;
  // Report Settings
  dateRangeType: 'last_day' | 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'custom';
  customDateRange?: { start: Date; end: Date };
  includeCharts: boolean;
  includeSummary: boolean;
  notifyOnError: boolean;
}

export interface ReportRun {
  id: string;
  scheduledReportId: string;
  executedAt: Date;
  status: 'success' | 'failed' | 'running';
  duration?: number; // milliseconds
  recordCount?: number;
  error?: string;
  fileUrl?: string;
  sentTo?: string[];
}

export interface EmailConfig {
  from: string;
  fromName: string;
  subject: string;
  body: string;
  attachmentName: string;
}

// ====================================
// Create Scheduled Report
// ====================================

export async function createScheduledReport(
  report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt' | 'runHistory' | 'nextRun'>
): Promise<string> {
  try {
    const reportRef = doc(collection(db, 'scheduled_reports'));
    
    // Calculate next run time
    const nextRun = calculateNextRun(
      report.frequency,
      report.time,
      report.dayOfWeek,
      report.dayOfMonth,
      report.month
    );

    const newReport: ScheduledReport = {
      ...report,
      id: reportRef.id,
      nextRun,
      runHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(reportRef, {
      ...newReport,
      createdAt: Timestamp.fromDate(newReport.createdAt),
      updatedAt: Timestamp.fromDate(newReport.updatedAt),
      nextRun: Timestamp.fromDate(newReport.nextRun),
      lastRun: newReport.lastRun ? Timestamp.fromDate(newReport.lastRun) : null
    });

    return reportRef.id;
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    throw error;
  }
}

// ====================================
// Update Scheduled Report
// ====================================

export async function updateScheduledReport(
  reportId: string,
  updates: Partial<ScheduledReport>
): Promise<void> {
  try {
    const reportRef = doc(db, 'scheduled_reports', reportId);
    
    // If frequency or time changed, recalculate next run
    let nextRun: Date | undefined;
    if (updates.frequency || updates.time || updates.dayOfWeek !== undefined || updates.dayOfMonth !== undefined) {
      const currentDoc = await getDoc(reportRef);
      if (currentDoc.exists()) {
        const current = currentDoc.data() as ScheduledReport;
        nextRun = calculateNextRun(
          updates.frequency || current.frequency,
          updates.time || current.time,
          updates.dayOfWeek !== undefined ? updates.dayOfWeek : current.dayOfWeek,
          updates.dayOfMonth !== undefined ? updates.dayOfMonth : current.dayOfMonth,
          updates.month !== undefined ? updates.month : current.month
        );
      }
    }

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    if (nextRun) {
      updateData.nextRun = Timestamp.fromDate(nextRun);
    }

    await updateDoc(reportRef, updateData);
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    throw error;
  }
}

// ====================================
// Delete Scheduled Report
// ====================================

export async function deleteScheduledReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'scheduled_reports', reportId));
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    throw error;
  }
}

// ====================================
// Get Scheduled Reports
// ====================================

export async function getScheduledReports(propertyId: string): Promise<ScheduledReport[]> {
  try {
    const q = query(
      collection(db, 'scheduled_reports'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        nextRun: data.nextRun?.toDate(),
        lastRun: data.lastRun?.toDate(),
        runHistory: data.runHistory?.map((run: any) => ({
          ...run,
          executedAt: run.executedAt?.toDate()
        })) || []
      } as ScheduledReport;
    });
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    return [];
  }
}

// ====================================
// Get Scheduled Report
// ====================================

export async function getScheduledReport(reportId: string): Promise<ScheduledReport | null> {
  try {
    const docSnap = await getDoc(doc(db, 'scheduled_reports', reportId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        nextRun: data.nextRun?.toDate(),
        lastRun: data.lastRun?.toDate(),
        runHistory: data.runHistory?.map((run: any) => ({
          ...run,
          executedAt: run.executedAt?.toDate()
        })) || []
      } as ScheduledReport;
    }
    return null;
  } catch (error) {
    console.error('Error fetching scheduled report:', error);
    return null;
  }
}

// ====================================
// Calculate Next Run Time
// ====================================

export function calculateNextRun(
  frequency: ScheduledReport['frequency'],
  time: string,
  dayOfWeek?: number,
  dayOfMonth?: number,
  month?: number
): Date {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      // إذا كان الوقت قد مضى اليوم، جدول لغداً
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;

    case 'weekly':
      // جدول لليوم المحدد من الأسبوع
      if (dayOfWeek !== undefined) {
        const currentDay = nextRun.getDay();
        let daysToAdd = dayOfWeek - currentDay;
        
        if (daysToAdd < 0 || (daysToAdd === 0 && nextRun <= now)) {
          daysToAdd += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      }
      break;

    case 'monthly':
      // جدول لليوم المحدد من الشهر
      if (dayOfMonth !== undefined) {
        nextRun.setDate(dayOfMonth);
        
        // إذا كان التاريخ قد مضى هذا الشهر، انتقل للشهر القادم
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        
        // التعامل مع الأشهر التي لديها أيام أقل
        if (nextRun.getDate() !== dayOfMonth) {
          nextRun.setDate(0); // آخر يوم من الشهر السابق
        }
      }
      break;

    case 'quarterly':
      // كل 3 أشهر
      if (dayOfMonth !== undefined) {
        nextRun.setDate(dayOfMonth);
        
        const currentMonth = nextRun.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        nextRun.setMonth(quarterStartMonth + 3);
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 3);
        }
      }
      break;

    case 'yearly':
      // سنوياً في الشهر واليوم المحدد
      if (month !== undefined && dayOfMonth !== undefined) {
        nextRun.setMonth(month - 1, dayOfMonth);
        
        if (nextRun <= now) {
          nextRun.setFullYear(nextRun.getFullYear() + 1);
        }
      }
      break;
  }

  return nextRun;
}

// ====================================
// Execute Scheduled Report
// ====================================

export async function executeScheduledReport(reportId: string): Promise<ReportRun> {
  const startTime = Date.now();
  
  const run: ReportRun = {
    id: `run_${Date.now()}`,
    scheduledReportId: reportId,
    executedAt: new Date(),
    status: 'running'
  };

  try {
    // Get scheduled report
    const scheduledReport = await getScheduledReport(reportId);
    if (!scheduledReport) {
      throw new Error('Scheduled report not found');
    }

    // Get template
    const template = await getReportTemplate(scheduledReport.templateId);
    if (!template) {
      throw new Error('Report template not found');
    }

    // Calculate date range
    const dateRange = calculateDateRange(
      scheduledReport.dateRangeType,
      scheduledReport.customDateRange
    );

    // Generate report
    const reportData = await generateReport(
      scheduledReport.propertyId,
      template,
      dateRange
    );

    // Export based on format
    let exportedData: string;
    let contentType: string;
    let fileExtension: string;

    switch (scheduledReport.format) {
      case 'csv':
        exportedData = exportToCSV(reportData);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'json':
        exportedData = JSON.stringify(reportData, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      case 'excel':
        // TODO: Implement Excel export
        exportedData = exportToCSV(reportData);
        contentType = 'application/vnd.ms-excel';
        fileExtension = 'xls';
        break;
      case 'pdf':
        // TODO: Implement PDF export
        exportedData = exportToCSV(reportData);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      default:
        exportedData = exportToCSV(reportData);
        contentType = 'text/csv';
        fileExtension = 'csv';
    }

    // Send email with attachment
    if (scheduledReport.recipients.length > 0) {
      await sendReportEmail(
        scheduledReport,
        exportedData,
        contentType,
        fileExtension,
        reportData.metadata.totalRows
      );
    }

    // Update run status
    run.status = 'success';
    run.duration = Date.now() - startTime;
    run.recordCount = reportData.metadata.totalRows;
    run.sentTo = scheduledReport.recipients;

    // Update scheduled report
    const runHistory = [...scheduledReport.runHistory, run];
    const nextRun = calculateNextRun(
      scheduledReport.frequency,
      scheduledReport.time,
      scheduledReport.dayOfWeek,
      scheduledReport.dayOfMonth,
      scheduledReport.month
    );

    await updateScheduledReport(reportId, {
      lastRun: new Date(),
      nextRun,
      runHistory: runHistory.slice(-10) // Keep last 10 runs
    });

  } catch (error: any) {
    console.error('Error executing scheduled report:', error);
    
    run.status = 'failed';
    run.duration = Date.now() - startTime;
    run.error = error.message || 'Unknown error';

    // Notify on error if configured
    const scheduledReport = await getScheduledReport(reportId);
    if (scheduledReport?.notifyOnError && scheduledReport.recipients.length > 0) {
      await sendErrorEmail(scheduledReport, run.error);
    }
  }

  return run;
}

// ====================================
// Calculate Date Range
// ====================================

function calculateDateRange(
  type: ScheduledReport['dateRangeType'],
  customRange?: { start: Date; end: Date }
): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date(now);

  switch (type) {
    case 'last_day':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last_week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last_month':
      start.setMonth(now.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth());
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      break;

    case 'last_quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start.setMonth((currentQuarter - 1) * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(currentQuarter * 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last_year':
      start.setFullYear(now.getFullYear() - 1);
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(now.getFullYear() - 1);
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      if (customRange) {
        return customRange;
      }
      // Fallback to last month
      start.setMonth(now.getMonth() - 1);
      break;
  }

  return { start, end };
}

// ====================================
// Send Report Email
// ====================================

async function sendReportEmail(
  scheduledReport: ScheduledReport,
  attachment: string,
  contentType: string,
  fileExtension: string,
  recordCount: number
): Promise<void> {
  try {
    const emailConfig: EmailConfig = {
      from: 'reports@almodif.net',
      fromName: 'تقارير المضيف',
      subject: `${scheduledReport.name} - ${new Date().toLocaleDateString('ar-SA')}`,
      body: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px;">📊 ${scheduledReport.name}</h2>
            
            <p style="color: #666; margin-bottom: 15px;">${scheduledReport.description || 'تم إنشاء التقرير المجدول بنجاح'}</p>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">📈 ملخص التقرير:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 5px 0;">📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}</li>
                <li style="padding: 5px 0;">🕐 الوقت: ${new Date().toLocaleTimeString('ar-SA')}</li>
                <li style="padding: 5px 0;">📊 عدد السجلات: ${recordCount.toLocaleString('ar-SA')}</li>
                <li style="padding: 5px 0;">📁 الصيغة: ${scheduledReport.format.toUpperCase()}</li>
              </ul>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              مرفق ملف التقرير. يرجى مراجعته وإعلامنا في حال وجود أي استفسارات.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              هذا تقرير تلقائي من نظام المضيف<br>
              لإيقاف التقارير المجدولة، يرجى تسجيل الدخول إلى لوحة التحكم
            </p>
          </div>
        </div>
      `,
      attachmentName: `${scheduledReport.name}_${new Date().toISOString().split('T')[0]}.${fileExtension}`
    };

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email to:', scheduledReport.recipients);
    console.log('Email config:', emailConfig);
    console.log('Attachment size:', attachment.length, 'bytes');

    // For now, just log. In production, integrate with actual email service:
    // await sendEmail(emailConfig, attachment, contentType);

  } catch (error) {
    console.error('Error sending report email:', error);
    throw error;
  }
}

// ====================================
// Send Error Email
// ====================================

async function sendErrorEmail(
  scheduledReport: ScheduledReport,
  errorMessage: string
): Promise<void> {
  try {
    const emailConfig: EmailConfig = {
      from: 'reports@almodif.net',
      fromName: 'تقارير المضيف',
      subject: `❌ فشل التقرير: ${scheduledReport.name}`,
      body: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-bottom: 20px;">❌ فشل إنشاء التقرير</h2>
            
            <p style="color: #666; margin-bottom: 15px;">
              فشل إنشاء التقرير المجدول: <strong>${scheduledReport.name}</strong>
            </p>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-bottom: 10px;">🔍 تفاصيل الخطأ:</h3>
              <pre style="white-space: pre-wrap; word-wrap: break-word; color: #7f1d1d; font-size: 13px; margin: 0;">${errorMessage}</pre>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-bottom: 10px;">📋 معلومات التقرير:</h3>
              <ul style="list-style: none; padding: 0; margin: 0; color: #78350f;">
                <li style="padding: 5px 0;">📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}</li>
                <li style="padding: 5px 0;">🕐 الوقت: ${new Date().toLocaleTimeString('ar-SA')}</li>
                <li style="padding: 5px 0;">🔄 التكرار: ${getFrequencyLabel(scheduledReport.frequency)}</li>
              </ul>
            </div>
            
            <p style="color: #666; margin-top: 20px;">
              يرجى التحقق من إعدادات التقرير وإعادة المحاولة. إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              إشعار تلقائي من نظام المضيف
            </p>
          </div>
        </div>
      `,
      attachmentName: ''
    };

    // TODO: Integrate with email service
    console.log('Sending error email to:', scheduledReport.recipients);
    console.log('Error:', errorMessage);

  } catch (error) {
    console.error('Error sending error email:', error);
  }
}

// ====================================
// Helper Functions
// ====================================

function getFrequencyLabel(frequency: ScheduledReport['frequency']): string {
  const labels = {
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي'
  };
  return labels[frequency] || frequency;
}

// ====================================
// Check Due Reports (for cron job)
// ====================================

export async function checkDueReports(): Promise<void> {
  try {
    // Get all enabled scheduled reports
    const allReports: ScheduledReport[] = [];
    
    // Note: In production, you'd query all properties
    // For now, we'll need to pass propertyId from cron job
    
    const now = new Date();
    
    for (const report of allReports) {
      if (report.enabled && report.nextRun <= now) {
        try {
          await executeScheduledReport(report.id);
        } catch (error) {
          console.error(`Failed to execute report ${report.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error checking due reports:', error);
  }
}

// ====================================
// Toggle Report Status
// ====================================

export async function toggleReportStatus(reportId: string, enabled: boolean): Promise<void> {
  try {
    await updateScheduledReport(reportId, { enabled });
  } catch (error) {
    console.error('Error toggling report status:', error);
    throw error;
  }
}
