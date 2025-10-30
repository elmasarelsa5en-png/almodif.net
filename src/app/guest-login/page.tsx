'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { User, Phone, Home, CheckCircle2, AlertCircle, Hotel, Sparkles } from 'lucide-react';

export default function GuestLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '' // فقط الاسم ورقم الغرفة
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotelLogo, setHotelLogo] = useState('');
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // جلب شعار الفندق من الإعدادات
    const menuSettings = localStorage.getItem('guest_menu_settings');
    if (menuSettings) {
      const settings = JSON.parse(menuSettings);
      if (settings.logoUrl) {
        setHotelLogo(settings.logoUrl);
      }
    }
    
    // تأخير ظهور المحتوى بعد الشعار
    setTimeout(() => setShowContent(true), 800);
  }, []);

  // دخول مباشر كضيف بدون تحقق
  const handleGuestLogin = () => {
    const guestData = {
      name: 'ضيف',
      phone: '',
      roomNumber: 'معاينة',
      loginTime: new Date().toISOString(),
      isGuest: true // علامة لمعرفة أنه ضيف
    };

    localStorage.setItem('guest_session', JSON.stringify(guestData));
    router.push('/guest-menu-unified');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.roomNumber) {
      setError('الرجاء إدخال الاسم ورقم الغرفة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // البحث عن الحجز في الغرف المشغولة من Firebase
      const { getRoomsFromFirebase } = await import('@/lib/firebase-sync');
      const rooms = await getRoomsFromFirebase();
      
      console.log('Searching for:', { name: formData.name, room: formData.roomNumber });
      console.log('Available rooms:', rooms.map((r: any) => ({ 
        number: r.number, 
        name: r.guestName, 
        status: r.status 
      })));
      
      // البحث بالاسم ورقم الغرفة - مع تحويل الأرقام للنص
      const matchedRoom = rooms.find((room: any) => {
        const isOccupied = room.status === 'Occupied' || room.status === 'Reserved';
        const nameMatch = room.guestName && 
          room.guestName.trim().toLowerCase().includes(formData.name.trim().toLowerCase());
        // تحويل كلا الرقمين للنص للمقارنة
        const roomMatch = String(room.number).trim() === String(formData.roomNumber).trim();
        
        console.log('Checking room:', { 
          roomNum: room.number, 
          guestName: room.guestName, 
          status: room.status,
          isOccupied,
          nameMatch,
          roomMatch 
        });
        
        return isOccupied && nameMatch && roomMatch;
      });

      if (!matchedRoom) {
        // محاولة البحث بالاسم فقط إذا لم يتم إيجاد تطابق
        const roomByName = rooms.find((room: any) => {
          const isOccupied = room.status === 'Occupied' || room.status === 'Reserved';
          const nameMatch = room.guestName && 
            room.guestName.trim().toLowerCase().includes(formData.name.trim().toLowerCase());
          return isOccupied && nameMatch;
        });

        if (roomByName) {
          setError(`وجدنا حجز باسم "${formData.name}" في غرفة ${roomByName.number}. يرجى التأكد من رقم الغرفة.`);
          setLoading(false);
          return;
        }

        // لم يتم العثور على حجز
        setError('عذراً، لم يتم العثور على حجز بهذا الاسم ورقم الغرفة. يرجى التواصل مع الاستقبال.');
        setLoading(false);
        return;
      }

      console.log('Found match:', matchedRoom);

      // تم العثور على الحجز - حفظ بيانات النزيل
      const guestData = {
        name: formData.name,
        phone: matchedRoom.guestPhone || '',
        roomNumber: matchedRoom.number,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('guest_session', JSON.stringify(guestData));

      // التوجه لصفحة المنيو الموحدة
      setTimeout(() => {
        router.push('/guest-menu-unified');
      }, 800);

    } catch (error) {
      console.error('Error during login:', error);
      setError('حدث خطأ أثناء التحقق من البيانات. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* خلفية متحركة */}
      <AnimatedBackground />

      {/* المحتوى */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className={`w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl transition-all duration-1000 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <CardHeader className="text-center pb-6">
            {/* شعار الفندق مع حركات احترافية */}
            {hotelLogo ? (
              <div className="mx-auto mb-6 relative">
                {/* دوائر متحركة خلف الشعار */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 animate-ping absolute"></div>
                  <div className="w-36 h-36 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 animate-pulse absolute"></div>
                </div>
                
                {/* الشعار مع حركة */}
                <div className={`relative transition-all duration-1000 ${
                  isLogoLoaded 
                    ? 'opacity-100 scale-100 rotate-0' 
                    : 'opacity-0 scale-50 -rotate-180'
                }`}>
                  <div className="relative group">
                    {/* تأثير التوهج */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-pulse transition-opacity"></div>
                    
                    {/* الشعار */}
                    <img 
                      src={hotelLogo} 
                      alt="شعار الفندق" 
                      className="relative h-32 w-auto mx-auto object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                      onLoad={() => setIsLogoLoaded(true)}
                    />
                    
                    {/* نجوم متلألئة حول الشعار */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0s' }} />
                    <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <Sparkles className="absolute -bottom-2 -right-2 w-5 h-5 text-purple-300 animate-pulse" style={{ animationDelay: '1s' }} />
                    <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-300 animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto mb-6 relative">
                {/* دوائر متحركة */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-600/30 animate-ping absolute"></div>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 animate-pulse absolute"></div>
                </div>
                
                {/* أيقونة افتراضية مع حركة */}
                <div className={`relative transition-all duration-1000 ${
                  showContent 
                    ? 'opacity-100 scale-100 rotate-0' 
                    : 'opacity-0 scale-50 rotate-180'
                }`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <Hotel className="h-12 w-12 text-white animate-pulse" />
                    </div>
                    
                    {/* نجوم متلألئة */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-bounce" />
                    <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-blue-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Sparkles className="absolute -bottom-2 -right-2 w-5 h-5 text-purple-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-300 animate-bounce" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* العنوان مع حركة */}
            <div className={`transition-all duration-1000 delay-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  المنيو الإلكتروني
                </CardTitle>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-blue-100 text-base font-semibold">أهلاً وسهلاً بك في فندق سيفن سون</p>
              <p className="text-blue-200/80 text-sm mt-2">يرجى إدخال بياناتك للوصول إلى خدمات الفندق</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-1000 delay-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {/* رسالة خطأ */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* الاسم */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white flex items-center gap-2 text-base font-medium">
                  <User className="h-5 w-5" />
                  الاسم الكامل
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك كما هو مسجل في الحجز"
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400 backdrop-blur-sm h-12 text-base"
                  required
                  disabled={loading}
                />
              </div>

              {/* رقم الغرفة */}
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-white flex items-center gap-2 text-base font-medium">
                  <Home className="h-5 w-5" />
                  رقم الغرفة
                </Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="مثال: 101"
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:ring-blue-400 backdrop-blur-sm h-12 text-base"
                  required
                  disabled={loading}
                />
              </div>

              {/* معلومات إضافية */}
              <div className="bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-100 text-sm space-y-1.5">
                    <p className="font-semibold text-white">ملاحظة هامة:</p>
                    <p>• أدخل اسمك كما هو مسجل في الحجز</p>
                    <p>• أدخل رقم الغرفة الخاصة بك</p>
                    <p>• سيتم التحقق تلقائياً من بياناتك</p>
                  </div>
                </div>
              </div>

              {/* زر الدخول */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                {/* تأثير الوميض */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                {loading ? (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق من البيانات...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <CheckCircle2 className="h-6 w-6 animate-pulse" />
                    تحقق ودخول
                  </div>
                )}
              </Button>

              {/* فاصل "أو" */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/80 font-medium">أو</span>
                </div>
              </div>

              {/* زر الدخول المباشر كضيف */}
              <Button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                {/* تأثير الوميض */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  دخول مباشر للمنيو
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
              </Button>
            </form>

            <div className={`mt-6 text-center transition-all duration-1000 delay-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  طريقتان للدخول
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </p>
                <div className="text-blue-200/80 text-xs space-y-1">
                  <p>✅ <span className="font-medium">دخول مباشر:</span> شاهد المنيو مباشرة بدون تسجيل</p>
                  <p>🔐 <span className="font-medium">تحقق ودخول:</span> إذا كان لديك حجز في الفندق</p>
                </div>
              </div>
              
              <p className="text-blue-200/80 text-sm mt-4 mb-2">
                إذا كانت لديك مشكلة في تسجيل الدخول
              </p>
              <p className="text-blue-100 text-sm font-medium">
                يرجى التواصل مع الاستقبال
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
