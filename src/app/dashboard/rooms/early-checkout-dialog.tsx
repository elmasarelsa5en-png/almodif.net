'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Calendar, DollarSign, CreditCard, Banknote, Building2 } from 'lucide-react';

interface EarlyCheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checkoutDate: string, refundMethod: 'cash' | 'card' | 'transfer') => void;
  bookedDays: number;
  actualDays: number;
  contractCheckoutDate: string;
  todayDate: string;
  dailyRate: number;
}

export default function EarlyCheckoutDialog({
  isOpen,
  onClose,
  onConfirm,
  bookedDays,
  actualDays,
  contractCheckoutDate,
  todayDate,
  dailyRate
}: EarlyCheckoutDialogProps) {
  const [selectedDate, setSelectedDate] = useState<'today' | 'contract'>('contract');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

  // حساب المبلغ المسترد
  const unusedDays = bookedDays - actualDays;
  const refundAmount = unusedDays * dailyRate;

  const handleConfirm = () => {
    const checkoutDate = selectedDate === 'today' ? todayDate : contractCheckoutDate;
    if (selectedDate === 'today' && refundAmount > 0) {
      // إذا اختار الخروج اليوم وهناك مبلغ مسترد، نحتاج طريقة الدفع
      onConfirm(checkoutDate, refundMethod);
    } else {
      // إذا اختار تاريخ العقد أو لا يوجد مبلغ مسترد
      onConfirm(checkoutDate, 'cash');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-orange-900/50 to-red-900/50 text-white border-2 border-orange-500/40 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                تنبيه خروج مبكر
              </DialogTitle>
              <DialogDescription className="text-orange-200 text-sm mt-1">
                النزيل حاجز لمدة أطول من موعد الخروج المختار
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات الحجز */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              معلومات الحجز
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-300 mb-1">المدة المحجوزة</p>
                <p className="text-2xl font-bold text-white">{bookedDays} يوم</p>
              </div>
              <div>
                <p className="text-green-300 mb-1">الأيام الفعلية</p>
                <p className="text-2xl font-bold text-white">{actualDays} يوم</p>
              </div>
              <div>
                <p className="text-purple-300 mb-1">تاريخ الخروج بالعقد</p>
                <p className="text-lg font-bold text-white">
                  {new Date(contractCheckoutDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div>
                <p className="text-yellow-300 mb-1">تاريخ اليوم</p>
                <p className="text-lg font-bold text-white">
                  {new Date(todayDate).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>

          {/* حساب المبلغ المسترد */}
          {unusedDays > 0 && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-green-400/40">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                المبلغ المسترد للنزيل
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-green-300 text-sm mb-1">أيام غير مستخدمة</p>
                  <p className="text-3xl font-bold text-white">{unusedDays}</p>
                </div>
                <div>
                  <p className="text-green-300 text-sm mb-1">السعر اليومي</p>
                  <p className="text-2xl font-bold text-white">{dailyRate} ر.س</p>
                </div>
                <div className="bg-green-600/30 rounded-lg py-2">
                  <p className="text-green-200 text-sm mb-1">المبلغ المسترد</p>
                  <p className="text-3xl font-bold text-white">{refundAmount} ر.س</p>
                </div>
              </div>
            </div>
          )}

          {/* اختيار تاريخ الخروج */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-bold mb-3">اختر تاريخ الخروج</h3>
            <RadioGroup value={selectedDate} onValueChange={(value) => setSelectedDate(value as 'today' | 'contract')}>
              <div className="space-y-3">
                <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedDate === 'today' 
                    ? 'bg-blue-500/30 border-blue-400' 
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}>
                  <RadioGroupItem value="today" id="today" className="mt-1" />
                  <label htmlFor="today" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <p className="font-bold text-white">خروج اليوم</p>
                    </div>
                    <p className="text-sm text-blue-200">
                      سيتم إنهاء العقد بتاريخ اليوم وإنشاء سند صرف للمبلغ المسترد ({refundAmount} ر.س)
                    </p>
                  </label>
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedDate === 'contract' 
                    ? 'bg-purple-500/30 border-purple-400' 
                    : 'bg-white/5 border-white/20 hover:border-white/40'
                }`}>
                  <RadioGroupItem value="contract" id="contract" className="mt-1" />
                  <label htmlFor="contract" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <p className="font-bold text-white">خروج بتاريخ العقد</p>
                    </div>
                    <p className="text-sm text-purple-200">
                      سيتم إنهاء العقد بالتاريخ المحدد في العقد ({new Date(contractCheckoutDate).toLocaleDateString('ar-SA')})
                    </p>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* طريقة صرف المبلغ المسترد */}
          {selectedDate === 'today' && refundAmount > 0 && (
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-indigo-400/40 animate-in slide-in-from-top">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                طريقة صرف المبلغ
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRefundMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    refundMethod === 'cash'
                      ? 'bg-green-500/30 border-green-400 scale-105'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <Banknote className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="font-bold">نقدي (كاش)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    refundMethod === 'card'
                      ? 'bg-blue-500/30 border-blue-400 scale-105'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <p className="font-bold">شبكة (كارت)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod('transfer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    refundMethod === 'transfer'
                      ? 'bg-purple-500/30 border-purple-400 scale-105'
                      : 'bg-white/5 border-white/20 hover:border-white/40'
                  }`}
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="font-bold">تحويل بنكي</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 text-lg shadow-lg"
          >
            تأكيد الخروج
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-white/30 text-white hover:bg-white/10 py-3 text-lg"
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
