// نظام إدارة سندات البنك والمطابقة البنكية الشامل
// Comprehensive Bank Vouchers & Bank Reconciliation System

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
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// ============================================
// Types & Interfaces
// ============================================

export type BankVoucherType = 'deposit' | 'withdrawal' | 'transfer' | 'check' | 'fee' | 'interest';
export type BankCategory = 
  | 'customer_payment'      // دفعات العملاء
  | 'supplier_payment'      // دفعات الموردين
  | 'salary_payment'        // رواتب
  | 'loan_payment'          // أقساط قروض
  | 'bank_charges'          // رسوم بنكية
  | 'interest_income'       // فوائد
  | 'interest_expense'      // مصاريف فوائد
  | 'tax_payment'           // ضرائب
  | 'capital_injection'     // رأس مال
  | 'dividend'              // أرباح
  | 'refund'                // استرجاع
  | 'other';

export type VoucherStatus = 'pending' | 'cleared' | 'bounced' | 'cancelled' | 'reconciled';
export type ReconciliationStatus = 'in_progress' | 'completed' | 'approved' | 'rejected';

export interface BankVoucher {
  id?: string;
  
  // معلومات أساسية
  voucherNumber: string;     // BNK-YYYY-NNNNNN
  type: BankVoucherType;
  
  // البنك
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
  swiftCode?: string;
  iban?: string;
  
  // المبالغ
  amount: number;
  currency: string;           // SAR, USD, EUR, etc.
  exchangeRate?: number;      // سعر الصرف
  amountInSAR?: number;       // المبلغ بالريال (للعملات الأجنبية)
  
  // التفاصيل
  transactionDate: Date;
  valueDate: Date;            // تاريخ القيمة
  reference: string;          // المرجع البنكي
  checkNumber?: string;
  
  // الطرف الآخر
  counterparty: string;       // الطرف المقابل
  counterpartyAccount?: string;
  counterpartyBank?: string;
  
  // التصنيف
  category: BankCategory;
  subcategory?: string;
  
  // الحالة
  status: VoucherStatus;
  
  // المطابقة
  reconciled: boolean;
  reconciledDate?: Date;
  reconciledBy?: string;
  bankStatementLine?: number;  // رقم السطر في كشف الحساب
  reconciliationId?: string;   // معرف المطابقة
  
  // المرجع
  relatedVoucherId?: string;   // سند مرتبط (قبض/صرف)
  relatedInvoiceId?: string;
  relatedBookingId?: string;
  relatedPromissoryNoteId?: string;
  
  // المرفقات
  bankSlip?: string;           // صورة إيصال البنك
  attachments?: string[];
  
  // ملاحظات
  notes?: string;
  description?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
}

export interface BankAccount {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'current' | 'credit';
  branch?: string;
  currency: string;
  balance: number;
  availableBalance?: number;
  iban?: string;
  swiftCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankStatement {
  id?: string;
  accountId: string;
  accountNumber: string;
  bankName: string;
  period: string;              // YYYY-MM
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lines: BankStatementLine[];
  uploadedAt: Date;
  uploadedBy: string;
  fileUrl?: string;            // رابط ملف الكشف
}

export interface BankStatementLine {
  lineNumber: number;
  date: Date;
  description: string;
  reference: string;
  debit: number;              // المدين
  credit: number;             // الدائن
  balance: number;
  matched: boolean;
  matchedVoucherId?: string;
  matchScore?: number;        // نسبة التطابق (0-100)
  autoMatched?: boolean;      // مطابقة تلقائية
}

export interface BankReconciliation {
  id?: string;
  accountId: string;
  accountNumber: string;
  bankName: string;
  period: string;              // YYYY-MM
  
  // الأرصدة
  openingBalance: number;
  closingBalance: number;
  
  // كشف البنك
  bankStatementId?: string;
  bankStatementLines: BankStatementLine[];
  
  // دفاتر الشركة
  companyVouchers: BankVoucher[];
  
  // الفروقات
  unmatchedBankLines: BankStatementLine[];
  unmatchedCompanyVouchers: BankVoucher[];
  
  // التسويات
  adjustments: ReconciliationAdjustment[];
  
  // الحالة
  status: ReconciliationStatus;
  
