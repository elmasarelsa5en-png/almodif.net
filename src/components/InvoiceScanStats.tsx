'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Scan,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileImage,
  Zap,
  Target
} from 'lucide-react';

interface ScanStatsProps {
  totalScanned: number;
  successRate: number;
  averageTime: number;
  lastScanTime?: string;
}

export default function InvoiceScanStats({ 
  totalScanned = 0, 
  successRate = 95, 
  averageTime = 3.2,
  lastScanTime 
}: ScanStatsProps) {
  const stats = [
    {
      icon: Scan,
      title: 'إجمالي المسح',
      value: totalScanned.toString(),
      unit: 'فاتورة',
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400'
    },
    {
      icon: Target,
      title: 'معدل الدقة',
      value: successRate.toString(),
      unit: '%',
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-400'
    },
    {
      icon: Zap,
      title: 'متوسط الوقت',
      value: averageTime.toString(),
      unit: 'ثانية',
      color: 'from-yellow-500 to-orange-600',
      textColor: 'text-yellow-400'
    },
    {
      icon: CheckCircle,
      title: 'نجح اليوم',
      value: Math.floor(totalScanned * 0.3).toString(),
      unit: 'فاتورة',
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-400'
    }
  ];

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 90) return CheckCircle;
    if (rate >= 80) return Clock;
    return AlertTriangle;
  };

  const SuccessIcon = getSuccessRateIcon(successRate);

  return (
    <div className="space-y-6">
      {/* إحصائيات رئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{stat.title}</CardTitle>
              <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
                <span className="text-sm text-white/60 ml-1">{stat.unit}</span>
              </div>
              {index === 1 && (
                <div className="flex items-center mt-2">
                  <SuccessIcon className={`w-4 h-4 ${getSuccessRateColor(successRate)} ml-1`} />
                  <span className={`text-xs ${getSuccessRateColor(successRate)}`}>
                    {successRate >= 90 ? 'ممتاز' : successRate >= 80 ? 'جيد' : 'يحتاج تحسين'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* معلومات تفصيلية */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            تفاصيل الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* دقة الاستخراج */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-400 mb-2">دقة الاستخراج</h3>
              <div className="text-3xl font-bold text-green-300 mb-1">{successRate}%</div>
              <p className="text-white/60 text-sm">من البيانات المستخرجة صحيحة</p>
            </div>

            {/* سرعة المعالجة */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">سرعة المعالجة</h3>
              <div className="text-3xl font-bold text-yellow-300 mb-1">{averageTime}s</div>
              <p className="text-white/60 text-sm">متوسط وقت المسح</p>
            </div>

            {/* آخر نشاط */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">آخر نشاط</h3>
              <div className="text-lg font-bold text-purple-300 mb-1">
                {lastScanTime ? lastScanTime : 'لم يتم المسح بعد'}
              </div>
              <p className="text-white/60 text-sm">آخر مسح للفواتير</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تحليل نوع الملفات */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
            <FileImage className="w-5 h-5 text-indigo-400" />
            أنواع الملفات المُسحت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-500/20 text-blue-400">JPEG/JPG</Badge>
                <span className="text-white">الأكثر استخداماً</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-white/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="text-blue-400 text-sm">70%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/20 text-green-400">PNG</Badge>
                <span className="text-white">جودة عالية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-white/20 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-green-400 text-sm">25%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/20 text-purple-400">PDF</Badge>
                <span className="text-white">متعدد الصفحات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-white/20 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-purple-400 text-sm">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}