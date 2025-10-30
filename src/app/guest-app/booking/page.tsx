'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, Bed, Wifi, Tv, 
  Coffee, Car, AirVent, Waves, Star, MapPin,
  Phone, Mail, User, CreditCard, Check, Loader2,
  Home, Building2, Hotel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    phone: '',
    email: '',
    nationalId: '',
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
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('status', '==', 'available'));
      const snapshot = await getDocs(q);
      
      const roomsData: Room[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          number: data.number || '',
          type: data.type || 'غرفة',
          price: data.pricePerNight || 0,
          capacity: data.capacity || 2,
          amenities: data.amenities || [],
          available: data.status === 'available',
          images: data.images || [],
          description: data.description
        };
      });

      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
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

      setStep(4);
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all cursor-pointer group hover:scale-105">
                        <CardContent className="p-0">
                          {/* Room Image */}
                          <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {room.type === 'شقة' ? (
                                <Building2 className="w-20 h-20 text-white/40" />
                              ) : (
                                <Bed className="w-20 h-20 text-white/40" />
                              )}
                            </div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                              <span className="text-purple-600 font-bold">{room.number}</span>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-bold text-white">{room.type}</h3>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-blue-200 mb-4">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">يستوعب {room.capacity} أشخاص</span>
                            </div>

                            {/* Amenities */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {room.amenities.slice(0, 6).map((amenity, i) => {
                                const Icon = amenityIcons[amenity] || Star;
                                return (
                                  <div key={i} className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
                                    <Icon className="w-4 h-4 text-blue-300" />
                                    <span className="text-xs text-blue-200/80">{amenity}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex items-end justify-between pt-4 border-t border-white/20">
                              <div>
                                <span className="text-3xl font-bold text-white">{room.price}</span>
                                <span className="text-blue-200 text-sm mr-2">ر.س / ليلة</span>
                              </div>
                              <Button
                                onClick={() => handleRoomSelect(room)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              >
                                احجز الآن
                              </Button>
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
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">معلومات الحجز</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        الاسم الكامل
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
                        رقم الجوال
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
                        رقم الهوية / الإقامة
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
                        <Calendar className="w-4 h-4" />
                        تاريخ الدخول
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
                        تاريخ الخروج
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
                        عدد النزلاء
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

                  <Button
                    onClick={() => setStep(3)}
                    disabled={!bookingData.guestName || !bookingData.phone || !bookingData.checkIn || !bookingData.checkOut}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                  >
                    التالي - مراجعة الحجز
                  </Button>
                </CardContent>
              </Card>
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
    </div>
  );
}
