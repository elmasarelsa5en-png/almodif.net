'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, Bed, Wifi, Tv, 
  Coffee, Car, AirVent, Waves, Star, MapPin,
  Phone, Mail, User, CreditCard, Check, Loader2,
  Home, Building2, Hotel, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notificationService } from '@/lib/notifications/notification-service';

interface Room {
  id: string;
  number: string;
  type: 'غرفة' | 'شقة';
  price: number;
  capacity: number;
  amenities: string[];
  available: boolean;
  images?: string[];
  description?: string;
}

interface Companion {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  relationship: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [bookingData, setBookingData] = useState({
    guestName: '',
    phone: '',
    email: '',
    nationalId: '',
    idCopyNumber: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    notes: ''
  });

  useEffect(() => {
    loadAvailableRooms();
  }, []);

  const loadAvailableRooms = async () => {
    try {
      setLoading(true);
      
      // 1. Load room types from catalog (الأنواع والصور والأوصاف)
      const catalogRef = collection(db, 'rooms_catalog');
      const catalogSnapshot = await getDocs(catalogRef);
      
      if (catalogSnapshot.empty) {
        console.warn('No rooms found in catalog');
        setLoading(false);
        return;
      }

      // 2. Load today's availability from calendar
      const today = new Date();
      const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const calendarDoc = await getDoc(doc(db, 'calendar_availability', monthKey));
      
      let availabilityData: any = {};
      if (calendarDoc.exists()) {
        const prices = calendarDoc.data().prices || [];
        const todayStr = today.toISOString().split('T')[0];
        
        // استخراج البيانات المتاحة على موقع الفندق اليوم
        prices.forEach((dayPrice: any) => {
          if (dayPrice.date === todayStr) {
            const websitePlatform = dayPrice.platforms?.find((p: any) => p.platformId === 'website');
            if (websitePlatform && websitePlatform.available && websitePlatform.availableUnits > 0) {
              availabilityData[dayPrice.roomTypeId] = {
                available: true,
                price: websitePlatform.price,
                units: websitePlatform.availableUnits
              };
            }
          }
        });
      }

      // 3. Combine catalog data with availability
      const roomsData: Room[] = catalogSnapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          const roomId = docSnap.id;
          
          // تحقق من التوفر في التقويم
          const availability = availabilityData[roomId];
          
          // إذا لم تكن متاحة في التقويم، لا تعرضها
          if (!availability) {
            return null;
          }

          return {
            id: roomId,
            number: data.name || data.roomNumber || '',
            type: data.type || 'غرفة',
            price: availability.price || data.basePrice || data.price || 0,
            capacity: data.maxGuests || data.capacity || 2,
            amenities: data.amenities || [],
            available: availability.available,
            images: data.images || [],
            description: data.description || data.details || ''
          };
        })
        .filter(room => room !== null) as Room[];
      
      setRooms(roomsData);
      
      if (roomsData.length === 0) {
        console.log('No rooms available from calendar today');
      }
      
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    // التحقق من تسجيل الدخول أولاً
    const guestSession = localStorage.getItem('guest_session');
    
    if (!guestSession) {
      // عرض modal فاخر
      setLoginMessage('يجب تسجيل الدخول أولاً للمتابعة في عملية الحجز');
      setShowLoginModal(true);
      return;
    }

    // التحقق من حالة الضيف
    try {
      const guestData = JSON.parse(guestSession);
      if (guestData.status !== 'checked-in') {
        setLoginMessage('يجب تسجيل الدخول كضيف نشط للحجز');
        setShowLoginModal(true);
        return;
      }
    } catch (error) {
      console.error('Error parsing guest session:', error);
      setLoginMessage('يجب تسجيل الدخول أولاً للمتابعة');
      setShowLoginModal(true);
      return;
    }

