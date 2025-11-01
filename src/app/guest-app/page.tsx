'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Hotel, Home, Utensils, Coffee, Shirt, Bell, Calendar, 
  Phone, Star, MapPin, Wifi, Car, Sparkles, QrCode,
  Download, Globe, Smartphone, User, LogOut, CreditCard, MessageSquare, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GuestRoomAlert } from '@/components/GuestRoomAlert';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface GuestSession {
  id?: string;
  name: string;
  phone: string;
  nationalId: string;
  roomNumber: string;
  checkInDate: string;
  status: 'checked-in' | 'checked-out';
  photo?: string;
  email?: string;
}

interface HotelSettings {
  hotelName: string;
  hotelNameEn?: string;
  logo?: string;
  logoUrl?: string;
  description?: string;
  phone?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  rating?: number;
  amenities?: string[];
  welcomeMessage?: string;
  welcomeMessageEn?: string;
  enableBooking?: boolean;
  enableRequests?: boolean;
  enableQRMenu?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function GuestAppHomePage() {
  const router = useRouter();
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>({
    hotelName: 'فندق المضيف',
    hotelNameEn: 'Al Modif Hotel',
    rating: 5,
    welcomeMessage: 'مرحباً بك في فندق المضيف',
    enableBooking: true,
    enableRequests: true,
    enableQRMenu: true,
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6'
  });
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // التحقق من تسجيل دخول النزيل
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }

    const guestData: GuestSession = JSON.parse(session);
    
    // التحقق من حالة الحجز
    if (guestData.status === 'checked-out') {
      alert('تم تسجيل خروجك من الفندق. نتمنى أن تكون قد استمتعت بإقامتك!');
      localStorage.removeItem('guest_session');
      router.push('/guest-app/login');
      return;
    }

    setGuestSession(guestData);
    
