'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  FileText, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  Banknote,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function VouchersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    receiptsCount: 0,
    receiptsTotal: 0,
    vouchersCount: 0,
    vouchersTotal: 0,
    netTotal: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load receipts stats
      const receiptsRef = collection(db, 'receipts');
      const receiptsSnap = await getDocs(receiptsRef);
      const receiptsData = receiptsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const receiptsTotal = receiptsData.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
      
      // Load payment vouchers stats
      const vouchersRef = collection(db, 'payment-vouchers');
      const vouchersSnap = await getDocs(vouchersRef);
      const vouchersData = vouchersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vouchersTotal = vouchersData.reduce((sum: number, v: any) => sum + (Number(v.totalAmount) || 0), 0);
      
      setStats({
        receiptsCount: receiptsData.length,
        receiptsTotal,
        vouchersCount: vouchersData.length,
        vouchersTotal,
        netTotal: receiptsTotal - vouchersTotal
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FileText className="w-8 h-8" />
                السندات والكمبيالات
              </h1>
              <p className="text-white/60 mt-2">إدارة جميع السندات المالية</p>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Receipts */}
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-300" />
                  <span className="text-xs font-semibold px-2 py-1 bg-green-500/30 text-green-200 rounded-full">
                    {stats.receiptsCount} سند
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-1">إجمالي المقبوضات</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.receiptsTotal)}</p>
                <p className="text-white/50 text-xs mt-1">ريال سعودي</p>
              </CardContent>
            </Card>

            {/* Total Vouchers */}
            <Card className="bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-400/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 text-red-300" />
                  <span className="text-xs font-semibold px-2 py-1 bg-red-500/30 text-red-200 rounded-full">
                    {stats.vouchersCount} سند
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-1">إجمالي المصروفات</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.vouchersTotal)}</p>
                <p className="text-white/50 text-xs mt-1">ريال سعودي</p>
              </CardContent>
            </Card>

            {/* Net Total */}
            <Card className={`bg-gradient-to-br ${stats.netTotal >= 0 ? 'from-blue-500/20 to-cyan-600/20 border-blue-400/30' : 'from-orange-500/20 to-red-600/20 border-orange-400/30'} backdrop-blur-md`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-white/70 text-sm mb-1">صافي الحركة</p>
                <p className={`text-3xl font-bold ${stats.netTotal >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(stats.netTotal))}
                </p>
                <p className="text-white/50 text-xs mt-1">{stats.netTotal >= 0 ? 'فائض' : 'عجز'}</p>
              </CardContent>
            </Card>

            {/* Promissory Notes */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border-purple-400/30 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-8 h-8 text-purple-300" />
                  <span className="text-xs font-semibold px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full">
                    0 كمبيالة
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-1">الكمبيالات</p>
                <p className="text-3xl font-bold text-white">0.00</p>
                <p className="text-white/50 text-xs mt-1">قريباً</p>
              </CardContent>
            </Card>
          </div>

          {/* Voucher Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Receipts */}
            <Card 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => router.push('/dashboard/accounting/receipts')}
            >
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <ArrowDownCircle className="w-6 h-6 text-green-300" />
                  </div>
                  سندات القبض
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">عدد السندات</span>
                    <span className="text-white font-bold text-xl">{stats.receiptsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الإجمالي</span>
                    <span className="text-green-300 font-bold text-xl">{formatCurrency(stats.receiptsTotal)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/accounting/receipts');
                      }}
                    >
                      عرض سندات القبض
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Vouchers */}
            <Card 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => router.push('/dashboard/accounting/payment-vouchers')}
            >
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                    <ArrowUpCircle className="w-6 h-6 text-red-300" />
                  </div>
                  سندات الصرف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">عدد السندات</span>
                    <span className="text-white font-bold text-xl">{stats.vouchersCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الإجمالي</span>
                    <span className="text-red-300 font-bold text-xl">{formatCurrency(stats.vouchersTotal)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/accounting/payment-vouchers');
                      }}
                    >
                      عرض سندات الصرف
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promissory Notes */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 opacity-60">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <CreditCard className="w-6 h-6 text-purple-300" />
                  </div>
                  الكمبيالات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">عدد الكمبيالات</span>
                    <span className="text-white font-bold text-xl">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الإجمالي</span>
                    <span className="text-purple-300 font-bold text-xl">0.00</span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <Button 
                      disabled
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white opacity-50 cursor-not-allowed"
                    >
                      قريباً
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Vouchers */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 opacity-60">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Banknote className="w-6 h-6 text-blue-300" />
                  </div>
                  سندات البنك
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">عدد السندات</span>
                    <span className="text-white font-bold text-xl">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">الإجمالي</span>
                    <span className="text-blue-300 font-bold text-xl">0.00</span>
                  </div>
                  <div className="pt-4 border-white/10">
                    <Button 
                      disabled
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white opacity-50 cursor-not-allowed"
                    >
                      قريباً
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Movement Report */}
            <Card 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => router.push('/dashboard/reports/cash-movement')}
            >
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                    <FileText className="w-6 h-6 text-cyan-300" />
                  </div>
                  تقرير حركة الصندوق
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">
                    عرض تقرير شامل لحركة الصندوق اليومية مع جميع المقبوضات والمصروفات
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <Button 
                      className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/reports/cash-movement');
                      }}
                    >
                      عرض التقرير
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accounting Transactions */}
            <Card 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
              onClick={() => router.push('/dashboard/accounting/transactions')}
            >
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                    <FileText className="w-6 h-6 text-yellow-300" />
                  </div>
                  القيود المحاسبية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">
                    إدارة القيود المحاسبية وحسابات الأصول والخصوم
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/accounting/transactions');
                      }}
                    >
                      عرض القيود
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto"></div>
              <p className="text-white/70 mt-4">جاري تحميل البيانات...</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