    // المتابعة في عملية الحجز
    setSelectedRoom(room);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const addCompanion = () => {
    const newCompanion: Companion = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      nationalId: '',
      relationship: ''
    };
    setCompanions([...companions, newCompanion]);
  };

  const updateCompanion = (id: string, field: keyof Companion, value: string) => {
    setCompanions(companions.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const removeCompanion = (id: string) => {
    setCompanions(companions.filter(comp => comp.id !== id));
  };

  const nextImage = (roomId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (roomId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price * calculateNights();
  };

  const handleSubmitBooking = async () => {
    if (!selectedRoom) return;

    try {
      setSubmitting(true);

      const bookingDoc = {
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.number,
        roomType: selectedRoom.type,
        guestName: bookingData.guestName,
        guestPhone: bookingData.phone,
        guestEmail: bookingData.email,
        guestNationalId: bookingData.nationalId,
        idCopyNumber: bookingData.idCopyNumber,
        companions: companions,
        checkInDate: Timestamp.fromDate(new Date(bookingData.checkIn)),
        checkOutDate: Timestamp.fromDate(new Date(bookingData.checkOut)),
        numberOfGuests: bookingData.guests,
        notes: bookingData.notes,
        pricePerNight: selectedRoom.price,
        totalNights: calculateNights(),
        totalAmount: calculateTotal(),
        status: 'pending',
        source: 'guest-app',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingDoc);
      
      // 🔔 إرسال إشعار للإدارة عن الحجز الجديد
      try {
        await notificationService.sendNotification('in_app', 'admin', {
          body: `حجز جديد من ${bookingData.guestName} - غرفة ${selectedRoom.number}`,
          type: 'booking_confirmation',
          priority: 'high',
          metadata: {
            bookingId: docRef.id,
            guestName: bookingData.guestName,
            roomNumber: selectedRoom.number,
            checkIn: bookingData.checkIn,
            totalAmount: calculateTotal()
          }
        });
        
        // تشغيل صوت التنبيه
        if (typeof window !== 'undefined') {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(err => console.log('Could not play notification sound:', err));
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // لا نوقف عملية الحجز إذا فشل الإشعار
      }
      
      // إرسال إشعار للضيف (WhatsApp/SMS/Email)
      try {
        await notificationService.sendBookingConfirmation(
          docRef.id,
          bookingData.phone,
          bookingData.email,
          bookingData.guestName
        );
      } catch (guestNotifError) {
        console.error('Error sending guest notification:', guestNotifError);
      }
      
      // حفظ معلومات الضيف في session
      const guestSession = {
        name: bookingData.guestName,
        phone: bookingData.phone,
        email: bookingData.email,
        roomNumber: selectedRoom.number,
        bookingId: docRef.id,
        loginTime: new Date().toISOString(),
        isGuest: true
      };
      localStorage.setItem('guest_session', JSON.stringify(guestSession));

      // التوجيه لصفحة تأكيد الحجز والدفع
      router.push(`/guest-app/booking-confirmation?id=${docRef.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const amenityIcons: Record<string, any> = {
    'واي فاي': Wifi,
    'تلفاز': Tv,
    'قهوة': Coffee,
    'موقف سيارات': Car,
    'تكييف': AirVent,
    'حمام سباحة': Waves
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => step === 1 ? router.back() : setStep(prev => prev - 1)}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Home className="w-8 h-8" />
              حجز غرفة / شقة
            </h1>
            <p className="text-blue-200">اختر المكان المثالي لإقامتك</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'اختر الغرفة' },
              { num: 2, label: 'البيانات' },
              { num: 3, label: 'التأكيد' },
              { num: 4, label: 'تم الحجز' }
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl scale-110' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                  </div>
                  <span className="text-white text-xs mt-2">{s.label}</span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > s.num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Room */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              ) : rooms.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-12 text-center">
                    <Hotel className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      لا توجد غرف متاحة حالياً
                    </h3>
                    <p className="text-blue-200">
                      يرجى المحاولة لاحقاً أو الاتصال بالاستقبال
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {rooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleRoomSelect(room)}
                      className="cursor-pointer"
                    >
                      <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-blue-400/50 transition-all overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/20">
                        <CardContent className="p-0">
                          {/* Room Images Carousel */}
                          <div className="relative h-80 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                            {room.images && room.images.length > 0 ? (
                              <div className="relative h-full">
                                {/* Current Image */}
                                <img 
                                  src={room.images[currentImageIndex[room.id] || 0]} 
                                  alt={`${room.number} - صورة ${(currentImageIndex[room.id] || 0) + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                
                                {/* Navigation Arrows - Only show if more than 1 image */}
                                {room.images.length > 1 && (
                                  <>
                                    {/* Previous Button */}
                                    <button
                                      onClick={(e) => prevImage(room.id, room.images!.length, e)}
                                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                      <ArrowRight className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Next Button */}
                                    <button
                                      onClick={(e) => nextImage(room.id, room.images!.length, e)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                      <ArrowRight className="w-5 h-5 rotate-180" />
                                    </button>

                                    {/* Image Counter */}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                      {(currentImageIndex[room.id] || 0) + 1} / {room.images.length}
                                    </div>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                      {room.images.map((_, i) => (
                                        <button
                                          key={i}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(prev => ({ ...prev, [room.id]: i }));
                                          }}
                                          className={`transition-all ${
                                            i === (currentImageIndex[room.id] || 0)
                                              ? 'w-8 h-2 bg-white'
                                              : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                                          } rounded-full backdrop-blur-sm`}
                                        />
                                      ))}
                                    </div>
                                  </>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                {room.type === 'شقة' ? (
                                  <Building2 className="w-24 h-24 text-white/30" />
                                ) : (
                                  <Bed className="w-24 h-24 text-white/30" />
                                )}
                              </div>
                            )}
                            
                            {/* Room Type Badge */}
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                              <span className="text-purple-600 font-bold text-lg">{room.type}</span>
                            </div>
                            
                            {/* Room Number */}
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-xl shadow-lg">
                              <span className="text-white font-bold">{room.number}</span>
                            </div>

                            {/* Featured Badge */}
                            <div className="absolute bottom-4 right-4">
                              <div className="flex items-center gap-2 bg-yellow-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                <Star className="w-4 h-4 text-white fill-white" />
                                <span className="text-white font-bold text-sm">مميزة</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-4">
                            {/* Description */}
                            {room.description && (
                              <p className="text-blue-100 text-sm leading-relaxed line-clamp-2">
                                {room.description}
                              </p>
                            )}

                            {/* Room Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                                <Users className="w-5 h-5 text-blue-400" />
                                <div>
                                  <div className="text-xs text-blue-200/70">السعة</div>
                                  <div className="text-white font-bold">{room.capacity} أشخاص</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                                <Bed className="w-5 h-5 text-purple-400" />
                                <div>
                                  <div className="text-xs text-blue-200/70">الأسرّة</div>
                                  <div className="text-white font-bold">{room.capacity > 2 ? 'متعددة' : 'مزدوج'}</div>
                                </div>
                              </div>

                              {room.amenities && room.amenities.includes('واي فاي مجاني') && (
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                                  <Wifi className="w-5 h-5 text-green-400" />
                                  <div>
                                    <div className="text-xs text-blue-200/70">الإنترنت</div>
                                    <div className="text-white font-bold">واي فاي</div>
                                  </div>
                                </div>
                              )}

                              {room.amenities && room.amenities.includes('تلفزيون') && (
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                                  <Tv className="w-5 h-5 text-cyan-400" />
                                  <div>
                                    <div className="text-xs text-blue-200/70">الترفيه</div>
                                    <div className="text-white font-bold">تلفزيون</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Amenities Pills */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {room.amenities.slice(0, 6).map((amenity, i) => {
                                  const Icon = amenityIcons[amenity] || Star;
                                  return (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                                      <Icon className="w-3.5 h-3.5 text-blue-300" />
                                      <span className="text-xs text-blue-100 font-medium">{amenity}</span>
                                    </div>
                                  );
                                })}
                                {room.amenities.length > 6 && (
                                  <div className="flex items-center gap-1.5 bg-purple-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-400/30">
                                    <span className="text-xs text-purple-200 font-bold">+{room.amenities.length - 6} المزيد</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Price and Book Button */}
                            <div className="flex items-end justify-between pt-4 border-t border-white/20">
                              <div className="flex flex-col">
                                <span className="text-blue-200/70 text-sm mb-1">السعر يبدأ من</span>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-4xl font-bold text-white">{room.price}</span>
                                  <span className="text-blue-200 font-medium">ر.س</span>
                                </div>
                                <span className="text-blue-300/60 text-xs mt-1">لليلة الواحدة</span>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRoomSelect(room);
                                }}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                              >
                                <Check className="w-5 h-5 ml-2" />
                                احجز الآن
                              </Button>
                            </div>

                            {/* Availability Status */}
                            <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-green-300 text-sm font-medium">متاحة للحجز الآن</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Guest Info */}
          {step === 2 && selectedRoom && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Main Guest Info */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="w-6 h-6" />
                    بيانات النزيل الأساسي
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        الاسم الكامل *
                      </Label>
                      <Input
                        value={bookingData.guestName}
                        onChange={(e) => handleInputChange('guestName', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        رقم الجوال *
                      </Label>
                      <Input
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </Label>
                      <Input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        رقم الهوية / الإقامة *
                      </Label>
                      <Input
                        value={bookingData.nationalId}
                        onChange={(e) => handleInputChange('nationalId', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="1xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        رقم نسخة البطاقة
                      </Label>
                      <Input
                        value={bookingData.idCopyNumber}
                        onChange={(e) => handleInputChange('idCopyNumber', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        placeholder="رقم نسخة الهوية"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        تاريخ الدخول *
                      </Label>
                      <Input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-white/10 border-white/20 text-white"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        تاريخ الخروج *
                      </Label>
                      <Input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        className="bg-white/10 border-white/20 text-white"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        عدد النزلاء *
                      </Label>
                      <Input
                        type="number"
                        value={bookingData.guests}
                        onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                        min={1}
                        max={selectedRoom.capacity}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-white mb-2">ملاحظات إضافية (اختياري)</Label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/40 min-h-[100px]"
                        placeholder="أي طلبات خاصة؟"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Companions Section */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users className="w-6 h-6" />
                      المرافقين ({companions.length})
                    </h2>
                    <Button
                      onClick={addCompanion}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Users className="w-4 h-4 ml-2" />
                      إضافة مرافق
                    </Button>
                  </div>

                  {companions.length === 0 ? (
                    <div className="text-center py-8 text-blue-200">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا يوجد مرافقين حتى الآن</p>
                      <p className="text-sm text-blue-300/70 mt-1">اضغط على "إضافة مرافق" لإضافة مرافق جديد</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence>
                        {companions.map((companion, index) => (
                          <motion.div
                            key={companion.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-white">مرافق {index + 1}</h3>
                              <Button
                                onClick={() => removeCompanion(companion.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white mb-2 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  الاسم الكامل
                                </Label>
                                <Input
                                  value={companion.name}
                                  onChange={(e) => updateCompanion(companion.id, 'name', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                  placeholder="أدخل الاسم الكامل"
                                />
                              </div>

                              <div>
                                <Label className="text-white mb-2 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  صلة القرابة
                                </Label>
                                <select
                                  value={companion.relationship}
                                  onChange={(e) => updateCompanion(companion.id, 'relationship', e.target.value)}
                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                                >
                                  <option value="" className="bg-slate-800">اختر صلة القرابة</option>
                                  <option value="زوج/زوجة" className="bg-slate-800">زوج/زوجة</option>
                                  <option value="ابن/ابنة" className="bg-slate-800">ابن/ابنة</option>
                                  <option value="أخ/أخت" className="bg-slate-800">أخ/أخت</option>
                                  <option value="أب/أم" className="bg-slate-800">أب/أم</option>
                                  <option value="صديق" className="bg-slate-800">صديق</option>
                                  <option value="قريب" className="bg-slate-800">قريب</option>
                                  <option value="أخرى" className="bg-slate-800">أخرى</option>
                                </select>
                              </div>

                              <div>
                                <Label className="text-white mb-2 flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  رقم الجوال
                                </Label>
                                <Input
                                  value={companion.phone}
                                  onChange={(e) => updateCompanion(companion.id, 'phone', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                  placeholder="05xxxxxxxx"
                                  dir="ltr"
                                />
                              </div>

                              <div>
                                <Label className="text-white mb-2 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  البريد الإلكتروني
                                </Label>
                                <Input
                                  type="email"
                                  value={companion.email}
                                  onChange={(e) => updateCompanion(companion.id, 'email', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                  placeholder="example@email.com"
                                  dir="ltr"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <Label className="text-white mb-2 flex items-center gap-2">
                                  <CreditCard className="w-4 h-4" />
                                  رقم الهوية / الإقامة
                                </Label>
                                <Input
                                  value={companion.nationalId}
                                  onChange={(e) => updateCompanion(companion.id, 'nationalId', e.target.value)}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                                  placeholder="1xxxxxxxxx"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  رجوع
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!bookingData.guestName || !bookingData.phone || !bookingData.nationalId || !bookingData.checkIn || !bookingData.checkOut}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  التالي - مراجعة الحجز
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedRoom && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">مراجعة وتأكيد الحجز</h2>

                  <div className="space-y-6">
                    {/* Room Details */}
                    <div className="bg-white/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">تفاصيل الغرفة</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-blue-200">
                        <div>رقم الغرفة: <span className="text-white font-bold">{selectedRoom.number}</span></div>
                        <div>النوع: <span className="text-white font-bold">{selectedRoom.type}</span></div>
                        <div>السعر: <span className="text-white font-bold">{selectedRoom.price} ر.س / ليلة</span></div>
                        <div>السعة: <span className="text-white font-bold">{selectedRoom.capacity} أشخاص</span></div>
                      </div>
                    </div>

                    {/* Guest Details */}
                    <div className="bg-white/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">معلومات النزيل</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-blue-200">
                        <div>الاسم: <span className="text-white font-bold">{bookingData.guestName}</span></div>
                        <div>الجوال: <span className="text-white font-bold">{bookingData.phone}</span></div>
                        <div>البريد: <span className="text-white font-bold">{bookingData.email}</span></div>
                        <div>الهوية: <span className="text-white font-bold">{bookingData.nationalId}</span></div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white/5 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">مواعيد الإقامة</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-blue-200">
                        <div>الدخول: <span className="text-white font-bold">{bookingData.checkIn}</span></div>
                        <div>الخروج: <span className="text-white font-bold">{bookingData.checkOut}</span></div>
                        <div>عدد الليالي: <span className="text-white font-bold">{calculateNights()}</span></div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">المجموع الكلي:</span>
                        <span className="text-4xl font-bold text-white">{calculateTotal()} <span className="text-xl">ر.س</span></span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitBooking}
                    disabled={submitting}
                    className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        جاري إنشاء الحجز...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        تأكيد الحجز
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  >
                    <Check className="w-12 h-12 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    تم تأكيد الحجز بنجاح! 🎉
                  </h2>
                  <p className="text-blue-200 text-lg mb-8">
                    سيتم التواصل معك قريباً من قبل فريق الاستقبال لتأكيد التفاصيل
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/guest-app')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                    >
                      العودة للصفحة الرئيسية
                    </Button>
                    <Button
                      onClick={() => router.push('/guest-menu/restaurant')}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 py-6 text-lg"
                    >
                      تصفح قائمة الطعام
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Login Required Modal - Luxury Design */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full"
            >
              <Card className="bg-gradient-to-br from-amber-500/95 via-orange-500/95 to-red-500/95 backdrop-blur-xl border-2 border-amber-300/50 shadow-2xl">
                <CardContent className="p-8 text-center">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Warning Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <User className="w-10 h-10 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    تسجيل الدخول مطلوب
                  </h3>

                  {/* Message */}
                  <p className="text-white/90 text-lg mb-8 leading-relaxed">
                    {loginMessage}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setShowLoginModal(false);
                        router.push('/guest-app/login');
                      }}
                      size="lg"
                      className="w-full bg-white text-amber-600 hover:bg-gray-100 font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                    >
                      <User className="w-5 h-5 ml-2" />
                      تسجيل الدخول الآن
                    </Button>
                    
                    <Button
                      onClick={() => setShowLoginModal(false)}
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-white/30 text-white hover:bg-white/10 py-6 text-lg backdrop-blur-sm"
                    >
                      إلغاء
                    </Button>
                  </div>

                  {/* Info Note */}
                  <p className="mt-6 text-white/70 text-sm">
                    💡 يمكنك إنشاء حساب جديد من صفحة تسجيل الدخول
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
