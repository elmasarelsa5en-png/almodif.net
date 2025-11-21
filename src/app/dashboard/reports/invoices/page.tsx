'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, TrendingUp, Calculator, DollarSign,
  Download, Printer, Calendar, Users, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface Invoice {
  id: string;
  invoiceNumber: string;
  guestName: string;
  bookingId?: string;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  date: Date;
  status: 'paid' | 'partial' | 'unpaid';
}

interface DailyInvoice {
  date: string;
  amount: number;
  count: number;
  tax: number;
}

export default function InvoicesReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dailyData, setDailyData] = useState<DailyInvoice[]>([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalTax: 0,
    totalPaid: 0,
    totalRemaining: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0
  });

  const TAX_RATE = 0.15; // 15% VAT

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadInvoicesData = async () => {
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

      // Load bookings as invoices
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('checkIn', '>=', Timestamp.fromDate(start)),
        where('checkIn', '<=', Timestamp.fromDate(end))
      );
      const bookingsSnap = await getDocs(bookingsQuery);

      const invoicesData: Invoice[] = [];

      for (const doc of bookingsSnap.docs) {
        const data = doc.data();
        const subtotal = data.totalPrice || 0;
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        const paid = data.amountPaid || 0;
        const remaining = total - paid;

        let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        if (paid >= total) status = 'paid';
        else if (paid > 0) status = 'partial';

        invoicesData.push({
          id: doc.id,
          invoiceNumber: 'INV-' + doc.id.slice(0, 8).toUpperCase(),
          guestName: data.guestName || 'غير محدد',
          bookingId: doc.id,
          subtotal,
          tax,
          total,
          paid,
          remaining,
          date: data.checkIn?.toDate() || new Date(),
          status
        });
      }

      // Calculate daily data
      const dailyMap = new Map<string, { amount: number; count: number; tax: number }>();
      let totalAmount = 0;
      let totalTax = 0;
      let totalPaid = 0;
      let totalRemaining = 0;
      let paidCount = 0;
      let partialCount = 0;
      let unpaidCount = 0;

      invoicesData.forEach(invoice => {
        const dateKey = invoice.date.toISOString().split('T')[0];
        const current = dailyMap.get(dateKey) || { amount: 0, count: 0, tax: 0 };
        dailyMap.set(dateKey, {
          amount: current.amount + invoice.total,
          count: current.count + 1,
          tax: current.tax + invoice.tax
        });

        totalAmount += invoice.total;
        totalTax += invoice.tax;
        totalPaid += invoice.paid;
        totalRemaining += invoice.remaining;

        if (invoice.status === 'paid') paidCount++;
        else if (invoice.status === 'partial') partialCount++;
        else unpaidCount++;
      });

      const daily: DailyInvoice[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count,
          tax: data.tax
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setInvoices(invoicesData.sort((a, b) => b.date.getTime() - a.date.getTime()));
      setDailyData(daily);
      setSummary({
        totalInvoices: invoicesData.length,
        totalAmount,
        totalTax,
        totalPaid,
        totalRemaining,
        paidCount,
        partialCount,
        unpaidCount
      });
    } catch (error) {
      console.error('Error loading invoices:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['رقم الفاتورة', 'اسم الضيف', 'المبلغ الأساسي', 'الضريبة', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة', 'التاريخ'],
      ...invoices.map(inv => [
        inv.invoiceNumber,
        inv.guestName,
        inv.subtotal.toFixed(2),
        inv.tax.toFixed(2),
        inv.total.toFixed(2),
        inv.paid.toFixed(2),
        inv.remaining.toFixed(2),
        inv.status === 'paid' ? 'مدفوع' : inv.status === 'partial' ? 'جزئي' : 'غير مدفوع',
        inv.date.toLocaleDateString('ar-SA')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoices_${fromDate}_to_${toDate}.csv`;
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  📄 تقرير الفواتير
                </h1>
                <p className="text-slate-400">تحليل شامل للفواتير والمدفوعات</p>
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
                <Button onClick={loadInvoicesData} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">إجمالي الفواتير</p>
                    <p className="text-2xl font-bold text-white">{summary.totalAmount.toFixed(0)} ر.س</p>
                  </div>
                  <FileText className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">الضريبة المضافة</p>
                    <p className="text-2xl font-bold text-white">{summary.totalTax.toFixed(0)} ر.س</p>
                  </div>
                  <Calculator className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm mb-1">المدفوع</p>
                    <p className="text-2xl font-bold text-white">{summary.totalPaid.toFixed(0)} ر.س</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-red-600/20 to-orange-800/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm mb-1">المتبقي</p>
                    <p className="text-2xl font-bold text-white">{summary.totalRemaining.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">مدفوع بالكامل</p>
                    <p className="text-2xl font-bold text-white">{summary.paidCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">مدفوع جزئياً</p>
                    <p className="text-2xl font-bold text-white">{summary.partialCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">غير مدفوع</p>
                    <p className="text-2xl font-bold text-white">{summary.unpaidCount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Area Chart - Daily Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">الاتجاه اليومي للفواتير</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#a855f7" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart - Daily Count & Tax */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">عدد الفواتير والضريبة اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#a855f7" name="عدد الفواتير" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="tax" fill="#3b82f6" name="الضريبة" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Invoices List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">قائمة الفواتير التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">رقم الفاتورة</th>
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-right p-3 text-slate-300">اسم الضيف</th>
                      <th className="text-right p-3 text-slate-300">المبلغ الأساسي</th>
                      <th className="text-right p-3 text-slate-300">الضريبة</th>
                      <th className="text-right p-3 text-slate-300">الإجمالي</th>
                      <th className="text-right p-3 text-slate-300">المدفوع</th>
                      <th className="text-right p-3 text-slate-300">المتبقي</th>
                      <th className="text-center p-3 text-slate-300">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm font-mono">{invoice.invoiceNumber}</td>
                        <td className="p-3 text-sm">{invoice.date.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3 text-sm">{invoice.guestName}</td>
                        <td className="p-3 text-sm">{invoice.subtotal.toFixed(2)} ر.س</td>
                        <td className="p-3 text-sm text-blue-400">{invoice.tax.toFixed(2)} ر.س</td>
                        <td className="p-3 text-sm font-bold">{invoice.total.toFixed(2)} ر.س</td>
                        <td className="p-3 text-sm text-green-400">{invoice.paid.toFixed(2)} ر.س</td>
                        <td className="p-3 text-sm text-red-400">{invoice.remaining.toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            invoice.status === 'paid' 
                              ? 'bg-green-500/20 text-green-300'
                              : invoice.status === 'partial'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'partial' ? 'جزئي' : 'غير مدفوع'}
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
