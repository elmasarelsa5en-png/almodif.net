'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Calendar, Clock, Hotel, CreditCard, CheckCircle2,
  XCircle, AlertCircle, Download, Phone, Mail, MapPin, Users,
  BedDouble, CalendarDays, DoorOpen, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  paid: number;
  roomType: string;
  guests: number;
  notes?: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guestSession, setGuestSession] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }

    const guestData = JSON.parse(session);
    setGuestSession(guestData);
    loadBookings(guestData);
  }, []);

  const loadBookings = async (guestData: any) => {
    setLoading(true);
    try {
      if (!db) {
        console.warn('Firebase not connected - using sample data');
        loadSampleBookings();
        return;
      }

      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('nationalId', '==', guestData.nationalId),
        orderBy('checkIn', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const bookingsData: Booking[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Booking));
        setBookings(bookingsData);
      } else {
        loadSampleBookings();
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      loadSampleBookings();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleBookings = () => {
    // بيانات تجريبية
    const sampleBookings: Booking[] = [
      {
        id: '1',
        guestName: guestSession?.name || 'عقرم المضيف',
        roomNumber: guestSession?.roomNumber || '101',
        checkIn: '2025-10-25',
        checkOut: '2025-11-02',
        status: 'active',
        totalAmount: 3500,
        paid: 3500,
        roomType: 'غرفة مفردة ديلوكس',
        guests: 1,
        notes: 'طلب غرفة هادئة'
      },
      {
        id: '2',
        guestName: guestSession?.name || 'عقرم المضيف',
        roomNumber: '205',
        checkIn: '2025-09-15',
        checkOut: '2025-09-20',
        status: 'completed',
        totalAmount: 2500,
        paid: 2500,
        roomType: 'غرفة مزدوجة',
        guests: 2
      },
      {
        id: '3',
        guestName: guestSession?.name || 'عقرم المضيف',
        roomNumber: '310',
        checkIn: '2025-08-01',
        checkOut: '2025-08-10',
        status: 'completed',
        totalAmount: 4500,
        paid: 4500,
        roomType: 'جناح عائلي',
        guests: 4
      }
    ];
    setBookings(sampleBookings);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'completed':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'cancelled':
        return 'from-red-500/20 to-pink-500/20 border-red-400/30';
      default:
        return 'from-amber-500/20 to-orange-500/20 border-amber-400/30';
    }
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' ? true : booking.status === filter
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 179, 69, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
            backgroundSize: '400% 400%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-amber-500/30 shadow-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/20"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-purple-200">
                  حجوزاتي
                </h1>
                <p className="text-sm text-slate-400 mt-1">إدارة جميع حجوزاتك</p>
              </div>
            </div>
            
            {guestSession && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {guestSession.name?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-amber-100 font-medium">{guestSession.name}</p>
                  <p className="text-xs text-slate-400">غرفة {guestSession.roomNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8 flex-wrap"
        >
          {[
            { key: 'all', label: 'الكل', color: 'amber' },
            { key: 'active', label: 'النشطة', color: 'green' },
            { key: 'completed', label: 'المكتملة', color: 'blue' },
            { key: 'cancelled', label: 'الملغية', color: 'red' }
          ].map((tab, index) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key as any)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                filter === tab.key
                  ? `bg-${tab.color}-500/30 text-${tab.color}-100 border-2 border-${tab.color}-400/50 shadow-lg shadow-${tab.color}-500/20`
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800/80 hover:text-slate-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {tab.key === 'all' ? bookings.length : bookings.filter(b => b.status === tab.key).length}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-amber-500/30 border-t-amber-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-slate-400">جاري تحميل الحجوزات...</p>
            </motion.div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Calendar className="w-24 h-24 mx-auto text-slate-600 mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">لا توجد حجوزات</h3>
            <p className="text-slate-500 mb-6">لم يتم العثور على حجوزات {filter !== 'all' && getStatusText(filter)}</p>
            <Button
              onClick={() => router.push('/guest-app/booking')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              احجز الآن
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative bg-gradient-to-br ${getStatusColor(booking.status)} backdrop-blur-xl border overflow-hidden group hover:shadow-2xl transition-all duration-300`}>
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      {/* Booking Header */}
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Hotel className="w-7 h-7 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">غرفة {booking.roomNumber}</h3>
                          <p className="text-sm text-slate-300">{booking.roomType}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusIcon(booking.status)}
                            <span className="text-sm font-medium text-white">{getStatusText(booking.status)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Booking ID */}
                      <div className="text-left">
                        <p className="text-xs text-slate-400">رقم الحجز</p>
                        <p className="text-sm font-mono text-amber-300">#{booking.id}</p>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {/* Check-in */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">تسجيل الدخول</p>
                          <p className="text-sm font-medium text-white">{formatDate(booking.checkIn)}</p>
                        </div>
                      </div>

                      {/* Check-out */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <DoorOpen className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">تسجيل الخروج</p>
                          <p className="text-sm font-medium text-white">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">مدة الإقامة</p>
                          <p className="text-sm font-medium text-white">{calculateDuration(booking.checkIn, booking.checkOut)} ليلة</p>
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">عدد النزلاء</p>
                          <p className="text-sm font-medium text-white">{booking.guests} {booking.guests === 1 ? 'شخص' : 'أشخاص'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-xl border border-amber-400/20 mb-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-amber-400" />
                        <div>
                          <p className="text-sm text-slate-300">المبلغ الإجمالي</p>
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-100">
                            {booking.totalAmount.toLocaleString()} ريال
                          </p>
                        </div>
                      </div>
                      {booking.paid >= booking.totalAmount ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-green-300">مدفوع</span>
                        </div>
                      ) : (
                        <div className="text-left">
                          <p className="text-xs text-slate-400">المتبقي</p>
                          <p className="text-lg font-bold text-red-300">
                            {(booking.totalAmount - booking.paid).toLocaleString()} ريال
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="p-3 bg-white/5 rounded-lg border border-slate-700/50 mb-4">
                        <p className="text-xs text-slate-400 mb-1">ملاحظات:</p>
                        <p className="text-sm text-slate-300">{booking.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        تحميل الفاتورة
                      </Button>
                      {booking.status === 'active' && (
                        <Button
                          onClick={() => router.push('/guest-app/extend-stay')}
                          variant="outline"
                          className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                        >
                          تمديد الإقامة
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
