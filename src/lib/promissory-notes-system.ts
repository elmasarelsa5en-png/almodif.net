// نظام إدارة سندات الكمبيالات الشامل
// Comprehensive Promissory Notes Management System

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
  orderBy, 
  Timestamp,
  onSnapshot,
  limit,
  startAfter,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// Types & Interfaces
// ============================================

export type PromissoryNoteType = 'receivable' | 'payable';  // مدين / دائن
export type PartyType = 'customer' | 'supplier' | 'company' | 'individual' | 'other';
export type NoteStatus = 'active' | 'due' | 'overdue' | 'paid' | 'partially_paid' | 'cancelled' | 'bounced' | 'renewed' | 'converted_to_legal';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check';

export interface PromissoryNote {
  id?: string;
  
  // معلومات أساسية
  noteNumber: string;              // PN-YYYY-NNNNNN
  type: PromissoryNoteType;        // مدين أو دائن
  
  // الأطراف - المُصدر
  issuerName: string;              // اسم المُصدر
  issuerType: PartyType;           // نوع المُصدر
  issuerID: string;                // رقم الهوية/السجل التجاري
  issuerPhone?: string;
  issuerEmail?: string;
  issuerAddress?: string;
  
  // الأطراف - المستفيد
  beneficiaryName: string;         // اسم المستفيد
  beneficiaryType: PartyType;      // نوع المستفيد
  beneficiaryID?: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  beneficiaryAddress?: string;
  
  // المبالغ
  amount: number;                  // المبلغ الأصلي
  paidAmount: number;              // المبلغ المدفوع
  remainingAmount: number;         // المبلغ المتبقي
  currency: string;                // العملة (SAR)
  
  // التواريخ
  issueDate: Date;                 // تاريخ الإصدار
  dueDate: Date;                   // تاريخ الاستحقاق
  paidDate?: Date;                 // تاريخ الدفع الفعلي
  
  // الحالة
  status: NoteStatus;
  
  // الضمانات
  guarantor?: string;              // الضامن
  guarantorID?: string;
  guarantorPhone?: string;
  collateral?: string;             // الضمان/الرهن
  collateralValue?: number;
  
  // المرجع
  relatedInvoiceNumber?: string;   // رقم الفاتورة المرتبطة
  relatedPONumber?: string;        // رقم أمر الشراء
  relatedBookingId?: string;       // رقم الحجز
  
  // البنك والشيك
  bank?: string;                   // اسم البنك
  accountNumber?: string;          // رقم الحساب
  checkNumber?: string;            // رقم الشيك
  branchName?: string;             // اسم الفرع
  
  // ملاحظات
  notes?: string;                  // ملاحظات عامة
  terms?: string;                  // الشروط والأحكام
  reason?: string;                 // سبب الإصدار
  
  // المرفقات
  attachments?: string[];          // روابط المرفقات في Firebase Storage
  
  // التنبيهات
  reminderDays: number[];          // أيام التنبيه قبل الاستحقاق [30, 15, 7, 3, 1]
  lastReminderSent?: Date;         // آخر تنبيه تم إرساله
  
  // التجديد والتقسيط
  isRenewable: boolean;            // قابل للتجديد
  renewalHistory?: RenewalRecord[]; // سجل التجديدات
  isInstallment: boolean;          // مقسط
  installmentPlan?: InstallmentPlan; // خطة التقسيط
  originalNoteId?: string;         // رقم السند الأصلي (في حالة التجديد)
  
  // الخصم والفوائد
  discountRate?: number;           // نسبة الخصم (Factoring)
  discountAmount?: number;         // مبلغ الخصم
  interestRate?: number;           // نسبة الفائدة
  interestAmount?: number;         // مبلغ الفائدة
  
  // السند القضائي
  convertedToLegal?: boolean;      // تم تحويله لسند قضائي
  legalReferenceNumber?: string;   // رقم السند القضائي
  legalConversionDate?: Date;
  
  // معلومات إضافية
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;               // المستخدم الذي أنشأ السند
  lastModifiedBy?: string;         // آخر من عدل السند
}

