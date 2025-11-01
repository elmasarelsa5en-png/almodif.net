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
  Home
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Home className="h-5 w-5" />
            <span className="font-semibold">الصفحة الرئيسية</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="#rooms">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                الغرف
              </Button>
            </Link>
            <Link href="/public/faq">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                <MessageCircle className="h-4 w-4 ml-2" />
                استفسارات
              </Button>
            </Link>
            <Link href="/guest-app/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calendar className="h-4 w-4 ml-2" />
                احجز الآن
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image Slider */}
      <section className="relative h-[600px] overflow-hidden mt-16">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 z-10" />
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center text-white px-4">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                  {image.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
                  {image.subtitle}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/guest-app/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                      <Calendar className="mr-2 h-5 w-5" />
                      احجز الآن
                    </Button>
                  </Link>
                  <Link href="#rooms">
                    <Button size="lg" variant="outline" className="bg-white/90 hover:bg-white text-blue-900 px-8 py-6 text-lg border-0">
                      استكشف الغرف
                    </Button>
                  </Link>
                  <Link href="/public/faq">
                    <Button size="lg" variant="outline" className="bg-white/90 hover:bg-white text-blue-900 px-8 py-6 text-lg border-0">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      استفسارات عامة
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* About Seven-Son Hotel */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            مرحباً بك في فندق سيفن سون
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            يقع فندق سيفن سون في قلب مدينة أبها الساحرة، حيث يجمع بين الفخامة والراحة والضيافة العربية الأصيلة. 
            نوفر لك تجربة إقامة لا تُنسى مع خدمات متميزة ومرافق حديثة تلبي جميع احتياجاتك.
          </p>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">الموقع</h3>
              <p className="text-gray-600 text-lg">
                العنوان الجديد - مدينة أبها، المملكة العربية السعودية
              </p>
              <p className="text-gray-500 mt-2">
                في موقع استراتيجي يسهل الوصول إليه من جميع أنحاء المدينة
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">للحجز والاستفسار</p>
                <a href="tel:+966504755400" className="text-lg font-semibold hover:text-blue-600 transition">
                  +966 50 475 5400
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <a href="mailto:info@almodif.net" className="text-lg font-semibold hover:text-blue-600 transition">
                  info@almodif.net
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Amenities */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            الخدمات والمرافق
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={service.url}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-bold text-white text-lg text-center drop-shadow-lg">
                      {service.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms & Suites */}
      <section id="rooms" className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          الغرف والأجنحة
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          اختر من بين مجموعة واسعة من الغرف والأجنحة الفاخرة
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الغرف...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow">
            <p className="text-gray-500 text-lg">لا توجد غرف متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                {/* Room Image */}
                <div className="relative h-64 bg-gray-200">
                  {room.images && room.images.length > 0 ? (
                    <Image
                      src={room.images[0].url}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Star className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                    {room.type}
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  {room.nameEn && (
                    <p className="text-gray-500 text-sm mb-3" dir="ltr">
                      {room.nameEn}
                    </p>
                  )}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Room Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-500">المساحة</p>
                      <p className="font-semibold text-blue-900">{room.area} م²</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-500">السعة</p>
                      <p className="font-semibold text-green-900">{room.maxGuests} أشخاص</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">المرافق:</p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            +{room.amenities.length - 3} المزيد
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="border-t pt-4">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-blue-600">
                          {room.price.daily}
                        </span>
                        <span className="text-gray-500 mr-2">ريال / ليلة</span>
                      </div>
                      {room.price.weekly && (
                        <div className="text-left">
                          <p className="text-sm text-gray-500">أسبوعي</p>
                          <p className="font-semibold text-gray-900">{room.price.weekly} ر.س</p>
                        </div>
                      )}
                    </div>

                    <Link href="/guest-app/login">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg">
                        احجز الآن
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            جاهز لتجربة إقامة استثنائية؟
          </h2>
          <p className="text-xl text-white/90 mb-8">
            احجز الآن واستمتع بأفضل الأسعار والخدمات
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/guest-app/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-xl">
                <Calendar className="mr-2 h-6 w-6" />
                ابدأ الحجز الآن
              </Button>
            </Link>
            <Link href="/public/faq">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-xl">
                <MessageCircle className="mr-2 h-6 w-6" />
                لديك استفسار؟
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">فندق سيفن سون</h3>
              <p className="text-gray-400 leading-relaxed">
                تجربة فندقية فاخرة في قلب أبها مع أفضل الخدمات والضيافة
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><Link href="#rooms" className="text-gray-400 hover:text-white transition">الغرف</Link></li>
                <li><Link href="/public/faq" className="text-gray-400 hover:text-white transition">الاستفسارات</Link></li>
                <li><Link href="/guest-app/login" className="text-gray-400 hover:text-white transition">احجز الآن</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+966504755400" className="hover:text-white transition">+966 50 475 5400</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:info@almodif.net" className="hover:text-white transition">info@almodif.net</a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>أبها، المملكة العربية السعودية</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 فندق سيفن سون. جميع الحقوق محفوظة.</p>
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
