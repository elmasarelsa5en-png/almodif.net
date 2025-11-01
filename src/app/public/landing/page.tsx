'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

export default function PublicLandingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // صور رئيسية للفندق (Hero Slider)
  const heroImages = [
    {
      url: '/images/hotel-exterior.jpg',
      title: 'فندق سيفن سون',
      subtitle: 'تجربة فندقية استثنائية في قلب أبها'
    },
    {
      url: '/images/seven-son-logo.jpeg',
      title: 'الضيافة الفاخرة',
      subtitle: 'راحتك هي أولويتنا'
    }
  ];

  useEffect(() => {
    loadRooms();
    
    // Auto-slide hero images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const roomsSnapshot = await getDocs(collection(db, 'rooms_catalog'));
      const roomsData = roomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      
      // عرض الغرف المتاحة فقط
      setRooms(roomsData.filter(room => room.available));
    } catch (error) {
      console.error('خطأ في تحميل الغرف:', error);
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
            {[
              { icon: Wifi, label: 'إنترنت فائق السرعة', color: 'bg-blue-100 text-blue-600' },
              { icon: Coffee, label: 'كافيه ومطعم', color: 'bg-amber-100 text-amber-600' },
              { icon: Utensils, label: 'خدمة الغرف 24/7', color: 'bg-green-100 text-green-600' },
              { icon: Car, label: 'مواقف مجانية', color: 'bg-gray-100 text-gray-600' },
              { icon: Dumbbell, label: 'صالة رياضية', color: 'bg-red-100 text-red-600' },
              { icon: Waves, label: 'حمام سباحة', color: 'bg-cyan-100 text-cyan-600' },
              { icon: ShieldCheck, label: 'أمن وحراسة', color: 'bg-indigo-100 text-indigo-600' },
              { icon: Clock, label: 'استقبال 24 ساعة', color: 'bg-purple-100 text-purple-600' }
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className={`${service.color.split(' ')[0]} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <service.icon className={`h-8 w-8 ${service.color.split(' ')[1]}`} />
                </div>
                <p className="font-semibold text-gray-900">{service.label}</p>
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
