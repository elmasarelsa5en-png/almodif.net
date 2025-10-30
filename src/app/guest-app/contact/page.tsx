'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Phone, Mail, MessageSquare, Headphones, 
  Clock, MapPin, Send, Loader2, Check, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [messageData, setMessageData] = useState({
    name: '',
    phone: '',
    roomNumber: '',
    subject: '',
    message: '',
    priority: 'normal' as 'urgent' | 'normal' | 'low'
  });

  useEffect(() => {
    // جلب بيانات الضيف إن وجدت
    const session = localStorage.getItem('guest_session');
    if (session) {
      const data = JSON.parse(session);
      setMessageData(prev => ({
        ...prev,
        name: data.name || '',
        phone: data.phone || '',
        roomNumber: data.roomNumber || ''
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setMessageData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const contactRequest = {
        guestName: messageData.name,
        guestPhone: messageData.phone,
        roomNumber: messageData.roomNumber,
        subject: messageData.subject,
        message: messageData.message,
        priority: messageData.priority,
        status: 'pending',
        type: 'contact',
        source: 'guest-app',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'guest-requests'), contactRequest);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    { id: 'housekeeping', icon: '🧹', title: 'تنظيف الغرفة', message: 'أرجو تنظيف الغرفة الآن' },
    { id: 'towels', icon: '🧻', title: 'مناشف إضافية', message: 'أحتاج مناشف إضافية للغرفة' },
    { id: 'maintenance', icon: '🔧', title: 'صيانة', message: 'هناك مشكلة في الغرفة تحتاج صيانة' },
    { id: 'checkout', icon: '📦', title: 'تسجيل خروج', message: 'أرغب في تسجيل الخروج الآن' }
  ];

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
                  تم إرسال رسالتك! 📨
                </h2>
                <p className="text-blue-200 text-lg mb-8">
                  سيتواصل معك فريقنا في أقرب وقت ممكن
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/guest-app')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                  >
                    العودة للصفحة الرئيسية
                  </Button>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 py-6 text-lg"
                  >
                    إرسال رسالة أخرى
                  </Button>
                </div>
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
              <Headphones className="w-8 h-8" />
              التواصل مع الاستقبال
            </h1>
            <p className="text-blue-200">نحن هنا لخدمتك على مدار الساعة</p>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Methods */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">طرق التواصل</h3>
                <div className="space-y-4">
                  <a 
                    href="tel:+966123456789"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">هاتف الاستقبال</p>
                      <p className="text-white font-bold" dir="ltr">+966 12 345 6789</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:info@hotel.com"
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">البريد الإلكتروني</p>
                      <p className="text-white font-bold">info@hotel.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">ساعات العمل</p>
                      <p className="text-white font-bold">24/7 على مدار الساعة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Messages */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">رسائل سريعة</h3>
                <div className="space-y-2">
                  {quickMessages.map(msg => (
                    <Button
                      key={msg.id}
                      onClick={() => setMessageData(prev => ({ 
                        ...prev, 
                        subject: msg.title, 
                        message: msg.message 
                      }))}
                      className="w-full bg-white/5 hover:bg-white/10 text-white justify-start text-right h-auto py-3"
                      variant="ghost"
                    >
                      <span className="text-2xl mr-2">{msg.icon}</span>
                      <span>{msg.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <MessageSquare className="w-7 h-7" />
                  أرسل رسالة
                </h2>

                <div className="space-y-6">
                  {/* Priority Selector */}
                  <div>
                    <Label className="text-white mb-3 block">درجة الأهمية</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => handleInputChange('priority', 'urgent')}
                        className={`${
                          messageData.priority === 'urgent'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-white/5 hover:bg-white/10'
                        } text-white`}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        عاجل
                      </Button>
                      <Button
                        onClick={() => handleInputChange('priority', 'normal')}
                        className={`${
                          messageData.priority === 'normal'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-white/5 hover:bg-white/10'
                        } text-white`}
                      >
                        عادي
                      </Button>
                      <Button
                        onClick={() => handleInputChange('priority', 'low')}
                        className={`${
                          messageData.priority === 'low'
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-white/5 hover:bg-white/10'
                        } text-white`}
                      >
                        غير عاجل
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white mb-2">الاسم</Label>
                      <Input
                        value={messageData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="أدخل اسمك"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2">رقم الجوال</Label>
                      <Input
                        value={messageData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2">رقم الغرفة (اختياري)</Label>
                    <Input
                      value={messageData.roomNumber}
                      onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="مثال: 101"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">الموضوع</Label>
                    <Input
                      value={messageData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      placeholder="مثال: طلب خدمة الغرف"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">الرسالة</Label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 min-h-[150px]"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  {/* Info Note */}
                  <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
                    <div className="flex gap-3 text-blue-200 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>
                        سيتم الرد على رسالتك في أسرع وقت ممكن. للطلبات العاجلة، يرجى الاتصال مباشرة.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !messageData.name || !messageData.phone || !messageData.message}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
