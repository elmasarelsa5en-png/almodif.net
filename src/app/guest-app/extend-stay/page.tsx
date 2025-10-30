'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Loader2, Check, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ExtendStayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guestData, setGuestData] = useState<any>(null);
  const [extendData, setExtendData] = useState({
    currentCheckOut: '',
    newCheckOut: '',
    additionalNights: 0,
    reason: ''
  });

  useEffect(() => {
    // جلب بيانات الضيف
    const session = localStorage.getItem('guest_session');
    if (session) {
      const data = JSON.parse(session);
      setGuestData(data);
      
      // إذا كان هناك حجز نشط، جلب تاريخ الخروج الحالي
      if (data.bookingId) {
        loadBookingDetails(data.bookingId);
      }
    }
  }, []);

  const loadBookingDetails = async (bookingId: string) => {
    // TODO: جلب تفاصيل الحجز من Firebase
  };

  const calculateAdditionalNights = () => {
    if (!extendData.currentCheckOut || !extendData.newCheckOut) return 0;
    const current = new Date(extendData.currentCheckOut);
    const newDate = new Date(extendData.newCheckOut);
    const diff = newDate.getTime() - current.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const extensionRequest = {
        guestName: guestData?.name || '',
        guestPhone: guestData?.phone || '',
        roomNumber: guestData?.roomNumber || '',
        bookingId: guestData?.bookingId || '',
        currentCheckOut: Timestamp.fromDate(new Date(extendData.currentCheckOut)),
        newCheckOut: Timestamp.fromDate(new Date(extendData.newCheckOut)),
        additionalNights: calculateAdditionalNights(),
        reason: extendData.reason,
        status: 'pending',
        type: 'extend-stay',
        source: 'guest-app',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'guest-requests'), extensionRequest);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting extension:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
        <AnimatedBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mt-20"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  تم إرسال الطلب بنجاح! ✨
                </h2>
                <p className="text-blue-200 text-lg mb-8">
                  سيتم مراجعة طلب تمديد الإقامة والتواصل معك قريباً
                </p>

                <Button
                  onClick={() => router.push('/guest-app')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                >
                  العودة للصفحة الرئيسية
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              تمديد الإقامة
            </h1>
            <p className="text-blue-200">مدد إقامتك بسهولة</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Info Alert */}
          <Card className="bg-blue-500/20 backdrop-blur-xl border-blue-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <div className="text-blue-200">
                  <h3 className="font-bold mb-2">معلومات هامة:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• سيتم مراجعة طلبك خلال 24 ساعة</li>
                    <li>• الأسعار تخضع للتوافر والموسم</li>
                    <li>• يمكنك التواصل مع الاستقبال للاستفسارات</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">معلومات التمديد</h2>

              <div className="space-y-6">
                {/* Current Guest Info */}
                {guestData && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">معلوماتك</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-blue-200">
                      <div>الاسم: <span className="text-white font-bold">{guestData.name}</span></div>
                      <div>رقم الغرفة: <span className="text-white font-bold">{guestData.roomNumber}</span></div>
                      {guestData.phone && (
                        <div>الجوال: <span className="text-white font-bold">{guestData.phone}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Checkout Date */}
                <div>
                  <Label className="text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ الخروج الحالي
                  </Label>
                  <Input
                    type="date"
                    value={extendData.currentCheckOut}
                    onChange={(e) => setExtendData(prev => ({ ...prev, currentCheckOut: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    dir="ltr"
                  />
                </div>

                {/* New Checkout Date */}
                <div>
                  <Label className="text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ الخروج الجديد
                  </Label>
                  <Input
                    type="date"
                    value={extendData.newCheckOut}
                    onChange={(e) => setExtendData(prev => ({ ...prev, newCheckOut: e.target.value }))}
                    min={extendData.currentCheckOut}
                    className="bg-white/10 border-white/20 text-white"
                    dir="ltr"
                  />
                </div>

                {/* Additional Nights Display */}
                {extendData.currentCheckOut && extendData.newCheckOut && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-purple-300" />
                        <div>
                          <p className="text-blue-200 text-sm">عدد الليالي الإضافية</p>
                          <p className="text-3xl font-bold text-white">{calculateAdditionalNights()}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-blue-200 text-sm">مدة التمديد</p>
                        <p className="text-xl font-bold text-white">{calculateAdditionalNights()} ليلة</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Reason */}
                <div>
                  <Label className="text-white mb-2">سبب التمديد (اختياري)</Label>
                  <textarea
                    value={extendData.reason}
                    onChange={(e) => setExtendData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 min-h-[120px]"
                    placeholder="مثال: رحلة عمل ممتدة، سياحة، ظروف طارئة..."
                  />
                </div>

                {/* Warning Note */}
                <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4">
                  <div className="flex gap-3 text-amber-200 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>
                      يرجى العلم أن التمديد يخضع للتوافر. سيتم التواصل معك لتأكيد الطلب والسعر النهائي.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !extendData.currentCheckOut || !extendData.newCheckOut || calculateAdditionalNights() <= 0}
                className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    إرسال طلب التمديد
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
