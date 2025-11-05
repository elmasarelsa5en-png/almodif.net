// نظام سندات الصرف التلقائي
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface PaymentVoucher {
  id?: string;
  voucherNumber: string; // رقم السند التسلسلي
  type: 'expense' | 'income';
  amount: number;
  vatRate: number; // نسبة الضريبة (15%)
  vatAmount: number; // مبلغ الضريبة
  totalWithoutVat: number; // المبلغ بدون ضريبة
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  paidTo: string; // المستلم
  paidFrom?: string; // دفع من
  category: string; // بند الصرف
  purpose: string; // من أجل
  supplierTaxNumber?: string; // الرقم الضريبي للمورد
  supplierInvoiceNumber?: string; // رقم فاتورة المورد
  cashier?: string; // أمين الصندوق
  gregorianDate?: string; // التاريخ الميلادي
  hijriDate?: string; // التاريخ الهجري
  time?: string; // الوقت
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  fiscalYear?: string;
}

// توليد رقم سند صرف تسلسلي
export async function generatePaymentVoucherNumber(): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    const vouchersRef = collection(db, 'payment-vouchers');
    const q = query(
      vouchersRef,
      where('fiscalYear', '==', currentYear.toString()),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    
    // تنسيق: PV-2025-0001
    return `PV-${currentYear}-${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating payment voucher number:', error);
    const timestamp = Date.now();
    return `PV-${new Date().getFullYear()}-${timestamp}`;
  }
}

// حساب الضريبة
export function calculateVAT(amount: number, vatRate: number = 15) {
  const vatAmount = (amount * vatRate) / 100;
  const totalWithoutVat = amount - vatAmount;
  return {
    vatAmount: Number(vatAmount.toFixed(2)),
    totalWithoutVat: Number(totalWithoutVat.toFixed(2))
  };
}

// إنشاء سند صرف
export async function createPaymentVoucher(
  voucherData: Omit<PaymentVoucher, 'id' | 'voucherNumber' | 'createdAt'>
): Promise<string | null> {
  try {
    const voucherNumber = await generatePaymentVoucherNumber();
    
    const voucher: Omit<PaymentVoucher, 'id'> = {
      ...voucherData,
      voucherNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'payment-vouchers'), voucher);
    console.log('✅ تم إنشاء سند الصرف:', voucherNumber, 'ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء سند الصرف:', error);
    return null;
  }
}

// جلب جميع سندات الصرف
export async function getAllPaymentVouchers(): Promise<PaymentVoucher[]> {
  try {
    const vouchersRef = collection(db, 'payment-vouchers');
    const q = query(vouchersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentVoucher));
  } catch (error) {
    console.error('Error getting payment vouchers:', error);
    return [];
  }
}

// جلب ملخص سندات الصرف
export async function getPaymentVouchersSummary(startDate: string, endDate: string) {
  try {
    const vouchers = await getAllPaymentVouchers();
    const filtered = vouchers.filter(v => {
      const vDate = new Date(v.createdAt);
      return vDate >= new Date(startDate) && vDate <= new Date(endDate);
    });

    const totalAmount = filtered.reduce((sum, v) => sum + v.amount, 0);
    const totalVAT = filtered.reduce((sum, v) => sum + v.vatAmount, 0);
    const byCategory = filtered.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + v.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      count: filtered.length,
      totalAmount,
      totalVAT,
      totalWithoutVat: totalAmount - totalVAT,
      byCategory
    };
  } catch (error) {
    console.error('Error getting payment vouchers summary:', error);
    return {
      count: 0,
      totalAmount: 0,
      totalVAT: 0,
      totalWithoutVat: 0,
      byCategory: {}
    };
  }
}
