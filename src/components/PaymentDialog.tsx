'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle2,
  Loader2,
  Calendar,
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onPaymentSuccess: (paymentData: PaymentResult) => void;
  allowPayLater?: boolean;
}

export interface PaymentResult {
  method: 'apple-pay' | 'credit-card' | 'pay-later';
  amount: number;
  orderId: string;
  transactionId?: string;
  status: 'success' | 'pending';
  timestamp: string;
}

export default function PaymentDialog({
  open,
  onClose,
  amount,
  orderId,
  onPaymentSuccess,
  allowPayLater = true
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'apple-pay' | 'credit-card' | 'pay-later'>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // بيانات البطاقة
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // التحقق من توفر Apple Pay
  const isApplePayAvailable = typeof window !== 'undefined' && 
    (window as any).ApplePaySession && 
    (window as any).ApplePaySession.canMakePayments();

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // XXXX XXXX XXXX XXXX
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardData(prev => ({ ...prev, expiry: formatted }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substr(0, 4);
    setCardData(prev => ({ ...prev, cvv: value }));
  };

  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length !== 16) {
      alert('رقم البطاقة غير صحيح');
      return false;
    }
    if (!cardData.name || cardData.name.length < 3) {
      alert('اسم حامل البطاقة غير صحيح');
      return false;
    }
    if (!cardData.expiry || cardData.expiry.length !== 5) {
      alert('تاريخ الانتهاء غير صحيح');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      alert('رمز CVV غير صحيح');
      return false;
    }
    return true;
  };

  const processApplePay = async () => {
    setIsProcessing(true);

    try {
      // محاكاة معالجة Apple Pay
      // في الواقع، يجب استخدام Apple Pay API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: PaymentResult = {
        method: 'apple-pay',
        amount,
        orderId,
        transactionId: `AP-${Date.now()}`,
        status: 'success',
        timestamp: new Date().toISOString()
      };

      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(result);
        onClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Apple Pay error:', error);
      alert('فشلت عملية الدفع عبر Apple Pay. يرجى المحاولة مرة أخرى.');
      setIsProcessing(false);
    }
  };

  const processCreditCard = async () => {
    if (!validateCardData()) {
      return;
    }

    setIsProcessing(true);

    try {
      // محاكاة معالجة البطاقة
      // في الواقع، يجب استخدام payment gateway مثل Stripe, PayTabs, etc.
      await new Promise(resolve => setTimeout(resolve, 2500));

      const result: PaymentResult = {
        method: 'credit-card',
        amount,
        orderId,
        transactionId: `CC-${Date.now()}`,
        status: 'success',
        timestamp: new Date().toISOString()
      };

      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(result);
        onClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Credit card payment error:', error);
      alert('فشلت عملية الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى.');
      setIsProcessing(false);
    }
  };

  const handlePayLater = () => {
    const result: PaymentResult = {
      method: 'pay-later',
      amount,
      orderId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    onPaymentSuccess(result);
    onClose();
    resetForm();
  };

  const handlePayment = () => {
    if (paymentMethod === 'apple-pay') {
      processApplePay();
    } else if (paymentMethod === 'credit-card') {
      processCreditCard();
    } else {
      handlePayLater();
    }
  };

  const resetForm = () => {
    setCardData({
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    });
    setPaymentMethod('credit-card');
    setIsProcessing(false);
    setPaymentSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-amber-500/30" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            إتمام الدفع
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center">
            اختر طريقة الدفع المناسبة
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {paymentSuccess ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-green-400 mb-2">تم الدفع بنجاح!</h3>
              <p className="text-slate-400">جاري إتمام طلبك...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* عرض المبلغ */}
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">المبلغ المطلوب:</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100">
                    {amount.toLocaleString()} ريال
                  </span>
                </div>
              </div>

              {/* اختيار طريقة الدفع */}
              <div className="space-y-3">
                <Label className="text-slate-300">اختر طريقة الدفع:</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  {/* Apple Pay */}
                  {isApplePayAvailable && (
                    <div 
                      className={`flex items-center space-x-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'apple-pay' 
                          ? 'border-amber-400 bg-amber-500/10' 
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onClick={() => setPaymentMethod('apple-pay')}
                    >
                      <RadioGroupItem value="apple-pay" id="apple-pay" />
                      <Label htmlFor="apple-pay" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Apple Pay</p>
                          <p className="text-xs text-slate-400">دفع سريع وآمن</p>
                        </div>
                      </Label>
                    </div>
                  )}

                  {/* Credit Card */}
                  <div 
                    className={`flex items-center space-x-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'credit-card' 
                        ? 'border-blue-400 bg-blue-500/10' 
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                    onClick={() => setPaymentMethod('credit-card')}
                  >
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">بطاقة ائتمان</p>
                        <p className="text-xs text-slate-400">Visa, Mastercard, Mada</p>
                      </div>
                    </Label>
                  </div>

                  {/* Pay Later */}
                  {allowPayLater && (
                    <div 
                      className={`flex items-center space-x-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'pay-later' 
                          ? 'border-purple-400 bg-purple-500/10' 
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onClick={() => setPaymentMethod('pay-later')}
                    >
                      <RadioGroupItem value="pay-later" id="pay-later" />
                      <Label htmlFor="pay-later" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">الدفع لاحقاً</p>
                          <p className="text-xs text-slate-400">الدفع عند الاستلام</p>
                        </div>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {/* نموذج البطاقة الائتمانية */}
              {paymentMethod === 'credit-card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                >
                  {/* رقم البطاقة */}
                  <div>
                    <Label className="text-slate-300 mb-2">رقم البطاقة</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={cardData.number}
                        onChange={handleCardNumberChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="bg-slate-900/50 border-slate-600 text-white pr-12"
                        maxLength={19}
                        dir="ltr"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  {/* اسم حامل البطاقة */}
                  <div>
                    <Label className="text-slate-300 mb-2">اسم حامل البطاقة</Label>
                    <Input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                      placeholder="CARDHOLDER NAME"
                      className="bg-slate-900/50 border-slate-600 text-white"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* تاريخ الانتهاء */}
                    <div>
                      <Label className="text-slate-300 mb-2">تاريخ الانتهاء</Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={cardData.expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="bg-slate-900/50 border-slate-600 text-white pr-10"
                          maxLength={5}
                          dir="ltr"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* CVV */}
                    <div>
                      <Label className="text-slate-300 mb-2">CVV</Label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={cardData.cvv}
                          onChange={handleCvvChange}
                          placeholder="XXX"
                          className="bg-slate-900/50 border-slate-600 text-white pr-10"
                          maxLength={4}
                          dir="ltr"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* رسالة الأمان */}
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-blue-400 mt-0.5" />
                      <p className="text-xs text-blue-300">
                        جميع المعاملات محمية بتشفير SSL. بياناتك آمنة تماماً.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* رسالة الدفع لاحقاً */}
              {paymentMethod === 'pay-later' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-purple-300 font-medium mb-1">
                        سيتم إضافة المبلغ إلى فاتورتك
                      </p>
                      <p className="text-xs text-purple-200/70">
                        يمكنك الدفع عند تسجيل المغادرة أو في أي وقت من الاستقبال
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'pay-later' ? (
                        <>
                          <Calendar className="w-5 h-5 ml-2" />
                          تأكيد - دفع لاحقاً
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 ml-2" />
                          ادفع {amount.toLocaleString()} ريال
                        </>
                      )}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={onClose}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
