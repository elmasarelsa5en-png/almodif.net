'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  PieChart,
  ArrowLeft
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function FinancialDashboardPage() {
  const router = useRouter();

  const monthlyData = [
    { month: 'يناير', revenue: 120000, expenses: 45000, profit: 75000 },
    { month: 'فبراير', revenue: 135000, expenses: 48000, profit: 87000 },
    { month: 'مارس', revenue: 142000, expenses: 52000, profit: 90000 },
    { month: 'أبريل', revenue: 138000, expenses: 49000, profit: 89000 },
    { month: 'مايو', revenue: 155000, expenses: 53000, profit: 102000 },
    { month: 'يونيو', revenue: 148000, expenses: 51000, profit: 97000 }
  ];

  const categoryBreakdown = [
    { category: 'إيرادات الغرف', amount: 95000, percentage: 76 },
    { category: 'المطعم', amount: 18000, percentage: 14 },
    { category: 'خدمات إضافية', amount: 8000, percentage: 6 },
    { category: 'الكوفي شوب', amount: 4000, percentage: 3 }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* العنوان مع زر العودة */}
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    لوحة المالية التفصيلية
                  </h1>
                  <p className="text-blue-200/80 mt-2 text-lg">تحليل مالي شامل ومتقدم</p>
                </div>
              </div>
            </div>
          </div>

          {/* الإحصائيات الشهرية */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                الأداء المالي الشهري
              </CardTitle>
              <CardDescription className="text-blue-200/80 font-medium">
                مقارنة الإيرادات والمصروفات لآخر 6 أشهر
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyData.map((data, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white font-semibold text-lg mb-3">{data.month}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-sm">الإيرادات:</span>
                        <span className="text-green-400 font-bold">{data.revenue.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 text-sm">المصروفات:</span>
                        <span className="text-red-400 font-bold">{data.expenses.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-2">
                        <span className="text-blue-400 text-sm font-semibold">صافي الربح:</span>
                        <span className="text-blue-400 font-bold">{data.profit.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* تحليل الإيرادات حسب الفئة */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-green-900/50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <PieChart className="w-6 h-6" />
                تحليل الإيرادات حسب المصدر
              </CardTitle>
              <CardDescription className="text-green-200/80 font-medium">
                توزيع الإيرادات على الأقسام المختلفة
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {categoryBreakdown.map((category, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{category.category}</span>
                      <span className="text-green-400 font-bold">{category.amount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400 text-sm">{category.percentage}% من إجمالي الإيرادات</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* مؤشرات الأداء الرئيسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  هامش الربح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">64%</div>
                <p className="text-xs text-green-200/80">العام الحالي</p>
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
                <div className="text-3xl font-bold text-blue-400">+12.5%</div>
                <p className="text-xs text-blue-200/80">مقارنة بالعام الماضي</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  متوسط الإيراد اليومي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">4,167</div>
                <p className="text-xs text-purple-200/80">ر.س يومياً</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  كفاءة التكلفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">36%</div>
                <p className="text-xs text-orange-200/80">نسبة المصروفات للإيرادات</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