  // النتيجة
  reconciledBalance: number;
  difference: number;
  
  // التواريخ
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
  completedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationAdjustment {
  id?: string;
  type: 'bank_error' | 'company_error' | 'timing_difference' | 'outstanding_check' | 'deposit_in_transit' | 'bank_charge' | 'interest' | 'other';
  amount: number;
  description: string;
  date: Date;
  reference?: string;
  addedBy: string;
  addedAt: Date;
}

export interface MatchingSuggestion {
  bankLine: BankStatementLine;
  voucher: BankVoucher;
  matchScore: number;          // 0-100
  matchReasons: string[];
}

export interface BankStatistics {
  totalVouchers: number;
  byType: { [key in BankVoucherType]: number };
  byCategory: { [key in BankCategory]: number };
  byStatus: { [key in VoucherStatus]: number };
  totalDeposits: number;
  totalWithdrawals: number;
  netCashFlow: number;
  pendingAmount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
  averageTransactionAmount: number;
  largestDeposit: number;
  largestWithdrawal: number;
}

// ============================================
// Sequential Number Generation
// ============================================

/**
 * توليد رقم سند بنك تلقائي
 * Format: BNK-YYYY-NNNNNN
 * Example: BNK-2025-000001
 */
export async function generateBankVoucherNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `BNK-${currentYear}-`;
  
