'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  ArrowLeft,
  FileText,
  Target,
  DollarSign,
  Eye
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('شهر');
  const [selectedYear, setSelectedYear] = useState('2025');

  const profitLossData = {
    revenue: {
      rooms: 95000,
      restaurant: 18000,
      services: 8000,
      coffeeshop: 4000,
      total: 125000
    },
    expenses: {
      utilities: 8000,
      maintenance: 5000,
      cleaning: 3000,
      salaries: 25000,
      supplies: 4000,
      total: 45000
    },
    netProfit: 80000
  };

  const monthlyTrends = [
    { month: 'يناير', revenue: 118000, expenses: 42000, profit: 76000 },
    { month: 'فبراير', revenue: 125000, expenses: 45000, profit: 80000 },
    { month: 'مارس', revenue: 132000, expenses: 48000, profit: 84000 },
    { month: 'أبريل', revenue: 128000, expenses: 46000, profit: 82000 },
    { month: 'مايو', revenue: 135000, expenses: 49000, profit: 86000 },
    { month: 'يونيو', revenue: 142000, expenses: 52000, profit: 90000 }
  ];

  const categoryAnalysis = [
    { category: 'إيرادات الغرف', amount: 95000, percentage: 76, trend: '+8%' },
    { category: 'المطعم', amount: 18000, percentage: 14, trend: '+12%' },
    { category: 'خدمات إضافية', amount: 8000, percentage: 6, trend: '+5%' },
    { category: 'الكوفي شوب', amount: 4000, percentage: 3, trend: '+15%' }
  ];

  const kpiData = {
    profitMargin: 64,
    growthRate: 12.5,
    expenseRatio: 36,
    dailyAverage: 4167,
    occupancyRate: 78,
    revenuePerRoom: 3125
  };

  const handleExportReport = (reportType: string) => {
    const reportData = {
      'profit-loss': profitLossData,
      'monthly-trends': monthlyTrends,
      'category-analysis': categoryAnalysis,
      'kpi': kpiData
    };

    const csvContent = Object.entries(reportData[reportType as keyof typeof reportData])
      .map(([key, value]) => `${key},${JSON.stringify(value)}`)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert(`تم تصدير تقرير ${reportType} بنجاح!`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* العنوان والتحكم */}
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    التقارير المالية
                  </h1>
                  <p className="text-purple-200/80 mt-2 text-lg">تقارير مالية تفصيلية وتحليلات متقدمة</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="يوم">يومي</SelectItem>
                    <SelectItem value="أسبوع">أسبوعي</SelectItem>
                    <SelectItem value="شهر">شهري</SelectItem>
                    <SelectItem value="سنة">سنوي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* مؤشرات الأداء الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  هامش الربح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{kpiData.profitMargin}%</div>
                <p className="text-xs text-green-200/80">من إجمالي الإيرادات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  معدل النمو
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">+{kpiData.growthRate}%</div>
                <p className="text-xs text-blue-200/80">مقارنة بالعام السابق</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  نسبة المصروفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">{kpiData.expenseRatio}%</div>
                <p className="text-xs text-orange-200/80">من إجمالي الإيرادات</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  متوسط يومي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">{kpiData.dailyAverage.toLocaleString()}</div>
                <p className="text-xs text-purple-200/80">ر.س يومياً</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  نسبة الإشغال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-400">{kpiData.occupancyRate}%</div>
                <p className="text-xs text-indigo-200/80">معدل شهري</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  إيراد الغرفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-400">{kpiData.revenuePerRoom.toLocaleString()}</div>
                <p className="text-xs text-teal-200/80">ر.س شهرياً</p>
              </CardContent>
            </Card>
          </div>

          {/* قائمة الأرباح والخسائر */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-green-900/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    قائمة الأرباح والخسائر
                  </CardTitle>
                  <CardDescription className="text-green-200/80 font-medium mt-2">
                    تحليل تفصيلي للإيرادات والمصروفات
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleExportReport('profit-loss')}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* الإيرادات */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-green-400 mb-4">الإيرادات</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-white">إيرادات الغرف</span>
                      <span className="text-green-400 font-bold">{profitLossData.revenue.rooms.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-white">المطعم</span>
                      <span className="text-green-400 font-bold">{profitLossData.revenue.restaurant.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-white">خدمات إضافية</span>
                      <span className="text-green-400 font-bold">{profitLossData.revenue.services.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-white">الكوفي شوب</span>
                      <span className="text-green-400 font-bold">{profitLossData.revenue.coffeeshop.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-lg border-2 border-green-500/40">
                      <span className="text-white font-bold text-lg">إجمالي الإيرادات</span>
                      <span className="text-green-400 font-bold text-xl">{profitLossData.revenue.total.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* المصروفات */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-red-400 mb-4">المصروفات</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-white">المرافق</span>
                      <span className="text-red-400 font-bold">{profitLossData.expenses.utilities.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-white">الصيانة</span>
                      <span className="text-red-400 font-bold">{profitLossData.expenses.maintenance.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-white">التنظيف</span>
                      <span className="text-red-400 font-bold">{profitLossData.expenses.cleaning.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-white">الرواتب</span>
                      <span className="text-red-400 font-bold">{profitLossData.expenses.salaries.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-white">المستلزمات</span>
                      <span className="text-red-400 font-bold">{profitLossData.expenses.supplies.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-500/20 rounded-lg border-2 border-red-500/40">
                      <span className="text-white font-bold text-lg">إجمالي المصروفات</span>
                      <span className="text-red-400 font-bold text-xl">{profitLossData.expenses.total.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* صافي الربح */}
              <div className="mt-8 p-6 bg-blue-500/20 rounded-lg border-2 border-blue-500/40">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-2xl">صافي الربح</span>
                  <span className="text-blue-400 font-bold text-3xl">{profitLossData.netProfit.toLocaleString()} ر.س</span>
                </div>
                <p className="text-blue-200/80 mt-2">هامش ربح: {Math.round((profitLossData.netProfit / profitLossData.revenue.total) * 100)}%</p>
              </div>
            </CardContent>
          </Card>

          {/* الاتجاهات الشهرية */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="w-6 h-6" />
                    الاتجاهات الشهرية
                  </CardTitle>
                  <CardDescription className="text-blue-200/80 font-medium mt-2">
                    تطور الأداء المالي عبر الأشهر
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleExportReport('monthly-trends')}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyTrends.map((data, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white font-semibold text-lg mb-3 text-center">{data.month}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-sm">الإيرادات:</span>
                        <span className="text-green-400 font-bold">{data.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 text-sm">المصروفات:</span>
                        <span className="text-red-400 font-bold">{data.expenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-2">
                        <span className="text-blue-400 text-sm font-semibold">الربح:</span>
                        <span className="text-blue-400 font-bold">{data.profit.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(data.profit / data.revenue) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        هامش ربح: {Math.round((data.profit / data.revenue) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* تحليل الفئات */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-purple-900/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <PieChart className="w-6 h-6" />
                    تحليل الإيرادات حسب الفئة
                  </CardTitle>
                  <CardDescription className="text-purple-200/80 font-medium mt-2">
                    أداء كل قسم وتطوره
                  </CardDescription>
                </div>
                <Button
                  onClick={() => handleExportReport('category-analysis')}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {categoryAnalysis.map((category, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{category.category}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                          {category.trend}
                        </Badge>
                      </div>
                      <span className="text-green-400 font-bold text-lg">{category.amount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{category.percentage}% من إجمالي الإيرادات</span>
                      <span className="text-purple-400 text-sm font-medium">نمو {category.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}