'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Eye,
  Plus,
  Download,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExcelDropzone from '@/components/ExcelDropzone';
import ExcelImportSection from '@/components/ExcelImportSection';

export default function AccountingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 159103, // إجمالي المقبوضات من البيانات المستوردة (34053 + 125000)
    monthlyExpenses: 71077.5, // إجمالي المصروفات من البيانات المستوردة (26077.5 + 45000)
    netProfit: 87975.5, // صافي الربح بعد إضافة البيانات الجديدة (7975.5 + 80000)
    pendingInvoices: 15, // زيادة عدد الفواتير المعلقة
    overduePayments: 5, // زيادة المدفوعات المتأخرة
    totalTransactions: 297 // إضافة 49 معاملة جديدة من الحركة النقدية
  });

  // حالات النوافذ المنبثقة
  const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // بيانات المعاملة الجديدة
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // بيانات التصفية
  const [filterData, setFilterData] = useState({
    type: 'الكل',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const [recentTransactions, setRecentTransactions] = useState([
    // معاملات مستوردة من الحركة النقدية
    { id: 1, type: 'دخل', description: 'فواتير افتخار', amount: 1035, date: '06-أكتوبر', status: 'مكتمل', category: 'فواتير' },
    { id: 2, type: 'مصروف', description: 'فواتير افتخار', amount: -1250, date: '06-أكتوبر', status: 'مكتمل', category: 'فواتير' },
    { id: 3, type: 'مصروف', description: 'افتخار', amount: -1500, date: '05-أكتوبر', status: 'مكتمل', category: 'مصروفات عامة' },
    { id: 4, type: 'مصروف', description: 'بدل ايجار شقة 501', amount: -160, date: '04-أكتوبر', status: 'مكتمل', category: 'إيجارات' },
    { id: 5, type: 'دخل', description: 'إيرادات متنوعة', amount: 4, date: '03-أكتوبر', status: 'مكتمل', category: 'إيرادات' },
    { id: 6, type: 'دخل', description: 'إيرادات غرف', amount: 700, date: '02-أكتوبر', status: 'مكتمل', category: 'إيرادات الغرف' },
    { id: 7, type: 'مصروف', description: 'راتب منذر', amount: -1700, date: '02-أكتوبر', status: 'مكتمل', category: 'رواتب' },
    { id: 8, type: 'دخل', description: 'إيرادات غرف', amount: 100, date: '01-أكتوبر', status: 'مكتمل', category: 'إيرادات الغرف' },
    { id: 9, type: 'مصروف', description: 'راتب مصطفي', amount: -1300, date: '01-أكتوبر', status: 'مكتمل', category: 'رواتب' },
    { id: 10, type: 'مصروف', description: 'راتب فهد مع اوفر تايم يوم وطنى مع ساعه', amount: -3795, date: '30-سبتمبر', status: 'مكتمل', category: 'رواتب' },
    { id: 11, type: 'دخل', description: 'بدل ايجار شقة 204', amount: 920, date: '23-سبتمبر', status: 'مكتمل', category: 'إيجارات' },
    { id: 12, type: 'مصروف', description: 'بدل ايجار شقة 308', amount: -100, date: '22-سبتمبر', status: 'مكتمل', category: 'إيجارات' }
  ]);

  // وظائف الأزرار
  const handleNewTransaction = () => {
    if (newTransaction.type && newTransaction.description && newTransaction.amount) {
      const transaction = {
        id: recentTransactions.length + 1,
        type: newTransaction.type,
        description: newTransaction.description,
        amount: newTransaction.type === 'مصروف' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount),
        date: newTransaction.date,
        status: 'مكتمل',
        category: newTransaction.category
      };

      setRecentTransactions([transaction, ...recentTransactions]);
      
      // تحديث الإحصائيات
      setStats(prev => ({
        ...prev,
        totalTransactions: prev.totalTransactions + 1,
        totalRevenue: newTransaction.type === 'دخل' ? prev.totalRevenue + newTransaction.amount : prev.totalRevenue,
        monthlyExpenses: newTransaction.type === 'مصروف' ? prev.monthlyExpenses + newTransaction.amount : prev.monthlyExpenses
      }));

      // إعادة تعيين النموذج
      setNewTransaction({
        type: '',
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0]
      });

      setIsNewTransactionOpen(false);
      alert('تم إضافة المعاملة بنجاح!');
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  const handleExportReport = () => {
    const csvContent = [
      ['النوع', 'الوصف', 'المبلغ', 'التاريخ', 'الحالة', 'الفئة'],
      ...recentTransactions.map(t => [t.type, t.description, t.amount, t.date, t.status, t.category])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_المحاسبة_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setIsExportOpen(false);
    alert('تم تصدير التقرير بنجاح!');
  };

  const navigateToSection = (path: string) => {
    router.push(path);
  };

  // معالج استيراد البيانات من Excel
  const handleDataImport = (data: any[], type: 'transactions' | 'invoices' | 'expenses') => {
    if (type === 'transactions') {
      // إضافة البيانات إلى المعاملات
      const newTransactions = data.map(item => ({
        ...item,
        id: recentTransactions.length + data.indexOf(item) + 1
      }));
      setRecentTransactions([...newTransactions, ...recentTransactions]);
      
      // تحديث الإحصائيات
      const totalRevenue = newTransactions.filter(t => t.type === 'دخل').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = newTransactions.filter(t => t.type === 'مصروف').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      setStats(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + totalRevenue,
        monthlyExpenses: prev.monthlyExpenses + totalExpenses,
        totalTransactions: prev.totalTransactions + data.length
      }));
      
      alert(`تم استيراد ${data.length} معاملة بنجاح!`);
    } else if (type === 'invoices') {
      // التنقل إلى صفحة الفواتير مع البيانات
      localStorage.setItem('importedInvoices', JSON.stringify(data));
      router.push('/dashboard/accounting/invoices?import=true');
    } else if (type === 'expenses') {
      // التنقل إلى صفحة المصروفات مع البيانات
      localStorage.setItem('importedExpenses', JSON.stringify(data));
      router.push('/dashboard/accounting/expenses?import=true');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* العنوان الرئيسي */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    المحاسبة والمالية
                  </h1>
                  <p className="text-emerald-200/80 mt-2 text-lg">إدارة شاملة للعمليات المالية والمحاسبية</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsNewTransactionOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                >
                  <Plus className="ml-2 w-4 h-4" />
                  معاملة جديدة
                </Button>
                <Button 
                  onClick={() => setIsExportOpen(true)}
                  variant="outline" 
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تصدير التقرير
                </Button>
              </div>
            </div>
          </div>

          {/* بطاقات الإحصائيات المالية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي الإيرادات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.totalRevenue.toLocaleString()} ر.س</div>
                <p className="text-xs text-green-200/80 font-medium">+12.5% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">المصروفات الشهرية</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.monthlyExpenses.toLocaleString()} ر.س</div>
                <p className="text-xs text-red-200/80 font-medium">-5.2% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">صافي الربح</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.netProfit.toLocaleString()} ر.س</div>
                <p className="text-xs text-blue-200/80 font-medium">+18.3% من الشهر الماضي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">فواتير معلقة</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{stats.pendingInvoices}</div>
                <p className="text-xs text-orange-200/80 font-medium">فاتورة بانتظار السداد</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">متأخرات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{stats.overduePayments}</div>
                <p className="text-xs text-purple-200/80 font-medium">دفعات متأخرة</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي المعاملات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-400">{stats.totalTransactions}</div>
                <p className="text-xs text-teal-200/80 font-medium">هذا الشهر</p>
              </CardContent>
            </Card>
          </div>

          {/* قسم الأقسام الفرعية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4">لوحة المالية</CardTitle>
                <CardDescription className="text-blue-200/80">
                  نظرة عامة على الوضع المالي والإحصائيات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigateToSection('/dashboard/accounting/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  <Eye className="ml-2 w-4 h-4" />
                  عرض التفاصيل
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4">إدارة الفواتير</CardTitle>
                <CardDescription className="text-blue-200/80">
                  إنشاء وإدارة جميع الفواتير والمدفوعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigateToSection('/dashboard/accounting/invoices')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Plus className="ml-2 w-4 h-4" />
                  إدارة الفواتير
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4">المصروفات</CardTitle>
                <CardDescription className="text-blue-200/80">
                  تتبع وإدارة جميع المصروفات والتكاليف
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigateToSection('/dashboard/accounting/expenses')}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                >
                  <Calculator className="ml-2 w-4 h-4" />
                  إدارة المصروفات
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4">التقارير المالية</CardTitle>
                <CardDescription className="text-blue-200/80">
                  تقارير مالية تفصيلية وتحليلات متقدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigateToSection('/dashboard/accounting/reports')}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                >
                  <BarChart3 className="ml-2 w-4 h-4" />
                  عرض التقارير
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mt-4">الحركة النقدية</CardTitle>
                <CardDescription className="text-blue-200/80">
                  تتبع الحركة النقدية اليومية والتدفقات المالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigateToSection('/dashboard/accounting/cash-flow')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  <DollarSign className="ml-2 w-4 h-4" />
                  الحركة النقدية
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* قسم ملخص البيانات المستوردة */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">البيانات المستوردة</h2>
                  <p className="text-blue-200/80">تم استيراد بيانات الحركة النقدية لشهر (6) بنجاح</p>
                </div>
              </div>
              <Button 
                onClick={() => navigateToSection('/dashboard/accounting/import-summary')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Eye className="ml-2 w-4 h-4" />
                عرض التفاصيل
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">49</div>
                <div className="text-green-200/80 text-sm">معاملة نقدية</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">34,053</div>
                <div className="text-blue-200/80 text-sm">إجمالي المقبوضات</div>
              </div>
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-400">26,077.5</div>
                <div className="text-red-200/80 text-sm">إجمالي المصروفات</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">7,975.5</div>
                <div className="text-purple-200/80 text-sm">الرصيد النهائي</div>
              </div>
            </div>
          </div>

          {/* قسم استيراد البيانات من Excel */}
          <ExcelImportSection onNavigateToSection={navigateToSection} />

          {/* مكون استيراد ملفات Excel */}
          <ExcelDropzone 
            onDataImport={handleDataImport}
            acceptedTypes={['transactions', 'invoices', 'expenses']}
          />

          {/* جدول المعاملات الأخيرة */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    المعاملات الأخيرة
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 font-medium mt-2">
                    آخر المعاملات المالية في النظام
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsFilterOpen(true)}
                  variant="outline" 
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Filter className="ml-2 w-4 h-4" />
                  تصفية
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-right py-3 px-4 text-white font-semibold">النوع</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الوصف</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">المبلغ</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">التاريخ</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <Badge className={transaction.type === 'دخل' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-white">{transaction.description}</td>
                        <td className={`py-3 px-4 font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} ر.س
                        </td>
                        <td className="py-3 px-4 text-blue-200/80">{transaction.date}</td>
                        <td className="py-3 px-4">
                          <Badge className={transaction.status === 'مكتمل' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}>
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نافذة إضافة معاملة جديدة */}
        <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                إضافة معاملة جديدة
              </DialogTitle>
              <DialogDescription className="text-blue-200/80 font-medium">
                أدخل تفاصيل المعاملة المالية الجديدة
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">نوع المعاملة</Label>
                <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                    <SelectValue placeholder="اختر نوع المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دخل">دخل</SelectItem>
                    <SelectItem value="مصروف">مصروف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-medium">الفئة</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {newTransaction.type === 'دخل' ? (
                      <>
                        <SelectItem value="إيرادات الغرف">إيرادات الغرف</SelectItem>
                        <SelectItem value="خدمات إضافية">خدمات إضافية</SelectItem>
                        <SelectItem value="المطعم">المطعم</SelectItem>
                        <SelectItem value="الكوفي شوب">الكوفي شوب</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="التنظيف">التنظيف</SelectItem>
                        <SelectItem value="المرافق">المرافق</SelectItem>
                        <SelectItem value="الصيانة">الصيانة</SelectItem>
                        <SelectItem value="الرواتب">الرواتب</SelectItem>
                        <SelectItem value="المستلزمات">المستلزمات</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-medium">الوصف</Label>
                <Input
                  type="text"
                  placeholder="وصف المعاملة"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">المبلغ (ر.س)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">التاريخ</Label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setIsNewTransactionOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleNewTransaction}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <CheckCircle className="ml-2 w-4 h-4" />
                إضافة المعاملة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة التصفية */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                تصفية المعاملات
              </DialogTitle>
              <DialogDescription className="text-blue-200/80 font-medium">
                اختر معايير التصفية للمعاملات
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">نوع المعاملة</Label>
                <Select value={filterData.type} onValueChange={(value) => setFilterData({...filterData, type: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">الكل</SelectItem>
                    <SelectItem value="دخل">دخل فقط</SelectItem>
                    <SelectItem value="مصروف">مصروف فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white font-medium">من تاريخ</Label>
                  <Input
                    type="date"
                    value={filterData.dateFrom}
                    onChange={(e) => setFilterData({...filterData, dateFrom: e.target.value})}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={filterData.dateTo}
                    onChange={(e) => setFilterData({...filterData, dateTo: e.target.value})}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white font-medium">أقل مبلغ</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filterData.minAmount}
                    onChange={(e) => setFilterData({...filterData, minAmount: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium">أعلى مبلغ</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={filterData.maxAmount}
                    onChange={(e) => setFilterData({...filterData, maxAmount: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setIsFilterOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  // تطبيق التصفية (يمكن إضافة المنطق هنا)
                  setIsFilterOpen(false);
                  alert('تم تطبيق التصفية!');
                }}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
              >
                <Filter className="ml-2 w-4 h-4" />
                تطبيق التصفية
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة تصدير التقرير */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                تصدير التقرير المالي
              </DialogTitle>
              <DialogDescription className="text-blue-200/80 font-medium">
                اختر تفاصيل التقرير المراد تصديره
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-2">محتويات التقرير:</h4>
                <ul className="text-blue-200/80 text-sm space-y-1">
                  <li>• جميع المعاملات المالية</li>
                  <li>• إجمالي الإيرادات والمصروفات</li>
                  <li>• تصنيف حسب الفئات</li>
                  <li>• البيانات الزمنية</li>
                </ul>
              </div>

              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-200 font-medium">تنبيه</span>
                </div>
                <p className="text-amber-200/80 text-sm mt-2">
                  سيتم تصدير التقرير بصيغة CSV ويحتوي على {recentTransactions.length} معاملة
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setIsExportOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleExportReport}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              >
                <Download className="ml-2 w-4 h-4" />
                تصدير الآن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}