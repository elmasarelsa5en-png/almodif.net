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

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-xl border-b border-amber-500/30 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hotelSettings.logo ? (
                <img 
                  src={hotelSettings.logo} 
                  alt={hotelSettings.hotelName}
                  className="h-16 w-auto object-contain drop-shadow-2xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-amber-300/50">
                  <Hotel className="w-10 h-10 text-slate-900" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-100 flex items-center gap-2 drop-shadow-lg">
                  {hotelSettings.hotelName}
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                </h1>
                {hotelSettings.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(hotelSettings.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={generateQRCode}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 backdrop-blur-sm border border-amber-400/30"
            >
              <QrCode className="w-5 h-5 mr-2" />
              QR Code
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Download Prompt */}
      {showDownloadPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 text-center"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Smartphone className="w-5 h-5" />
            <span className="font-medium">احصل على تجربة أفضل مع التطبيق!</span>
            <Button 
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              <Download className="w-4 h-4 mr-2" />
              تحميل التطبيق
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">جاري تحميل الإعدادات...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {hotelSettings.welcomeMessage || 'مرحباً بك في تطبيق الضيوف'}
              </h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                {hotelSettings.welcomeMessageEn || 'استمتع بجميع خدمات الفندق من راحة غرفتك'}
              </p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {enabledServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card 
                    onClick={() => handleServiceClick(service)}
                    className="bg-slate-800/80 backdrop-blur-xl border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                  >
                    <CardContent className="p-6">
                      <div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl border-2 border-amber-400/30`}
                      >
                        <service.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-100 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm text-amber-200/70 mb-3">
                        {service.description}
                      </p>
                      <p className="text-xs text-amber-300/50 font-medium">
                        {service.titleEn}
                      </p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Hotel className="w-6 h-6" />
                  معلومات التواصل
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(hotelSettings.phone || hotelSettings.contactPhone) && (
                    <a 
                      href={`tel:${hotelSettings.phone || hotelSettings.contactPhone}`}
                      className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-blue-300">الهاتف</p>
                        <p className="font-medium">{hotelSettings.phone || hotelSettings.contactPhone}</p>
                      </div>
                    </a>
                  )}
                  {hotelSettings.contactEmail && (
                    <a 
                      href={`mailto:${hotelSettings.contactEmail}`}
                      className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-blue-300">البريد الإلكتروني</p>
                        <p className="font-medium" dir="ltr">{hotelSettings.contactEmail}</p>
                      </div>
                    </a>
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
        transition={{ delay: 1 }}
        className="relative z-10 mt-12 py-6 text-center text-blue-200/60 text-sm"
      >
        <p>© 2025 {hotelSettings.hotelName} - جميع الحقوق محفوظة</p>
      </motion.footer>
    </div>
  );
}
