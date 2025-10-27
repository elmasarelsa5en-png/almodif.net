'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  FileText,
  Download,
  Upload,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  cashFlowData as importedCashFlowData, 
  rentSubsidyData, 
  monthlyReport,
  cashFlowStats 
} from '@/lib/cash-flow-data';

export default function CashFlowPage() {
  const [cashFlowData, setCashFlowData] = useState(importedCashFlowData);
  const [filteredData, setFilteredData] = useState(importedCashFlowData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newEntry, setNewEntry] = useState({
    date: '',
    receipts: 0,
    expenses: 0,
    notes: ''
  });

  // حساب الإحصائيات من البيانات المستوردة
  const stats = {
    totalReceipts: cashFlowData.reduce((sum, item) => sum + item.receipts, 0),
    totalExpenses: cashFlowData.reduce((sum, item) => sum + item.expenses, 0),
    finalBalance: cashFlowStats.finalBalance,
    netFlow: cashFlowStats.netFlow,
    entriesCount: cashFlowStats.entriesCount,
    averageDaily: cashFlowStats.averageDaily
  };

  // تصفية البيانات
  useEffect(() => {
    let filtered = cashFlowData;

    if (filterMonth !== 'all') {
      filtered = filtered.filter(item => item.date.includes(filterMonth));
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  }, [filterMonth, searchTerm, cashFlowData]);

  // إضافة معاملة جديدة
  const handleAddEntry = () => {
    if (newEntry.date) {
      const lastBalance = cashFlowData[cashFlowData.length - 1]?.balance || 0;
      const newBalance = lastBalance + newEntry.receipts - newEntry.expenses;
      
      const entry = {
        ...newEntry,
        id: cashFlowData.length + 1,
        balance: newBalance
      };

      setCashFlowData([...cashFlowData, entry]);
      setNewEntry({ date: '', receipts: 0, expenses: 0, notes: '' });
      setIsAddDialogOpen(false);
      alert('تم إضافة المعاملة بنجاح!');
    }
  };

  // تصدير البيانات
  const handleExport = () => {
    const csvContent = [
      ['التاريخ', 'المقبوضات', 'المصروفات', 'رصيد الدرج', 'ملاحظات'],
      ...filteredData.map(item => [item.date, item.receipts, item.expenses, item.balance, item.notes])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `الحركة_النقدية_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert('تم تصدير البيانات بنجاح!');
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
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    الحركة النقدية لشهر (6)
                  </h1>
                  <p className="text-emerald-200/80 mt-2 text-lg">تتبع شامل للمقبوضات والمصروفات اليومية</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                >
                  <Plus className="ml-2 w-4 h-4" />
                  إضافة معاملة
                </Button>
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تصدير البيانات
                </Button>
              </div>
            </div>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي المقبوضات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.totalReceipts.toLocaleString()} ر.س</div>
                <p className="text-xs text-green-200/80 font-medium">إجمالي الإيرادات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">إجمالي المصروفات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{stats.totalExpenses.toLocaleString()} ر.س</div>
                <p className="text-xs text-red-200/80 font-medium">إجمالي المصروفات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">الرصيد النهائي</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.finalBalance.toLocaleString()} ر.س</div>
                <p className="text-xs text-blue-200/80 font-medium">الرصيد الحالي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">صافي التدفق</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.netFlow >= 0 ? '+' : ''}{stats.netFlow.toLocaleString()} ر.س
                </div>
                <p className="text-xs text-purple-200/80 font-medium">المقبوضات - المصروفات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">عدد المعاملات</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{stats.entriesCount}</div>
                <p className="text-xs text-orange-200/80 font-medium">معاملة مسجلة</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">المتوسط اليومي</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.averageDaily >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {stats.averageDaily >= 0 ? '+' : ''}{stats.averageDaily.toFixed(2)} ر.س
                </div>
                <p className="text-xs text-teal-200/80 font-medium">متوسط التدفق اليومي</p>
              </CardContent>
            </Card>
          </div>

          {/* أدوات التصفية والبحث */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div>
                  <Label className="text-white font-medium">تصفية بالشهر</Label>
                  <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="mt-1 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">جميع الشهور</option>
                    <option value="أغسطس">أغسطس</option>
                    <option value="سبتمبر">سبتمبر</option>
                    <option value="أكتوبر">أكتوبر</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white font-medium">البحث</Label>
                  <Input
                    type="text"
                    placeholder="ابحث في الملاحظات أو التاريخ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>
              <div className="text-sm text-white/80">
                عرض {filteredData.length} من أصل {cashFlowData.length} معاملة
              </div>
            </div>
          </div>

          {/* جدول الحركة النقدية */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    تفاصيل الحركة النقدية
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 font-medium mt-2">
                    سجل شامل لجميع المعاملات النقدية اليومية
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-right py-3 px-4 text-white font-semibold">التاريخ</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">المقبوضات</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">المصروفات</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">رصيد الدرج</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">ملاحظات</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((entry) => (
                      <tr key={entry.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-blue-200/80 font-medium">{entry.date}</td>
                        <td className="py-3 px-4 text-green-400 font-bold">
                          {entry.receipts > 0 ? `+${entry.receipts.toLocaleString()}` : '0'} ر.س
                        </td>
                        <td className="py-3 px-4 text-red-400 font-bold">
                          {entry.expenses > 0 ? `-${entry.expenses.toLocaleString()}` : '0'} ر.س
                        </td>
                        <td className="py-3 px-4 text-yellow-400 font-bold">
                          {entry.balance.toLocaleString()} ر.س
                        </td>
                        <td className="py-3 px-4 text-white max-w-xs truncate">
                          {entry.notes || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* قسم بدل الإيجار */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                بدل الإيجار بالشقق
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rentSubsidyData.map((rent, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">شقة {rent.apartment}</div>
                        <div className="text-blue-200/80 text-sm">{rent.date}</div>
                      </div>
                      <div className="text-yellow-400 font-bold text-lg">
                        {rent.amount} ر.س
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-lg">
                <div className="text-white font-bold">
                  إجمالي بدل الإيجار: {rentSubsidyData.reduce((sum, rent) => sum + rent.amount, 0)} ر.س
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التقرير الشهري */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                التقرير الشهري
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(monthlyReport).map(([month, amount]) => (
                  <div key={month} className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                    <div className="text-white font-bold capitalize">
                      {month === 'august' ? 'أغسطس' :
                       month === 'september' ? 'سبتمبر' :
                       month === 'october' ? 'أكتوبر' :
                       month === 'november' ? 'نوفمبر' :
                       month === 'december' ? 'ديسمبر' :
                       month === 'january' ? 'يناير' :
                       month === 'february' ? 'فبراير' :
                       month === 'march' ? 'مارس' :
                       month === 'april' ? 'أبريل' :
                       month === 'may' ? 'مايو' :
                       month === 'june' ? 'يونيو' : 'يوليو'}
                    </div>
                    <div className={`font-bold text-lg mt-2 ${amount > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {amount.toLocaleString()} ر.س
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                <div className="text-white font-bold text-xl">
                  إجمالي المقبوضات: {Object.values(monthlyReport).reduce((a, b) => a + b, 0).toLocaleString()} ر.س
                </div>
                <div className="text-white/80 mt-2">
                  الرصيد النهائي مع العهدة: {stats.finalBalance.toLocaleString()} ر.س
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نافذة إضافة معاملة جديدة */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                إضافة معاملة جديدة
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">التاريخ</Label>
                <Input
                  type="text"
                  placeholder="مثال: 15-أكتوبر"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">المقبوضات (ر.س)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newEntry.receipts}
                  onChange={(e) => setNewEntry({...newEntry, receipts: parseFloat(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">المصروفات (ر.س)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newEntry.expenses}
                  onChange={(e) => setNewEntry({...newEntry, expenses: parseFloat(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-white font-medium">ملاحظات</Label>
                <Textarea
                  placeholder="أدخل ملاحظات إضافية..."
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                  className="bg-white/10 border-white/20 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddEntry}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                إضافة المعاملة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
