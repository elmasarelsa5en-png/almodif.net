'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
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

  // للموبايل: تحويل مباشر لصفحة تسجيل الدخول
  useEffect(() => {
    // التحقق إذا كان التطبيق يعمل في Capacitor (موبايل)
    const isCapacitor = typeof window !== 'undefined' && 
      (window as any).Capacitor !== undefined;
    
    if (isCapacitor) {
      // تحويل مباشر لصفحة تسجيل دخول النزيل
      router.push('/guest-login');
    }
  }, [router]);

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
                variant="outline"
                className="border-green-400/30 text-green-300 bg-green-900/30 hover:bg-green-800/50 backdrop-blur-sm"
                onClick={() => router.push('/guest-login')}
              >
                <Menu className="w-4 h-4 ml-2" />
                المنيو الإلكتروني
              </Button>
              <Button 
                variant="outline"
                className="border-purple-400/30 text-purple-300 bg-purple-900/30 hover:bg-purple-800/50 backdrop-blur-sm"
                onClick={() => router.push('/employee-login')}
              >
                <UserCircle className="w-4 h-4 ml-2" />
                دخول الموظفين
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
                  variant="outline"
                  className="border-green-400/30 text-green-300 bg-green-900/30 w-full justify-start"
                  onClick={() => router.push('/guest-login')}
                >
                  <Menu className="w-4 h-4 ml-2" />
                  المنيو الإلكتروني للنزلاء
                </Button>
                <Button 
                  variant="outline"
                  className="border-purple-400/30 text-purple-300 bg-purple-900/30 w-full justify-start"
                  onClick={() => router.push('/employee-login')}
                >
                  <UserCircle className="w-4 h-4 ml-2" />
                  دخول الموظفين
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
              
              {/* Hero Value Proposition */}
              <div className="mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    تطبيق المضيف
                  </h3>
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                </div>
                <p className="text-xl lg:text-2xl text-blue-100 font-semibold leading-relaxed">
                  نقدم لك الإضافة ونساعدك في إدارة الاستضافة
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">إدارة احترافية</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">خدمات متكاملة</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">دعم مستمر</span>
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
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl text-lg px-8 py-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                  onClick={() => router.push('/guest-login')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                  <div className="relative flex items-center">
                    <Menu className="w-5 h-5 ml-2" />
                    المنيو الإلكتروني للنزلاء
                  </div>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm text-lg px-8 py-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                  onClick={() => router.push('/dashboard')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></div>
                  <div className="relative flex items-center">
                    <ArrowRight className="w-5 h-5 ml-2" />
                    {t('homepageExploreSystem')}
                  </div>
                </Button>
              </div>
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

        {/* CTA Section */}
        <section className="py-12 lg:py-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              جاهز لتطوير إدارة فندقك؟
            </h2>
            <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
              انضم إلى مئات الفنادق التي تثق في نظام المضيف الذكي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl text-xl px-10 py-5"
                onClick={() => window.location.href = '/login'}
              >
                <CheckCircle className="w-6 h-6 ml-2" />
                ابدأ مجاناً
              </Button>
            </div>
          </div>
        </section>

        {/* Guest Menu Banner - NEW */}
        <section className="py-12 lg:py-20 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 lg:p-12 border border-white/10 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    <Sparkles className="w-4 h-4" />
                    للنزلاء الأعزاء
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                    اطلب ما تشاء من غرفتك! 🛎️
                  </h2>
                  <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
                    استخدم المنيو الإلكتروني لطلب:
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="font-medium">قهوة ومشروبات</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="font-medium">طعام ووجبات</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="font-medium">خدمة مغسلة</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Bed className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="font-medium">خدمة الغرف</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-center shadow-2xl">
                  <div className="text-6xl mb-6">📱</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    ادخل للمنيو الآن
                  </h3>
                  <p className="text-green-100 mb-6 text-lg">
                    فقط أدخل اسمك ورقم الغرفة وابدأ الطلب
                  </p>
                  <Button 
                    size="lg"
                    className="w-full bg-white text-green-700 hover:bg-gray-100 shadow-xl text-xl px-8 py-6 font-bold"
                    onClick={() => router.push('/guest-login')}
                  >
                    <Menu className="w-6 h-6 ml-2" />
                    افتح المنيو الإلكتروني
                  </Button>
                  <p className="text-green-200 text-sm mt-4">
                    ✨ سريع، سهل، ومباشر لغرفتك
                  </p>
                </div>
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