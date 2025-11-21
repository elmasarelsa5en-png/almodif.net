'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Lock, Calendar, Users, DollarSign,
  Download, Printer, Clock, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OpenBooking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalPrice: number;
  amountPaid: number;
  remaining: number;
  status: string;
  guestPhone?: string;
}

export default function OpenReservationsReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<OpenBooking[]>([]);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    currentGuests: 0,
    upcomingGuests: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalRemaining: 0
  });

  useEffect(() => {
    loadOpenBookings();
  }, []);

  const loadOpenBookings = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('status', '==', 'confirmed'),
        where('checkOut', '>=', Timestamp.fromDate(today)),
        orderBy('checkOut', 'asc')
      );
      const bookingsSnap = await getDocs(bookingsQuery);

      const bookingsData: OpenBooking[] = [];
      let totalRevenue = 0;
      let totalPaid = 0;
      let currentCount = 0;
      let upcomingCount = 0;

      for (const doc of bookingsSnap.docs) {
        const data = doc.data();
        const checkIn = data.checkIn?.toDate() || new Date();
        const checkOut = data.checkOut?.toDate() || new Date();
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = data.totalPrice || 0;
        const paid = data.amountPaid || 0;

        // Check if currently staying or upcoming
        if (checkIn <= today) {
          currentCount++;
        } else {
          upcomingCount++;
        }

        totalRevenue += totalPrice;
        totalPaid += paid;

        bookingsData.push({
          id: doc.id,
          guestName: data.guestName || 'غير محدد',
          roomNumber: data.roomNumber || 'غير محدد',
          roomType: data.roomType || 'غير محدد',
          checkIn,
          checkOut,
          nights,
          totalPrice,
          amountPaid: paid,
          remaining: totalPrice - paid,
          status: checkIn <= today ? 'current' : 'upcoming',
          guestPhone: data.guestPhone
        });
      }

      setBookings(bookingsData);
      setSummary({
        totalBookings: bookingsData.length,
        currentGuests: currentCount,
        upcomingGuests: upcomingCount,
        totalRevenue,
        totalPaid,
        totalRemaining: totalRevenue - totalPaid
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['اسم الضيف', 'رقم الغرفة', 'نوع الغرفة', 'تاريخ الدخول', 'تاريخ الخروج', 'الليالي', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'],
      ...bookings.map(b => [
        b.guestName,
        b.roomNumber,
        b.roomType,
        b.checkIn.toLocaleDateString('ar-SA'),
        b.checkOut.toLocaleDateString('ar-SA'),
        b.nights,
        b.totalPrice.toFixed(2),
        b.amountPaid.toFixed(2),
        b.remaining.toFixed(2),
        b.status === 'current' ? 'حالي' : 'قادم'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `open_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" size="sm" className="text-orange-300 hover:bg-orange-500/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-orange-300">
                  🔐 تقرير الحجوزات المفتوحة
                </h1>
                <p className="text-slate-400">الحجوزات النشطة والقادمة</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button onClick={handleExport} variant="outline" className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button onClick={handlePrint} variant="outline" className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={loadOpenBookings} variant="outline" className="bg-purple-500/20 border-purple-400/30 text-purple-300 hover:bg-purple-500/30">
                <Clock className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">ضيوف حاليون</p>
                    <p className="text-3xl font-bold text-white">{summary.currentGuests}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm mb-1">حجوزات قادمة</p>
                    <p className="text-3xl font-bold text-white">{summary.upcomingGuests}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold text-white">{summary.totalBookings}</p>
                  </div>
                  <Lock className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Financial Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                الملخص المالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-2">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-white">{summary.totalRevenue.toFixed(0)} ر.س</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">المبالغ المدفوعة</p>
                  <p className="text-3xl font-bold text-green-400">{summary.totalPaid.toFixed(0)} ر.س</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">المبالغ المتبقية</p>
                  <p className="text-3xl font-bold text-red-400">{summary.totalRemaining.toFixed(0)} ر.س</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">قائمة الحجوزات المفتوحة</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  <p className="text-white mt-4">جاري التحميل...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">اسم الضيف</th>
                        <th className="text-center p-3 text-slate-300">رقم الغرفة</th>
                        <th className="text-right p-3 text-slate-300">نوع الغرفة</th>
                        <th className="text-center p-3 text-slate-300">تاريخ الدخول</th>
                        <th className="text-center p-3 text-slate-300">تاريخ الخروج</th>
                        <th className="text-center p-3 text-slate-300">الليالي</th>
                        <th className="text-right p-3 text-slate-300">الإجمالي</th>
                        <th className="text-right p-3 text-slate-300">المدفوع</th>
                        <th className="text-right p-3 text-slate-300">المتبقي</th>
                        <th className="text-center p-3 text-slate-300">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-semibold">{booking.guestName}</p>
                              {booking.guestPhone && (
                                <p className="text-xs text-slate-400">{booking.guestPhone}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-bold">
                              {booking.roomNumber}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{booking.roomType}</td>
                          <td className="p-3 text-center text-sm">{booking.checkIn.toLocaleDateString('ar-SA')}</td>
                          <td className="p-3 text-center text-sm">{booking.checkOut.toLocaleDateString('ar-SA')}</td>
                          <td className="p-3 text-center font-semibold">{booking.nights}</td>
                          <td className="p-3 font-bold">{booking.totalPrice.toFixed(0)} ر.س</td>
                          <td className="p-3 text-green-400 font-bold">{booking.amountPaid.toFixed(0)} ر.س</td>
                          <td className="p-3 text-red-400 font-bold">{booking.remaining.toFixed(0)} ر.س</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === 'current' 
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {booking.status === 'current' ? 'حالي' : 'قادم'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
