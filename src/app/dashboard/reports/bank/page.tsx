'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, TrendingUp, TrendingDown, DollarSign,
  Download, Printer, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface BankTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description: string;
  reference: string;
  date: Date;
  balance: number;
}

interface DailyBank {
  date: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

export default function BankReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [dailyData, setDailyData] = useState<DailyBank[]>([]);
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    netChange: 0,
    transactionCount: 0,
    depositCount: 0,
    withdrawalCount: 0,
    currentBalance: 0
  });

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadBankData = async () => {
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

      const transactionsData: BankTransaction[] = [];

      // Load deposits from receipts with bank payment
      const receiptsRef = collection(db, 'receipts');
      const receiptsQuery = query(
        receiptsRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        where('paymentMethod', '==', 'bank_transfer')
      );
      const receiptsSnap = await getDocs(receiptsQuery);

      receiptsSnap.docs.forEach(doc => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id + '_deposit',
          type: 'deposit',
          amount: data.totalAmount || 0,
          description: `إيداع من ${data.guestName || 'غير محدد'}`,
          reference: data.receiptNumber || doc.id.slice(0, 8),
          date: data.createdAt?.toDate() || new Date(),
          balance: 0 // Will calculate later
        });
      });

      // Load withdrawals from payment vouchers with bank payment
      const vouchersRef = collection(db, 'payment-vouchers');
      const vouchersQuery = query(
        vouchersRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        where('paidFrom', '==', 'bank')
      );
      const vouchersSnap = await getDocs(vouchersQuery);

      vouchersSnap.docs.forEach(doc => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id + '_withdrawal',
          type: 'withdrawal',
          amount: data.totalAmount || 0,
          description: data.description || 'سحب',
          reference: doc.id.slice(0, 8),
          date: data.createdAt?.toDate() || new Date(),
          balance: 0
        });
      });

      // Sort by date
      transactionsData.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate running balance
      let runningBalance = 0;
      transactionsData.forEach(transaction => {
        if (transaction.type === 'deposit') {
          runningBalance += transaction.amount;
        } else {
          runningBalance -= transaction.amount;
        }
        transaction.balance = runningBalance;
      });

      // Calculate daily data
      const dailyMap = new Map<string, { deposits: number; withdrawals: number }>();
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let depositCount = 0;
      let withdrawalCount = 0;

      transactionsData.forEach(transaction => {
        const dateKey = transaction.date.toISOString().split('T')[0];
        const current = dailyMap.get(dateKey) || { deposits: 0, withdrawals: 0 };
        
        if (transaction.type === 'deposit') {
          current.deposits += transaction.amount;
          totalDeposits += transaction.amount;
          depositCount++;
        } else {
          current.withdrawals += transaction.amount;
          totalWithdrawals += transaction.amount;
          withdrawalCount++;
        }
        
        dailyMap.set(dateKey, current);
      });

      const daily: DailyBank[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          deposits: data.deposits,
          withdrawals: data.withdrawals,
          net: data.deposits - data.withdrawals
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setTransactions(transactionsData.reverse());
      setDailyData(daily);
      setSummary({
        totalDeposits,
        totalWithdrawals,
        netChange: totalDeposits - totalWithdrawals,
        transactionCount: transactionsData.length,
        depositCount,
        withdrawalCount,
        currentBalance: runningBalance
      });
    } catch (error) {
      console.error('Error loading bank data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['التاريخ', 'النوع', 'الوصف', 'المرجع', 'المبلغ', 'الرصيد'],
      ...transactions.map(t => [
        t.date.toLocaleDateString('ar-SA'),
        t.type === 'deposit' ? 'إيداع' : 'سحب',
        t.description,
        t.reference,
        t.amount.toFixed(2),
        t.balance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bank_report_${fromDate}_to_${toDate}.csv`;
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                  🏦 تقرير البنك
                </h1>
                <p className="text-slate-400">حركة الحساب البنكي والإيداعات والسحوبات</p>
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
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <Button onClick={loadBankData} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
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
                    <p className="text-green-300 text-sm mb-1">إجمالي الإيداعات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalDeposits.toFixed(0)} ر.س</p>
                    <p className="text-xs text-green-400 mt-1">{summary.depositCount} عملية</p>
                  </div>
                  <ArrowUpCircle className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-red-600/20 to-orange-800/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm mb-1">إجمالي السحوبات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalWithdrawals.toFixed(0)} ر.س</p>
                    <p className="text-xs text-red-400 mt-1">{summary.withdrawalCount} عملية</p>
                  </div>
                  <ArrowDownCircle className="w-12 h-12 text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={`bg-gradient-to-br ${summary.netChange >= 0 ? 'from-blue-600/20 to-cyan-800/20 border-blue-500/30' : 'from-orange-600/20 to-amber-800/20 border-orange-500/30'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${summary.netChange >= 0 ? 'text-blue-300' : 'text-orange-300'} text-sm mb-1`}>صافي الحركة</p>
                    <p className="text-2xl font-bold text-white">{summary.netChange.toFixed(0)} ر.س</p>
                  </div>
                  {summary.netChange >= 0 ? (
                    <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
                  ) : (
                    <TrendingDown className="w-12 h-12 text-orange-400 opacity-50" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-indigo-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">الرصيد الحالي</p>
                    <p className="text-2xl font-bold text-white">{summary.currentBalance.toFixed(0)} ر.س</p>
                  </div>
                  <Building2 className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart - Balance Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">صافي الحركة اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart - Deposits vs Withdrawals */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">الإيداعات مقابل السحوبات</CardTitle>
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
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                    <Legend />
                    <Bar dataKey="deposits" fill="#10b981" name="إيداعات" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="سحوبات" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Transactions List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">كشف الحساب البنكي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-right p-3 text-slate-300">المرجع</th>
                      <th className="text-right p-3 text-slate-300">الوصف</th>
                      <th className="text-center p-3 text-slate-300">النوع</th>
                      <th className="text-right p-3 text-slate-300">المبلغ</th>
                      <th className="text-right p-3 text-slate-300">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm">{transaction.date.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3 text-sm font-mono">{transaction.reference}</td>
                        <td className="p-3 text-sm">{transaction.description}</td>
                        <td className="p-3 text-center">
                          {transaction.type === 'deposit' ? (
                            <div className="flex items-center justify-center gap-1">
                              <ArrowUpCircle className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-green-400">إيداع</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <ArrowDownCircle className="w-4 h-4 text-red-400" />
                              <span className="text-xs text-red-400">سحب</span>
                            </div>
                          )}
                        </td>
                        <td className={`p-3 font-bold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toFixed(2)} ر.س
                        </td>
                        <td className="p-3 text-white font-bold">{transaction.balance.toFixed(2)} ر.س</td>
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
