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

interface HotelSettings {
  hotelName: string;
  logo?: string;
  description?: string;
  phone?: string;
  address?: string;
  rating?: number;
  amenities?: string[];
}

export default function GuestAppHomePage() {
  const router = useRouter();
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>({
    hotelName: 'فندق سيفن سون',
    rating: 5
  });
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  useEffect(() => {
    // جلب إعدادات الفندق
    const settings = localStorage.getItem('guest_menu_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setHotelSettings(prev => ({
        ...prev,
        hotelName: parsed.hotelName || prev.hotelName,
        logo: parsed.logoUrl,
        description: parsed.description,
        phone: parsed.phone,
        address: parsed.address
      }));
    }

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
      color: 'from-blue-500 to-blue-600',
      description: 'احجز غرفتك أو شقتك بسهولة',
      route: '/guest-app/booking'
    },
    {
      id: 'restaurant',
      title: 'طلب من المطعم',
      titleEn: 'Restaurant Order',
      icon: Utensils,
      color: 'from-amber-500 to-orange-600',
      description: 'تصفح قائمة الطعام واطلب',
      route: '/guest-app/restaurant'
    },
    {
      id: 'coffee',
      title: 'الكوفي شوب',
      titleEn: 'Coffee Shop',
      icon: Coffee,
      color: 'from-yellow-600 to-amber-700',
      description: 'قهوة طازجة ومشروبات',
      route: '/guest-app/coffee-shop'
    },
    {
      id: 'laundry',
      title: 'خدمة المغسلة',
      titleEn: 'Laundry Service',
      icon: Shirt,
      color: 'from-cyan-500 to-blue-600',
      description: 'غسيل وكي الملابس',
      route: '/guest-app/laundry'
    },
    {
      id: 'room-service',
      title: 'خدمة الغرف',
      titleEn: 'Room Service',
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      description: 'اطلب أي شيء لغرفتك',
      route: '/guest-app/room-service'
    },
    {
      id: 'extend',
      title: 'تمديد الإقامة',
      titleEn: 'Extend Stay',
      icon: Calendar,
      color: 'from-green-500 to-emerald-600',
      description: 'مدد إقامتك بسهولة',
      route: '/guest-app/extend-stay'
    },
    {
      id: 'contact',
      title: 'التواصل معنا',
      titleEn: 'Contact Us',
      icon: Phone,
      color: 'from-pink-500 to-rose-600',
      description: 'تواصل مع الاستقبال',
      route: '/guest-app/contact'
    }
  ];

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* خلفية متحركة */}
      <AnimatedBackground />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hotelSettings.logo ? (
                <img 
                  src={hotelSettings.logo} 
                  alt={hotelSettings.hotelName}
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Hotel className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  {hotelSettings.hotelName}
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                </h1>
                {hotelSettings.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(hotelSettings.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={generateQRCode}
              className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            مرحباً بك في تطبيق الضيوف
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            استمتع بجميع خدمات الفندق من راحة غرفتك
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card 
                onClick={() => handleServiceClick(service)}
                className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-blue-200/80 mb-3">
                    {service.description}
                  </p>
                  <p className="text-xs text-blue-300/60 font-medium">
                    {service.titleEn}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Hotel Info */}
        {(hotelSettings.phone || hotelSettings.address) && (
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
                  معلومات الفندق
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {hotelSettings.phone && (
                    <a 
                      href={`tel:${hotelSettings.phone}`}
                      className="flex items-center gap-3 text-blue-200 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{hotelSettings.phone}</span>
                    </a>
                  )}
                  {hotelSettings.address && (
                    <div className="flex items-center gap-3 text-blue-200">
                      <MapPin className="w-5 h-5" />
                      <span>{hotelSettings.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

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
