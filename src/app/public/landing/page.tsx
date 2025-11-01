'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Wifi, 
  Coffee, 
  Utensils,
  Car,
  Dumbbell,
  Waves,
  ShieldCheck,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Calendar,
  Home,
  Building,
  Sparkles,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Room {
  id: string;
  name: string;
  nameEn?: string;
  type: 'غرفة' | 'جناح' | 'شقة' | 'فيلا';
  description: string;
  area: number;
  maxGuests: number;
  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  images: Array<{ url: string; caption?: string }>;
  amenities: string[];
  available: boolean;
}

interface HeroImage {
  id: string;
  url: string;
  title: string;
}

interface ServiceImage {
  id: string;
  url: string;
  title: string;
  icon: string;
}

export default function PublicLandingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [services, setServices] = useState<ServiceImage[]>([]);
  
  // Hotel Info
  const hotelName = 'فندق سيفن سون';
  const hotelAddress = 'مدينة أبها، المملكة العربية السعودية';

  // صور افتراضية في حالة عدم وجود صور في Firebase
  const getDefaultHeroImages = (): HeroImage[] => [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      title: 'فندق سيفن سون - تجربة استثنائية'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      title: 'الضيافة الفاخرة'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      title: 'راحتك هي أولويتنا'
    }
  ];

  const getDefaultServices = (): ServiceImage[] => [
    { id: '1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', title: 'واي فاي مجاني', icon: 'Wifi' },
    { id: '2', url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', title: 'خدمة الغرف 24/7', icon: 'Clock' },
    { id: '3', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', title: 'مسبح خاص', icon: 'Waves' },
    { id: '4', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6', title: 'مطعم فاخر', icon: 'Utensils' },
    { id: '5', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', title: 'موقف سيارات', icon: 'Car' },
    { id: '6', url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', title: 'صالة رياضية', icon: 'Dumbbell' },
    { id: '7', url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e', title: 'سبا وساونا', icon: 'Sparkles' },
    { id: '8', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', title: 'قاعة اجتماعات', icon: 'Users' }
  ];

  useEffect(() => {
    loadData();
    
    // Auto-slide hero images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % (heroImages.length || 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const loadData = async () => {
    try {
      // تحميل الغرف
      const roomsSnapshot = await getDocs(collection(db, 'rooms_catalog'));
      const roomsData = roomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      
      console.log('📊 إجمالي الغرف في الكتالوج:', roomsData.length);
      console.log('🏨 الغرف المحملة:', roomsData);
      
      // عرض الغرف المتاحة، وإذا لم توجد اعرض كل الغرف
      const availableRooms = roomsData.filter(room => room.available);
      if (availableRooms.length > 0) {
        setRooms(availableRooms);
        console.log('✅ عدد الغرف المتاحة:', availableRooms.length);
      } else {
        // إذا لم توجد غرف متاحة، اعرض كل الغرف
        setRooms(roomsData);
        console.log('⚠️ لا توجد غرف متاحة، عرض جميع الغرف:', roomsData.length);
      }

      // تحميل الصور من Firebase
      const imagesDoc = await getDoc(doc(db, 'settings', 'website-images'));
      if (imagesDoc.exists()) {
        const data = imagesDoc.data();
        setHeroImages(data.heroImages || getDefaultHeroImages());
        setServices(data.services || getDefaultServices());
      } else {
        setHeroImages(getDefaultHeroImages());
        setServices(getDefaultServices());
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
      setHeroImages(getDefaultHeroImages());
      setServices(getDefaultServices());
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - Luxury Style */}
      <nav className="fixed top-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-b border-gray-100 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                <Star className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">سيفن سون</h1>
                <p className="text-xs text-amber-600 font-semibold">SEVEN SON HOTEL</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#about" className="text-gray-900 hover:text-amber-600 transition font-bold text-lg">
                عن الفندق
              </Link>
              <Link href="#rooms" className="text-gray-900 hover:text-amber-600 transition font-bold text-lg">
                الغرف والأجنحة
              </Link>
              <Link href="#services" className="text-gray-900 hover:text-amber-600 transition font-bold text-lg">
                الخدمات
              </Link>
              <Link href="/public/faq" className="text-gray-900 hover:text-amber-600 transition font-bold text-lg">
                الأسئلة الشائعة
              </Link>
              <Link href="/guest-app/login">
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all font-bold text-lg">
                  <Calendar className="h-5 w-5 ml-2" />
                  احجز الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      <section className="relative h-screen overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
            
            {/* Background Image */}
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            
            {/* Content */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 px-4 py-2 rounded-full mb-6">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-100 text-sm font-medium">فندق 5 نجوم - أبها</span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    {image.title}
                  </h1>
                  
                  {/* Divider */}
                  <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mb-6"></div>
                  
                  {/* Description */}
                  <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
                    استمتع بتجربة فندقية استثنائية تجمع بين الفخامة العصرية والضيافة العربية الأصيلة
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex gap-4 flex-wrap">
                    <Link href="/guest-app/login">
                      <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-7 text-lg rounded-full shadow-2xl hover:shadow-amber-500/50 transition-all">
                        <Calendar className="mr-2 h-6 w-6" />
                        احجز إقامتك الآن
                      </Button>
                    </Link>
                    <Link href="#rooms">
                      <Button size="lg" variant="outline" className="border-3 border-amber-400 bg-white/95 text-amber-900 hover:bg-amber-50 backdrop-blur-sm px-10 py-7 text-lg rounded-full font-bold shadow-xl">
                        استكشف الغرف
                        <ChevronLeft className="ml-2 h-6 w-6" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons - Elegant */}
        <button
          onClick={prevImage}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-full transition-all shadow-xl"
          aria-label="Previous image"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-full transition-all shadow-xl"
          aria-label="Next image"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators - Premium */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-amber-500 w-12' 
                  : 'bg-white/50 w-2 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="flex flex-col items-center text-white/80">
            <ChevronLeft className="h-6 w-6 rotate-90" />
            <span className="text-sm">استكشف المزيد</span>
          </div>
        </div>
      </section>

      {/* About Section - Luxury Design */}
      <section id="about" className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
            alt="Hotel Luxury"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/85 to-amber-800/90" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-amber-300" />
              <span className="text-white font-semibold text-sm">من نحن</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              فندق سيفن سون
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-300 to-amber-400 mx-auto mb-6"></div>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              تجربة فندقية استثنائية تجمع بين الفخامة العصرية والضيافة العربية الأصيلة في قلب مدينة أبها الساحرة
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">موقع مميز</h3>
              <p className="text-amber-100 leading-relaxed">
                في قلب أبها، موقع استراتيجي يسهل الوصول إليه من جميع المعالم السياحية
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">أمان وراحة</h3>
              <p className="text-amber-100 leading-relaxed">
                حراسة على مدار الساعة، أنظمة أمان متطورة، وبيئة آمنة تماماً
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">خدمة متميزة</h3>
              <p className="text-amber-100 leading-relaxed">
                فريق محترف متاح 24/7 لتلبية جميع احتياجاتك وضمان راحتك
              </p>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-3xl p-10 text-white shadow-2xl border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">تواصل معنا</h3>
                <p className="text-gray-300 text-lg mb-6">
                  فريقنا جاهز لاستقبال حجزك والإجابة على جميع استفساراتك
                </p>
                <div className="flex gap-4">
                  <Link href="/guest-app/login">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 rounded-full">
                      احجز الآن
                    </Button>
                  </Link>
                  <Link href="/public/faq">
                    <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full">
                      استفسارات
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <a href="tel:+966504755400" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-xl transition group">
                  <div className="bg-green-500 p-3 rounded-full group-hover:scale-110 transition">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">اتصل بنا</p>
                    <p className="text-lg font-semibold" dir="ltr">+966 50 475 5400</p>
                  </div>
                </a>
                
                <a href="mailto:info@almodif.net" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-xl transition group">
                  <div className="bg-purple-500 p-3 rounded-full group-hover:scale-110 transition">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">راسلنا</p>
                    <p className="text-lg font-semibold" dir="ltr">info@almodif.net</p>
                  </div>
                </a>
                
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">العنوان</p>
                    <p className="text-lg font-semibold">العنوان الجديد - أبها</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Premium Design */}
      <section id="services" className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
            alt="Hotel Services"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/85 to-blue-800/90" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-white font-semibold text-sm">خدماتنا</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              خدمات ومرافق فاخرة
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-300 to-purple-300 mx-auto mb-6"></div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              نوفر مجموعة متكاملة من الخدمات والمرافق لضمان راحتك وإقامة لا تُنسى
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.url}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg text-center drop-shadow-lg">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Hover Details */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex items-center justify-center p-6">
                  <div className="text-center text-white">
                    <Star className="h-12 w-12 mx-auto mb-4 fill-white" />
                    <p className="text-xl font-bold mb-2">{service.title}</p>
                    <p className="text-sm text-amber-100">متاح الآن</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/guest-app/login">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-12 py-7 text-lg rounded-full shadow-xl">
                <Calendar className="mr-2 h-6 w-6" />
                احجز الآن واستمتع بكل المزايا
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rooms & Suites - Luxury Showcase */}
      <section id="rooms" className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
            alt="Hotel Rooms"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-800/85 to-amber-900/90" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
              <Building className="h-4 w-4 text-amber-300" />
              <span className="text-white font-semibold text-sm">غرفنا</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              الغرف والأجنحة الفاخرة
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-300 to-amber-400 mx-auto mb-6"></div>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              اختر من بين مجموعة متنوعة من الغرف والأجنحة المصممة بعناية لتوفير أقصى درجات الراحة والفخامة
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-amber-500 mx-auto"></div>
                <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-amber-500 animate-pulse" />
              </div>
              <p className="mt-6 text-gray-600 text-lg">جاري تحميل الغرف الفاخرة...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xl">لا توجد غرف متاحة حالياً</p>
              <p className="text-gray-400 mt-2">يرجى التواصل معنا للاستفسار</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Room Image */}
                  <div className="relative h-72 overflow-hidden">
                    {room.images && room.images.length > 0 ? (
                      <Image
                        src={room.images[0].url}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <Star className="h-20 w-20 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Room Type Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg">
                      {room.type}
                    </div>
                    
                    {/* Quick View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-7">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition">
                      {room.name}
                    </h3>
                    {room.nameEn && (
                      <p className="text-gray-400 text-sm mb-4 font-medium" dir="ltr">
                        {room.nameEn}
                      </p>
                    )}
                    <p className="text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Room Info Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">المساحة</p>
                        <p className="text-lg font-bold text-blue-900">{room.area} م²</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <p className="text-xs text-green-600 font-semibold mb-1">السعة</p>
                        <p className="text-lg font-bold text-green-900">{room.maxGuests} أشخاص</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs text-gray-500 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          المرافق المتوفرة
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 3).map((amenity: any, idx: number) => {
                            return (
                              <span
                                key={idx}
                                className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 font-medium"
                              >
                                {amenity}
                              </span>
                            );
                          })}
                          {room.amenities.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                              +{room.amenities.length - 3} المزيد
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="border-t border-gray-100 pt-5">
                      <div className="flex items-end justify-between mb-5">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">السعر يبدأ من</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                              {room.price.daily}
                            </span>
                            <span className="text-gray-500 font-medium">ر.س</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">لليلة الواحدة</p>
                        </div>
                        {room.price.weekly && (
                          <div className="text-right bg-green-50 px-3 py-2 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold">عرض أسبوعي</p>
                            <p className="text-sm font-bold text-green-900">{room.price.weekly} ر.س</p>
                          </div>
                        )}
                      </div>

                      <Link href="/guest-app/login">
                        <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                          <Calendar className="mr-2 h-5 w-5" />
                          احجز هذه الغرفة
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {rooms.length > 0 && (
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-6 text-lg">لم تجد ما تبحث عنه؟</p>
              <Link href="/public/faq">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-amber-500 hover:text-amber-600 px-8 py-6 rounded-full">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  تحدث مع فريق الحجوزات
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section - Premium */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
            alt="Hotel"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 via-amber-800/90 to-amber-900/95" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full mb-8">
            <Star className="h-5 w-5 text-amber-300 fill-amber-300" />
            <span className="text-white font-semibold">تجربة فاخرة تنتظرك</span>
            <Star className="h-5 w-5 text-amber-300 fill-amber-300" />
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            جاهز لتجربة إقامة استثنائية؟
          </h2>
          
          <div className="w-32 h-1 bg-gradient-to-r from-white via-amber-300 to-white mx-auto mb-8"></div>
          
          <p className="text-2xl text-amber-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            احجز الآن واستمتع بأفضل الأسعار والخدمات الفاخرة في قلب مدينة أبها
          </p>
          
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/guest-app/login">
              <Button size="lg" className="bg-white text-amber-900 hover:bg-amber-50 px-12 py-8 text-xl font-bold rounded-full shadow-2xl hover:shadow-white/50 transition-all">
                <Calendar className="mr-3 h-7 w-7" />
                ابدأ حجزك الآن
              </Button>
            </Link>
            <Link href="tel:+966504755400">
              <Button size="lg" variant="outline" className="border-3 border-white text-white hover:bg-white/20 backdrop-blur-md px-12 py-8 text-xl font-bold rounded-full">
                <Phone className="mr-3 h-7 w-7" />
                اتصل بنا مباشرة
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5★</div>
              <p className="text-amber-200 text-sm">تقييم الفندق</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <p className="text-amber-200 text-sm">خدمة عملاء</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <p className="text-amber-200 text-sm">ضمان الرضا</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">VIP</div>
              <p className="text-amber-200 text-sm">خدمة مميزة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Logo & About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/50">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    {hotelName}
                  </h3>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mb-6">
                نقدم لكم أفضل تجربة إقامة فاخرة في قلب مدينة أبها، مع خدمات متميزة وغرف عصرية تجمع بين الفخامة والراحة.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="h-10 w-10 rounded-full bg-slate-700 hover:bg-amber-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-slate-700 hover:bg-amber-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-slate-700 hover:bg-amber-600 flex items-center justify-center transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-amber-400">روابط سريعة</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/guest-app/login" className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    حجز غرفة
                  </Link>
                </li>
                <li>
                  <Link href="/public/faq" className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    الأسئلة الشائعة
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    عن الفندق
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    الخدمات
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-amber-400">تواصل معنا</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300">+966 50 475 5400</div>
                    <div className="text-slate-400 text-sm">متاح 24/7</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-slate-300">info@hotel.com</div>
                    <div className="text-slate-400 text-sm">نرد خلال ساعة</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-400 mt-1 flex-shrink-0" />
                  <div className="text-slate-300 leading-relaxed">
                    {hotelAddress || 'مدينة أبها، المملكة العربية السعودية'}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-center md:text-right">
              © {new Date().getFullYear()} {hotelName}. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
                سياسة الإلغاء
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}
