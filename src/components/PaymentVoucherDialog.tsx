'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPaymentVoucher, generatePaymentVoucherNumber, calculateVAT } from '@/lib/payment-vouchers-system';
import { checkBalance, calculateBalances, type CashRegisterBalance } from '@/lib/cash-register-system';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentVoucherDialog({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [voucherNumber, setVoucherNumber] = useState('');
  
  // Form fields
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [time, setTime] = useState('');
  const [cashier, setCashier] = useState('');
  const [paidFrom, setPaidFrom] = useState('cash_register'); // صندوق أو بنك
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState('15');
  const [vatAmount, setVatAmount] = useState('0');
  const [totalWithoutVat, setTotalWithoutVat] = useState('0');
  const [supplierTaxNumber, setSupplierTaxNumber] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [category, setCategory] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  
  // رصيد الصندوق والبنك
  const [balances, setBalances] = useState<CashRegisterBalance | null>(null);
  const [balanceCheck, setBalanceCheck] = useState<{sufficient: boolean; message: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
      loadBalances();
    }
  }, [isOpen]);

  // Auto-calculate VAT when amount changes
  useEffect(() => {
    if (amount) {
      const numAmount = parseFloat(amount);
      const rate = parseFloat(vatRate);
      if (!isNaN(numAmount) && !isNaN(rate)) {
        const { vatAmount: vat, totalWithoutVat: total } = calculateVAT(numAmount, rate);
        setVatAmount(vat.toFixed(2));
        setTotalWithoutVat(total.toFixed(2));
      }
    } else {
      setVatAmount('0');
      setTotalWithoutVat('0');
    }
  }, [amount, vatRate]);

  // التحقق من الرصيد عند تغيير المبلغ أو المصدر
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      checkBalanceAvailability();
    } else {
      setBalanceCheck(null);
    }
  }, [amount, paidFrom]);

  const loadBalances = async () => {
    const data = await calculateBalances();
    setBalances(data);
  };

  const checkBalanceAvailability = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const result = await checkBalance(numAmount, paidFrom as 'cash_register' | 'bank');
    setBalanceCheck(result);
  };

  const initializeForm = async () => {
    // Generate voucher number
    const number = await generatePaymentVoucherNumber();
    setVoucherNumber(number);

    // Set current date and time
    const now = new Date();
    setGregorianDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));

    // Convert to Hijri (simplified)
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    setHijriDate(hijri);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الرصيد قبل الحفظ
    if (balanceCheck && !balanceCheck.sufficient) {
      const confirm = window.confirm(
        `${balanceCheck.message}\n\nهل تريد المتابعة رغم عدم كفاية الرصيد؟`
      );
      if (!confirm) return;
    }
    
    setLoading(true);

    try {
      await createPaymentVoucher({
        type: 'expense',
        amount: parseFloat(amount),
        vatRate: parseFloat(vatRate),
        vatAmount: parseFloat(vatAmount),
        totalWithoutVat: parseFloat(totalWithoutVat),
        paymentMethod: paymentMethod as 'cash' | 'bank_transfer' | 'check',
        paidTo,
        paidFrom,
        category,
        purpose,
        supplierTaxNumber,
        supplierInvoiceNumber,
        notes,
        cashier,
        gregorianDate,
        hijriDate,
        time,
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('حدث خطأ أثناء إنشاء السند');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaidTo('');
    setPaidFrom('');
    setCategory('');
    setPurpose('');
    setSupplierTaxNumber('');
    setSupplierInvoiceNumber('');
    setNotes('');
    setCashier('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">سند صرف جديد</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Voucher Number, Dates, Time */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم السند</label>
              <input
                type="text"
                value={voucherNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ الميلادي</label>
              <input
                type="date"
                value={gregorianDate}
                onChange={(e) => setGregorianDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ الهجري</label>
              <input
                type="text"
                value={hijriDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
          </div>

          {/* Row 2: Cashier, Paid From/To */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">أمين الصندوق</label>
              <input
                type="text"
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="اسم أمين الصندوق"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">دفع من <span className="text-red-500">*</span></label>
              <select
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
              >
                <option value="cash_register">💵 الصندوق</option>
                <option value="bank">🏦 البنك</option>
              </select>
              {balances && (
                <div className="mt-2 text-xs">
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                    <span className="text-gray-600">رصيد الصندوق:</span>
                    <span className="font-bold text-green-600">{balances.cashRegister.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded mt-1">
                    <span className="text-gray-600">رصيد البنك:</span>
                    <span className="font-bold text-blue-600">{balances.bank.toFixed(2)} ر.س</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المستلم <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="اسم المستلم"
              />
            </div>
          </div>

          {/* تنبيه الرصيد */}
          {balanceCheck && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              balanceCheck.sufficient 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {balanceCheck.sufficient ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${
                  balanceCheck.sufficient ? 'text-green-800' : 'text-red-800'
                }`}>
                  {balanceCheck.message}
                </p>
                {!balanceCheck.sufficient && (
                  <p className="text-sm text-red-600 mt-1">
                    سيتم الصرف حتى لو كان الرصيد غير كافي، يرجى التأكد من البيانات
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Row 3: Amount & VAT Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نسبة الضريبة %</label>
              <input
                type="number"
                step="0.01"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">قيمة الضريبة</label>
              <input
                type="text"
                value={vatAmount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ بدون ضريبة</label>
              <input
                type="text"
                value={totalWithoutVat}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-bold text-green-600"
              />
            </div>
          </div>

          {/* Row 4: Supplier Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي للمورد</label>
              <input
                type="text"
                value={supplierTaxNumber}
                onChange={(e) => setSupplierTaxNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="300000000000003"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم فاتورة المورد</label>
              <input
                type="text"
                value={supplierInvoiceNumber}
                onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="INV-2025-001"
              />
            </div>
          </div>

          {/* Row 5: Payment Method & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                <option value="cash">💵 نقدي</option>
                <option value="bank_transfer">🏦 تحويل بنكي</option>
                <option value="check">📝 شيك</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">بند الصرف <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                <option value="">اختر البند</option>
                <option value="utilities">⚡ مرافق وخدمات</option>
                <option value="maintenance">🔧 صيانة</option>
                <option value="salaries">💰 رواتب</option>
                <option value="supplies">📦 مستلزمات</option>
                <option value="cleaning">🧹 نظافة</option>
                <option value="food">🍽️ مواد غذائية</option>
                <option value="marketing">📢 تسويق</option>
                <option value="other">📋 أخرى</option>
              </select>
            </div>
          </div>

          {/* Row 6: Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">من أجل <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="الغرض من الصرف"
            />
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-gray-700"
              placeholder="ملاحظات إضافية..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-6 text-lg"
            >
              {loading ? '⏳ جاري الحفظ...' : '✅ حفظ السند'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-8 py-6 text-lg"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
