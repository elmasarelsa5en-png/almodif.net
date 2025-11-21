'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, TrendingUp, DollarSign, Users, 
  CheckCircle, XCircle, Clock, Download, Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyActivity {
  date: string;
  checkIns: number;
  checkOuts: number;
  revenue: number;
  newGuests: number;
  requests: number;
  occupiedRooms: number;
}

export default function DailyMovementReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<DailyActivity[]>([]);
  const [summary, setSummary] = useState({
    totalCheckIns: 0,
    totalCheckOuts: 0,
    totalRevenue: 0,
    totalGuests: 0,
    totalRequests: 0,
    averageOccupancy: 0
  });

  useEffect(() => {
    // Set default to last 7 days
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    setFromDate(weekAgo.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadDailyData = async () => {
    if (!fromDate || !toDate) {
      alert('الرجاء تحديد التاريخ');
      return;
    }

    setLoading(true);
    try {
      const data: DailyActivity[] = [];
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      let totalCheckIns = 0;
      let totalCheckOuts = 0;
      let totalRevenue = 0;
      let totalGuests = 0;
      let totalRequests = 0;
      let totalOccupancy = 0;
      let daysCount = 0;

      // Loop through each day
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        // Get check-ins for the day
        const checkInsRef = collection(db, 'bookings');
        const checkInsQuery = query(
          checkInsRef,
          where('checkIn', '>=', Timestamp.fromDate(dayStart)),
          where('checkIn', '<=', Timestamp.fromDate(dayEnd))
        );
        const checkInsSnap = await getDocs(checkInsQuery);
        const checkIns = checkInsSnap.size;

        // Get check-outs for the day
        const checkOutsQuery = query(
          checkInsRef,
          where('checkOut', '>=', Timestamp.fromDate(dayStart)),
          where('checkOut', '<=', Timestamp.fromDate(dayEnd))
        );
        const checkOutsSnap = await getDocs(checkOutsQuery);
        const checkOuts = checkOutsSnap.size;

        // Calculate revenue
        const bookings = checkInsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const dayRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

        // Count guests
        const dayGuests = bookings.reduce((sum: number, b: any) => sum + (b.numberOfGuests || 1), 0);

        // Get requests for the day
        const requestsRef = collection(db, 'guest-requests');
        const requestsQuery = query(
          requestsRef,
          where('createdAt', '>=', Timestamp.fromDate(dayStart)),
          where('createdAt', '<=', Timestamp.fromDate(dayEnd))
        );
        const requestsSnap = await getDocs(requestsQuery);
        const dayRequests = requestsSnap.size;

        // Get occupied rooms for the day
        const occupiedQuery = query(
          checkInsRef,
          where('checkIn', '<=', Timestamp.fromDate(dayEnd)),
          where('checkOut', '>=', Timestamp.fromDate(dayStart)),
          where('status', '==', 'confirmed')
        );
        const occupiedSnap = await getDocs(occupiedQuery);
        const occupiedRooms = occupiedSnap.size;

        data.push({
          date: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
          checkIns,
          checkOuts,
          revenue: dayRevenue,
          newGuests: dayGuests,
          requests: dayRequests,
          occupiedRooms
        });

        totalCheckIns += checkIns;
        totalCheckOuts += checkOuts;
        totalRevenue += dayRevenue;
        totalGuests += dayGuests;
        totalRequests += dayRequests;
        totalOccupancy += occupiedRooms;
        daysCount++;
      }

      setDailyData(data);
      setSummary({
        totalCheckIns,
        totalCheckOuts,
        totalRevenue,
        totalGuests,
        totalRequests,
        averageOccupancy: daysCount > 0 ? totalOccupancy / daysCount : 0
      });
    } catch (error) {
      console.error('Error loading daily data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['التاريخ', 'دخول', 'خروج', 'الإيرادات', 'الضيوف', 'الطلبات', 'الغرف المشغولة'],
      ...dailyData.map(d => [
        d.date,
        d.checkIns,
        d.checkOuts,
        d.revenue.toFixed(2),
        d.newGuests,
        d.requests,
        d.occupiedRooms
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daily_movement_${fromDate}_to_${toDate}.csv`;
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  📅 تقرير الحركة اليومية
                </h1>
                <p className="text-slate-400">متابعة النشاط اليومي للفندق</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button
                onClick={handleExport}
                variant="outline"
                className="bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير
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

          {/* Date Filters */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl print:hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-white text-sm mb-2">من تاريخ</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <Button
                  onClick={loadDailyData}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">إجمالي الدخول</p>
                    <p className="text-3xl font-bold text-white">{summary.totalCheckIns}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm mb-1">إجمالي الخروج</p>
                    <p className="text-3xl font-bold text-white">{summary.totalCheckOuts}</p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalRevenue.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">إجمالي الضيوف</p>
                    <p className="text-3xl font-bold text-white">{summary.totalGuests}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm mb-1">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-white">{summary.totalRequests}</p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-gradient-to-br from-teal-600/20 to-teal-800/20 border-teal-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-300 text-sm mb-1">متوسط الغرف المشغولة</p>
                    <p className="text-3xl font-bold text-white">{summary.averageOccupancy.toFixed(1)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-teal-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Check-ins/Check-outs Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">الدخول والخروج</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="checkIns" stroke="#10b981" strokeWidth={2} name="دخول" />
                    <Line type="monotone" dataKey="checkOuts" stroke="#ef4444" strokeWidth={2} name="خروج" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">الإيرادات اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="الإيرادات" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">التفاصيل اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-center p-3 text-slate-300">دخول</th>
                      <th className="text-center p-3 text-slate-300">خروج</th>
                      <th className="text-right p-3 text-slate-300">الإيرادات</th>
                      <th className="text-center p-3 text-slate-300">الضيوف</th>
                      <th className="text-center p-3 text-slate-300">الطلبات</th>
                      <th className="text-center p-3 text-slate-300">غرف مشغولة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((day, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-semibold">{day.date}</td>
                        <td className="p-3 text-center text-green-400">{day.checkIns}</td>
                        <td className="p-3 text-center text-red-400">{day.checkOuts}</td>
                        <td className="p-3 text-blue-400">{day.revenue.toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">{day.newGuests}</td>
                        <td className="p-3 text-center">{day.requests}</td>
                        <td className="p-3 text-center">{day.occupiedRooms}</td>
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
