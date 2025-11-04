'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { 
  Bed,
  LogIn,
  CheckCircle,
  MessageCircle,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Play,
  Headphones,
  Menu,
  X,
  Coffee,
  Utensils,
  Shirt,
  DollarSign,
  Settings,
  Globe,
  UserCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function HomePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // التأكد من عدم وجود redirect
  useEffect(() => {
    console.log('✅ HomePage loaded - No automatic redirect');
    console.log('Current path:', window.location.pathname);
  }, []);

  // تحميل صور السلايدر من Firebase
  useEffect(() => {
    const loadSliderImages = async () => {
      try {
        console.log('📥 Loading slider images from Firebase...');
        const imagesRef = ref(storage, 'slider-images');
        const imagesList = await listAll(imagesRef);
        
        const imageUrls: string[] = [];
        for (const item of imagesList.items) {
          const url = await getDownloadURL(item);
          imageUrls.push(url);
        }
        
        console.log('✅ Loaded', imageUrls.length, 'slider images');
        setSliderImages(imageUrls);
      } catch (error) {
        console.error('❌ Error loading slider images:', error);
        // استخدام الصور الافتراضية في حالة الخطأ
        setSliderImages([]);
      } finally {
        setLoadingImages(false);
      }
    };

    loadSliderImages();
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (sliderImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000); // تغيير كل 3 ثواني

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const features = [
    {
      icon: <Bed className="w-8 h-8 text-blue-400" />,
      title: t('featureRoomsManagement'),
      description: t('featureRoomsDesc'),
      stats: t('featureRoomsStats'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-400" />,
      title: t('featureCRM'),
      description: t('featureCRMDesc'),
      stats: t('featureCRMStats'),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
      title: t('featureAnalytics'),
      description: t('featureAnalyticsDesc'),
      stats: t('featureAnalyticsStats'),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Coffee className="w-8 h-8 text-amber-400" />,
      title: t('featureCoffeeShop'),
      description: t('featureCoffeeShopDesc'),
      stats: t('featureCoffeeShopStats'),
      color: "from-amber-500 to-orange-500"
    }
  ];

  const services = [
    { icon: <Bed className="w-6 h-6" />, title: t('serviceRooms'), desc: t('serviceRoomsDesc'), path: "/dashboard/rooms" },
    { icon: <MessageCircle className="w-6 h-6" />, title: t('serviceCRM'), desc: t('serviceCRMDesc'), path: "/dashboard/contacts" },
    { icon: <BarChart3 className="w-6 h-6" />, title: t('serviceAnalytics'), desc: t('serviceAnalyticsDesc'), path: "/analytics" },
    { icon: <Coffee className="w-6 h-6" />, title: t('serviceCoffeeShop'), desc: t('serviceCoffeeShopDesc'), path: "/dashboard/coffee-shop" },
    { icon: <Utensils className="w-6 h-6" />, title: t('serviceRestaurant'), desc: t('serviceRestaurantDesc'), path: "/dashboard/restaurant" },
    { icon: <Shirt className="w-6 h-6" />, title: t('serviceLaundry'), desc: t('serviceLaundryDesc'), path: "/dashboard/laundry" },
    { icon: <DollarSign className="w-6 h-6" />, title: t('serviceAccounting'), desc: t('serviceAccountingDesc'), path: "/dashboard/accounting" },
    { icon: <Settings className="w-6 h-6" />, title: t('serviceSettings'), desc: t('serviceSettingsDesc'), path: "/settings" }
  ];

  const stats = [
    { number: t('statBookings'), label: t('statBookingsLabel'), icon: <Calendar className="w-8 h-8 text-blue-400" /> },
    { number: t('statSatisfaction'), label: t('statSatisfactionLabel'), icon: <Star className="w-8 h-8 text-yellow-400" /> },
    { number: t('statHotels'), label: t('statHotelsLabel'), icon: <Bed className="w-8 h-8 text-green-400" /> },
    { number: t('statSupport'), label: t('statSupportLabel'), icon: <Headphones className="w-8 h-8 text-purple-400" /> }
  ];

  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" dir="rtl">
      <AnimatedBackground />
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative flex items-center gap-2">
                {/* Rotating Ring */}
                <div className="absolute inset-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full border border-transparent border-t-blue-400/50 border-r-purple-400/50 animate-spin-slow"></div>
                
                {/* Logo with animations */}
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl ring-1 ring-white/30 animate-pulse-glow relative group">
                  <img 
                    src="/app-logo.png" 
                    alt={t('appName')} 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    style={{objectFit:'contain'}} 
                  />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity"></div>
                </div>
                
                {/* Orbiting Dot */}
                <div className="absolute inset-0 animate-orbit pointer-events-none">
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full -ml-1 shadow-md shadow-green-400/50"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {t('homepageSystemName')}
                </h1>
                <p className="text-purple-200/70 text-xs lg:text-sm font-medium">{t('appSubtitle')}</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-white/20 text-white bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm"
                onClick={toggleLanguage}
              >
                <Globe className="w-4 h-4 ml-2" />
                {language === 'ar' ? '🇺🇸 English' : '🇸🇦 العربية'}
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl"
                onClick={() => router.push('/login')}
              >
                <LogIn className="w-4 h-4 ml-2" />
                {t('loginButton')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              className="lg:hidden bg-white/10 border-white/20"
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-black/40 backdrop-blur-md rounded-lg p-4 mb-4 border border-white/10">
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white bg-slate-700/50 w-full justify-start"
                  onClick={toggleLanguage}
                >
                  <Globe className="w-4 h-4 ml-2" />
                  {language === 'ar' ? '🇺🇸 English' : '🇸🇦 العربية'}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 w-full justify-start"
                  onClick={() => router.push('/login')}
                >
                  <LogIn className="w-4 h-4 ml-2" />
                  {t('loginButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-6xl font-bold text-white mb-6">
                {t('homepageWelcome')}
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {t('homepageSystemName')}
                </span>
              </h2>
              
              {/* Hero Value Proposition - Enhanced */}
              <div className="mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-10 max-w-5xl mx-auto shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                  <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    منظومة متكاملة لإدارة فندقك
                  </h3>
                  <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                </div>
                
                <p className="text-xl lg:text-2xl text-center text-blue-50 font-semibold leading-relaxed mb-8">
                  🎯 نقدم لك <span className="text-yellow-300">4 حلول في واحد</span> لتحويل فندقك إلى منشأة رقمية متطورة
                </p>

                {/* 4 Main Solutions Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Solution 1: Management System */}
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-5 border border-blue-400/30 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">نظام إدارة متكامل</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">
                          إدارة الحجوزات، الغرف، المحاسبة، الموظفين، والتقارير من مكان واحد
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">Dashboard</span>
                      <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">Analytics</span>
                      <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">CRM</span>
                    </div>
                  </div>

                  {/* Solution 2: Guest App */}
                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-5 border border-green-400/30 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">تطبيق الضيف التفاعلي</h4>
                        <p className="text-green-100 text-sm leading-relaxed">
                          تطبيق كامل للنزلاء للطلب والحجز والتواصل مع إدارة الفندق
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded">Mobile App</span>
                      <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded">QR Menu</span>
                      <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded">Orders</span>
                    </div>
                  </div>

                  {/* Solution 3: Hotel Website */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-5 border border-purple-400/30 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">موقع فندقك الخاص</h4>
                        <p className="text-purple-100 text-sm leading-relaxed">
                          نصمم لك موقع احترافي مخصص بالكامل لفندقك مع نظام حجز مباشر
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">Custom Website</span>
                      <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">SEO</span>
                      <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded">Booking</span>
                    </div>
                  </div>

                  {/* Solution 4: Unified Inbox */}
                  <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-5 border border-orange-400/30 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">صندوق رسائل موحد</h4>
                        <p className="text-orange-100 text-sm leading-relaxed">
                          جميع رسائل WhatsApp والدردشة في مكان واحد مع ردود تلقائية ذكية
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-orange-500/30 text-orange-200 px-2 py-1 rounded">WhatsApp</span>
                      <span className="text-xs bg-orange-500/30 text-orange-200 px-2 py-1 rounded">AI Chatbot</span>
                      <span className="text-xs bg-orange-500/30 text-orange-200 px-2 py-1 rounded">Auto Reply</span>
                    </div>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">توفير 80% من الوقت</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">زيادة الحجوزات 3x</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">رضا العملاء 98%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">دعم 24/7</span>
                  </div>
                </div>
              </div>

              <p className="text-lg lg:text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                {t('homepageSubtitle')}
                <br />
                {t('homepageSubtitle2')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-2xl text-lg px-8 py-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                  onClick={() => window.location.href = '/login'}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                  <div className="relative flex items-center">
                    <Play className="w-5 h-5 ml-2" />
                    {t('homepageStartNow')}
                  </div>
                </Button>
              </div>
            </div>

            {/* Screenshots Slideshow - NEW */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {sliderImages.length > 0 ? 'استكشف أجزاء التطبيق' : 'معرض الصور'}
                </h3>
                <p className="text-blue-100/70">
                  {sliderImages.length > 0 ? 'شاهد كيف يعمل التطبيق من الداخل' : 'صور من التطبيق'}
                </p>
              </div>

              {loadingImages ? (
                <div className="relative overflow-hidden rounded-2xl bg-black/30 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white/60">جاري تحميل الصور...</p>
                  </div>
                </div>
              ) : sliderImages.length === 0 ? (
                <div className="relative overflow-hidden rounded-2xl bg-black/30 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-white/80 text-lg font-medium mb-2">لا توجد صور حالياً</p>
                    <p className="text-white/60 text-sm">سيتم إضافة صور التطبيق قريباً</p>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl bg-black/30 aspect-video">
                  {/* Main Image Display from Firebase */}
                  <div className="relative w-full h-full">
                    {sliderImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          index === currentSlide
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - only show if more than 1 image */}
                  {sliderImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110"
                      >
                        <ArrowRight className="w-6 h-6 rotate-180" />
                      </button>
                    </>
                  )}

                  {/* Dots Indicator */}
                  {sliderImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {sliderImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>



            {/* Feature Showcase */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${features[activeFeature].color} rounded-2xl flex items-center justify-center mb-4 shadow-xl`}>
                      {features[activeFeature].icon}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-blue-100/80 text-lg leading-relaxed mb-4">
                      {features[activeFeature].description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-400 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      {features[activeFeature].stats}
                    </div>
                  </div>
                  
                  {/* Feature Navigation */}
                  <div className="flex gap-3">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeFeature 
                            ? 'bg-blue-400 scale-125' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        index === activeFeature
                          ? 'bg-white/10 border-blue-400/50 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                          {React.cloneElement(feature.icon, { className: "w-5 h-5" })}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{feature.title}</h4>
                          <p className="text-blue-100/60 text-sm">{feature.stats}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 lg:py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {t('servicesTitle')}
              </h2>
              <p className="text-blue-100/80 text-lg max-w-2xl mx-auto">
                {t('servicesSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {services.map((service, index) => (
                <Card 
                  key={index}
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500 cursor-pointer group hover:scale-110 hover:rotate-1 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden"
                  onClick={() => window.location.href = service.path}
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity"></div>
                  
                  <CardContent className="p-4 lg:p-6 text-center relative z-10">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 lg:mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-blue-400/50">
                      {React.cloneElement(service.icon, { className: "text-white group-hover:scale-110 transition-transform" })}
                    </div>
                    <h3 className="text-white font-bold text-sm lg:text-base mb-1 lg:mb-2 group-hover:text-blue-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-blue-100/60 text-xs lg:text-sm group-hover:text-blue-100/80 transition-colors">
                      {service.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Journey Section - NEW */}
        <section className="py-12 lg:py-20 bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                رحلة النجاح معنا
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                كيف نحول فندقك <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">إلى منشأة رقمية</span>
              </h2>
              <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
                من التعاقد حتى النجاح - نرافقك في كل خطوة
              </p>
            </div>

            {/* Journey Steps */}
            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 z-0"></div>
              
              <div className="grid lg:grid-cols-4 gap-8 relative z-10">
                {/* Step 1: Contract */}
                <div className="text-center group hover:scale-105 transition-transform duration-500">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-blue-500/50 border-4 border-white/20 relative z-10">
                      <div className="text-4xl">📝</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">التعاقد والإعداد</h3>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    نبدأ بفهم احتياجات فندقك وإعداد النظام المناسب لك خلال 48 ساعة فقط
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">سريع</span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">مخصص</span>
                  </div>
                </div>

                {/* Step 2: Website */}
                <div className="text-center group hover:scale-105 transition-transform duration-500">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-purple-500/50 border-4 border-white/20 relative z-10">
                      <Globe className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">إنشاء موقعك</h3>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    نصمم موقع احترافي مخصص لفندقك مع نظام حجز مباشر وتحسين محركات البحث
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">SEO</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">Responsive</span>
                  </div>
                </div>

                {/* Step 3: Guest App */}
                <div className="text-center group hover:scale-105 transition-transform duration-500">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-green-500/50 border-4 border-white/20 relative z-10">
                      <div className="text-4xl">📱</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">تطبيق الضيف</h3>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    نزلاؤك يحصلون على تطبيق كامل للطلب والحجز والتواصل مع QR Code في كل غرفة
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">QR Menu</span>
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">Easy</span>
                  </div>
                </div>

                {/* Step 4: Unified Communication */}
                <div className="text-center group hover:scale-105 transition-transform duration-500">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-orange-500/50 border-4 border-white/20 relative z-10">
                      <MessageCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      4
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">إدارة موحدة</h3>
                  <p className="text-blue-100/70 text-sm leading-relaxed">
                    جميع الرسائل من WhatsApp والتطبيق في مكان واحد مع ردود تلقائية ذكية
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">AI Bot</span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="mt-16 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  ماذا تحصل في النهاية؟
                </h3>
                <p className="text-blue-100/70">منظومة رقمية متكاملة تعمل لصالحك 24/7</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-5xl mb-4">🎯</div>
                  <h4 className="text-xl font-bold text-white mb-2">كفاءة عالية</h4>
                  <p className="text-blue-100/70 text-sm">توفير 80% من وقت الإدارة والتركيز على تطوير الخدمة</p>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-5xl mb-4">📈</div>
                  <h4 className="text-xl font-bold text-white mb-2">زيادة الإيرادات</h4>
                  <p className="text-blue-100/70 text-sm">زيادة الحجوزات المباشرة 3x وتقليل العمولات</p>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-5xl mb-4">⭐</div>
                  <h4 className="text-xl font-bold text-white mb-2">رضا العملاء</h4>
                  <p className="text-blue-100/70 text-sm">تجربة ضيف استثنائية تضمن التقييمات العالية</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group hover:scale-110 transition-all duration-500 cursor-pointer"
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10 group-hover:bg-white/20 group-hover:rotate-12 group-hover:shadow-xl group-hover:shadow-blue-400/30 transition-all duration-500">
                    <div className="group-hover:scale-125 transition-transform duration-500">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl lg:text-4xl font-bold text-white mb-2 group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300">
                    {stat.number}
                  </div>
                  <div className="text-blue-100/70 text-sm lg:text-base group-hover:text-blue-100 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="py-12 lg:py-20 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-sm relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              عرض خاص - خصم 30% للمشتركين الجدد
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              جاهز لتحويل فندقك إلى <br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                منشأة رقمية متطورة؟
              </span>
            </h2>
            
            <p className="text-xl text-blue-100/80 mb-8 leading-relaxed max-w-3xl mx-auto">
              انضم إلى <strong className="text-white">مئات الفنادق</strong> التي تثق في نظام المضيف سمارت <br />
              وابدأ رحلتك نحو <strong className="text-green-400">النجاح الرقمي</strong> اليوم!
            </p>

            {/* Value Props Before CTA */}
            <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-white font-semibold text-sm">إعداد في 48 ساعة</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-white font-semibold text-sm">بدون رسوم إعداد</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">🎓</div>
                <p className="text-white font-semibold text-sm">تدريب مجاني كامل</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl text-xl px-12 py-6 group relative overflow-hidden"
                onClick={() => window.location.href = '/login'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                <div className="relative flex items-center">
                  <CheckCircle className="w-6 h-6 ml-2 group-hover:scale-125 transition-transform" />
                  ابدأ تجربتك المجانية
                </div>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 text-xl px-12 py-6 backdrop-blur-sm"
                onClick={() => window.open('https://wa.me/966559902557?text=مرحباً، أريد معرفة المزيد عن نظام المضيف', '_blank')}
              >
                <Phone className="w-6 h-6 ml-2" />
                تواصل معنا
              </Button>
            </div>

            <p className="text-blue-200/60 text-sm mt-6">
              ✨ لا حاجة لبطاقة ائتمانية • إلغاء في أي وقت • دعم فني على مدار الساعة
            </p>
          </div>
        </section>

        {/* Guest App Showcase - Enhanced */}
        <section className="py-12 lg:py-20 bg-gradient-to-b from-black/20 to-green-900/20 border-y border-white/10 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-green-500 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-green-400/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
                تطبيق الضيف التفاعلي
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                تجربة ضيف <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">استثنائية</span>
              </h2>
              <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
                نوفر لنزلاء فندقك تطبيق كامل للطلب والتواصل بدون تحميل - فقط QR Code!
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 lg:p-12 border border-white/10 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Left Side - Features */}
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-white" />
                    </div>
                    ماذا يستطيع النزيل فعله؟
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Coffee, title: "طلب القهوة والمشروبات", desc: "منيو كامل بالصور والأسعار", color: "amber" },
                      { icon: Utensils, title: "طلب الطعام من المطعم", desc: "تتبع الطلب لحظياً", color: "green" },
                      { icon: Shirt, title: "خدمة المغسلة", desc: "جدولة وتسليم سريع", color: "purple" },
                      { icon: MessageCircle, title: "التواصل مع الاستقبال", desc: "دردشة مباشرة 24/7", color: "blue" },
                      { icon: Calendar, title: "تمديد الإقامة", desc: "بضغطة زر واحدة", color: "indigo" },
                      { icon: Star, title: "تقييم الخدمة", desc: "مشاركة التجربة", color: "yellow" }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-pointer group"
                      >
                        <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1 group-hover:text-green-300 transition-colors">{item.title}</h4>
                          <p className="text-blue-100/60 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-400/30">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">⚡</div>
                      <div>
                        <p className="text-white font-bold">بدون تحميل!</p>
                        <p className="text-green-200 text-sm">فقط امسح QR Code وابدأ فوراً</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Side - CTA Card */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 lg:p-10 text-center shadow-2xl relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                    <div className="text-7xl mb-6 animate-bounce">📱</div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      هل أنت نزيل؟
                    </h3>
                    <p className="text-green-100 mb-6 text-lg leading-relaxed">
                      امسح الـ QR Code في غرفتك<br />
                      أو أدخل اسمك ورقم الغرفة هنا
                    </p>

                    {/* QR Code Mockup */}
                    <div className="bg-white rounded-2xl p-6 mb-6 inline-block">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Menu className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-gray-700 font-bold mt-3 text-sm">امسح للدخول</p>
                    </div>

                    <Button 
                      size="lg"
                      className="w-full bg-white text-green-700 hover:bg-gray-100 shadow-xl text-xl px-8 py-6 font-bold group relative overflow-hidden"
                      onClick={() => router.push('/guest-app')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                      <div className="relative flex items-center justify-center">
                        <Menu className="w-7 h-7 ml-2 group-hover:rotate-12 transition-transform" />
                        افتح تطبيق الضيف
                        <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 mt-6 text-green-100">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">سريع • سهل • آمن</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
                <p className="text-blue-100/70 text-sm">رضا النزلاء</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">&lt;2 دقيقة</div>
                <p className="text-blue-100/70 text-sm">متوسط وقت التوصيل</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                <p className="text-blue-100/70 text-sm">متاح دائماً</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-12 pb-[env(safe-area-inset-bottom)] md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Bed className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">نظام المضيف</span>
              </div>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                نظام إدارة فنادق متطور مع تقنيات الذكاء الاصطناعي لتجربة إدارية استثنائية.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">المنتج</h3>
              <ul className="space-y-2 text-sm text-blue-100/70">
                <li><button onClick={() => window.location.href = '/dashboard'} className="hover:text-white transition-colors">لوحة التحكم</button></li>
                <li><button onClick={() => window.location.href = '/analytics'} className="hover:text-white transition-colors">التحليلات</button></li>
                <li><button onClick={() => window.location.href = '/dashboard/contacts'} className="hover:text-white transition-colors">CRM</button></li>
                <li><button onClick={() => window.location.href = '/dashboard/accounting'} className="hover:text-white transition-colors">المحاسبة</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">الدعم</h3>
              <ul className="space-y-2 text-sm text-blue-100/70">
                <li><button className="hover:text-white transition-colors">المساعدة</button></li>
                <li><button className="hover:text-white transition-colors">التوثيق</button></li>
                <li><button className="hover:text-white transition-colors">الدعم الفني</button></li>
                <li><button className="hover:text-white transition-colors">التدريب</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-blue-100/70">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>00966559902557</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>akramabdelaziz1992@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>أبها، المملكة العربية السعودية</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8 text-center">
            <p className="text-blue-100/60 text-sm">
              © 2025 Eng/Akram elmasry . جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.6);
          }
        }

        @keyframes shine {
          from {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          to {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(40px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(40px) rotate(-360deg);
          }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        .animate-orbit {
          animation: orbit 4s linear infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}