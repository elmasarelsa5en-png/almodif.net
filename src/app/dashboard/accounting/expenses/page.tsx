'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TrendingDown,
  Plus,
  Search,
  ArrowLeft,
  CheckCircle,
  Edit,
  Trash2,
  Calculator,
  Receipt,
  Zap,
  Wrench,
  Users,
  ShoppingCart,
  Upload
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter, useSearchParams } from 'next/navigation';
import ExcelDropzone from '@/components/ExcelDropzone';
import ExcelImportInstructions from '@/components/ExcelImportInstructions';

export default function ExpensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showImportZone, setShowImportZone] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      description: 'فاتورة كهرباء شهر أكتوبر',
      amount: 1200,
      category: 'المرافق',
      date: '2025-10-09',
      paymentMethod: 'تحويل بنكي',
      receipt: 'REC-001',
      notes: 'فاتورة شهرية للكهرباء'
    },
    {
      id: 2,
      description: 'شراء مستلزمات تنظيف',
      amount: 350,
      category: 'التنظيف',
      date: '2025-10-08',
      paymentMethod: 'نقدي',
      receipt: 'REC-002',
      notes: 'مواد تنظيف للغرف'
    },
    {
      id: 3,
      description: 'إصلاح مكيف الهواء - غرفة 205',
      amount: 800,
      category: 'الصيانة',
      date: '2025-10-07',
      paymentMethod: 'بطاقة ائتمان',
      receipt: 'REC-003',
      notes: 'صيانة عاجلة'
    },
    {
      id: 4,
      description: 'رواتب الموظفين - أكتوبر',
      amount: 25000,
      category: 'الرواتب',
      date: '2025-10-01',
      paymentMethod: 'تحويل بنكي',
      receipt: 'REC-004',
      notes: 'رواتب شهر أكتوبر'
    }
  ]);

  // فحص البيانات المستوردة
  useEffect(() => {
    const isImport = searchParams.get('import');
    if (isImport === 'true') {
      const importedData = localStorage.getItem('importedExpenses');
      if (importedData) {
        const data = JSON.parse(importedData);
        const newExpenses = data.map((item: any, index: number) => ({
          ...item,
          id: expenses.length + index + 1
        }));
        setExpenses(prev => [...newExpenses, ...prev]);
        localStorage.removeItem('importedExpenses');
        alert(`تم استيراد ${data.length} مصروف بنجاح!`);
      }
    }
  }, [searchParams, expenses.length]);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: '',
    paymentMethod: '',
    receipt: '',
    notes: ''
  });

  const categoryConfig = {
    'المرافق': { color: 'bg-blue-500/20 text-blue-400', icon: Zap },
    'التنظيف': { color: 'bg-green-500/20 text-green-400', icon: ShoppingCart },
    'الصيانة': { color: 'bg-orange-500/20 text-orange-400', icon: Wrench },
    'الرواتب': { color: 'bg-purple-500/20 text-purple-400', icon: Users },
    'المستلزمات': { color: 'bg-pink-500/20 text-pink-400', icon: Receipt }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.category) {
      const expense = {
        id: expenses.length + 1,
        description: newExpense.description,
        amount: newExpense.amount,
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: newExpense.paymentMethod,
        receipt: newExpense.receipt || `REC-${String(expenses.length + 1).padStart(3, '0')}`,
        notes: newExpense.notes
      };

      setExpenses([expense, ...expenses]);
      setNewExpense({
        description: '',
        amount: 0,
        category: '',
        paymentMethod: '',
        receipt: '',
        notes: ''
      });
      setIsNewExpenseOpen(false);
      alert('تم إضافة المصروف بنجاح!');
    } else {
      alert('يرجى ملء الحقول المطلوبة');
    }
  };

  // معالج استيراد البيانات من Excel
  const handleDataImport = (data: any[], type: 'transactions' | 'invoices' | 'expenses') => {
    if (type === 'expenses') {
      const newExpenses = data.map((item, index) => ({
        ...item,
        id: expenses.length + index + 1
      }));
      setExpenses(prev => [...newExpenses, ...prev]);
      alert(`تم استيراد ${data.length} مصروف بنجاح!`);
    }
  };

  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    utilities: expenses.filter(exp => exp.category === 'المرافق').reduce((sum, exp) => sum + exp.amount, 0),
    maintenance: expenses.filter(exp => exp.category === 'الصيانة').reduce((sum, exp) => sum + exp.amount, 0),
    salaries: expenses.filter(exp => exp.category === 'الرواتب').reduce((sum, exp) => sum + exp.amount, 0),
    supplies: expenses.filter(exp => exp.category === 'التنظيف').reduce((sum, exp) => sum + exp.amount, 0)
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* العنوان والأزرار */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                    إدارة المصروفات
                  </h1>
                  <p className="text-red-200/80 mt-2 text-lg">تتبع وإدارة جميع المصروفات والتكاليف</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsNewExpenseOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                >
                  <Plus className="ml-2 w-4 h-4" />
                  مصروف جديد
                </Button>
                <Button
                  onClick={() => setShowImportZone(!showImportZone)}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Upload className="ml-2 w-4 h-4" />
                  استيراد Excel
                </Button>
              </div>
            </div>
          </div>

          {/* إحصائيات المصروفات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-red-200/80">ر.س</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">عدد المصروفات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-blue-200/80">مصروف</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">المرافق</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.utilities.toLocaleString()}</div>
                <p className="text-xs text-blue-200/80">ر.س</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{stats.maintenance.toLocaleString()}</div>
                <p className="text-xs text-orange-200/80">ر.س</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">الرواتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{stats.salaries.toLocaleString()}</div>
                <p className="text-xs text-purple-200/80">ر.س</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white">المستلزمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.supplies.toLocaleString()}</div>
                <p className="text-xs text-green-200/80">ر.س</p>
              </CardContent>
            </Card>
          </div>

          {/* شريط البحث والتصفية */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في المصروفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200/50"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">جميع الفئات</SelectItem>
                  <SelectItem value="المرافق">المرافق</SelectItem>
                  <SelectItem value="التنظيف">التنظيف</SelectItem>
                  <SelectItem value="الصيانة">الصيانة</SelectItem>
                  <SelectItem value="الرواتب">الرواتب</SelectItem>
                  <SelectItem value="المستلزمات">المستلزمات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* مكون استيراد ملفات Excel */}
          {showImportZone && (
            <div className="space-y-4">
              <ExcelImportInstructions type="expenses" />
              <ExcelDropzone 
                onDataImport={handleDataImport}
                acceptedTypes={['expenses']}
              />
            </div>
          )}

          {/* جدول المصروفات */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-red-900/50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-white">
                قائمة المصروفات ({filteredExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-right py-3 px-4 text-white font-semibold">الوصف</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الفئة</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">المبلغ</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">طريقة الدفع</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">التاريخ</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الإيصال</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => {
                      const CategoryIcon = categoryConfig[expense.category as keyof typeof categoryConfig]?.icon || Receipt;
                      return (
                        <tr key={expense.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white">{expense.description}</td>
                          <td className="py-3 px-4">
                            <Badge className={categoryConfig[expense.category as keyof typeof categoryConfig]?.color || 'bg-gray-500/20 text-gray-400'}>
                              <CategoryIcon className="w-3 h-3 ml-1" />
                              {expense.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-red-400 font-semibold">-{expense.amount.toLocaleString()} ر.س</td>
                          <td className="py-3 px-4 text-blue-200/80">{expense.paymentMethod}</td>
                          <td className="py-3 px-4 text-blue-200/80">{expense.date}</td>
                          <td className="py-3 px-4 text-gray-400 font-mono text-sm">{expense.receipt}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-400/20 bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نافذة إضافة مصروف جديد */}
        <Dialog open={isNewExpenseOpen} onOpenChange={setIsNewExpenseOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-slate-800/50 to-red-900/50 rounded-lg p-4 -m-6 mb-6">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                إضافة مصروف جديد
              </DialogTitle>
              <DialogDescription className="text-red-200/80 font-medium">
                أدخل تفاصيل المصروف الجديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">وصف المصروف</Label>
                <Input
                  type="text"
                  placeholder="وصف المصروف"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">الفئة</Label>
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="المرافق">المرافق</SelectItem>
                    <SelectItem value="التنظيف">التنظيف</SelectItem>
                    <SelectItem value="الصيانة">الصيانة</SelectItem>
                    <SelectItem value="الرواتب">الرواتب</SelectItem>
                    <SelectItem value="المستلزمات">المستلزمات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-medium">المبلغ (ر.س)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">طريقة الدفع</Label>
                <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white font-medium">رقم الإيصال (اختياري)</Label>
                <Input
                  type="text"
                  placeholder="رقم الإيصال"
                  value={newExpense.receipt}
                  onChange={(e) => setNewExpense({...newExpense, receipt: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">ملاحظات (اختياري)</Label>
                <Textarea
                  placeholder="ملاحظات إضافية"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setIsNewExpenseOpen(false)}
                variant="outline" 
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleCreateExpense}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              >
                <CheckCircle className="ml-2 w-4 h-4" />
                إضافة المصروف
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}