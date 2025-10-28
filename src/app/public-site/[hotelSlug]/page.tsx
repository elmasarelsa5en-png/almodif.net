'use client';

import { useEffect, useState } from 'react';
import { loadWebsiteSettings, WebsiteSettings } from '@/lib/website-settings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import {
  Calendar,
  Users,
  Search,
  Star,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Shield,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Heart,
  TrendingUp
} from 'lucide-react';

export default function PublicHomePage({ params }: { params: { hotelSlug: string } }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);
  const hotelSlug = params.hotelSlug;

  useEffect(() => {
    // Load settings
    const loaded = loadWebsiteSettings();
    setSettings(loaded);

    // Load rooms from localStorage
    const storedRooms = localStorage.getItem('hotel-rooms');
    if (storedRooms) {
      const allRooms = JSON.parse(storedRooms);
      // Get first 6 rooms for featured section
      setRooms(allRooms.slice(0, 6));
    }
    
    setLoading(false);
  }, []);

  const testimonials = [
    {
      name: 'أحمد محمد',
      rating: 5,
      text: 'تجربة رائعة! الغرف نظيفة جداً والخدمة ممتازة. أنصح بشدة بالإقامة هنا.',
      date: 'منذ أسبوعين'
    },
    {
      name: 'فاطمة علي',
      rating: 5,
      text: 'موقع مميز والموظفين متعاونين جداً. الإفطار كان لذيذ والأسعار معقولة.',
      date: 'منذ شهر'
    },
    {
      name: 'خالد عبدالله',
      rating: 5,
      text: 'أفضل فندق أقمت فيه! المرافق حديثة والمكان هادئ ومريح للعائلات.',
      date: 'منذ 3 أسابيع'
    }
  ];

  const features = [
    { icon: Wifi, title: 'إنترنت مجاني', description: 'Wi-Fi عالي السرعة' },
    { icon: Car, title: 'موقف سيارات', description: 'مجاني للنزلاء' },
    { icon: Utensils, title: 'مطعم', description: 'مأكولات عالمية' },
    { icon: Coffee, title: 'كافيه', description: 'قهوة ومشروبات' },
    { icon: Waves, title: 'مسبح', description: 'مسبح خارجي' },
    { icon: Dumbbell, title: 'نادي رياضي', description: 'معدات حديثة' },
    { icon: Shield, title: 'أمن وحماية', description: 'حراسة 24 ساعة' },
    { icon: Clock, title: 'خدمة 24/7', description: 'دعم مستمر' },
  ];

  const handleSearch = () => {
    if (checkIn && checkOut && guests && hotelSlug) {
      window.location.href = `/public-site/${hotelSlug}/booking?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Stunning with Gradient */}
      <section
        className="relative h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${settings.theme.primaryColor}ee, ${settings.theme.secondaryColor}ee, ${settings.theme.accentColor}ee)`,
        }}
      >
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">أفضل فندق في المنطقة</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {settings.hotelName}
            </h1>
            
            {settings.tagline && (
              <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {settings.tagline}
              </p>
            )}

            <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {settings.description}
            </p>

            {/* Search Widget */}
            {settings.bookingSettings.enableOnlineBooking && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الوصول</label>
                    <Input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ المغادرة</label>
                    <Input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عدد النزلاء</label>
                    <div className="relative">
                      <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full pr-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSearch}
                      className="w-full h-10 text-white font-medium"
                      style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
                    >
                      <Search className="h-4 w-4 ml-2" />
                      ابحث الآن
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                <Award className="h-8 w-8" style={{ color: settings.theme.primaryColor }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: settings.theme.primaryColor }}>15+</div>
              <div className="text-gray-600">سنوات خبرة</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                <Heart className="h-8 w-8" style={{ color: settings.theme.secondaryColor }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: settings.theme.secondaryColor }}>5,000+</div>
              <div className="text-gray-600">عميل سعيد</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                <Star className="h-8 w-8" style={{ color: settings.theme.accentColor }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: settings.theme.accentColor }}>4.9/5</div>
              <div className="text-gray-600">تقييم العملاء</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                <TrendingUp className="h-8 w-8" style={{ color: settings.theme.primaryColor }} />
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: settings.theme.primaryColor }}>{rooms.length}</div>
              <div className="text-gray-600">غرفة وجناح</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      {rooms.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-sm font-medium mb-4"
                style={{ color: settings.theme.accentColor }}>
                <Sparkles className="h-4 w-4" />
                <span>غرفنا المميزة</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">اختر غرفتك المثالية</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                نوفر مجموعة متنوعة من الغرف والأجنحة المصممة لتلبية احتياجاتك
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative h-64 bg-gradient-to-br overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold opacity-10">{room.number}</div>
                    </div>
                    {room.status === 'available' && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        متاح الآن
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{room.type}</h3>
                        <p className="text-gray-600">غرفة رقم {room.number}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold" style={{ color: settings.theme.primaryColor }}>
                        {room.price}
                      </span>
                      <span className="text-gray-600">{settings.currency} / ليلة</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        <Users className="h-3 w-3" />
                        <span>حتى {room.capacity} أشخاص</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        <Wifi className="h-3 w-3" />
                        <span>Wi-Fi</span>
                      </div>
                    </div>

                    <Link href={`/public-site/${hotelSlug}/booking?room=${room.id}`}>
                      <Button
                        className="w-full text-white group-hover:shadow-lg transition-all"
                        style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
                      >
                        احجز الآن
                        <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href={`/public-site/${hotelSlug}/rooms`}>
                <Button variant="outline" size="lg" className="group">
                  عرض جميع الغرف
                  <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">المرافق والخدمات</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نوفر جميع وسائل الراحة والخدمات لضمان إقامة مريحة وممتعة
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}
                >
                  <feature.icon className="h-8 w-8" style={{ color: settings.theme.primaryColor }} />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">ماذا يقول عملاؤنا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              آراء حقيقية من نزلائنا الكرام
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br p-8 text-white shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.secondaryColor})` }}>
              <CardContent className="p-0">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-xl mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-white/80 text-sm">{testimonials[currentTestimonial].date}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {settings.bookingSettings.enableOnlineBooking && (
        <section className="py-20 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.secondaryColor}, ${settings.theme.accentColor})` }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">جاهز لتجربة إقامة لا تُنسى؟</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              احجز الآن واستمتع بخصومات حصرية وعروض مميزة
            </p>
            <Link href={`/public-site/${hotelSlug}/booking`}>
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 shadow-2xl text-lg px-8 py-6 h-auto"
                style={{ color: settings.theme.primaryColor }}
              >
                احجز الآن
                <ChevronLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">تواصل معنا</h2>
              <p className="text-gray-600 mb-8">
                نحن هنا للإجابة على جميع استفساراتك ومساعدتك في حجز إقامتك
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                    <Phone className="h-5 w-5" style={{ color: settings.theme.primaryColor }} />
                  </div>
                  <div>
                    <div className="font-medium">الهاتف</div>
                    <a href={`tel:${settings.phone}`} className="text-gray-600 hover:underline">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                    <Mail className="h-5 w-5" style={{ color: settings.theme.primaryColor }} />
                  </div>
                  <div>
                    <div className="font-medium">البريد الإلكتروني</div>
                    <a href={`mailto:${settings.email}`} className="text-gray-600 hover:underline">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}20, ${settings.theme.accentColor}20)` }}>
                    <MapPin className="h-5 w-5" style={{ color: settings.theme.primaryColor }} />
                  </div>
                  <div>
                    <div className="font-medium">العنوان</div>
                    <div className="text-gray-600">{settings.address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h3>
              <form className="space-y-4">
                <Input placeholder="الاسم الكامل" className="w-full" />
                <Input type="email" placeholder="البريد الإلكتروني" className="w-full" />
                <Input placeholder="رقم الهاتف" className="w-full" />
                <textarea
                  placeholder="رسالتك..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                ></textarea>
                <Button
                  type="button"
                  className="w-full text-white"
                  style={{ background: `linear-gradient(135deg, ${settings.theme.primaryColor}, ${settings.theme.accentColor})` }}
                >
                  إرسال الرسالة
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
