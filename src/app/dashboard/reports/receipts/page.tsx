'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Receipt, TrendingUp, CreditCard, DollarSign,
  Download, Printer, Wallet, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';

interface ReceiptData {
  id: string;
  receiptNumber: string;
  guestName: string;
  amount: number;
  paymentMethod: string;
  date: Date;
  bookingId?: string;
  items: any[];
}

interface DailyData {
  date: string;
  amount: number;
  count: number;
}

export default function ReceiptsReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    cashAmount: 0,
    cardAmount: 0,
    bankAmount: 0,
    receiptCount: 0,
    averageAmount: 0
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقدي',
    card: 'بطاقة',
    bank_transfer: 'تحويل بنكي',
    cash_register: 'صندوق النقدية'
  };

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadReceiptsData = async () => {
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

      const receiptsRef = collection(db, 'receipts');
      const receiptsQuery = query(
        receiptsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        orderBy('createdAt', 'desc')
      );
      const receiptsSnap = await getDocs(receiptsQuery);

      const receiptsData: ReceiptData[] = receiptsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          receiptNumber: data.receiptNumber || doc.id.slice(0, 8),
          guestName: data.guestName || 'غير محدد',
          amount: data.totalAmount || 0,
          paymentMethod: data.paymentMethod || 'cash',
          date: data.createdAt?.toDate() || new Date(),
          bookingId: data.bookingId,
          items: data.items || []
        };
      });

      // Calculate daily data
      const dailyMap = new Map<string, { amount: number; count: number }>();
      let totalAmount = 0;
      let cashAmount = 0;
      let cardAmount = 0;
      let bankAmount = 0;

      receiptsData.forEach(receipt => {
        const dateKey = receipt.date.toISOString().split('T')[0];
        const current = dailyMap.get(dateKey) || { amount: 0, count: 0 };
        dailyMap.set(dateKey, {
          amount: current.amount + receipt.amount,
          count: current.count + 1
        });

        totalAmount += receipt.amount;

        if (receipt.paymentMethod === 'cash' || receipt.paymentMethod === 'cash_register') {
          cashAmount += receipt.amount;
        } else if (receipt.paymentMethod === 'card') {
          cardAmount += receipt.amount;
        } else {
          bankAmount += receipt.amount;
        }
      });

      const daily: DailyData[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setReceipts(receiptsData);
      setDailyData(daily);
      setSummary({
        totalAmount,
        cashAmount,
        cardAmount,
        bankAmount,
        receiptCount: receiptsData.length,
        averageAmount: receiptsData.length > 0 ? totalAmount / receiptsData.length : 0
      });
    } catch (error) {
      console.error('Error loading receipts:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['رقم السند', 'اسم الضيف', 'المبلغ', 'طريقة الدفع', 'التاريخ'],
      ...receipts.map(r => [
        r.receiptNumber,
        r.guestName,
        r.amount.toFixed(2),
        paymentMethodLabels[r.paymentMethod] || r.paymentMethod,
        r.date.toLocaleDateString('ar-SA')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `receipts_${fromDate}_to_${toDate}.csv`;
    link.click();
  };

  const paymentMethodData = [
    { name: 'نقدي', value: summary.cashAmount },
    { name: 'بطاقة', value: summary.cardAmount },
    { name: 'بنك', value: summary.bankAmount }
  ].filter(item => item.value > 0);

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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                  🧾 تقرير سندات القبض
                </h1>
                <p className="text-slate-400">تحليل المدفوعات المستلمة من الضيوف</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-white text-sm mb-2">من تاريخ</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <Button onClick={loadReceiptsData} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 font-semibold text-sm mb-1">إجمالي المبالغ</p>
                    <p className="text-2xl font-bold text-white">{summary.totalAmount.toFixed(0)} ر.س</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 font-semibold text-sm mb-1">نقدي</p>
                    <p className="text-2xl font-bold text-white">{summary.cashAmount.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 font-semibold text-sm mb-1">بطاقات</p>
                    <p className="text-2xl font-bold text-white">{summary.cardAmount.toFixed(0)} ر.س</p>
                  </div>
                  <CreditCard className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-violet-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 font-semibold text-sm mb-1">عدد السندات</p>
                    <p className="text-3xl font-bold text-white">{summary.receiptCount}</p>
                  </div>
                  <Receipt className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Area Chart - Daily Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">الاتجاه اليومي للمدفوعات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart - Payment Methods */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">توزيع طرق الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${((entry.value / summary.totalAmount) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
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
        </div>

        {/* Detailed Receipts List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">قائمة سندات القبض التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">رقم السند</th>
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-right p-3 text-slate-300">اسم الضيف</th>
                      <th className="text-center p-3 text-slate-300">طريقة الدفع</th>
                      <th className="text-center p-3 text-slate-300">عدد البنود</th>
                      <th className="text-right p-3 text-slate-300">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm font-mono">{receipt.receiptNumber}</td>
                        <td className="p-3 text-sm">{receipt.date.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3 text-sm">{receipt.guestName}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            receipt.paymentMethod === 'cash' || receipt.paymentMethod === 'cash_register'
                              ? 'bg-amber-500/20 text-amber-300'
                              : receipt.paymentMethod === 'card'
                              ? 'bg-blue-500/20 text-blue-100 font-semibold'
                              : 'bg-purple-500/20 text-purple-100 font-semibold'
                          }`}>
                            {paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm">{receipt.items.length}</td>
                        <td className="p-3 text-green-400 font-bold">{receipt.amount.toFixed(2)} ر.س</td>
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


