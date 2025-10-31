/**
 * نظام إدارة سندات الصرف
 * Comprehensive Expense Vouchers Management System
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// =====================
// Types & Interfaces
// =====================

export type ExpenseCategory = 
  | 'salaries'           // رواتب
  | 'utilities'          // مرافق (كهرباء، ماء، غاز)
  | 'maintenance'        // صيانة
  | 'supplies'           // مستلزمات
  | 'food'               // مواد غذائية
  | 'cleaning'           // تنظيف
  | 'marketing'          // تسويق
  | 'transportation'     // مواصلات
  | 'communication'      // اتصالات
  | 'furniture'          // أثاث
  | 'equipment'          // معدات
  | 'insurance'          // تأمين
  | 'taxes'              // ضرائب ورسوم
  | 'rent'               // إيجار
  | 'professional_fees'  // رسوم مهنية
  | 'entertainment'      // ضيافة
  | 'petty_cash'         // مصروفات نثرية
  | 'other';             // أخرى

export type PaymentMethod = 
  | 'cash'               // نقدي
  | 'bank_transfer'      // تحويل بنكي
  | 'check'              // شيك
  | 'credit_card'        // بطاقة ائتمانية
  | 'debit_card';        // بطاقة مدينة

export type VoucherStatus = 
  | 'draft'              // مسودة
  | 'pending'            // قيد الانتظار
  | 'approved'           // معتمد
  | 'paid'               // مدفوع
  | 'rejected'           // مرفوض
  | 'cancelled';         // ملغي

export interface ExpenseVoucher {
  id?: string;
  
  // رقم السند
  voucherNumber: string;       // EXP-YYYY-NNNN
  
  // معلومات أساسية
  title: string;
  description: string;
  category: ExpenseCategory;
  subcategory?: string;
  
  // المبلغ
  amount: number;
  currency: string;             // SAR
  taxAmount?: number;
  taxPercentage?: number;       // 15% VAT
  totalAmount: number;          // amount + taxAmount
  
  // طريقة الدفع
  paymentMethod: PaymentMethod;
  checkNumber?: string;
  bankReference?: string;
  cardLastDigits?: string;
  
  // المستفيد
  beneficiaryName: string;
  beneficiaryType: 'employee' | 'supplier' | 'vendor' | 'individual';
  beneficiaryId?: string;       // Employee ID, Supplier ID, etc.
  beneficiaryPhone?: string;
  beneficiaryIdNumber?: string; // National ID
  
  // القسم والموظف المسؤول
  department?: string;
  requestedBy: string;          // User ID
  requestedByName: string;
  
  // الموافقة
  approvedBy?: string;          // User ID
  approvedByName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  
  // الحالة والتاريخ
  status: VoucherStatus;
  voucherDate: string;          // تاريخ السند
  paymentDate?: string;         // تاريخ الدفع الفعلي
  dueDate?: string;             // تاريخ الاستحقاق
  
  // المرفقات
  attachments?: string[];       // URLs to uploaded files
  invoiceNumber?: string;
  receiptNumber?: string;
  
  // ملاحظات
  notes?: string;
  internalNotes?: string;       // ملاحظات داخلية للإدارة
  
  // الربط
  linkedTo?: string;            // ربط بمهمة صيانة أو طلب
  linkedType?: 'maintenance' | 'request' | 'booking' | 'other';
  roomId?: string;
  roomNumber?: string;
  
  // المحاسبة
  accountCode?: string;
  costCenter?: string;
  projectCode?: string;
  fiscalYear?: string;
  fiscalMonth?: string;
  
  // التتبع
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt?: string;
  updatedBy?: string;
  paidAt?: string;
  paidBy?: string;
  paidByName?: string;
  
  // إشعارات
  notificationSent?: boolean;
  remindersSent?: number;
}

export interface ExpenseStats {
  total: number;
  totalAmount: number;
  byStatus: Record<VoucherStatus, { count: number; amount: number }>;
  byCategory: Record<ExpenseCategory, { count: number; amount: number }>;
  byMonth: Record<string, { count: number; amount: number }>;
  byPaymentMethod: Record<PaymentMethod, { count: number; amount: number }>;
  topBeneficiaries: Array<{ name: string; count: number; amount: number }>;
  avgVoucherAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export interface VoucherHistory {
  voucherId: string;
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
  previousStatus?: VoucherStatus;
  newStatus?: VoucherStatus;
}

// =====================
// Voucher Number Generation
// =====================

/**
 * توليد رقم سند صرف تلقائي
 */
