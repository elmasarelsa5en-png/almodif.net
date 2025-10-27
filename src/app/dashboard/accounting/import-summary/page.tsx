'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// تم إزالة Progress مؤقتاً
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Database,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Building2
} from 'lucide-react';
import { cashFlowData, rentSubsidyData, monthlyReport, cashFlowStats } from '@/lib/cash-flow-data';

export default function DataImportSummary() {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  // إحصائيات الاستيراد
  const importStats = {
    cashFlowEntries: cashFlowData.length,
    totalReceipts: cashFlowStats.totalReceipts,
    totalExpenses: cashFlowStats.totalExpenses,
    netFlow: cashFlowStats.netFlow,
    rentEntries: rentSubsidyData.length,
    totalRentSubsidy: rentSubsidyData.reduce((sum, rent) => sum + rent.amount, 0),
    monthsWithData: Object.values(monthlyReport).filter(amount => amount > 0).length,
    totalMonthlyRevenue: Object.values(monthlyReport).reduce((a, b) => a + b, 0)
  };

  // محاكاة عملية الاستيراد
  const handleImportData = async () => {
    setIsImporting(true);
    setImportProgress(0);

    // محاكاة تقدم الاستيراد
    const intervals = [10, 25, 45, 65, 80, 95, 100];
    
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setImportProgress(intervals[i]);
    }

    setIsImporting(false);
    setIsImportDialogOpen(false);
    alert('تم استيراد جميع البيانات بنجاح إلى النظام المحاسبي!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان الرئيسي */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  ملخص استيراد البيانات
                </h1>
                <p className="text-emerald-200/80 mt-2 text-lg">نظرة شاملة على البيانات المستوردة من الشيت</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsImportDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
              >
                <Upload className="ml-2 w-4 h-4" />
                استيراد البيانات
              </Button>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mt-4">معاملات الحركة النقدية</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{importStats.cashFlowEntries}</div>
              <p className="text-green-200/80">معاملة نقدية</p>
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                <div className="text-sm text-green-300">صافي التدفق</div>
                <div className="text-lg font-bold text-green-400">{importStats.netFlow.toLocaleString()} ر.س</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mt-4">المقبوضات والمصروفات</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3">
                <div className="p-2 bg-green-500/10 rounded">
                  <div className="text-sm text-green-300">إجمالي المقبوضات</div>
                  <div className="text-lg font-bold text-green-400">{importStats.totalReceipts.toLocaleString()} ر.س</div>
                </div>
                <div className="p-2 bg-red-500/10 rounded">
                  <div className="text-sm text-red-300">إجمالي المصروفات</div>
                  <div className="text-lg font-bold text-red-400">{importStats.totalExpenses.toLocaleString()} ر.س</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mt-4">بدل الإيجارات</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{importStats.rentEntries}</div>
              <p className="text-purple-200/80">شقة</p>
              <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
                <div className="text-sm text-purple-300">إجمالي بدل الإيجار</div>
                <div className="text-lg font-bold text-purple-400">{importStats.totalRentSubsidy} ر.س</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mt-4">التقرير الشهري</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{importStats.monthsWithData}</div>
              <p className="text-orange-200/80">شهر بالبيانات</p>
              <div className="mt-4 p-3 bg-orange-500/10 rounded-lg">
                <div className="text-sm text-orange-300">إجمالي الإيرادات</div>
                <div className="text-lg font-bold text-orange-400">{importStats.totalMonthlyRevenue.toLocaleString()} ر.س</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل البيانات المستوردة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الحركة النقدية */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6" />
                الحركة النقدية
              </CardTitle>
              <CardDescription className="text-blue-200/80">
                تفاصيل المعاملات النقدية اليومية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{importStats.cashFlowEntries}</div>
                    <div className="text-sm text-green-300">معاملة</div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{cashFlowStats.finalBalance.toLocaleString()}</div>
                    <div className="text-sm text-blue-300">الرصيد النهائي</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">المعاملات في أغسطس</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      {cashFlowData.filter(item => item.date.includes('أغسطس')).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">المعاملات في سبتمبر</span>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {cashFlowData.filter(item => item.date.includes('سبتمبر')).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">المعاملات في أكتوبر</span>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {cashFlowData.filter(item => item.date.includes('أكتوبر')).length}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بدل الإيجارات */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-6 h-6" />
                بدل الإيجارات
              </CardTitle>
              <CardDescription className="text-blue-200/80">
                تفاصيل بدل إيجار الشقق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-500/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{rentSubsidyData.length}</div>
                    <div className="text-sm text-purple-300">شقة</div>
                  </div>
                  <div className="bg-yellow-500/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">{importStats.totalRentSubsidy}</div>
                    <div className="text-sm text-yellow-300">إجمالي البدل</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {rentSubsidyData.map((rent, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span className="text-white">شقة {rent.apartment}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400">{rent.amount} ر.س</Badge>
                        <span className="text-xs text-white/60">{rent.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* حالة الاستيراد */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              حالة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-green-400 mb-2">البيانات جاهزة</h3>
                <p className="text-white/80 text-sm">
                  تم تحميل وتنظيم جميع بيانات الحركة النقدية بنجاح
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">متوافق مع النظام</h3>
                <p className="text-white/80 text-sm">
                  البيانات منسقة ومتوافقة مع النظام المحاسبي
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">جاهز للتحليل</h3>
                <p className="text-white/80 text-sm">
                  يمكن الآن إنشاء التقارير والتحليلات المالية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نافذة تأكيد الاستيراد */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 backdrop-blur-md border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8 text-emerald-400" />
              استيراد البيانات
            </DialogTitle>
            <DialogDescription className="text-blue-200/80">
              هل أنت متأكد من رغبتك في استيراد جميع البيانات إلى النظام المحاسبي؟
            </DialogDescription>
          </DialogHeader>

          {isImporting && (
            <div className="py-4">
              <div className="flex justify-between mb-2 text-white text-sm">
                <span>جاري الاستيراد...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm text-white/80">
            <div className="flex justify-between">
              <span>معاملات الحركة النقدية:</span>
              <Badge className="bg-green-500/20 text-green-400">{importStats.cashFlowEntries}</Badge>
            </div>
            <div className="flex justify-between">
              <span>بدل الإيجارات:</span>
              <Badge className="bg-purple-500/20 text-purple-400">{importStats.rentEntries}</Badge>
            </div>
            <div className="flex justify-between">
              <span>إجمالي صافي التدفق:</span>
              <Badge className="bg-blue-500/20 text-blue-400">{importStats.netFlow.toLocaleString()} ر.س</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsImportDialogOpen(false)}
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              disabled={isImporting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleImportData}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              disabled={isImporting}
            >
              <Upload className="ml-2 w-4 h-4" />
              {isImporting ? 'جاري الاستيراد...' : 'استيراد البيانات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
