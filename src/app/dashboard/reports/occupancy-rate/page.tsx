'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, TrendingUp, BedDouble, Building,
  Download, Printer, Filter, Users, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OccupancyData {
  date: string;
  occupiedRooms: number;
  totalRooms: number;
  occupancyRate: number;
  revenue: number;
}

export default function OccupancyRateReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [summary, setSummary] = useState({
    averageOccupancy: 0,
    totalRevenue: 0,
    bestDay: '',
    worstDay: '',
    totalNights: 0
  });

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
    loadTotalRooms();
  }, []);

  const loadTotalRooms = async () => {
    try {
      const roomsRef = collection(db, 'rooms');
      const roomsSnap = await getDocs(roomsRef);
      setTotalRooms(roomsSnap.size);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadOccupancyData = async () => {
    if (!fromDate || !toDate) {
      alert('الرجاء تحديد التاريخ');
      return;
    }

    setLoading(true);
    try {
      const data: OccupancyData[] = [];
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      let totalOccupancy = 0;
      let totalRevenue = 0;
      let bestRate = 0;
      let worstRate = 100;
      let bestDay = '';
      let worstDay = '';
      let daysCount = 0;
      let totalNights = 0;

      // Loop through each day
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        // Get active bookings for the day
        const bookingsRef = collection(db, 'bookings');
        const activeQuery = query(
          bookingsRef,
          where('checkIn', '<=', Timestamp.fromDate(dayEnd)),
          where('checkOut', '>=', Timestamp.fromDate(dayStart)),
          where('status', '==', 'confirmed')
        );
        const activeSnap = await getDocs(activeQuery);
        const occupiedRooms = activeSnap.size;

        // Calculate daily revenue from bookings checking in this day
        const checkInQuery = query(
          bookingsRef,
          where('checkIn', '>=', Timestamp.fromDate(dayStart)),
          where('checkIn', '<=', Timestamp.fromDate(dayEnd))
        );
        const checkInSnap = await getDocs(checkInQuery);
        const dayRevenue = checkInSnap.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.totalAmount || 0);
        }, 0);

        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        data.push({
          date: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
          occupiedRooms,
          totalRooms,
          occupancyRate,
          revenue: dayRevenue
        });

        totalOccupancy += occupancyRate;
        totalRevenue += dayRevenue;
        totalNights += occupiedRooms;
        daysCount++;

        if (occupancyRate > bestRate) {
          bestRate = occupancyRate;
          bestDay = d.toLocaleDateString('ar-SA');
        }
        if (occupancyRate < worstRate) {
          worstRate = occupancyRate;
          worstDay = d.toLocaleDateString('ar-SA');
        }
      }

      setOccupancyData(data);
      setSummary({
        averageOccupancy: daysCount > 0 ? totalOccupancy / daysCount : 0,
        totalRevenue,
        bestDay,
        worstDay,
        totalNights
      });
    } catch (error) {
      console.error('Error loading occupancy data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyLevel = (rate: number) => {
    if (rate >= 80) return { label: 'ممتاز', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (rate >= 60) return { label: 'جيد', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'منخفض', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const occupancyDistribution = [
    { name: 'ممتاز (80%+)', value: occupancyData.filter(d => d.occupancyRate >= 80).length, color: '#10b981' },
    { name: 'جيد (60-80%)', value: occupancyData.filter(d => d.occupancyRate >= 60 && d.occupancyRate < 80).length, color: '#f59e0b' },
    { name: 'منخفض (<60%)', value: occupancyData.filter(d => d.occupancyRate < 60).length, color: '#ef4444' },
  ];

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['التاريخ', 'الغرف المشغولة', 'إجمالي الغرف', 'نسبة الإشغال', 'الإيرادات'],
      ...occupancyData.map(d => [
        d.date,
        d.occupiedRooms,
        d.totalRooms,
        d.occupancyRate.toFixed(1) + '%',
        d.revenue.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `occupancy_rate_${fromDate}_to_${toDate}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => router.back()} variant="ghost" size="sm" className="text-orange-100 font-semibold hover:bg-orange-500/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300">
                  📈 تقرير نسبة الإشغال
                </h1>
                <p className="text-slate-400">مراقبة معدلات الإشغال وتحليل الأداء</p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden">
              <Button onClick={handleExport} variant="outline" className="bg-green-600 border-green-700 text-white font-bold shadow-lg hover:bg-green-500/30">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button onClick={handlePrint} variant="outline" className="bg-blue-600 border-blue-700 text-white font-bold shadow-lg hover:bg-blue-500/30">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </div>
          </div>

          {/* Date Filters */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl print:hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-white text-sm mb-2">من تاريخ</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إجمالي الغرف</label>
                  <div className="px-4 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white text-center font-bold">
                    {totalRooms}
                  </div>
                </div>
                <Button onClick={loadOccupancyData} disabled={loading} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 font-semibold text-sm mb-1">متوسط الإشغال</p>
                    <p className="text-3xl font-bold text-white">{summary.averageOccupancy.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 font-semibold text-sm mb-1">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalRevenue.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-semibold text-sm mb-1">أفضل يوم</p>
                    <p className="text-lg font-bold text-white">{summary.bestDay || '-'}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-semibold text-sm mb-1">إجمالي الليالي</p>
                    <p className="text-3xl font-bold text-white">{summary.totalNights}</p>
                  </div>
                  <BedDouble className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Occupancy Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">منحنى نسبة الإشغال</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={occupancyData}>
                    <defs>
                      <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area type="monotone" dataKey="occupancyRate" stroke="#f97316" fillOpacity={1} fill="url(#colorOccupancy)" name="نسبة الإشغال %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Occupancy Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">توزيع الأيام</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={occupancyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.value} يوم`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {occupancyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {occupancyDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-white font-semibold">{item.value} يوم</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
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
                      <th className="text-center p-3 text-slate-300">غرف مشغولة</th>
                      <th className="text-center p-3 text-slate-300">إجمالي الغرف</th>
                      <th className="text-center p-3 text-slate-300">نسبة الإشغال</th>
                      <th className="text-right p-3 text-slate-300">الإيرادات</th>
                      <th className="text-center p-3 text-slate-300">المستوى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupancyData.map((day, index) => {
                      const level = getOccupancyLevel(day.occupancyRate);
                      return (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 font-semibold">{day.date}</td>
                          <td className="p-3 text-center">{day.occupiedRooms}</td>
                          <td className="p-3 text-center">{day.totalRooms}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${level.color}`}>{day.occupancyRate.toFixed(1)}%</span>
                          </td>
                          <td className="p-3 text-green-400">{day.revenue.toFixed(2)} ر.س</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${level.bg} ${level.color}`}>
                              {level.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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