async function generateVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  
  try {
    // جلب آخر سند في هذا العام
    const q = query(
      collection(db, 'expense_vouchers'),
      where('voucherNumber', '>=', prefix),
      where('voucherNumber', '<', `EXP-${year + 1}-`),
      orderBy('voucherNumber', 'desc'),
      firestoreLimit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return `${prefix}0001`;
    }
    
    const lastVoucher = snapshot.docs[0].data();
    const lastNumber = parseInt(lastVoucher.voucherNumber.split('-')[2]);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `${prefix}${newNumber}`;
  } catch (error) {
    console.error('Error generating voucher number:', error);
    // في حالة الخطأ، استخدم timestamp
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// =====================
// Create & Update
// =====================

/**
 * إنشاء سند صرف جديد
 */
export async function createExpenseVoucher(
  voucher: Omit<ExpenseVoucher, 'id' | 'voucherNumber' | 'createdAt' | 'totalAmount'>
): Promise<string> {
  try {
    const voucherNumber = await generateVoucherNumber();
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // حساب الإجمالي
    const taxAmount = voucher.taxPercentage 
      ? (voucher.amount * voucher.taxPercentage / 100) 
      : (voucher.taxAmount || 0);
    const totalAmount = voucher.amount + taxAmount;
    
    const voucherData: ExpenseVoucher = {
      ...voucher,
      voucherNumber,
      totalAmount,
      taxAmount,
      currency: voucher.currency || 'SAR',
      status: voucher.status || 'draft',
      fiscalYear: year.toString(),
      fiscalMonth: `${year}-${month}`,
      createdAt: now,
      notificationSent: false,
      remindersSent: 0
    };

    const docRef = await addDoc(collection(db, 'expense_vouchers'), voucherData);

    // تسجيل في السجل
    await addVoucherHistory({
      voucherId: docRef.id,
      action: 'created',
      performedBy: voucher.createdBy,
      performedByName: voucher.createdByName,
      timestamp: now,
      details: `تم إنشاء سند صرف: ${voucher.title}`
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating expense voucher:', error);
    throw error;
  }
}

/**
 * تحديث سند صرف
 */
export async function updateExpenseVoucher(
  voucherId: string,
  updates: Partial<ExpenseVoucher>,
  updatedBy: string,
  updatedByName: string
): Promise<boolean> {
  try {
    const voucherRef = doc(db, 'expense_vouchers', voucherId);
    const voucherSnap = await getDoc(voucherRef);
    
    if (!voucherSnap.exists()) {
      throw new Error('Voucher not found');
    }

    const previousVoucher = voucherSnap.data() as ExpenseVoucher;
    
    // إعادة حساب الإجمالي إذا تغير المبلغ
    let updatedData = { ...updates };
    if (updates.amount || updates.taxPercentage || updates.taxAmount) {
      const amount = updates.amount || previousVoucher.amount;
      const taxAmount = updates.taxPercentage 
        ? (amount * updates.taxPercentage / 100)
        : (updates.taxAmount || previousVoucher.taxAmount || 0);
      updatedData.totalAmount = amount + taxAmount;
      updatedData.taxAmount = taxAmount;
    }
    
    await updateDoc(voucherRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
      updatedBy
    });

    // تسجيل التغييرات
    if (updates.status && updates.status !== previousVoucher.status) {
      await addVoucherHistory({
        voucherId,
        action: 'updated',
        performedBy: updatedBy,
        performedByName: updatedByName,
        timestamp: new Date().toISOString(),
        previousStatus: previousVoucher.status,
        newStatus: updates.status,
        details: `تم تغيير الحالة من ${getStatusLabel(previousVoucher.status)} إلى ${getStatusLabel(updates.status)}`
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating expense voucher:', error);
    return false;
  }
}

/**
 * اعتماد سند صرف
 */
export async function approveExpenseVoucher(
  voucherId: string,
  approvedBy: string,
  approvedByName: string,
  approvalNotes?: string
): Promise<boolean> {
  try {
    const voucherRef = doc(db, 'expense_vouchers', voucherId);
    const now = new Date().toISOString();
    
    await updateDoc(voucherRef, {
      status: 'approved',
      approvedBy,
      approvedByName,
      approvedAt: now,
      approvalNotes,
      updatedAt: now,
      updatedBy: approvedBy
    });

    await addVoucherHistory({
      voucherId,
      action: 'approved',
      performedBy: approvedBy,
      performedByName: approvedByName,
      timestamp: now,
      details: approvalNotes ? `تم الاعتماد: ${approvalNotes}` : 'تم اعتماد السند'
    });

    return true;
  } catch (error) {
    console.error('Error approving voucher:', error);
    return false;
  }
}

/**
 * رفض سند صرف
 */
export async function rejectExpenseVoucher(
  voucherId: string,
  rejectedBy: string,
  rejectedByName: string,
  reason: string
): Promise<boolean> {
  try {
    const voucherRef = doc(db, 'expense_vouchers', voucherId);
    const now = new Date().toISOString();
    
    await updateDoc(voucherRef, {
      status: 'rejected',
      approvalNotes: reason,
      updatedAt: now,
      updatedBy: rejectedBy
    });

    await addVoucherHistory({
      voucherId,
      action: 'rejected',
      performedBy: rejectedBy,
      performedByName: rejectedByName,
      timestamp: now,
      details: `تم الرفض: ${reason}`
    });

    return true;
  } catch (error) {
    console.error('Error rejecting voucher:', error);
    return false;
  }
}

/**
 * تسجيل دفع سند صرف
 */
export async function markVoucherAsPaid(
  voucherId: string,
  paidBy: string,
  paidByName: string,
  paymentDate?: string,
  paymentNotes?: string
): Promise<boolean> {
  try {
    const voucherRef = doc(db, 'expense_vouchers', voucherId);
    const now = new Date().toISOString();
    
    await updateDoc(voucherRef, {
      status: 'paid',
      paidAt: now,
      paidBy,
      paidByName,
      paymentDate: paymentDate || now.split('T')[0],
      notes: paymentNotes ? `${paymentNotes}\n` : '',
      updatedAt: now,
      updatedBy: paidBy
    });

    await addVoucherHistory({
      voucherId,
      action: 'paid',
      performedBy: paidBy,
      performedByName: paidByName,
      timestamp: now,
      details: paymentNotes || 'تم الدفع'
    });

    return true;
  } catch (error) {
    console.error('Error marking voucher as paid:', error);
    return false;
  }
}

/**
 * إلغاء سند صرف
 */
export async function cancelExpenseVoucher(
  voucherId: string,
  cancelledBy: string,
  cancelledByName: string,
  reason: string
): Promise<boolean> {
  try {
    const voucherRef = doc(db, 'expense_vouchers', voucherId);
    const now = new Date().toISOString();
    
    await updateDoc(voucherRef, {
      status: 'cancelled',
      internalNotes: reason,
      updatedAt: now,
      updatedBy: cancelledBy
    });

    await addVoucherHistory({
      voucherId,
      action: 'cancelled',
      performedBy: cancelledBy,
      performedByName: cancelledByName,
      timestamp: now,
      details: `تم الإلغاء: ${reason}`
    });

    return true;
  } catch (error) {
    console.error('Error cancelling voucher:', error);
    return false;
  }
}

/**
 * حذف سند صرف
 */
export async function deleteExpenseVoucher(voucherId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'expense_vouchers', voucherId));
    return true;
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return false;
  }
}

// =====================
// Read Operations
// =====================

/**
 * جلب جميع سندات الصرف
 */
export async function getAllExpenseVouchers(): Promise<ExpenseVoucher[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers'),
      orderBy('voucherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseVoucher));
  } catch (error) {
    console.error('Error getting expense vouchers:', error);
    return [];
  }
}

/**
 * جلب سندات الصرف حسب الحالة
 */
export async function getVouchersByStatus(status: VoucherStatus): Promise<ExpenseVoucher[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers'),
      where('status', '==', status),
      orderBy('voucherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseVoucher));
  } catch (error) {
    console.error('Error getting vouchers by status:', error);
    return [];
  }
}

/**
 * جلب سندات الصرف حسب الفئة
 */
export async function getVouchersByCategory(category: ExpenseCategory): Promise<ExpenseVoucher[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers'),
      where('category', '==', category),
      orderBy('voucherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseVoucher));
  } catch (error) {
    console.error('Error getting vouchers by category:', error);
    return [];
  }
}

/**
 * جلب سندات الصرف حسب المستفيد
 */
export async function getVouchersByBeneficiary(beneficiaryId: string): Promise<ExpenseVoucher[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers'),
      where('beneficiaryId', '==', beneficiaryId),
      orderBy('voucherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseVoucher));
  } catch (error) {
    console.error('Error getting vouchers by beneficiary:', error);
    return [];
  }
}

/**
 * جلب سندات الصرف حسب الفترة
 */
export async function getVouchersByDateRange(startDate: string, endDate: string): Promise<ExpenseVoucher[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers'),
      where('voucherDate', '>=', startDate),
      where('voucherDate', '<=', endDate),
      orderBy('voucherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseVoucher));
  } catch (error) {
    console.error('Error getting vouchers by date range:', error);
    return [];
  }
}

/**
 * جلب إحصائيات سندات الصرف
 */
export async function getExpenseStats(startDate?: string, endDate?: string): Promise<ExpenseStats> {
  try {
    let vouchers: ExpenseVoucher[];
    
    if (startDate && endDate) {
      vouchers = await getVouchersByDateRange(startDate, endDate);
    } else {
      vouchers = await getAllExpenseVouchers();
    }
    
    const stats: ExpenseStats = {
      total: vouchers.length,
      totalAmount: 0,
      byStatus: {} as Record<VoucherStatus, { count: number; amount: number }>,
      byCategory: {} as Record<ExpenseCategory, { count: number; amount: number }>,
      byMonth: {},
      byPaymentMethod: {} as Record<PaymentMethod, { count: number; amount: number }>,
      topBeneficiaries: [],
      avgVoucherAmount: 0,
      pendingAmount: 0,
      paidAmount: 0
    };

    const beneficiariesMap = new Map<string, { count: number; amount: number }>();

    vouchers.forEach(voucher => {
      // إجمالي المبلغ
      stats.totalAmount += voucher.totalAmount;

      // حسب الحالة
      if (!stats.byStatus[voucher.status]) {
        stats.byStatus[voucher.status] = { count: 0, amount: 0 };
      }
      stats.byStatus[voucher.status].count++;
      stats.byStatus[voucher.status].amount += voucher.totalAmount;

      // حسب الفئة
      if (!stats.byCategory[voucher.category]) {
        stats.byCategory[voucher.category] = { count: 0, amount: 0 };
      }
      stats.byCategory[voucher.category].count++;
      stats.byCategory[voucher.category].amount += voucher.totalAmount;

      // حسب الشهر
      const month = voucher.voucherDate.substring(0, 7); // YYYY-MM
      if (!stats.byMonth[month]) {
        stats.byMonth[month] = { count: 0, amount: 0 };
      }
      stats.byMonth[month].count++;
      stats.byMonth[month].amount += voucher.totalAmount;

      // حسب طريقة الدفع
      if (!stats.byPaymentMethod[voucher.paymentMethod]) {
        stats.byPaymentMethod[voucher.paymentMethod] = { count: 0, amount: 0 };
      }
      stats.byPaymentMethod[voucher.paymentMethod].count++;
      stats.byPaymentMethod[voucher.paymentMethod].amount += voucher.totalAmount;

      // المستفيدين
      const existing = beneficiariesMap.get(voucher.beneficiaryName) || { count: 0, amount: 0 };
      beneficiariesMap.set(voucher.beneficiaryName, {
        count: existing.count + 1,
        amount: existing.amount + voucher.totalAmount
      });

      // المبالغ المعلقة والمدفوعة
      if (voucher.status === 'pending' || voucher.status === 'approved') {
        stats.pendingAmount += voucher.totalAmount;
      } else if (voucher.status === 'paid') {
        stats.paidAmount += voucher.totalAmount;
      }
    });

    // متوسط المبلغ
    stats.avgVoucherAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

    // أعلى المستفيدين
    stats.topBeneficiaries = Array.from(beneficiariesMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return stats;
  } catch (error) {
    console.error('Error getting expense stats:', error);
    throw error;
  }
}

// =====================
// History & Logs
// =====================

/**
 * إضافة سجل في تاريخ السندات
 */
async function addVoucherHistory(history: Omit<VoucherHistory, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'expense_vouchers_history'), history);
  } catch (error) {
    console.error('Error adding voucher history:', error);
  }
}

