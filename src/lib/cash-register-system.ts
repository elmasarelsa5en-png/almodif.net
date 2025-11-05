// نظام إدارة الصندوق والبنك
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface CashRegisterBalance {
  cashRegister: number; // رصيد الصندوق
  bank: number; // رصيد البنك
  total: number; // الإجمالي
  lastUpdated: string;
}

/**
 * حساب رصيد الصندوق والبنك من السندات والمقبوضات
 */
export async function calculateBalances(): Promise<CashRegisterBalance> {
  try {
    let cashRegister = 0;
    let bank = 0;

    // 1. جلب كل سندات القبض (الإيرادات)
    const receiptsRef = collection(db, 'receipts');
    const receiptsSnapshot = await getDocs(receiptsRef);
    
    receiptsSnapshot.forEach((doc) => {
      const receipt = doc.data();
      const amount = Number(receipt.amount) || 0;
      
      // إضافة المبالغ المحصلة للصندوق أو البنك حسب طريقة الدفع
      if (receipt.paymentMethod === 'cash') {
        cashRegister += amount;
      } else if (receipt.paymentMethod === 'card' || receipt.paymentMethod === 'transfer') {
        bank += amount;
      }
    });

    // 2. طرح سندات الصرف (المصروفات)
    const vouchersRef = collection(db, 'payment-vouchers');
    const vouchersSnapshot = await getDocs(vouchersRef);
    
    vouchersSnapshot.forEach((doc) => {
      const voucher = doc.data();
      const amount = Number(voucher.amount) || 0;
      
      // طرح المبالغ المصروفة من الصندوق أو البنك
      if (voucher.paidFrom === 'cash_register') {
        cashRegister -= amount;
      } else if (voucher.paidFrom === 'bank') {
        bank -= amount;
      }
    });

    // 3. إضافة معاملات الحسابات (accounting-transactions)
    const transactionsRef = collection(db, 'accounting-transactions');
    const transactionsSnapshot = await getDocs(transactionsRef);
    
    transactionsSnapshot.forEach((doc) => {
      const transaction = doc.data();
      const amount = Number(transaction.amount) || 0;
      
      if (transaction.type === 'income') {
        if (transaction.paymentMethod === 'cash') {
          cashRegister += amount;
        } else {
          bank += amount;
        }
      } else if (transaction.type === 'expense') {
        if (transaction.paymentMethod === 'cash') {
          cashRegister -= amount;
        } else {
          bank -= amount;
        }
      }
    });

    return {
      cashRegister: Number(cashRegister.toFixed(2)),
      bank: Number(bank.toFixed(2)),
      total: Number((cashRegister + bank).toFixed(2)),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating balances:', error);
    return {
      cashRegister: 0,
      bank: 0,
      total: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * التحقق من كفاية الرصيد قبل الصرف
 */
export async function checkBalance(amount: number, source: 'cash_register' | 'bank'): Promise<{
  sufficient: boolean;
  currentBalance: number;
  remaining: number;
  message: string;
}> {
  try {
    const balances = await calculateBalances();
    const currentBalance = source === 'cash_register' ? balances.cashRegister : balances.bank;
    const remaining = currentBalance - amount;
    const sufficient = remaining >= 0;

    const sourceName = source === 'cash_register' ? 'الصندوق' : 'البنك';

    return {
      sufficient,
      currentBalance,
      remaining,
      message: sufficient 
        ? `✅ الرصيد كافي. المتبقي في ${sourceName}: ${remaining.toFixed(2)} ريال`
        : `⚠️ الرصيد غير كافي! الرصيد الحالي في ${sourceName}: ${currentBalance.toFixed(2)} ريال، المطلوب: ${amount.toFixed(2)} ريال`
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return {
      sufficient: false,
      currentBalance: 0,
      remaining: 0,
      message: '❌ حدث خطأ في التحقق من الرصيد'
    };
  }
}

/**
 * الحصول على تقرير الأرصدة
 */
export async function getBalanceReport(): Promise<{
  balances: CashRegisterBalance;
  breakdown: {
    receiptsTotal: number;
    vouchersTotal: number;
    transactionsIncome: number;
    transactionsExpense: number;
  };
}> {
  try {
    const balances = await calculateBalances();
    
    // حساب التفاصيل
    let receiptsTotal = 0;
    let vouchersTotal = 0;
    let transactionsIncome = 0;
    let transactionsExpense = 0;

    const receiptsSnapshot = await getDocs(collection(db, 'receipts'));
    receiptsSnapshot.forEach(doc => {
      receiptsTotal += Number(doc.data().amount) || 0;
    });

    const vouchersSnapshot = await getDocs(collection(db, 'payment-vouchers'));
    vouchersSnapshot.forEach(doc => {
      vouchersTotal += Number(doc.data().amount) || 0;
    });

    const transactionsSnapshot = await getDocs(collection(db, 'accounting-transactions'));
    transactionsSnapshot.forEach(doc => {
      const amount = Number(doc.data().amount) || 0;
      if (doc.data().type === 'income') {
        transactionsIncome += amount;
      } else {
        transactionsExpense += amount;
      }
    });

    return {
      balances,
      breakdown: {
        receiptsTotal: Number(receiptsTotal.toFixed(2)),
        vouchersTotal: Number(vouchersTotal.toFixed(2)),
        transactionsIncome: Number(transactionsIncome.toFixed(2)),
        transactionsExpense: Number(transactionsExpense.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Error getting balance report:', error);
    return {
      balances: {
        cashRegister: 0,
        bank: 0,
        total: 0,
        lastUpdated: new Date().toISOString()
      },
      breakdown: {
        receiptsTotal: 0,
        vouchersTotal: 0,
        transactionsIncome: 0,
        transactionsExpense: 0
      }
    };
  }
}
