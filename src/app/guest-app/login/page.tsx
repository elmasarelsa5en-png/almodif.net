'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Hotel, User, Phone, Calendar, CreditCard, Globe, 
  LogIn, Loader2, AlertCircle, CheckCircle, KeyRound
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
  roomNumber: string;
  password: string;
  checkInDate: string;
  status: 'checked-in' | 'checked-out';
}

export default function GuestLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    roomNumber: '',
    password: '',
    checkInDate: new Date().toISOString().split('T')[0],
    status: 'checked-in',
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
        where('password', '==', loginData.password),
        where('status', '==', 'checked-in')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('رقم الهوية أو كلمة المرور غير صحيحة، أو لا يوجد حجز نشط');
        setLoading(false);
        return;
      }

      const guestDoc = querySnapshot.docs[0];
      const guestData = { id: guestDoc.id, ...guestDoc.data() } as GuestData & { id: string };

      // حفظ الجلسة
      localStorage.setItem('guest_session', JSON.stringify(guestData));
      
      setSuccess('تم تسجيل الدخول بنجاح!');
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
      // التحقق من البيانات
      if (!registerData.name || !registerData.phone || !registerData.nationalId || 
          !registerData.roomNumber || !registerData.password) {
        setError('الرجاء إدخال جميع البيانات المطلوبة');
        setLoading(false);
        return;
      }

      // التحقق من عدم وجود نزيل بنفس رقم الهوية
      const guestsRef = collection(db, 'guests');
      const existingQuery = query(
        guestsRef,
        where('nationalId', '==', registerData.nationalId),
        where('status', '==', 'checked-in')
      );
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        setError('يوجد حجز نشط بنفس رقم الهوية');
        setLoading(false);
        return;
      }

      // إضافة النزيل إلى Firebase
      const newGuest = await addDoc(guestsRef, {
        ...registerData,
        createdAt: new Date().toISOString(),
      });

      // تحديث الغرفة في rooms collection
      const roomsRef = collection(db, 'rooms');
      const roomQuery = query(roomsRef, where('roomNumber', '==', registerData.roomNumber));
      const roomSnapshot = await getDocs(roomQuery);

      if (!roomSnapshot.empty) {
        const roomDoc = roomSnapshot.docs[0];
        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          status: 'occupied',
          guestName: registerData.name,
          guestPhone: registerData.phone,
          guestNationality: registerData.nationalId,
          checkInDate: registerData.checkInDate,
        });
      }

      // حفظ الجلسة
      const guestData = { id: newGuest.id, ...registerData };
      localStorage.setItem('guest_session', JSON.stringify(guestData));

      setSuccess('تم التسجيل بنجاح! جاري التحويل...');
      setTimeout(() => {
        router.push('/guest-app');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError('حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-2xl mb-4">
            <Hotel className="w-12 h-12 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">تطبيق النزلاء</h1>
          <p className="text-slate-300">مرحباً بك في فندق المضيف</p>
        </div>

        <Card className="bg-slate-800/90 backdrop-blur-xl border-amber-500/30 shadow-2xl">
          <CardHeader>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setMode('login')}
                className={`flex-1 ${mode === 'login' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                تسجيل دخول
              </Button>
              <Button
                onClick={() => setMode('register')}
                className={`flex-1 ${mode === 'register' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'}`}
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
                  <Label className="text-amber-100 mb-2 block">رقم الهوية الوطنية</Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={loginData.nationalId}
                      onChange={(e) => setLoginData({ ...loginData, nationalId: e.target.value })}
                      placeholder="1234567890"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">كلمة المرور</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg"
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
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className="text-amber-100 mb-2 block">الاسم الكامل *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      placeholder="أحمد محمد"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">رقم الجوال *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">رقم الهوية الوطنية *</Label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.nationalId}
                      onChange={(e) => setRegisterData({ ...registerData, nationalId: e.target.value })}
                      placeholder="1234567890"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">تاريخ الميلاد *</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="date"
                      value={registerData.dateOfBirth}
                      onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">الجنسية *</Label>
                  <div className="relative">
                    <Globe className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.nationality}
                      onChange={(e) => setRegisterData({ ...registerData, nationality: e.target.value })}
                      placeholder="السعودية"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">رقم الغرفة/الشقة *</Label>
                  <div className="relative">
                    <Hotel className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={registerData.roomNumber}
                      onChange={(e) => setRegisterData({ ...registerData, roomNumber: e.target.value })}
                      placeholder="208"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-amber-100 mb-2 block">كلمة المرور *</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10 bg-slate-700/50 border-slate-600 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
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
      </motion.div>
    </div>
  );
}