export interface RenewalRecord {
  renewalDate: Date;
  oldDueDate: Date;
  newDueDate: Date;
  additionalAmount?: number;       // مبلغ إضافي عند التجديد
  renewalFee?: number;             // رسوم التجديد
  renewedBy: string;
  notes?: string;
}

export interface InstallmentPlan {
  totalInstallments: number;       // عدد الأقساط
  installmentAmount: number;       // قيمة القسط
  frequency: 'weekly' | 'monthly' | 'quarterly'; // تكرار الدفع
  installments: Installment[];
}

export interface Installment {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PaymentRecord {
  id?: string;
  noteId: string;
  noteNumber: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;        // رقم المرجع/الشيك/التحويل
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

export interface NoteHistory {
  id?: string;
  noteId: string;
  noteNumber: string;
  action: 'created' | 'updated' | 'paid' | 'partially_paid' | 'cancelled' | 'renewed' | 'converted_to_legal' | 'bounced';
  previousStatus?: NoteStatus;
  newStatus?: NoteStatus;
  amount?: number;
  details: string;
  performedBy: string;
  timestamp: Date;
}

export interface NoteReminder {
  id?: string;
  noteId: string;
  noteNumber: string;
  type: PromissoryNoteType;
  dueDate: Date;
  daysUntilDue: number;
  amount: number;
  partyName: string;              // اسم الطرف (المصدر أو المستفيد)
  sentDate: Date;
  sentTo: string[];               // البريد الإلكتروني أو الهاتف
  reminderType: 'email' | 'sms' | 'notification';
}

// ============================================
// Sequential Number Generation
// ============================================

/**
 * توليد رقم سند كمبيالة تلقائي
 * Format: PN-YYYY-NNNNNN
 * Example: PN-2025-000001
 */
export async function generatePromissoryNoteNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PN-${currentYear}-`;
  
  // البحث عن آخر رقم في نفس السنة
  const notesRef = collection(db, 'promissory_notes');
  const q = query(
    notesRef,
    where('noteNumber', '>=', prefix),
    where('noteNumber', '<=', prefix + '\uf8ff'),
    orderBy('noteNumber', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastNote = snapshot.docs[0].data();
    const lastNumber = parseInt(lastNote.noteNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // تنسيق الرقم بـ 6 أرقام
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  const noteNumber = `${prefix}${paddedNumber}`;
  
  // التحقق من عدم وجود تصادم
  const checkDoc = await getDocs(query(notesRef, where('noteNumber', '==', noteNumber)));
  if (!checkDoc.empty) {
    // في حالة التصادم، حاول مرة أخرى برقم أكبر
    return generatePromissoryNoteNumber();
  }
  
  return noteNumber;
}

// ============================================
// CRUD Operations
// ============================================

/**
 * إنشاء سند كمبيالة جديد
 */
export async function createPromissoryNote(
  noteData: Omit<PromissoryNote, 'id' | 'noteNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const noteNumber = await generatePromissoryNoteNumber();
    
    const note: Omit<PromissoryNote, 'id'> = {
      ...noteData,
      noteNumber,
      paidAmount: 0,
      remainingAmount: noteData.amount,
      status: 'active',
      reminderDays: noteData.reminderDays || [30, 15, 7, 3, 1],
      isRenewable: noteData.isRenewable ?? false,
      isInstallment: noteData.isInstallment ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'promissory_notes'), {
      ...note,
      issueDate: Timestamp.fromDate(note.issueDate),
      dueDate: Timestamp.fromDate(note.dueDate),
      createdAt: Timestamp.fromDate(note.createdAt),
      updatedAt: Timestamp.fromDate(note.updatedAt)
    });
    
    // تسجيل في السجل التاريخي
    await addNoteHistory({
      noteId: docRef.id,
      noteNumber,
      action: 'created',
      newStatus: 'active',
      amount: note.amount,
      details: `تم إنشاء سند كمبيالة ${note.type === 'receivable' ? 'مدين' : 'دائن'} بمبلغ ${note.amount} ${note.currency}`,
      performedBy: note.createdBy,
      timestamp: new Date()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating promissory note:', error);
    throw error;
  }
}

/**
 * الحصول على سند كمبيالة بالمعرف
 */
export async function getPromissoryNoteById(noteId: string): Promise<PromissoryNote | null> {
  try {
    const docRef = doc(db, 'promissory_notes', noteId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      issueDate: data.issueDate?.toDate(),
      dueDate: data.dueDate?.toDate(),
      paidDate: data.paidDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as PromissoryNote;
  } catch (error) {
    console.error('Error getting promissory note:', error);
    throw error;
  }
}

/**
 * الحصول على جميع سندات الكمبيالات
 */
export async function getAllPromissoryNotes(): Promise<PromissoryNote[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
  } catch (error) {
    console.error('Error getting promissory notes:', error);
    throw error;
  }
}

/**
 * تحديث سند كمبيالة
 */
export async function updatePromissoryNote(
  noteId: string,
  updates: Partial<PromissoryNote>,
  modifiedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, 'promissory_notes', noteId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: modifiedBy
    };
    
    // تحويل التواريخ
    if (updates.issueDate) updateData.issueDate = Timestamp.fromDate(updates.issueDate);
    if (updates.dueDate) updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    if (updates.paidDate) updateData.paidDate = Timestamp.fromDate(updates.paidDate);
    
    await updateDoc(docRef, updateData);
    
    // تسجيل في السجل
    const note = await getPromissoryNoteById(noteId);
    if (note) {
      await addNoteHistory({
        noteId,
        noteNumber: note.noteNumber,
        action: 'updated',
        details: 'تم تحديث بيانات السند',
        performedBy: modifiedBy,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating promissory note:', error);
    throw error;
  }
}

/**
 * حذف سند كمبيالة
 */
export async function deletePromissoryNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'promissory_notes', noteId));
  } catch (error) {
    console.error('Error deleting promissory note:', error);
    throw error;
  }
}

// ============================================
// Payment Operations
// ============================================

/**
 * تسجيل دفعة على سند كمبيالة
 */
export async function recordPayment(
  noteId: string,
  paymentData: Omit<PaymentRecord, 'id' | 'noteId' | 'noteNumber' | 'createdAt'>,
  recordedBy: string
): Promise<void> {
  try {
    const note = await getPromissoryNoteById(noteId);
    if (!note) throw new Error('Note not found');
    
    if (paymentData.amount > note.remainingAmount) {
      throw new Error('Payment amount exceeds remaining amount');
    }
    
    const newPaidAmount = note.paidAmount + paymentData.amount;
    const newRemainingAmount = note.amount - newPaidAmount;
    const newStatus: NoteStatus = 
      newRemainingAmount === 0 ? 'paid' : 
      newRemainingAmount < note.amount ? 'partially_paid' : 
      note.status;
    
    // تحديث السند
    await updateDoc(doc(db, 'promissory_notes', noteId), {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      paidDate: newStatus === 'paid' ? Timestamp.fromDate(paymentData.paymentDate) : note.paidDate,
      updatedAt: Timestamp.fromDate(new Date())
    });
    
    // حفظ سجل الدفع
    await addDoc(collection(db, 'promissory_notes_payments'), {
      ...paymentData,
      noteId,
      noteNumber: note.noteNumber,
      recordedBy,
      paymentDate: Timestamp.fromDate(paymentData.paymentDate),
      createdAt: Timestamp.fromDate(new Date())
    });
    
    // تسجيل في السجل التاريخي
    await addNoteHistory({
      noteId,
      noteNumber: note.noteNumber,
      action: newStatus === 'paid' ? 'paid' : 'partially_paid',
      previousStatus: note.status,
      newStatus,
      amount: paymentData.amount,
      details: `تم تسجيل دفعة بمبلغ ${paymentData.amount} ${note.currency}. المتبقي: ${newRemainingAmount}`,
      performedBy: recordedBy,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * الحصول على سجل الدفعات لسند معين
 */
export async function getNotePayments(noteId: string): Promise<PaymentRecord[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes_payments'),
      where('noteId', '==', noteId),
      orderBy('paymentDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    } as PaymentRecord));
  } catch (error) {
    console.error('Error getting note payments:', error);
    throw error;
  }
}

// ============================================
// Status Operations
// ============================================

/**
 * إلغاء سند كمبيالة
 */
export async function cancelNote(
  noteId: string,
  reason: string,
  cancelledBy: string
): Promise<void> {
  try {
    const note = await getPromissoryNoteById(noteId);
    if (!note) throw new Error('Note not found');
    
    await updateDoc(doc(db, 'promissory_notes', noteId), {
      status: 'cancelled',
      notes: note.notes ? `${note.notes}\n\nسبب الإلغاء: ${reason}` : `سبب الإلغاء: ${reason}`,
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: cancelledBy
    });
    
    await addNoteHistory({
      noteId,
      noteNumber: note.noteNumber,
      action: 'cancelled',
      previousStatus: note.status,
      newStatus: 'cancelled',
      details: `تم إلغاء السند. السبب: ${reason}`,
      performedBy: cancelledBy,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error cancelling note:', error);
    throw error;
  }
}

/**
 * تحويل سند لسند قضائي
 */
export async function convertToLegalNote(
  noteId: string,
  legalReferenceNumber: string,
  convertedBy: string
): Promise<void> {
  try {
    const note = await getPromissoryNoteById(noteId);
    if (!note) throw new Error('Note not found');
    
    await updateDoc(doc(db, 'promissory_notes', noteId), {
      status: 'converted_to_legal',
      convertedToLegal: true,
      legalReferenceNumber,
      legalConversionDate: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: convertedBy
    });
    
    await addNoteHistory({
      noteId,
      noteNumber: note.noteNumber,
      action: 'converted_to_legal',
      previousStatus: note.status,
      newStatus: 'converted_to_legal',
      details: `تم تحويل السند لسند قضائي. الرقم المرجعي: ${legalReferenceNumber}`,
      performedBy: convertedBy,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error converting to legal note:', error);
    throw error;
  }
}

/**
 * تجديد سند كمبيالة
 */
export async function renewNote(
  noteId: string,
  newDueDate: Date,
  additionalAmount: number = 0,
  renewalFee: number = 0,
  renewedBy: string
): Promise<string> {
  try {
    const oldNote = await getPromissoryNoteById(noteId);
    if (!oldNote) throw new Error('Note not found');
    
    if (!oldNote.isRenewable) {
      throw new Error('Note is not renewable');
    }
    
    // إنشاء سند جديد
    const newAmount = oldNote.remainingAmount + additionalAmount + renewalFee;
    const newNoteId = await createPromissoryNote({
      ...oldNote,
      amount: newAmount,
      dueDate: newDueDate,
      paidAmount: 0,
      remainingAmount: newAmount,
      originalNoteId: noteId,
      renewalHistory: [
        ...(oldNote.renewalHistory || []),
        {
          renewalDate: new Date(),
          oldDueDate: oldNote.dueDate,
          newDueDate,
          additionalAmount,
          renewalFee,
          renewedBy,
          notes: `تجديد من السند ${oldNote.noteNumber}`
        }
      ],
      createdBy: renewedBy
    });
    
    // تحديث السند القديم
    await updateDoc(doc(db, 'promissory_notes', noteId), {
      status: 'renewed',
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: renewedBy
    });
    
    await addNoteHistory({
      noteId,
      noteNumber: oldNote.noteNumber,
      action: 'renewed',
      previousStatus: oldNote.status,
      newStatus: 'renewed',
      details: `تم تجديد السند إلى سند جديد بتاريخ استحقاق ${newDueDate.toLocaleDateString('ar')}`,
      performedBy: renewedBy,
      timestamp: new Date()
    });
    
    return newNoteId;
  } catch (error) {
    console.error('Error renewing note:', error);
    throw error;
  }
}

// ============================================
// Query Functions
// ============================================

/**
 * الحصول على السندات حسب الحالة
 */
export async function getNotesByStatus(status: NoteStatus): Promise<PromissoryNote[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes'),
      where('status', '==', status),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
  } catch (error) {
    console.error('Error getting notes by status:', error);
    throw error;
  }
}

/**
 * الحصول على السندات حسب النوع
 */
export async function getNotesByType(type: PromissoryNoteType): Promise<PromissoryNote[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes'),
      where('type', '==', type),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
  } catch (error) {
    console.error('Error getting notes by type:', error);
    throw error;
  }
}

/**
 * الحصول على السندات المستحقة خلال فترة معينة
 */
export async function getNotesDueBetween(startDate: Date, endDate: Date): Promise<PromissoryNote[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes'),
      where('dueDate', '>=', Timestamp.fromDate(startDate)),
      where('dueDate', '<=', Timestamp.fromDate(endDate)),
      where('status', 'in', ['active', 'due', 'partially_paid']),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
  } catch (error) {
    console.error('Error getting notes due between dates:', error);
    throw error;
  }
}

/**
 * الحصول على السندات المتأخرة
 */
export async function getOverdueNotes(): Promise<PromissoryNote[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, 'promissory_notes'),
      where('dueDate', '<', Timestamp.fromDate(today)),
      where('status', 'in', ['active', 'due', 'partially_paid']),
      orderBy('dueDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    // تحديث الحالة لمتأخر
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
    
    // تحديث الحالة تلقائياً
    for (const note of notes) {
      if (note.id && note.status !== 'overdue') {
        await updateDoc(doc(db, 'promissory_notes', note.id), {
          status: 'overdue',
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    }
    
    return notes;
  } catch (error) {
    console.error('Error getting overdue notes:', error);
    throw error;
  }
}

// ============================================
// Statistics & Reports
// ============================================

export interface NotesStatistics {
  total: number;
  byStatus: { [key in NoteStatus]: number };
  byType: { receivable: number; payable: number };
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  overdueAmount: number;
  dueThisMonth: number;
  averageAmount: number;
}

/**
 * الحصول على إحصائيات سندات الكمبيالات
 */
export async function getNotesStatistics(): Promise<NotesStatistics> {
  try {
    const notes = await getAllPromissoryNotes();
    
    const stats: NotesStatistics = {
      total: notes.length,
      byStatus: {
        active: 0,
        due: 0,
        overdue: 0,
        paid: 0,
        partially_paid: 0,
        cancelled: 0,
        bounced: 0,
        renewed: 0,
        converted_to_legal: 0
      },
      byType: { receivable: 0, payable: 0 },
      totalAmount: 0,
      totalPaid: 0,
      totalRemaining: 0,
      overdueAmount: 0,
      dueThisMonth: 0,
      averageAmount: 0
    };
    
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    notes.forEach(note => {
      stats.byStatus[note.status]++;
      stats.byType[note.type]++;
      stats.totalAmount += note.amount;
      stats.totalPaid += note.paidAmount;
      stats.totalRemaining += note.remainingAmount;
      
      if (note.status === 'overdue') {
        stats.overdueAmount += note.remainingAmount;
      }
      
      if (note.dueDate <= endOfMonth && note.status !== 'paid' && note.status !== 'cancelled') {
        stats.dueThisMonth += note.remainingAmount;
      }
    });
    
    stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
    
    return stats;
  } catch (error) {
    console.error('Error getting notes statistics:', error);
    throw error;
  }
}

// ============================================
// History & Audit
// ============================================

/**
 * إضافة سجل تاريخي
 */
async function addNoteHistory(history: Omit<NoteHistory, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'promissory_notes_history'), {
      ...history,
      timestamp: Timestamp.fromDate(history.timestamp)
    });
  } catch (error) {
    console.error('Error adding note history:', error);
  }
}

/**
 * الحصول على السجل التاريخي لسند
 */
export async function getNoteHistory(noteId: string): Promise<NoteHistory[]> {
  try {
    const q = query(
      collection(db, 'promissory_notes_history'),
      where('noteId', '==', noteId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      noteId: doc.data().noteId,
      noteNumber: doc.data().noteNumber,
      action: doc.data().action,
      previousStatus: doc.data().previousStatus,
      newStatus: doc.data().newStatus,
      amount: doc.data().amount,
      details: doc.data().details,
      performedBy: doc.data().performedBy,
      timestamp: doc.data().timestamp?.toDate()
    } as NoteHistory));
  } catch (error) {
    console.error('Error getting note history:', error);
    throw error;
  }
}

// ============================================
// Real-time Subscription
// ============================================

/**
 * الاشتراك في تحديثات سندات الكمبيالات
 */
export function subscribeToPromissoryNotes(
  callback: (notes: PromissoryNote[]) => void
): () => void {
  const q = query(
    collection(db, 'promissory_notes'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as PromissoryNote));
    
    callback(notes);
  });
}
