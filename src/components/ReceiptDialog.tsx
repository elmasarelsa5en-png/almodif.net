'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createReceipt, generateReceiptNumber } from '@/lib/receipts-system';
import { calculateBalances, type CashRegisterBalance } from '@/lib/cash-register-system';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReceiptDialog({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  
  // Form fields
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardType, setCardType] = useState(''); // نوع البطاقة
  const [category, setCategory] = useState('room_rent');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  
  // رصيد الصندوق والبنك
  const [balances, setBalances] = useState<CashRegisterBalance | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeForm();
      loadBalances();
    }
  }, [isOpen]);

  const loadBalances = async () => {
    const data = await calculateBalances();
    setBalances(data);
  };

  const initializeForm = async () => {
    // Generate receipt number
    const number = await generateReceiptNumber();
    setReceiptNumber(number);
    
    // Set default cashier name
    setPaidBy('أمين الصندوق');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createReceipt({
        type: 'room_payment',
        amount: parseFloat(amount),
        paymentMethod: paymentMethod as 'cash' | 'card' | 'transfer',
        cardType: cardType || undefined,
        category: category as 'room_rent' | 'services' | 'laundry' | 'restaurant' | 'coffee' | 'other',
        description: description || `سند قبض ${category === 'room_rent' ? 'إيجار شقة' : category}`,
        roomNumber: roomNumber || undefined,
        guestName: guestName || undefined,
        paidBy,
        createdBy: paidBy,
        notes: notes || undefined,
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert('حدث خطأ أثناء إنشاء السند');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomNumber('');
    setGuestName('');
    setAmount('');
    setPaymentMethod('cash');
    setCardType('');
    setCategory('room_rent');
    setDescription('');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">سند قبض جديد</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Receipt Number & Balance Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم السند</label>
              <input
                type="text"
                value={receiptNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono text-gray-700"
              />
            </div>
            {balances && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الرصيد الحالي</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                    <span className="text-xs text-gray-600">الصندوق:</span>
                    <span className="text-sm font-bold text-green-600">{balances.cashRegister.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                    <span className="text-xs text-gray-600">البنك:</span>
                    <span className="text-sm font-bold text-blue-600">{balances.bank.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Guest Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الشقة</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="مثال: 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم النزيل</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                placeholder="اسم النزيل"
              />
            </div>
          </div>

          {/* Row 3: Amount & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ المستلم <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
              >
                <option value="cash">💵 نقدي</option>
                <option value="card">💳 بطاقة</option>
                <option value="transfer">🏦 تحويل بنكي</option>
              </select>
            </div>
          </div>

          {/* Card Type (only shown when payment method is card) */}
          {paymentMethod === 'card' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع البطاقة <span className="text-red-500">*</span></label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
              >
                <option value="">-- اختر نوع البطاقة --</option>
                <option value="mada">💳 مدى (Mada)</option>
                <option value="mastercard">💳 ماستر كارد (Mastercard)</option>
                <option value="amex">💳 أمريكان إكسبريس (American Express)</option>
                <option value="gccnet">💳 الشبكة الخليجية (GCC Net)</option>
                <option value="unionpay">💳 يونيون باي (UnionPay)</option>
              </select>
            </div>
          )}

          {/* Row 4: Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
            >
              <option value="room_rent">🏠 إيجار شقة</option>
              <option value="services">🛎️ خدمات</option>
              <option value="laundry">👔 مغسلة</option>
              <option value="restaurant">🍽️ مطعم</option>
              <option value="coffee">☕ كافيه</option>
              <option value="other">📋 أخرى</option>
            </select>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="وصف السند"
            />
          </div>

          {/* Row 6: Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المستلم <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              placeholder="اسم المستلم"
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

          {/* تنبيه الرصيد الجديد */}
          {balances && amount && parseFloat(amount) > 0 && (
            <div className="p-4 rounded-lg flex items-center gap-3 bg-green-50 border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-green-800">
                  ✅ سيتم إضافة {parseFloat(amount).toFixed(2)} ريال إلى {
                    paymentMethod === 'cash' ? 'الصندوق' : 'البنك'
                  }
                </p>
                <p className="text-sm text-green-600 mt-1">
                  الرصيد الجديد: {(
                    paymentMethod === 'cash' 
                      ? balances.cashRegister + parseFloat(amount)
                      : balances.bank + parseFloat(amount)
                  ).toFixed(2)} ريال
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg"
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
