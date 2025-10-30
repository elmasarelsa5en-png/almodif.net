'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Star, MessageSquare, Send, CheckCircle, 
  AlertCircle, Loader2, ThumbsUp, ThumbsDown, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface GuestSession {
  id?: string;
  name: string;
  phone: string;
  nationalId: string;
  roomNumber: string;
  checkInDate: string;
}

export default function GuestReviewPage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewType, setReviewType] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }
    setGuestSession(JSON.parse(session));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('الرجاء اختيار تقييم');
      return;
    }

    if (!comment.trim()) {
      alert('الرجاء كتابة تعليق');
      return;
    }

    setLoading(true);

    try {
      // إضافة التقييم إلى Firebase
      await addDoc(collection(db, 'guest-reviews'), {
        guestName: guestSession?.name,
        guestPhone: guestSession?.phone,
        nationalId: guestSession?.nationalId,
        roomNumber: guestSession?.roomNumber,
        rating,
        reviewType,
        comment,
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, reviewed, responded
      });

      setSubmitted(true);

      // انتظر 3 ثواني ثم ارجع للصفحة الرئيسية
      setTimeout(() => {
        router.push('/guest-app');
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    // رابط التقييم على خرائط جوجل - غيّر الرابط حسب فندقك
    window.open('https://g.page/r/YOUR_GOOGLE_PLACE_ID/review', '_blank');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">شكراً لتقييمك!</h2>
          <p className="text-lg text-blue-200 mb-6">
            نقدر وقتك في مشاركة رأيك معنا
          </p>
          <p className="text-slate-300">جاري العودة للصفحة الرئيسية...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/guest-app')}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">تقييم الإقامة</h1>
              <p className="text-sm text-blue-200">شاركنا تجربتك</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white flex items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                كيف كانت تجربتك؟
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="text-center">
                  <Label className="text-white text-lg mb-4 block">تقييمك العام</Label>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-12 h-12 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-purple-200 text-sm"
                    >
                      {rating === 5 && '🌟 ممتاز!'}
                      {rating === 4 && '😊 جيد جداً'}
                      {rating === 3 && '😐 جيد'}
                      {rating === 2 && '😕 مقبول'}
                      {rating === 1 && '😞 يحتاج تحسين'}
                    </motion.p>
                  )}
                </div>

                {/* Review Type */}
                <div>
                  <Label className="text-white text-lg mb-3 block">نوع التعليق</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      onClick={() => setReviewType('positive')}
                      className={`h-auto py-4 ${
                        reviewType === 'positive'
                          ? 'bg-green-500 hover:bg-green-600 border-green-400'
                          : 'bg-white/10 hover:bg-white/20 border-white/20'
                      } border-2`}
                    >
                      <ThumbsUp className="w-6 h-6 ml-2" />
                      <div className="text-right">
                        <div className="font-bold">تعليق إيجابي</div>
                        <div className="text-xs opacity-80">شاركنا ما أعجبك</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setReviewType('negative')}
                      className={`h-auto py-4 ${
                        reviewType === 'negative'
                          ? 'bg-red-500 hover:bg-red-600 border-red-400'
                          : 'bg-white/10 hover:bg-white/20 border-white/20'
                      } border-2`}
                    >
                      <ThumbsDown className="w-6 h-6 ml-2" />
                      <div className="text-right">
                        <div className="font-bold">ملاحظة</div>
                        <div className="text-xs opacity-80">ساعدنا في التحسين</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <Label className="text-white text-lg mb-3 block">تعليقك</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      reviewType === 'positive'
                        ? 'أخبرنا عن الأشياء التي أعجبتك...'
                        : reviewType === 'negative'
                        ? 'أخبرنا كيف يمكننا التحسين...'
                        : 'شاركنا رأيك وتجربتك...'
                    }
                    rows={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      إرسال التقييم
                    </>
                  )}
                </Button>

                {/* Google Maps Review */}
                {rating >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          🌟 شكراً لتقييمك الإيجابي!
                        </p>
                        <p className="text-blue-200 text-sm mb-3">
                          هل يمكنك مشاركة تجربتك على خرائط جوجل؟ سيساعدنا ذلك كثيراً!
                        </p>
                        <Button
                          type="button"
                          onClick={openGoogleMaps}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          تقييم على جوجل ماب
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
