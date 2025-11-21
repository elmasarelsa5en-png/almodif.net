'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Package, TrendingUp, Users, DollarSign,
  Download, Printer, Calendar, PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface Commission {
  id: string;
  source: 'booking' | 'service' | 'extra';
  amount: number;
  percentage: number;
  bookingId?: string;
  guestName: string;
  date: Date;
  agentName?: string;
}

interface SourceTotal {
  source: string;
  total: number;
  count: number;
  percentage: number;
}

export default function CommissionsReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [sourceTotals, setSourceTotals] = useState<SourceTotal[]>([]);
  const [summary, setSummary] = useState({
    totalCommissions: 0,
    bookingCommissions: 0,
    serviceCommissions: 0,
    extraCommissions: 0,
    itemCount: 0,
    averageCommission: 0
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const sourceLabels = {
    booking: 'عمولة حجوزات',
    service: 'عمولة خدمات',
    extra: 'عمولات إضافية'
  };

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadCommissionsData = async () => {
    if (!fromDate || !toDate) {
      alert('الرجاء تحديد التاريخ');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      const commissionsData: Commission[] = [];

      // Load booking commissions
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('checkIn', '>=', Timestamp.fromDate(start)),
        where('checkIn', '<=', Timestamp.fromDate(end)),
        where('status', '==', 'confirmed')
      );
      const bookingsSnap = await getDocs(bookingsQuery);

      bookingsSnap.docs.forEach(doc => {
        const data = doc.data();
        const commission = data.commission || 0;
        if (commission > 0) {
          commissionsData.push({
            id: doc.id + '_booking',
            source: 'booking',
            amount: commission,
            percentage: data.commissionPercentage || 10,
            bookingId: doc.id,
            guestName: data.guestName || 'غير محدد',
            date: data.checkIn?.toDate() || new Date(),
            agentName: data.agentName || 'مباشر'
          });
        }
      });

      // Load receipts for service commissions
      const receiptsRef = collection(db, 'receipts');
      const receiptsQuery = query(
        receiptsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end))
      );
      const receiptsSnap = await getDocs(receiptsQuery);

      receiptsSnap.docs.forEach(doc => {
        const data = doc.data();
        const items = data.items || [];
        items.forEach((item: any, index: number) => {
          const commission = item.commission || 0;
          if (commission > 0) {
            commissionsData.push({
              id: doc.id + '_service_' + index,
              source: 'service',
              amount: commission,
              percentage: 5,
              guestName: data.guestName || 'غير محدد',
              date: data.createdAt?.toDate() || new Date()
            });
          }
        });
      });

      // Calculate totals
      const sourceMap = new Map<string, { total: number; count: number }>();
      let totalAmount = 0;
      let bookingTotal = 0;
      let serviceTotal = 0;
      let extraTotal = 0;

      commissionsData.forEach(commission => {
        const source = commission.source;
        const current = sourceMap.get(source) || { total: 0, count: 0 };
        sourceMap.set(source, {
          total: current.total + commission.amount,
          count: current.count + 1
        });

        totalAmount += commission.amount;

        if (commission.source === 'booking') bookingTotal += commission.amount;
        else if (commission.source === 'service') serviceTotal += commission.amount;
        else extraTotal += commission.amount;
      });

      const sources: SourceTotal[] = Array.from(sourceMap.entries()).map(([source, data]) => ({
        source: sourceLabels[source as keyof typeof sourceLabels] || source,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      })).sort((a, b) => b.total - a.total);

      setCommissions(commissionsData.sort((a, b) => b.date.getTime() - a.date.getTime()));
      setSourceTotals(sources);
      setSummary({
        totalCommissions: totalAmount,
        bookingCommissions: bookingTotal,
        serviceCommissions: serviceTotal,
        extraCommissions: extraTotal,
        itemCount: commissionsData.length,
        averageCommission: commissionsData.length > 0 ? totalAmount / commissionsData.length : 0
      });
    } catch (error) {
      console.error('Error loading commissions:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['التاريخ', 'المصدر', 'اسم الضيف', 'المبلغ', 'النسبة'],
      ...commissions.map(c => [
        c.date.toLocaleDateString('ar-SA'),
        sourceLabels[c.source],
        c.guestName,
        c.amount.toFixed(2),
        c.percentage + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commissions_${fromDate}_to_${toDate}.csv`;
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                  📦 تقرير العمولات
                </h1>
                <p className="text-slate-400">تحليل العمولات من جميع المصادر</p>
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
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <Button onClick={loadCommissionsData} disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">إجمالي العمولات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalCommissions.toFixed(0)} ر.س</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">عمولة الحجوزات</p>
                    <p className="text-2xl font-bold text-white">{summary.bookingCommissions.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-amber-600/20 to-orange-800/20 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm mb-1">عمولة الخدمات</p>
                    <p className="text-2xl font-bold text-white">{summary.serviceCommissions.toFixed(0)} ر.س</p>
                  </div>
                  <Package className="w-12 h-12 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-violet-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">عدد العمولات</p>
                    <p className="text-3xl font-bold text-white">{summary.itemCount}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-400" />
                  توزيع العمولات حسب المصدر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceTotals}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.percentage.toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {sourceTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">المبالغ حسب المصدر</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceTotals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="source" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Source Summary Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white">ملخص المصادر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">المصدر</th>
                      <th className="text-right p-3 text-slate-300">المبلغ الإجمالي</th>
                      <th className="text-center p-3 text-slate-300">عدد العمولات</th>
                      <th className="text-right p-3 text-slate-300">متوسط العمولة</th>
                      <th className="text-center p-3 text-slate-300">النسبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceTotals.map((src, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            {src.source}
                          </div>
                        </td>
                        <td className="p-3 text-blue-400 font-bold">{src.total.toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">{src.count}</td>
                        <td className="p-3">{(src.total / src.count).toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-sm font-semibold">
                            {src.percentage.toFixed(1)}%
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

        {/* Detailed Commissions List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">قائمة العمولات التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-right p-3 text-slate-300">المصدر</th>
                      <th className="text-right p-3 text-slate-300">اسم الضيف</th>
                      <th className="text-right p-3 text-slate-300">الوكيل</th>
                      <th className="text-center p-3 text-slate-300">النسبة</th>
                      <th className="text-right p-3 text-slate-300">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm">{commission.date.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            commission.source === 'booking' 
                              ? 'bg-green-500/20 text-green-300'
                              : commission.source === 'service'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {sourceLabels[commission.source]}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{commission.guestName}</td>
                        <td className="p-3 text-sm">{commission.agentName || '-'}</td>
                        <td className="p-3 text-center text-sm">{commission.percentage}%</td>
                        <td className="p-3 text-blue-400 font-bold">{commission.amount.toFixed(2)} ر.س</td>
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
