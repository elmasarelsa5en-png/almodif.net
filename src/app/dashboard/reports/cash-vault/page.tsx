'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, DollarSign, TrendingDown, Receipt, Package,
  Download, Printer, Filter, Calendar, PieChart as PieChartIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  paidTo: string;
  paymentMethod: string;
}

interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export default function CashVaultReport() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    cashExpenses: 0,
    bankExpenses: 0,
    itemCount: 0,
    averageExpense: 0
  });

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const expenseCategories = {
    salaries: 'رواتب',
    utilities: 'مرافق',
    maintenance: 'صيانة',
    supplies: 'مستلزمات',
    marketing: 'تسويق',
    food: 'مأكولات ومشروبات',
    cleaning: 'نظافة',
    other: 'أخرى'
  };

  useEffect(() => {
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(today.toISOString().split('T')[0]);
  }, []);

  const loadExpensesData = async () => {
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

      // Load expense vouchers
      const vouchersRef = collection(db, 'payment-vouchers');
      const vouchersQuery = query(
        vouchersRef,
        where('createdAt', '>=', Timestamp.fromDate(start)),
        where('createdAt', '<=', Timestamp.fromDate(end)),
        orderBy('createdAt', 'desc')
      );
      const vouchersSnap = await getDocs(vouchersQuery);

      const expensesData: ExpenseItem[] = vouchersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category || 'other',
          amount: data.totalAmount || 0,
          description: data.description || '',
          date: data.createdAt?.toDate() || new Date(),
          paidTo: data.paidTo || '',
          paymentMethod: data.paidFrom || 'cash_register'
        };
      });

      // Calculate category totals
      const categoryMap = new Map<string, { total: number; count: number }>();
      let totalAmount = 0;
      let cashTotal = 0;
      let bankTotal = 0;

      expensesData.forEach(expense => {
        const category = expense.category;
        const current = categoryMap.get(category) || { total: 0, count: 0 };
        categoryMap.set(category, {
          total: current.total + expense.amount,
          count: current.count + 1
        });

        totalAmount += expense.amount;

        if (expense.paymentMethod === 'cash_register') {
          cashTotal += expense.amount;
        } else {
          bankTotal += expense.amount;
        }
      });

      const categories: CategoryTotal[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category: expenseCategories[category as keyof typeof expenseCategories] || category,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      })).sort((a, b) => b.total - a.total);

      setExpenses(expensesData);
      setCategoryTotals(categories);
      setSummary({
        totalExpenses: totalAmount,
        cashExpenses: cashTotal,
        bankExpenses: bankTotal,
        itemCount: expensesData.length,
        averageExpense: expensesData.length > 0 ? totalAmount / expensesData.length : 0
      });
    } catch (error) {
      console.error('Error loading expenses:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csvContent = [
      ['التصنيف', 'المبلغ', 'عدد البنود', 'النسبة'],
      ...categoryTotals.map(c => [
        c.category,
        c.total.toFixed(2),
        c.count,
        c.percentage.toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${fromDate}_to_${toDate}.csv`;
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                  💰 تقرير بنود الصرف
                </h1>
                <p className="text-slate-400">تحليل المصروفات حسب الفئات</p>
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
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">إلى تاريخ</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <Button onClick={loadExpensesData} disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  {loading ? 'جاري التحميل...' : 'عرض التقرير'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm mb-1">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-white">{summary.totalExpenses.toFixed(0)} ر.س</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-amber-600/20 to-yellow-600/20 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm mb-1">صرف نقدي</p>
                    <p className="text-2xl font-bold text-white">{summary.cashExpenses.toFixed(0)} ر.س</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm mb-1">صرف بنكي</p>
                    <p className="text-2xl font-bold text-white">{summary.bankExpenses.toFixed(0)} ر.س</p>
                  </div>
                  <Receipt className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm mb-1">عدد البنود</p>
                    <p className="text-3xl font-bold text-white">{summary.itemCount}</p>
                  </div>
                  <Package className="w-12 h-12 text-purple-400 opacity-50" />
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
                  <PieChartIcon className="w-5 h-5 text-amber-400" />
                  توزيع المصروفات حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryTotals}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.percentage.toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {categoryTotals.map((entry, index) => (
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
                <CardTitle className="text-white">المبالغ حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryTotals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="category" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: any) => `${value.toFixed(2)} ر.س`}
                    />
                    <Bar dataKey="total" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Category Summary Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">ملخص الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">الفئة</th>
                      <th className="text-right p-3 text-slate-300">المبلغ الإجمالي</th>
                      <th className="text-center p-3 text-slate-300">عدد البنود</th>
                      <th className="text-right p-3 text-slate-300">متوسط البند</th>
                      <th className="text-center p-3 text-slate-300">النسبة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryTotals.map((cat, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            {cat.category}
                          </div>
                        </td>
                        <td className="p-3 text-red-400 font-bold">{cat.total.toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">{cat.count}</td>
                        <td className="p-3">{(cat.total / cat.count).toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-sm font-semibold">
                            {cat.percentage.toFixed(1)}%
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

        {/* Detailed Expenses List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">قائمة المصروفات التفصيلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-white">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-700">
                      <th className="text-right p-3 text-slate-300">التاريخ</th>
                      <th className="text-right p-3 text-slate-300">الفئة</th>
                      <th className="text-right p-3 text-slate-300">الوصف</th>
                      <th className="text-right p-3 text-slate-300">المستفيد</th>
                      <th className="text-right p-3 text-slate-300">المبلغ</th>
                      <th className="text-center p-3 text-slate-300">الطريقة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-3 text-sm">{expense.date.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3 text-sm">{expenseCategories[expense.category as keyof typeof expenseCategories] || expense.category}</td>
                        <td className="p-3 text-sm">{expense.description}</td>
                        <td className="p-3 text-sm">{expense.paidTo}</td>
                        <td className="p-3 text-red-400 font-bold">{expense.amount.toFixed(2)} ر.س</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            expense.paymentMethod === 'cash_register' 
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {expense.paymentMethod === 'cash_register' ? 'نقدي' : 'بنك'}
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
