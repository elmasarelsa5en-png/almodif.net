// نظام سندات القبض التلقائي
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface Receipt {
  id?: string;
  receiptNumber: string; // رقم السند التسلسلي
  type: 'room_payment' | 'service_payment' | 'booking_deposit' | 'other';
  amount: number;
  roomNumber?: string;
  guestName?: string;
  guestPhone?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  cardType?: string; // مدى، فيزا، ماستركارد
  receiptNumberExternal?: string; // رقم إيصال البطاقة
  description: string;
  category: 'room_rent' | 'services' | 'laundry' | 'restaurant' | 'coffee' | 'other';
  paidBy: string; // اسم الموظف المستلم
  createdAt: string;
  createdBy: string;
  fiscalYear: string; // السنة المالية
  notes?: string;
}

// توليد رقم سند تسلسلي
export async function generateReceiptNumber(): Promise<string> {
  try {
    const currentYear = new Date().getFullYear();
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('fiscalYear', '==', currentYear.toString()),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    
    // تنسيق: RCP-2025-0001
    return `RCP-${currentYear}-${count.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating receipt number:', error);
    const timestamp = Date.now();
    return `RCP-${new Date().getFullYear()}-${timestamp}`;
  }
}

// إنشاء سند قبض
export async function createReceipt(receiptData: Omit<Receipt, 'id' | 'receiptNumber' | 'fiscalYear' | 'createdAt'>): Promise<string | null> {
  try {
    const receiptNumber = await generateReceiptNumber();
    const fiscalYear = new Date().getFullYear().toString();
    
    const receipt: Omit<Receipt, 'id'> = {
      ...receiptData,
      receiptNumber,
      fiscalYear,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'receipts'), receipt);
    console.log('✅ تم إنشاء سند القبض:', receiptNumber, 'ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء سند القبض:', error);
    return null;
  }
}

// جلب جميع سندات القبض
export async function getAllReceipts(): Promise<Receipt[]> {
  try {
    const receiptsRef = collection(db, 'receipts');
    const q = query(receiptsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Receipt));
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return [];
  }
}

// جلب سندات القبض لشقة معينة
export async function getReceiptsByRoom(roomNumber: string): Promise<Receipt[]> {
  try {
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('roomNumber', '==', roomNumber),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Receipt));
  } catch (error) {
    console.error('Error fetching receipts by room:', error);
    return [];
  }
}

// جلب سندات القبض لنزيل معين
export async function getReceiptsByGuest(guestName: string): Promise<Receipt[]> {
  try {
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('guestName', '==', guestName),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Receipt));
  } catch (error) {
    console.error('Error fetching receipts by guest:', error);
    return [];
  }
}

// جلب إجمالي المبالغ المحصلة حسب الفترة
export async function getReceiptsSummary(startDate: string, endDate: string) {
  try {
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    const snapshot = await getDocs(q);
    
    const receipts = snapshot.docs.map(doc => doc.data() as Receipt);
    
    const summary = {
      totalAmount: receipts.reduce((sum, r) => sum + r.amount, 0),
      totalReceipts: receipts.length,
      byPaymentMethod: {
        cash: receipts.filter(r => r.paymentMethod === 'cash').reduce((sum, r) => sum + r.amount, 0),
        card: receipts.filter(r => r.paymentMethod === 'card').reduce((sum, r) => sum + r.amount, 0),
        transfer: receipts.filter(r => r.paymentMethod === 'transfer').reduce((sum, r) => sum + r.amount, 0),
      },
      byCategory: {
        room_rent: receipts.filter(r => r.category === 'room_rent').reduce((sum, r) => sum + r.amount, 0),
        services: receipts.filter(r => r.category === 'services').reduce((sum, r) => sum + r.amount, 0),
        laundry: receipts.filter(r => r.category === 'laundry').reduce((sum, r) => sum + r.amount, 0),
        restaurant: receipts.filter(r => r.category === 'restaurant').reduce((sum, r) => sum + r.amount, 0),
        coffee: receipts.filter(r => r.category === 'coffee').reduce((sum, r) => sum + r.amount, 0),
        other: receipts.filter(r => r.category === 'other').reduce((sum, r) => sum + r.amount, 0),
      }
    };
    
    return summary;
  } catch (error) {
    console.error('Error getting receipts summary:', error);
    return null;
  }
}
