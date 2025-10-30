'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Hotel, Home, Utensils, Coffee, Shirt, Bell, Calendar, 
  Phone, Star, MapPin, Wifi, Car, Sparkles, QrCode,
  Download, Globe, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  useEffect(() => {
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setShowDownloadPrompt(true);
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
    }
  ];

  // فلتر الخدمات المفعلة فقط
  const enabledServices = services.filter(service => service.enabled);

  const handleServiceClick = (service: typeof services[0]) => {
    // حفظ جلسة ضيف إذا لم تكن موجودة
    const guestSession = localStorage.getItem('guest_session');
    if (!guestSession && service.id !== 'contact' && service.id !== 'booking') {
      // إنشاء جلسة ضيف مؤقتة
      const tempGuest = {
        name: 'ضيف',
        phone: '',
        roomNumber: 'معاينة',
        loginTime: new Date().toISOString(),
        isGuest: true
      };
      localStorage.setItem('guest_session', JSON.stringify(tempGuest));
    }
    router.push(service.route);
  };

  const generateQRCode = () => {
    const url = window.location.origin + '/guest-app';
    router.push(`/guest-app/qr-code?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" dir="rtl">
      {/* طبقة الخلفية المتحركة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* جزيئات ذهبية متحركة */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        
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

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl border-b border-amber-500/30 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hotelSettings.logo ? (
                <motion.img
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  src={hotelSettings.logo} 
                  alt={hotelSettings.hotelName}
                  className="h-16 w-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-amber-300/50"
                >
                  <Hotel className="w-10 h-10 text-slate-900" />
                </motion.div>
              )}
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-amber-100 flex items-center gap-2 drop-shadow-lg"
                >
                  {hotelSettings.hotelName}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </motion.div>
                </motion.h1>
                {hotelSettings.rating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    {[...Array(hotelSettings.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                onClick={generateQRCode}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 backdrop-blur-sm border border-amber-400/30 hover:scale-105 transition-all duration-300"
              >
                <QrCode className="w-5 h-5 mr-2" />
                QR Code
              </Button>
            </motion.div>
          </div>
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
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h2
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 mb-4 drop-shadow-lg"
              >
                {hotelSettings.welcomeMessage || 'مرحباً بك في تطبيق الضيوف'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg text-slate-300 max-w-2xl mx-auto"
              >
                {hotelSettings.welcomeMessageEn || 'استمتع بجميع خدمات الفندق من راحة غرفتك'}
              </motion.p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {enabledServices.map((service, index) => (
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
