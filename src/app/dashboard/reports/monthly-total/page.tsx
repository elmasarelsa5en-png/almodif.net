'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, TrendingUp, DollarSign, Users, 
  BedDouble, Download, Printer, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MonthlyStats {
  month: string;
  bookings: number;
  revenue: number;
  guests: number;
  averageStay: number;
  occupancyRate: number;
}

export default function MonthlyTotalReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalGuests: 0,
    averageOccupancy: 0
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#6366f1', '#d946ef'];

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  useEffect(() => {
    loadMonthlyData();
  }, [selectedYear]);

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const data: MonthlyStats[] = [];
      let totalBookings = 0;
      let totalRevenue = 0;
      let totalGuests = 0;
      let totalOccupancy = 0;

      // Loop through all months
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(selectedYear, month, 1);
        const endDate = new Date(selectedYear, month + 1, 0, 23, 59, 59);

        // Get bookings for the month
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          where('checkIn', '>=', Timestamp.fromDate(startDate)),
          where('checkIn', '<=', Timestamp.fromDate(endDate))
        );
        const bookingsSnap = await getDocs(bookingsQuery);
        const bookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate stats for the month
        const monthBookings = bookings.length;
        const monthRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
        const monthGuests = bookings.reduce((sum: number, b: any) => sum + (b.numberOfGuests || 1), 0);
        const monthStays = bookings.reduce((sum: number, b: any) => {
          const checkIn = b.checkIn?.toDate() || new Date();
          const checkOut = b.checkOut?.toDate() || new Date();
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);
        const averageStay = monthBookings > 0 ? monthStays / monthBookings : 0;

        // Get rooms to calculate occupancy
        const roomsRef = collection(db, 'rooms');
        const roomsSnap = await getDocs(roomsRef);
        const totalRooms = roomsSnap.size;
        const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
        const possibleRoomNights = totalRooms * daysInMonth;
        const occupancyRate = possibleRoomNights > 0 ? (monthStays / possibleRoomNights) * 100 : 0;

        data.push({
          month: months[month],
          bookings: monthBookings,
          revenue: monthRevenue,
          guests: monthGuests,
          averageStay: averageStay,
          occupancyRate: occupancyRate
        });

        totalBookings += monthBookings;
        totalRevenue += monthRevenue;
        totalGuests += monthGuests;
        totalOccupancy += occupancyRate;
      }

      setMonthlyData(data);
      setTotalStats({
        totalBookings,
        totalRevenue,
        totalGuests,
        averageOccupancy: totalOccupancy / 12
      });
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['الشهر', 'الحجوزات', 'الإيرادات', 'الضيوف', 'متوسط الإقامة', 'نسبة الإشغال'],
      ...monthlyData.map(m => [
        m.month,
        m.bookings,
        m.revenue.toFixed(2),
        m.guests,
        m.averageStay.toFixed(1),
        m.occupancyRate.toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_report_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="text-orange-300 hover:bg-orange-500/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-purple-300">
                  📊 التقرير الشهري الإجمالي
                </h1>
                <p className="text-slate-400">نظرة شاملة على أداء كل شهر</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button
                onClick={handleExport}
                variant="outline"
                className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير CSV
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </div>
          </div>

          {/* Year Selector */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl print:hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-orange-400" />
                <label className="text-white font-medium">السنة:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Button
                  onClick={loadMonthlyData}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? 'جاري التحميل...' : 'تحديث البيانات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold text-white">{totalStats.totalBookings}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold text-white">{totalStats.totalRevenue.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">إجمالي الضيوف</p>
                    <p className="text-3xl font-bold text-white">{totalStats.totalGuests}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm mb-1">متوسط الإشغال</p>
                    <p className="text-3xl font-bold text-white">{totalStats.averageOccupancy.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  الإيرادات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bookings Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  الحجوزات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">البيانات التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">الشهر</th>
                      <th className="text-right p-3 text-slate-300">الحجوزات</th>
                      <th className="text-right p-3 text-slate-300">الإيرادات</th>
                      <th className="text-right p-3 text-slate-300">الضيوف</th>
                      <th className="text-right p-3 text-slate-300">متوسط الإقامة</th>
                      <th className="text-right p-3 text-slate-300">نسبة الإشغال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((month, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-semibold">{month.month}</td>
                        <td className="p-3">{month.bookings}</td>
                        <td className="p-3 text-green-400">{month.revenue.toFixed(2)} ر.س</td>
                        <td className="p-3">{month.guests}</td>
                        <td className="p-3">{month.averageStay.toFixed(1)} يوم</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            month.occupancyRate >= 80 ? 'bg-green-500/20 text-green-300' :
                            month.occupancyRate >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {month.occupancyRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
