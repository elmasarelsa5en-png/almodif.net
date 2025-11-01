'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Maximize,
  Star,
  X,
  Calendar,
  ArrowRight,
  Sparkles,
  Building2
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
  features?: {
    view?: string;
    bedType?: string;
    bathroom?: string;
  };
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      // تحميل الغرف من rooms_catalog
      const roomsSnapshot = await getDocs(collection(db, 'rooms_catalog'));
      const roomsData = roomsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      
      console.log('📊 إجمالي الغرف:', roomsData.length);
      
      // تحميل availability من calendar للشهر الحالي
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const day = today.getDate();
      
      try {
        const calendarDoc = await getDoc(doc(db, 'calendar_availability', monthKey));
        
        if (calendarDoc.exists()) {
          const calendarData = calendarDoc.data();
          const prices = calendarData.prices || [];
          
          const todayData = prices.find((p: any) => p.day === day);
          
          if (todayData) {
            const availableRoomIds = new Set<string>();
            
            if (todayData.platforms && Array.isArray(todayData.platforms)) {
              todayData.platforms.forEach((platform: any) => {
                if (platform.name === 'website' && platform.available && platform.units > 0) {
                  availableRoomIds.add(platform.roomId);
                }
              });
            }
            
            const availableRooms = roomsData.filter(room => availableRoomIds.has(room.id));
            
            if (availableRooms.length > 0) {
              setRooms(availableRooms);
              setSelectedRoom(availableRooms[0]); // اختيار أول غرفة افتراضياً
            } else {
              const catalogAvailable = roomsData.filter(room => room.available);
              setRooms(catalogAvailable);
              if (catalogAvailable.length > 0) {
                setSelectedRoom(catalogAvailable[0]);
              }
            }
          } else {
            const availableRooms = roomsData.filter(room => room.available);
            setRooms(availableRooms);
            if (availableRooms.length > 0) {
              setSelectedRoom(availableRooms[0]);
            }
          }
        } else {
          const availableRooms = roomsData.filter(room => room.available);
          setRooms(availableRooms);
          if (availableRooms.length > 0) {
            setSelectedRoom(availableRooms[0]);
          }
        }
      } catch (calendarError) {
        console.error('❌ خطأ في تحميل التقويم:', calendarError);
        const availableRooms = roomsData.filter(room => room.available);
        setRooms(availableRooms);
        if (availableRooms.length > 0) {
          setSelectedRoom(availableRooms[0]);
        }
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الغرف:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedRoom && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedRoom.images.length);
    }
  };

  const prevImage = () => {
    if (selectedRoom && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedRoom.images.length) % selectedRoom.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-amber-500 mx-auto"></div>
            <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-amber-500 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-600 text-xl font-semibold">جاري تحميل الغرف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/public/landing" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-amber-400/30 group-hover:ring-amber-500 transition">
                <img 
                  src="/images/seven-son-logo.jpeg" 
                  alt="Seven-Son Hotel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">سيفن سون</h1>
                <p className="text-xs text-amber-600 font-semibold">SEVEN SON HOTEL</p>
              </div>
            </Link>

            {/* Back Button */}
            <Link href="/public/landing">
              <Button variant="outline" className="border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition">
                <ArrowRight className="ml-2 h-5 w-5" />
                العودة للصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 rounded-full mb-4 shadow-md">
              <Building2 className="h-5 w-5 text-amber-600" />
              <span className="text-amber-900 font-bold">الغرف والأجنحة</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              اختر غرفتك المثالية
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              استكشف مجموعتنا الفاخرة من الغرف والأجنحة المصممة خصيصاً لراحتك
            </p>
          </div>

          {/* Room Selection Buttons */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    selectedRoom?.id === room.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white scale-105 shadow-amber-500/50'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border-2 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    <span>{room.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Room Display */}
          {selectedRoom && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Image Slider Section */}
              <div className="relative h-[600px] bg-gradient-to-br from-gray-900 to-gray-800">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div className="relative h-full">
                      <Image
                        src={selectedRoom.images[currentImageIndex].url}
                        alt={selectedRoom.name}
                        fill
                        className="object-cover"
                        priority
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                    </div>

                    {/* Navigation Arrows */}
                    {selectedRoom.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm p-4 rounded-full transition-all shadow-2xl border-2 border-white/50 hover:scale-110"
                          aria-label="Previous image"
                        >
                          <ChevronRight className="h-8 w-8 text-gray-900" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm p-4 rounded-full transition-all shadow-2xl border-2 border-white/50 hover:scale-110"
                          aria-label="Next image"
                        >
                          <ChevronLeft className="h-8 w-8 text-gray-900" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-2xl border-2 border-white/30">
                          {currentImageIndex + 1} / {selectedRoom.images.length}
                        </div>

                        {/* Thumbnail Dots */}
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                          {selectedRoom.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`transition-all rounded-full ${
                                idx === currentImageIndex
                                  ? 'bg-white w-12 h-4'
                                  : 'bg-white/50 hover:bg-white/80 w-4 h-4'
                              }`}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Room Info Overlay */}
                    <div className="absolute top-6 left-6 z-20">
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/50">
                        <span className="text-gray-800 font-bold text-lg">{selectedRoom.type}</span>
                      </div>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-6 right-6 z-20">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/30">
                        <p className="text-xs font-semibold opacity-90">يبدأ من</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{selectedRoom.price.daily}</span>
                          <span className="text-sm">ر.س</span>
                        </div>
                        <p className="text-xs opacity-90">/ ليلة</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <Star className="h-32 w-32 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Room Details Section */}
              <div className="p-10">
                {/* Title */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">{selectedRoom.name}</h2>
                  {selectedRoom.nameEn && (
                    <p className="text-xl text-gray-500 font-medium" dir="ltr">{selectedRoom.nameEn}</p>
                  )}
                </div>

                {/* Description */}
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {selectedRoom.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 text-center">
                    <Maximize className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-blue-600 font-semibold mb-1">المساحة</p>
                    <p className="text-3xl font-bold text-blue-900">{selectedRoom.area} م²</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="text-sm text-green-600 font-semibold mb-1">السعة</p>
                    <p className="text-3xl font-bold text-green-900">{selectedRoom.maxGuests} أشخاص</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 text-center">
                    <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-sm text-purple-600 font-semibold mb-1">التصنيف</p>
                    <p className="text-3xl font-bold text-purple-900">{selectedRoom.type}</p>
                  </div>
                </div>

                {/* Amenities */}
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-amber-500" />
                      المرافق والخدمات
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedRoom.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-amber-50 to-orange-50 text-amber-800 px-4 py-3 rounded-xl border-2 border-amber-200 font-semibold text-center"
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Offers */}
                {(selectedRoom.price.weekly || selectedRoom.price.monthly) && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-green-600" />
                      عروض خاصة متاحة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRoom.price.weekly && (
                        <div className="bg-white p-4 rounded-xl">
                          <span className="text-green-600 font-semibold text-lg">العرض الأسبوعي: </span>
                          <span className="text-green-900 font-bold text-2xl">{selectedRoom.price.weekly} ر.س</span>
                        </div>
                      )}
                      {selectedRoom.price.monthly && (
                        <div className="bg-white p-4 rounded-xl">
                          <span className="text-green-600 font-semibold text-lg">العرض الشهري: </span>
                          <span className="text-green-900 font-bold text-2xl">{selectedRoom.price.monthly} ر.س</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link href="/guest-app/login">
                  <Button className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 text-white py-8 text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-amber-500/50 transition-all border-2 border-amber-400 hover:scale-[1.02]">
                    <Calendar className="mr-3 h-8 w-8" />
                    احجز هذه الغرفة الآن
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No Rooms Message */}
          {rooms.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-2xl font-semibold">لا توجد غرف متاحة حالياً</p>
              <p className="text-gray-400 mt-2 text-lg">يرجى التواصل معنا للاستفسار</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