/**
 * جلب تاريخ سند صرف
 */
export async function getVoucherHistory(voucherId: string): Promise<VoucherHistory[]> {
  try {
    const q = query(
      collection(db, 'expense_vouchers_history'),
      where('voucherId', '==', voucherId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoucherHistory));
  } catch (error) {
    console.error('Error getting voucher history:', error);
    return [];
  }
}

// =====================
// Helper Functions
// =====================

/**
 * الحصول على تسمية الحالة
 */
export function getStatusLabel(status: VoucherStatus): string {
  const labels: Record<VoucherStatus, string> = {
    'draft': 'مسودة',
    'pending': 'قيد الانتظار',
    'approved': 'معتمد',
    'paid': 'مدفوع',
    'rejected': 'مرفوض',
    'cancelled': 'ملغي'
  };
  return labels[status] || status;
}

/**
 * الحصول على تسمية الفئة
 */
export function getCategoryLabel(category: ExpenseCategory): string {
  const labels: Record<ExpenseCategory, string> = {
    'salaries': 'رواتب',
    'utilities': 'مرافق',
    'maintenance': 'صيانة',
    'supplies': 'مستلزمات',
    'food': 'مواد غذائية',
    'cleaning': 'تنظيف',
    'marketing': 'تسويق',
    'transportation': 'مواصلات',
    'communication': 'اتصالات',
    'furniture': 'أثاث',
    'equipment': 'معدات',
    'insurance': 'تأمين',
    'taxes': 'ضرائب',
    'rent': 'إيجار',
    'professional_fees': 'رسوم مهنية',
    'entertainment': 'ضيافة',
    'petty_cash': 'مصروفات نثرية',
    'other': 'أخرى'
  };
  return labels[category] || category;
}

/**
 * الحصول على تسمية طريقة الدفع
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    'cash': 'نقدي',
    'bank_transfer': 'تحويل بنكي',
    'check': 'شيك',
    'credit_card': 'بطاقة ائتمانية',
    'debit_card': 'بطاقة مدينة'
  };
  return labels[method] || method;
}

/**
 * تنسيق المبلغ
 */
export function formatAmount(amount: number, currency: string = 'SAR'): string {
  return `${amount.toFixed(2)} ${currency === 'SAR' ? 'ريال' : currency}`;
}
