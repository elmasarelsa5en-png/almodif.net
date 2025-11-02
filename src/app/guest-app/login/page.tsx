'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Hotel, User, Phone, Calendar, CreditCard, Globe, 
  LogIn, Loader2, AlertCircle, CheckCircle, KeyRound, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

interface GuestData {
  name: string;
  phone: string;
  nationalId: string;
  nationalIdCopy?: string;
  dateOfBirth: string;
  nationality: string;
  roomNumber?: string; // ✅ Optional - يتم تحديده من قبل الإدارة
  password: string;
  checkInDate?: string;
  status: 'pending' | 'checked-in' | 'checked-out'; // ✅ إضافة حالة pending
}

export default function GuestLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'verify-otp' | 'forgot-password'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // ✅ OTP States
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [pendingGuestData, setPendingGuestData] = useState<GuestData | null>(null);

  // Login Form
  const [loginData, setLoginData] = useState({
    nationalId: '',
    password: '',
  });

  // Registration Form
  const [registerData, setRegisterData] = useState<GuestData>({
    name: '',
    phone: '',
    nationalId: '',
    nationalIdCopy: '',
    dateOfBirth: '',
    nationality: 'السعودية',
    password: '',
    status: 'pending', // ✅ بانتظار تخصيص غرفة من الإدارة
  });

  // التحقق من الجلسة الموجودة
  useEffect(() => {
    const session = localStorage.getItem('guest_session');
    if (session) {
      const guestData = JSON.parse(session);
      if (guestData.status === 'checked-in') {
        router.push('/guest-app');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // البحث عن النزيل في Firebase
      const guestsRef = collection(db, 'guests');
      const q = query(
        guestsRef,
        where('nationalId', '==', loginData.nationalId),
        where('password', '==', loginData.password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('رقم الهوية أو كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      const guestDoc = querySnapshot.docs[0];
      const guestData = { id: guestDoc.id, ...guestDoc.data() } as GuestData & { id: string };

      // ✅ التحقق من حالة الحساب
      if (guestData.status === 'checked-out') {
        setError('تم إنهاء إقامتك. للحجز مجدداً تواصل مع الاستقبال');
        setLoading(false);
        return;
      }

      // ✅ السماح بالدخول حتى لو الحساب pending (بدون غرفة)
      // if (guestData.status === 'pending') {
      //   setError('حسابك بانتظار تخصيص غرفة من قبل الإدارة. يرجى التواصل مع الاستقبال');
      //   setLoading(false);
      //   return;
      // }

      // ✅ جلب رقم الغرفة من قاعدة بيانات الغرف
      const roomsRef = collection(db, 'rooms');
      const roomQuery = query(roomsRef, where('guestNationalId', '==', loginData.nationalId));
      const roomSnapshot = await getDocs(roomQuery);

      if (!roomSnapshot.empty) {
        const roomData = roomSnapshot.docs[0].data();
        guestData.roomNumber = roomData.number || roomData.roomNumber;
      }

      // حفظ الجلسة (حتى لو بدون غرفة)
      localStorage.setItem('guest_session', JSON.stringify(guestData));
      
      // رسالة نجاح مختلفة حسب الحالة
      if (guestData.status === 'pending' || !guestData.roomNumber) {
        setSuccess('تم تسجيل الدخول! حسابك بانتظار تخصيص غرفة.');
      } else {
        setSuccess('تم تسجيل الدخول بنجاح!');
      }
      
      setTimeout(() => {
        router.push('/guest-app');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ التحقق من البيانات الأساسية
      if (!registerData.name || !registerData.phone || !registerData.nationalId || 
          !registerData.password || !registerData.dateOfBirth) {
        setError('الرجاء إدخال جميع البيانات المطلوبة');
        setLoading(false);
        return;
      }

      // التحقق من عدم وجود نزيل بنفس رقم الهوية
      const guestsRef = collection(db, 'guests');
      const existingQuery = query(
        guestsRef,
        where('nationalId', '==', registerData.nationalId)
      );
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        setError('يوجد حساب مسجل بنفس رقم الهوية. يمكنك تسجيل الدخول');
        setLoading(false);
        return;
      }

      // ✅ إنشاء الحساب مباشرة (بدون OTP مؤقتاً)
      const docRef = await addDoc(guestsRef, {
        name: registerData.name,
        phone: registerData.phone,
        nationalId: registerData.nationalId,
        nationalIdCopy: registerData.nationalIdCopy || '',
        dateOfBirth: registerData.dateOfBirth,
        nationality: registerData.nationality,
        password: registerData.password,
        status: 'pending', // بانتظار تخصيص غرفة من الإدارة
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 🔔 إرسال إشعار لموظف الاستقبال + إنشاء طلب تسجيل
      try {
        const { notificationService } = await import('@/lib/notifications/notification-service');
        
        // إنشاء طلب تسجيل جديد في قاعدة بيانات الطلبات
        await addDoc(collection(db, 'requests'), {
          type: 'تسجيل ضيف جديد',
          guestId: docRef.id,
          guestName: registerData.name,
          guestPhone: registerData.phone,
          guestNationalId: registerData.nationalId,
          guestDateOfBirth: registerData.dateOfBirth,
          guestNationality: registerData.nationality,
          description: `طلب تسجيل دخول جديد من ${registerData.name}\nرقم الهوية: ${registerData.nationalId}\nرقم الهاتف: ${registerData.phone}\nتاريخ الميلاد: ${registerData.dateOfBirth}\nالجنسية: ${registerData.nationality}`,
          status: 'pending',
          priority: 'high',
          roomNumber: null,
          assignedRoom: null,
          createdAt: new Date().toISOString(),
          source: 'guest-app-registration'
        });
        
        await notificationService.sendNotification('in_app', 'reception', {
          subject: 'طلب تسجيل جديد',
          body: `طلب تسجيل جديد من ${registerData.name}\nرقم الهوية: ${registerData.nationalId}\nرقم الهاتف: ${registerData.phone}`,
          type: 'custom',
          priority: 'high',
          metadata: {
            guestId: docRef.id,
            guestName: registerData.name,
            nationalId: registerData.nationalId,
            phone: registerData.phone,
            action: 'assign_room'
          }
        });
        
        // تشغيل صوت تنبيه
        if (typeof window !== 'undefined') {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(err => console.log('Could not play sound:', err));
        }
      } catch (notifError) {
        console.error('Error sending notification to reception:', notifError);
      }

      setSuccess('✅ تم إنشاء الحساب بنجاح! سيتم تخصيص غرفة لك من قبل الإدارة.');
      
      // العودة لصفحة تسجيل الدخول بعد 2 ثانية
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        // ملء بيانات تسجيل الدخول
        setLoginData({
          nationalId: registerData.nationalId,
          password: registerData.password
        });
      }, 2000);

    } catch (error: any) {
      console.error('Registration error:', error);
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ التحقق من OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // التحقق من صحة OTP
      if (otpCode !== generatedOtp) {
        setError('رمز التحقق غير صحيح');
        setLoading(false);
        return;
      }

      // التحقق من انتهاء الصلاحية
      if (otpExpiry && new Date() > otpExpiry) {
        setError('انتهت صلاحية رمز التحقق. يرجى المحاولة مرة أخرى');
        setLoading(false);
        return;
      }

      if (!pendingGuestData) {
        setError('خطأ في البيانات');
        setLoading(false);
        return;
      }

      // ✅ حفظ البيانات في Firebase
      const guestsRef = collection(db, 'guests');
      await addDoc(guestsRef, {
        ...pendingGuestData,
        status: 'pending',
        verified: true,
        createdAt: new Date().toISOString(),
      });

      setSuccess('✅ تم التحقق بنجاح! سيتم تخصيص غرفة لك من قبل الإدارة.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setOtpCode('');
        setPendingGuestData(null);
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setError('حدث خطأ أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  // ✅ نسيت كلمة المرور
  const [forgotPasswordData, setForgotPasswordData] = useState({
    name: '',
    nationalId: ''
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!forgotPasswordData.name || !forgotPasswordData.nationalId) {
        setError('الرجاء إدخال الاسم ورقم الهوية');
        setLoading(false);
        return;
      }

      // البحث عن الحساب
      const guestsRef = collection(db, 'guests');
      const q = query(
        guestsRef,
        where('nationalId', '==', forgotPasswordData.nationalId),
        where('name', '==', forgotPasswordData.name)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('لم يتم العثور على حساب بهذه البيانات');
        setLoading(false);
        return;
      }

      const guestDoc = querySnapshot.docs[0];
      const guestData = guestDoc.data();

      // إرسال كلمة المرور عبر WhatsApp
      const otpResponse = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: guestData.phone,
          code: guestData.password,
          type: 'password'
        })
      });

      const responseData = await otpResponse.json();

      if (!otpResponse.ok) {
        throw new Error(responseData.message || 'فشل إرسال كلمة المرور');
      }

      setSuccess('✅ تم إرسال كلمة المرور على الواتساب!');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setForgotPasswordData({ name: '', nationalId: '' });
      }, 3000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.message.includes('fetch')) {
        setError('❌ خدمة الواتساب غير متاحة. تأكد من تشغيل start-whatsapp-service.bat');
      } else {
        setError(error.message || 'حدث خطأ أثناء إرسال كلمة المرور');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end p-4 md:p-8 relative overflow-hidden" dir="rtl">
      {/* Background Hotel Image - More Visible */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/images/hotel-exterior.jpg"
          alt="Hotel Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            console.log('Image failed to load');
          }}
          onLoad={() => {
            console.log('Image loaded successfully');
          }}
        />
        {/* Darker overlay on left, lighter on right for better readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900/40 via-slate-900/60 to-slate-900/80"></div>
      </div>

      {/* Login Form Container - Right Side with Glass Effect */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 mr-0 md:mr-8"
      >
        {/* Logo with Icon and Text */}
        <div className="text-center mb-6">
          {/* Seven-Son Hotel Logo */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex flex-col items-center justify-center mb-4"
          >
            {/* Logo Container with Glow Effect */}
            <div className="relative mb-3">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/40 via-orange-500/30 to-red-500/20 rounded-[32px] blur-2xl"></div>
              
              {/* Seven-Son Logo - Larger to fill container */}
              <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-[28px] overflow-hidden shadow-2xl border border-amber-500/20 w-32 h-32">
                <img 
                  src="/images/seven-son-logo.jpeg"
                  alt="Seven-Son Hotel"
                  className="w-full h-full object-cover scale-125"
                  onLoad={() => {
                    console.log('✅ Seven-Son logo loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('❌ Failed to load Seven-Son logo from /images/seven-son-logo.jpeg');
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    // Fallback to icon if image fails
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600"><svg class="w-20 h-20 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
                      console.log('⚠️ Showing fallback hotel icon');
                    }
                  }}
                />
              </div>
            </div>
            
            {/* App Name Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-sm px-5 py-2 rounded-full shadow-lg"
            >
              <p className="text-slate-900 text-base font-bold tracking-wide">تطبيق الضيف</p>
            </motion.div>
          </motion.div>

          {/* Hotel Name */}
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
          >
            فندق سيفن سون
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-xl text-amber-400 mb-2 drop-shadow-lg font-semibold"
          >
            Seven-Son Hotel
          </motion.h2>
        </div>

        {/* Glass Card with Backdrop Blur */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-amber-500/20 transition-shadow duration-300">
          <CardHeader>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setMode('login')}
                className={`flex-1 ${mode === 'login' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
              >
                تسجيل دخول
              </Button>
              <Button
                onClick={() => setMode('register')}
                className={`flex-1 ${mode === 'register' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
              >
                تسجيل جديد
              </Button>
            </div>
            <CardTitle className="text-2xl text-center text-amber-100">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300"
              >
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-300"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </motion.div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block font-medium">رقم الهوية الوطنية</Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={loginData.nationalId}
                      onChange={(e) => setLoginData({ ...loginData, nationalId: e.target.value })}
                      placeholder="1234567890"
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">كلمة المرور</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg shadow-lg shadow-amber-500/30 border border-amber-400/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      دخول
                    </>
                  )}
                </Button>

                {/* ✅ زر نسيت كلمة المرور */}
                <Button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  variant="ghost"
                  className="w-full text-amber-300 hover:text-amber-200 hover:bg-slate-700/50"
                >
                  نسيت كلمة المرور؟
                </Button>
              </form>
            ) : mode === 'verify-otp' ? (
              // ✅ نموذج التحقق من OTP
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-amber-200 text-lg mb-2">تم إرسال رمز التحقق</p>
                  <p className="text-slate-300 text-sm">
                    أدخل الرمز المكون من 6 أرقام المرسل على الواتساب
                  </p>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">رمز التحقق</Label>
                  <Input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      تأكيد
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setOtpCode('');
                    setError('');
                  }}
                  variant="ghost"
                  className="w-full text-amber-300"
                >
                  العودة للتسجيل
                </Button>
              </form>
            ) : mode === 'forgot-password' ? (
              // ✅ نموذج نسيت كلمة المرور
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-amber-200 text-lg mb-2">استعادة كلمة المرور</p>
                  <p className="text-slate-300 text-sm">
                    أدخل اسمك ورقم الهوية لاستلام كلمة المرور على الواتساب
                  </p>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={forgotPasswordData.name}
                      onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, name: e.target.value })}
                      placeholder="أحمد محمد"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">رقم الهوية الوطنية</Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={forgotPasswordData.nationalId}
                      onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, nationalId: e.target.value })}
                      placeholder="1234567890"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2" />
                      إرسال كلمة المرور
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotPasswordData({ name: '', nationalId: '' });
                    setError('');
                  }}
                  variant="ghost"
                  className="w-full text-amber-300"
                >
                  العودة لتسجيل الدخول
                </Button>
              </form>
            ) : (
              // نموذج التسجيل (كما هو)
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block font-medium">الاسم الكامل *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="أحمد محمد"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">رقم الجوال *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">رقم الهوية الوطنية *</Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.nationalId}
                      onChange={(e) => setRegisterData({ ...registerData, nationalId: e.target.value })}
                      placeholder="1234567890"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">تاريخ الميلاد *</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="date"
                      value={registerData.dateOfBirth}
                      onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">الجنسية *</Label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.nationality}
                      onChange={(e) => setRegisterData({ ...registerData, nationality: e.target.value })}
                      placeholder="السعودية"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block font-medium">كلمة المرور *</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10 bg-white/10 border-white/20 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/50 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
                  <p className="font-semibold mb-1">📌 ملاحظة مهمة:</p>
                  <p>بعد التسجيل، سيتم تخصيص غرفة لك من قبل الإدارة. يرجى التواصل مع الاستقبال لإكمال إجراءات الحجز.</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      إنشاء حساب
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-sm mt-6">
          للمساعدة، تواصل مع الاستقبال
        </p>

        {/* زر الدخول السريع للمنيو */}
        <div className="mt-4">
          <Button
            onClick={() => router.push('/guest-app/menu/coffee-shop')}
            variant="outline"
            className="w-full bg-slate-800/50 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/50 py-6"
          >
            <UtensilsCrossed className="w-5 h-5 ml-2" />
            تصفح المنيو بدون تسجيل دخول
          </Button>
          <p className="text-center text-slate-500 text-xs mt-2">
            للطلب يجب تسجيل الدخول أولاً
          </p>
        </div>
      </motion.div>
    </div>
  );
}