    // جلب إعدادات الفندق من Firebase
    const loadSettings = async () => {
      if (!db) {
        console.warn('⚠️ Firebase غير متصل - استخدام الإعدادات الافتراضية');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'settings', 'guest-app');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setHotelSettings(prev => ({
            ...prev,
            ...data,
            logo: data.logoUrl || data.logo,
            phone: data.contactPhone || data.phone
          }));
          console.log('✅ تم تحميل إعدادات تطبيق النزيل من Firebase');
        } else {
          console.log('⚠️ لم يتم العثور على إعدادات - استخدام الإعدادات الافتراضية');
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // التحقق من نوع الجهاز
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setShowDownloadPrompt(true);
      }
    }
  }, []);

  const services = [
    {
      id: 'booking',
      title: 'حجز غرفة / شقة',
      titleEn: 'Room Booking',
      icon: Home,
      color: 'from-amber-500 to-amber-600',
      description: 'احجز غرفتك أو شقتك بسهولة',
      route: '/guest-app/booking',
      enabled: hotelSettings.enableBooking !== false
    },
    {
      id: 'restaurant',
      title: 'طلب من المطعم',
      titleEn: 'Restaurant Order',
      icon: Utensils,
      color: 'from-amber-600 to-orange-600',
      description: 'تصفح قائمة الطعام واطلب',
      route: '/guest-app/restaurant',
      enabled: hotelSettings.enableQRMenu !== false
    },
    {
      id: 'coffee',
      title: 'الكوفي شوب',
      titleEn: 'Coffee Shop',
      icon: Coffee,
      color: 'from-yellow-600 to-amber-700',
      description: 'قهوة طازجة ومشروبات',
      route: '/guest-app/coffee-shop',
      enabled: hotelSettings.enableQRMenu !== false
    },
    {
      id: 'laundry',
      title: 'خدمة المغسلة',
      titleEn: 'Laundry Service',
      icon: Shirt,
      color: 'from-slate-600 to-slate-700',
      description: 'غسيل وكي الملابس',
      route: '/guest-app/laundry',
      enabled: hotelSettings.enableRequests !== false
    },
    {
      id: 'room-service',
      title: 'خدمة الغرف',
      titleEn: 'Room Service',
      icon: Bell,
      color: 'from-amber-700 to-orange-700',
      description: 'اطلب أي شيء لغرفتك',
      route: '/guest-app/room-service',
      enabled: hotelSettings.enableRequests !== false
    },
    {
      id: 'extend',
      title: 'تمديد الإقامة',
      titleEn: 'Extend Stay',
      icon: Calendar,
      color: 'from-slate-700 to-slate-800',
      description: 'مدد إقامتك بسهولة',
      route: '/guest-app/extend-stay',
      enabled: hotelSettings.enableRequests !== false
    },
    {
      id: 'contact',
      title: 'التواصل معنا',
      titleEn: 'Contact Us',
      icon: Phone,
      color: 'from-amber-600 to-amber-700',
      description: 'تواصل مع الاستقبال',
      route: '/guest-app/contact',
      enabled: true // دائماً متاح
    },
    {
      id: 'review',
      title: 'تقييم الإقامة',
      titleEn: 'Rate Your Stay',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-600',
      description: 'شاركنا رأيك وتجربتك',
      route: '/guest-app/review',
      enabled: true // دائماً متاح
    }
  ];

  // فلتر الخدمات المفعلة فقط
  const enabledServices = services.filter(service => service.enabled);

  const handleServiceClick = (service: typeof services[0]) => {
    // حفظ جلسة ضيف - البيانات موجودة من تسجيل الدخول
    router.push(service.route);
  };

  const generateQRCode = () => {
    const url = window.location.origin + '/guest-app';
    router.push(`/guest-app/qr-code?url=${encodeURIComponent(url)}`);
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج من التطبيق؟')) {
      localStorage.removeItem('guest_session');
      router.push('/guest-app/login');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" dir="rtl">
      {/* طبقة الخلفية المتحركة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* جزيئات ذهبية متحركة */}
        {isMounted && [...Array(20)].map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const endX = Math.random() * 100;
          const endY = Math.random() * 100;
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
              initial={{
                x: `${startX}vw`,
                y: `${startY}vh`,
              }}
              animate={{
                x: `${endX}vw`,
                y: `${endY}vh`,
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}
        
        {/* موجات ذهبية متحركة */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 179, 69, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(217, 179, 69, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 40% 20%, rgba(217, 179, 69, 0.05) 0%, transparent 50%)`,
            backgroundSize: '400% 400%',
          }}
        />
      </div>

      {/* خلفية بنمط الطوب - مستوحاة من الصورة */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 35px,
          rgba(212, 175, 55, 0.3) 35px,
          rgba(212, 175, 55, 0.3) 37px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 70px,
          rgba(212, 175, 55, 0.3) 70px,
          rgba(212, 175, 55, 0.3) 72px
        )`
      }}></div>
      
      {/* تأثير الإضاءة المحيطة */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
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
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Professional Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-2xl border-b-2 border-amber-500/40 shadow-2xl"
      >
        {/* Animated top border */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="container mx-auto px-4 py-3">
          {/* Top Bar - Logo & Actions */}
          <div className="flex items-center justify-between mb-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              {hotelSettings.logo ? (
                <motion.img
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  src={hotelSettings.logo} 
                  alt={hotelSettings.hotelName}
                  className="h-12 w-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-2xl border-2 border-amber-300/50"
                >
                  <Hotel className="w-7 h-7 text-slate-900" />
                </motion.div>
              )}
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 flex items-center gap-2"
                >
                  {hotelSettings.hotelName}
                </motion.h1>
                {hotelSettings.rating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-1"
                  >
                    {[...Array(hotelSettings.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    const currentLang = localStorage.getItem('guest_language') || 'ar';
                    const newLang = currentLang === 'ar' ? 'en' : 'ar';
                    localStorage.setItem('guest_language', newLang);
                    alert(`Language changed to ${newLang === 'ar' ? 'العربية' : 'English'}`);
                    window.location.reload();
                  }}
                  size="sm"
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-50 backdrop-blur-sm border border-amber-400/40 shadow-lg"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={generateQRCode}
                  size="sm"
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-50 backdrop-blur-sm border border-amber-400/40 shadow-lg"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleLogout}
                  size="sm"
                  variant="ghost"
                  className="text-red-200 hover:text-red-100 hover:bg-red-500/20 border border-red-400/30 shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Guest Profile Card */}
          {guestSession && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-purple-500/10 backdrop-blur-xl border border-amber-400/30 p-4 shadow-xl"
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                {/* Guest Avatar & Info */}
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <motion.div
                    className="relative cursor-pointer group"
                    onClick={() => router.push('/guest-app/profile')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-amber-500 to-purple-500 rounded-full blur-md opacity-75"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
                      {guestSession.photo ? (
                        <img 
                          src={guestSession.photo} 
                          alt={guestSession.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                      {/* Edit indicator on hover */}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">تعديل</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Guest Details */}
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white"
                    >
                      {guestSession.name}
                    </motion.h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 rounded-full border border-amber-400/30"
                      >
                        <Hotel className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-sm text-amber-100 font-medium">غرفة {guestSession.roomNumber}</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 rounded-full border border-purple-400/30"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-purple-300" />
                        <span className="text-xs text-purple-200 font-medium">{guestSession.nationalId}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => router.push('/guest-app/my-bookings')}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white backdrop-blur-sm border border-amber-400/50 shadow-lg font-semibold"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      حجوزاتي
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => router.push('/guest-app/my-orders')}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white backdrop-blur-sm border border-purple-400/50 shadow-lg font-semibold"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      طلباتي
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => router.push('/guest-app/profile')}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white backdrop-blur-sm border border-emerald-400/50 shadow-lg font-semibold"
                    >
                      <User className="w-4 h-4 mr-2" />
                      الملف الشخصي
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Download Prompt */}
      {showDownloadPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="relative z-10 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white py-3 px-4 text-center shadow-lg"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex items-center justify-center gap-4 flex-wrap relative z-10">
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Smartphone className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">احصل على تجربة أفضل مع التطبيق!</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm"
                className="bg-white text-amber-600 hover:bg-white/90 shadow-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                تحميل التطبيق
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative mx-auto mb-4"
                style={{ width: 64, height: 64 }}
              >
                {/* دائرة خارجية دوارة */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-amber-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* دائرة داخلية دوارة عكسية */}
                <motion.div
                  className="absolute inset-2 rounded-full border-4 border-slate-600/30 border-b-slate-400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* نقطة مركزية نابضة */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full" />
                </motion.div>
              </motion.div>
              <motion.p
                className="text-amber-100 text-lg font-medium"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                جاري تحميل الإعدادات...
              </motion.p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Guest Room Alert - إذا مفيش غرفة */}
            {guestSession && (guestSession.status === 'pending' || !guestSession.roomNumber) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <GuestRoomAlert guestName={guestSession.name} />
              </motion.div>
            )}

            {/* Compact Hero + Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Side - Hotel Image - EVEN BIGGER */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="lg:col-span-7"
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30">
                      <img 
                        src="/images/hotel-exterior.jpg"
                        alt="Hotel"
                        className="w-full h-[600px] object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                            fallback.classList.add('flex');
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-amber-500/30 via-purple-500/30 to-blue-500/30 backdrop-blur-sm items-center justify-center">
                        <div className="text-center">
                          <div className="text-8xl mb-4">🏨</div>
                          <p className="text-white text-2xl font-bold">فندق المضيف</p>
                        </div>
                      </div>
                      
                      {/* Hotel Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                        {/* Seven-Son Logo */}
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src="/images/seven-son-logo.jpeg" 
                            alt="Seven-Son Logo" 
                            className="h-16 w-16 object-contain rounded-lg border-2 border-amber-400/50 shadow-lg"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div>
                            <h1 className="text-4xl font-bold text-white mb-1">
                              Seven-Son Hotel
                            </h1>
                            <p className="text-xl text-amber-400 font-semibold">سيفن سون</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {[...Array(hotelSettings.rating || 3)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        {guestSession && (
                          <div className="flex items-center gap-2 text-white text-lg">
                            <User className="w-5 h-5 text-amber-400" />
                            <span>{guestSession.name} - الغرفة: {guestSession.roomNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Side - Services Grid */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="lg:col-span-5"
                  >
                    <h2 className="text-2xl font-bold text-amber-200 mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                      خدمات التطبيق
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {enabledServices.map((service, index) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Card
                            onClick={() => handleServiceClick(service)}
                            className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber-500/20 h-full"
                          >
                            <CardContent className="p-4 relative z-10">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <service.icon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-base font-bold text-amber-100 mb-1 line-clamp-1">
                                {service.title}
                              </h3>
                              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                {service.description}
                              </p>
                              <div className="flex items-center gap-1 text-amber-400">
                                <span className="text-xs">اضغط للدخول</span>
                                <motion.div
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  ←
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Additional Services - If any overflow */}
            {enabledServices.length > 6 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto mt-8">
                {enabledServices.slice(6).map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: 0.1 * index,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateZ: 2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      onClick={() => handleServiceClick(service)}
                      className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/30"
                    >
                      {/* تأثير التوهج عند المرور */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      {/* زخرفة في الزاوية */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full" />
                      
                      <CardContent className="p-6 relative z-10">
                        <motion.div 
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-xl border-2 border-amber-400/30 relative overflow-hidden`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8 }}
                        >
                          {/* توهج داخلي */}
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0, 0.5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <service.icon className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                        </motion.div>
                        
                        <motion.h3
                          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100 mb-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          {service.title}
                        </motion.h3>
                        <p className="text-sm text-slate-300 mb-3">
                          {service.description}
                        </p>
                        <p className="text-xs text-amber-400/70 font-medium">
                          {service.titleEn}
                        </p>
                        
                        {/* سهم التنقل */}
                        <motion.div
                          className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Hotel Info */}
        {!loading && (hotelSettings.phone || hotelSettings.contactPhone || hotelSettings.contactEmail) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-amber-500/30 overflow-hidden shadow-2xl">
              {/* تأثير توهج في الخلفية */}
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <CardContent className="p-6 relative z-10">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100 mb-4 flex items-center gap-2"
                >
                  <Hotel className="w-6 h-6 text-amber-400" />
                  معلومات التواصل
                </motion.h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(hotelSettings.phone || hotelSettings.contactPhone) && (
                    <motion.a
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 }}
                      whileHover={{ scale: 1.05, x: 5 }}
                      href={`tel:${hotelSettings.phone || hotelSettings.contactPhone}`}
                      className="flex items-center gap-3 text-slate-300 hover:text-amber-300 transition-colors p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Phone className="w-5 h-5 text-amber-400" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-slate-400">الهاتف</p>
                        <p className="font-medium">{hotelSettings.phone || hotelSettings.contactPhone}</p>
                      </div>
                    </motion.a>
                  )}
                  {hotelSettings.contactEmail && (
                    <motion.a
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.05, x: -5 }}
                      href={`mailto:${hotelSettings.contactEmail}`}
                      className="flex items-center gap-3 text-slate-300 hover:text-amber-300 transition-colors p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70"
                    >
                      <Globe className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-sm text-slate-400">البريد الإلكتروني</p>
                        <p className="font-medium" dir="ltr">{hotelSettings.contactEmail}</p>
                      </div>
                    </motion.a>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div> {/* End Main Content */}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="relative z-10 mt-12 py-6 text-center text-slate-400 text-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
          className="inline-block"
        >
          <p className="flex items-center justify-center gap-2">
            <span>© 2025 {hotelSettings.hotelName}</span>
            <motion.span
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-amber-400"
            >
              •
            </motion.span>
            <span>جميع الحقوق محفوظة</span>
          </p>
        </motion.div>
      </motion.footer>
    </div>
  );
}