  const vouchersRef = collection(db, 'bank_vouchers');
  const q = query(
    vouchersRef,
    where('voucherNumber', '>=', prefix),
    where('voucherNumber', '<=', prefix + '\uf8ff'),
    orderBy('voucherNumber', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  let nextNumber = 1;
  if (!snapshot.empty) {
    const lastVoucher = snapshot.docs[0].data();
    const lastNumber = parseInt(lastVoucher.voucherNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  const voucherNumber = `${prefix}${paddedNumber}`;
  
  // التحقق من عدم وجود تصادم
  const checkDoc = await getDocs(query(vouchersRef, where('voucherNumber', '==', voucherNumber)));
  if (!checkDoc.empty) {
    return generateBankVoucherNumber();
  }
  
  return voucherNumber;
}

// ============================================
// Bank Vouchers CRUD
// ============================================

/**
 * إنشاء سند بنك جديد
 */
export async function createBankVoucher(
  voucherData: Omit<BankVoucher, 'id' | 'voucherNumber' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const voucherNumber = await generateBankVoucherNumber();
    
    const voucher: Omit<BankVoucher, 'id'> = {
      ...voucherData,
      voucherNumber,
      reconciled: false,
      status: voucherData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // حساب المبلغ بالريال للعملات الأجنبية
    if (voucher.currency !== 'SAR' && voucher.exchangeRate) {
      voucher.amountInSAR = voucher.amount * voucher.exchangeRate;
    }
    
    const docRef = await addDoc(collection(db, 'bank_vouchers'), {
      ...voucher,
      transactionDate: Timestamp.fromDate(voucher.transactionDate),
      valueDate: Timestamp.fromDate(voucher.valueDate),
      reconciledDate: voucher.reconciledDate ? Timestamp.fromDate(voucher.reconciledDate) : null,
      createdAt: Timestamp.fromDate(voucher.createdAt),
      updatedAt: Timestamp.fromDate(voucher.updatedAt)
    });
    
    // تحديث رصيد الحساب البنكي
    await updateAccountBalance(voucher.accountNumber, voucher.type, voucher.amount);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating bank voucher:', error);
    throw error;
  }
}

/**
 * الحصول على سند بنك بالمعرف
 */
export async function getBankVoucherById(voucherId: string): Promise<BankVoucher | null> {
  try {
    const docRef = doc(db, 'bank_vouchers', voucherId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      transactionDate: data.transactionDate?.toDate(),
      valueDate: data.valueDate?.toDate(),
      reconciledDate: data.reconciledDate?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as BankVoucher;
  } catch (error) {
    console.error('Error getting bank voucher:', error);
    throw error;
  }
}

/**
 * الحصول على جميع سندات البنك
 */
export async function getAllBankVouchers(): Promise<BankVoucher[]> {
  try {
    const q = query(
      collection(db, 'bank_vouchers'),
      orderBy('transactionDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      transactionDate: doc.data().transactionDate?.toDate(),
      valueDate: doc.data().valueDate?.toDate(),
      reconciledDate: doc.data().reconciledDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as BankVoucher));
  } catch (error) {
    console.error('Error getting bank vouchers:', error);
    throw error;
  }
}

/**
 * تحديث سند بنك
 */
export async function updateBankVoucher(
  voucherId: string,
  updates: Partial<BankVoucher>,
  modifiedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, 'bank_vouchers', voucherId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
      lastModifiedBy: modifiedBy
    };
    
    if (updates.transactionDate) updateData.transactionDate = Timestamp.fromDate(updates.transactionDate);
    if (updates.valueDate) updateData.valueDate = Timestamp.fromDate(updates.valueDate);
    if (updates.reconciledDate) updateData.reconciledDate = Timestamp.fromDate(updates.reconciledDate);
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating bank voucher:', error);
    throw error;
  }
}

/**
 * حذف سند بنك
 */
export async function deleteBankVoucher(voucherId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bank_vouchers', voucherId));
  } catch (error) {
    console.error('Error deleting bank voucher:', error);
    throw error;
  }
}

// ============================================
// Bank Accounts Management
// ============================================

/**
 * إنشاء حساب بنكي جديد
 */
export async function createBankAccount(accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const account: Omit<BankAccount, 'id'> = {
      ...accountData,
      balance: accountData.balance || 0,
      isActive: accountData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'bank_accounts'), {
      ...account,
      createdAt: Timestamp.fromDate(account.createdAt),
      updatedAt: Timestamp.fromDate(account.updatedAt)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw error;
  }
}

/**
 * الحصول على جميع الحسابات البنكية
 */
export async function getAllBankAccounts(): Promise<BankAccount[]> {
  try {
    const q = query(
      collection(db, 'bank_accounts'),
      where('isActive', '==', true),
      orderBy('bankName', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as BankAccount));
  } catch (error) {
    console.error('Error getting bank accounts:', error);
    throw error;
  }
}

/**
 * تحديث رصيد الحساب البنكي
 */
async function updateAccountBalance(
  accountNumber: string,
  transactionType: BankVoucherType,
  amount: number
): Promise<void> {
  try {
    const q = query(
      collection(db, 'bank_accounts'),
      where('accountNumber', '==', accountNumber),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    
    const accountDoc = snapshot.docs[0];
    const currentBalance = accountDoc.data().balance || 0;
    
    let newBalance = currentBalance;
    if (transactionType === 'deposit' || transactionType === 'interest') {
      newBalance += amount;
    } else if (transactionType === 'withdrawal' || transactionType === 'fee') {
      newBalance -= amount;
    }
    
    await updateDoc(doc(db, 'bank_accounts', accountDoc.id), {
      balance: newBalance,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating account balance:', error);
  }
}

// ============================================
// Bank Statement Upload & Processing
// ============================================

/**
 * رفع كشف حساب بنكي
 */
export async function uploadBankStatement(
  file: File,
  accountId: string,
  period: string,
  uploadedBy: string
): Promise<string> {
  try {
    // رفع الملف إلى Firebase Storage
    const storageRef = ref(storage, `bank_statements/${accountId}/${period}_${Date.now()}.pdf`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    
    // إنشاء سجل كشف الحساب
    const statementData: Omit<BankStatement, 'id'> = {
      accountId,
      accountNumber: '', // سيتم ملؤه من بيانات الحساب
      bankName: '',
      period,
      openingBalance: 0,
      closingBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      lines: [],
      uploadedAt: new Date(),
      uploadedBy,
      fileUrl
    };
    
    const docRef = await addDoc(collection(db, 'bank_statements'), {
      ...statementData,
      uploadedAt: Timestamp.fromDate(statementData.uploadedAt)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error uploading bank statement:', error);
    throw error;
  }
}

/**
 * معالجة سطور كشف الحساB
 */
export async function processBankStatementLines(
  statementId: string,
  lines: BankStatementLine[]
): Promise<void> {
  try {
    const docRef = doc(db, 'bank_statements', statementId);
    
    // حساب الإجماليات
    const totalDeposits = lines.reduce((sum, line) => sum + line.credit, 0);
    const totalWithdrawals = lines.reduce((sum, line) => sum + line.debit, 0);
    
    await updateDoc(docRef, {
      lines: lines.map(line => ({
        ...line,
        date: Timestamp.fromDate(line.date)
      })),
      totalDeposits,
      totalWithdrawals,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error processing bank statement lines:', error);
    throw error;
  }
}

// ============================================
// Auto-Matching Algorithm
// ============================================

/**
 * مطابقة تلقائية ذكية بين كشف البنك والسندات
 */
export async function autoMatchTransactions(
  statementId: string,
  threshold: number = 90
): Promise<MatchingSuggestion[]> {
  try {
    const statement = await getBankStatementById(statementId);
    if (!statement) throw new Error('Statement not found');
    
    const vouchers = await getUnreconciledVouchers(statement.accountNumber);
    const suggestions: MatchingSuggestion[] = [];
    
    for (const bankLine of statement.lines) {
      if (bankLine.matched) continue;
      
      for (const voucher of vouchers) {
        const matchScore = calculateMatchScore(bankLine, voucher);
        
        if (matchScore >= threshold) {
          const matchReasons = getMatchReasons(bankLine, voucher, matchScore);
          suggestions.push({
            bankLine,
            voucher,
            matchScore,
            matchReasons
          });
        }
      }
    }
    
    // ترتيب حسب النسبة
    suggestions.sort((a, b) => b.matchScore - a.matchScore);
    
    return suggestions;
  } catch (error) {
    console.error('Error auto-matching transactions:', error);
    throw error;
  }
}

/**
 * حساب نسبة التطابق بين سطر بنك وسند
 */
function calculateMatchScore(
  bankLine: BankStatementLine,
  voucher: BankVoucher
): number {
  let score = 0;
  const weights = {
    amount: 40,
    date: 30,
    reference: 20,
    description: 10
  };
  
  // تطابق المبلغ (أهم عامل)
  const voucherAmount = voucher.type === 'deposit' ? voucher.amount : -voucher.amount;
  const lineAmount = bankLine.credit - bankLine.debit;
  
  if (Math.abs(voucherAmount - lineAmount) < 0.01) {
    score += weights.amount;
  } else if (Math.abs(voucherAmount - lineAmount) < 10) {
    score += weights.amount * 0.5;
  }
  
  // تطابق التاريخ (± 3 أيام)
  const dateDiff = Math.abs(
    bankLine.date.getTime() - voucher.transactionDate.getTime()
  ) / (1000 * 60 * 60 * 24);
  
  if (dateDiff === 0) {
    score += weights.date;
  } else if (dateDiff <= 1) {
    score += weights.date * 0.8;
  } else if (dateDiff <= 3) {
    score += weights.date * 0.5;
  }
  
  // تطابق المرجع
  if (voucher.reference && bankLine.reference) {
    const refMatch = bankLine.reference.toLowerCase().includes(voucher.reference.toLowerCase()) ||
                     voucher.reference.toLowerCase().includes(bankLine.reference.toLowerCase());
    if (refMatch) score += weights.reference;
  }
  
  // تطابق الوصف
  if (voucher.description && bankLine.description) {
    const descMatch = similarity(
      bankLine.description.toLowerCase(),
      voucher.description.toLowerCase()
    );
    score += weights.description * descMatch;
  }
  
  return Math.round(score);
}

/**
 * حساب نسبة التشابه بين نصين
 */
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * حساب مسافة Levenshtein
 */
function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * الحصول على أسباب التطابق
 */
function getMatchReasons(
  bankLine: BankStatementLine,
  voucher: BankVoucher,
  matchScore: number
): string[] {
  const reasons: string[] = [];
  
  const voucherAmount = voucher.type === 'deposit' ? voucher.amount : -voucher.amount;
  const lineAmount = bankLine.credit - bankLine.debit;
  
  if (Math.abs(voucherAmount - lineAmount) < 0.01) {
    reasons.push('تطابق كامل في المبلغ');
  }
  
  const dateDiff = Math.abs(
    bankLine.date.getTime() - voucher.transactionDate.getTime()
  ) / (1000 * 60 * 60 * 24);
  
  if (dateDiff === 0) {
    reasons.push('نفس التاريخ');
  } else if (dateDiff <= 3) {
    reasons.push(`فرق ${Math.round(dateDiff)} يوم في التاريخ`);
  }
  
  if (voucher.reference && bankLine.reference) {
    if (bankLine.reference.includes(voucher.reference)) {
      reasons.push('تطابق في المرجع');
    }
  }
  
  if (matchScore >= 95) {
    reasons.push('تطابق عالي الثقة');
  }
  
  return reasons;
}

/**
 * تطبيق المطابقة
 */
export async function applyMatch(
  bankLineNumber: number,
  voucherId: string,
  statementId: string,
  matchedBy: string
): Promise<void> {
  try {
    // تحديث السند
    await updateDoc(doc(db, 'bank_vouchers', voucherId), {
      reconciled: true,
      reconciledDate: Timestamp.fromDate(new Date()),
      reconciledBy: matchedBy,
      bankStatementLine: bankLineNumber,
      status: 'reconciled',
      updatedAt: Timestamp.fromDate(new Date())
    });
    
    // تحديث سطر كشف الحساب
    const statement = await getBankStatementById(statementId);
    if (statement) {
      const updatedLines = statement.lines.map(line => {
        if (line.lineNumber === bankLineNumber) {
          return {
            ...line,
            matched: true,
            matchedVoucherId: voucherId,
            autoMatched: false
          };
        }
        return line;
      });
      
      await updateDoc(doc(db, 'bank_statements', statementId), {
        lines: updatedLines,
        updatedAt: Timestamp.fromDate(new Date())
      });
    }
  } catch (error) {
    console.error('Error applying match:', error);
    throw error;
  }
}

// ============================================
// Bank Reconciliation
// ============================================

/**
 * إنشاء مطابقة بنكية جديدة
 */
export async function createBankReconciliation(
  accountId: string,
  period: string,
  startDate: Date,
  endDate: Date,
  createdBy: string
): Promise<string> {
  try {
    const account = await getBankAccountById(accountId);
    if (!account) throw new Error('Account not found');
    
    // جلب سندات الفترة
    const vouchers = await getVouchersForPeriod(account.accountNumber, startDate, endDate);
    
    // جلب كشف الحساب
    const statement = await getBankStatementForPeriod(accountId, period);
    
    const reconciliation: Omit<BankReconciliation, 'id'> = {
      accountId,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      period,
      openingBalance: account.balance,
      closingBalance: account.balance,
      bankStatementId: statement?.id,
      bankStatementLines: statement?.lines || [],
      companyVouchers: vouchers,
      unmatchedBankLines: [],
      unmatchedCompanyVouchers: [],
      adjustments: [],
      status: 'in_progress',
      reconciledBalance: 0,
      difference: 0,
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'bank_reconciliations'), {
      ...reconciliation,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      createdAt: Timestamp.fromDate(reconciliation.createdAt),
      updatedAt: Timestamp.fromDate(reconciliation.updatedAt)
    });
    
    // بدء المطابقة التلقائية
    if (statement) {
      await autoMatchTransactions(statement.id);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating bank reconciliation:', error);
    throw error;
  }
}

/**
 * إكمال المطابقة البنكية
 */
export async function completeBankReconciliation(
  reconciliationId: string,
  completedBy: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bank_reconciliations', reconciliationId), {
      status: 'completed',
      completedAt: Timestamp.fromDate(new Date()),
      completedBy,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error completing bank reconciliation:', error);
    throw error;
  }
}

// ============================================
// Helper Functions
// ============================================

async function getBankStatementById(statementId: string): Promise<BankStatement | null> {
  const docRef = doc(db, 'bank_statements', statementId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    uploadedAt: data.uploadedAt?.toDate(),
    lines: data.lines?.map((line: any) => ({
      ...line,
      date: line.date?.toDate()
    }))
  } as BankStatement;
}

async function getBankAccountById(accountId: string): Promise<BankAccount | null> {
  const docRef = doc(db, 'bank_accounts', accountId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  } as BankAccount;
}

async function getUnreconciledVouchers(accountNumber: string): Promise<BankVoucher[]> {
  const q = query(
    collection(db, 'bank_vouchers'),
    where('accountNumber', '==', accountNumber),
    where('reconciled', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    transactionDate: doc.data().transactionDate?.toDate(),
    valueDate: doc.data().valueDate?.toDate(),
    reconciledDate: doc.data().reconciledDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as BankVoucher));
}

async function getVouchersForPeriod(
  accountNumber: string,
  startDate: Date,
  endDate: Date
): Promise<BankVoucher[]> {
  const q = query(
    collection(db, 'bank_vouchers'),
    where('accountNumber', '==', accountNumber),
    where('transactionDate', '>=', Timestamp.fromDate(startDate)),
    where('transactionDate', '<=', Timestamp.fromDate(endDate))
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    transactionDate: doc.data().transactionDate?.toDate(),
    valueDate: doc.data().valueDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as BankVoucher));
}

async function getBankStatementForPeriod(
  accountId: string,
  period: string
): Promise<BankStatement | null> {
  const q = query(
    collection(db, 'bank_statements'),
    where('accountId', '==', accountId),
    where('period', '==', period),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    uploadedAt: data.uploadedAt?.toDate(),
    lines: data.lines?.map((line: any) => ({
      ...line,
      date: line.date?.toDate()
    }))
  } as BankStatement;
}

// ============================================
// Statistics
// ============================================

/**
 * الحصول على إحصائيات سندات البنك
 */
export async function getBankStatistics(): Promise<BankStatistics> {
  try {
    const vouchers = await getAllBankVouchers();
    
    const stats: BankStatistics = {
      totalVouchers: vouchers.length,
      byType: {
        deposit: 0,
        withdrawal: 0,
        transfer: 0,
        check: 0,
        fee: 0,
        interest: 0
      },
      byCategory: {
        customer_payment: 0,
        supplier_payment: 0,
        salary_payment: 0,
        loan_payment: 0,
        bank_charges: 0,
        interest_income: 0,
        interest_expense: 0,
        tax_payment: 0,
        capital_injection: 0,
        dividend: 0,
        refund: 0,
        other: 0
      },
      byStatus: {
        pending: 0,
        cleared: 0,
        bounced: 0,
        cancelled: 0,
        reconciled: 0
      },
      totalDeposits: 0,
      totalWithdrawals: 0,
      netCashFlow: 0,
      pendingAmount: 0,
      reconciledAmount: 0,
      unreconciledAmount: 0,
      averageTransactionAmount: 0,
      largestDeposit: 0,
      largestWithdrawal: 0
    };
    
    vouchers.forEach(voucher => {
      stats.byType[voucher.type]++;
      stats.byCategory[voucher.category]++;
      stats.byStatus[voucher.status]++;
      
      if (voucher.type === 'deposit' || voucher.type === 'interest') {
        stats.totalDeposits += voucher.amount;
        if (voucher.amount > stats.largestDeposit) {
          stats.largestDeposit = voucher.amount;
        }
      } else if (voucher.type === 'withdrawal' || voucher.type === 'fee') {
        stats.totalWithdrawals += voucher.amount;
        if (voucher.amount > stats.largestWithdrawal) {
          stats.largestWithdrawal = voucher.amount;
        }
      }
      
      if (voucher.status === 'pending') {
        stats.pendingAmount += voucher.amount;
      }
      
      if (voucher.reconciled) {
        stats.reconciledAmount += voucher.amount;
      } else {
        stats.unreconciledAmount += voucher.amount;
      }
    });
    
    stats.netCashFlow = stats.totalDeposits - stats.totalWithdrawals;
    stats.averageTransactionAmount = vouchers.length > 0 
      ? (stats.totalDeposits + stats.totalWithdrawals) / vouchers.length 
      : 0;
    
    return stats;
  } catch (error) {
    console.error('Error getting bank statistics:', error);
    throw error;
  }
}

// ============================================
// Real-time Subscriptions
// ============================================

/**
 * الاشتراك في تحديثات سندات البنك
 */
export function subscribeToBankVouchers(
  callback: (vouchers: BankVoucher[]) => void
): () => void {
  const q = query(
    collection(db, 'bank_vouchers'),
    orderBy('transactionDate', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const vouchers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      transactionDate: doc.data().transactionDate?.toDate(),
      valueDate: doc.data().valueDate?.toDate(),
      reconciledDate: doc.data().reconciledDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as BankVoucher));
    
    callback(vouchers);
  });
}
