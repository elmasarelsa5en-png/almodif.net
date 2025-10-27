'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Star,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Target,
  Award,
  Globe,
  Clock,
  Percent,
  ArrowLeft,
  Bed,
  MessageCircle,
  Coffee,
  Utensils,
  Shirt,
  PieChart,
  LineChart,
  BarChart,
  AlertTriangle,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  // بيانات KPI الرئيسية
  const kpiCards = [
    {
      title: 'معدل الإشغال',
      value: '87.5%',
      change: '+5.2%',
      changeType: 'increase',
      icon: Bed,
      color: 'from-blue-500 to-indigo-600',
      description: 'متوسط الإشغال هذا الشهر',
      target: '85%'
    },
    {
      title: 'الإيرادات الشهرية',
      value: '2.4M ريال',
      change: '+12.8%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      description: 'إجمالي الإيرادات',
      target: '2.2M ريال'
    },
    {
      title: 'رضا العملاء',
      value: '4.8/5',
      change: '+0.3',
      changeType: 'increase',
      icon: Star,
      color: 'from-yellow-500 to-orange-600',
      description: 'متوسط التقييمات',
      target: '4.5/5'
    },
    {
      title: 'عدد النزلاء',
      value: '3,247',
      change: '+8.4%',
      changeType: 'increase',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      description: 'إجمالي النزلاء',
      target: '3,000'
    }
  ];

  // بيانات الأقسام
  const departmentStats = [
    {
      name: 'الغرف',
      revenue: '1.8M ريال',
      growth: '+15.2%',
      icon: Bed,
      color: 'bg-blue-500',
      percentage: 75
    },
    {
      name: 'المطعم',
      revenue: '350K ريال',
      growth: '+8.7%',
      icon: Utensils,
      color: 'bg-green-500',
      percentage: 15
    },
    {
      name: 'المقهى',
      revenue: '180K ريال',
      growth: '+12.3%',
      icon: Coffee,
      color: 'bg-orange-500',
      percentage: 7
    },
    {
      name: 'المغسلة',
      revenue: '70K ريال',
      growth: '+5.1%',
      icon: Shirt,
      color: 'bg-purple-500',
      percentage: 3
    }
  ];

  // بيانات التقييمات
  const ratingsData = [
    { rating: 5, count: 1847, percentage: 68 },
    { rating: 4, count: 623, percentage: 23 },
    { rating: 3, count: 156, percentage: 6 },
    { rating: 2, count: 52, percentage: 2 },
    { rating: 1, count: 27, percentage: 1 }
  ];

  // بيانات الأهداف
  const goals = [
    {
      title: 'الإشغال المستهدف',
      current: 87.5,
      target: 90,
      status: 'on-track',
      period: 'هذا الشهر'
    },
    {
      title: 'الإيرادات المستهدفة',
      current: 2.4,
      target: 2.5,
      status: 'on-track',
      period: 'هذا الشهر'
    },
    {
      title: 'رضا العملاء',
      current: 4.8,
      target: 4.5,
      status: 'achieved',
      period: 'هذا الشهر'
    },
    {
      title: 'تكلفة التشغيل',
      current: 1.2,
      target: 1.1,
      status: 'behind',
      period: 'هذا الشهر'
    }
  ];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6 relative overflow-hidden" dir="rtl">
        {/* خلفية تزيينية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة
                </Button>
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    التحليلات والتقارير
                  </h1>
                  <p className="text-purple-200/80 text-sm lg:text-base">
                    رؤى شاملة وتحليلات متقدمة لأداء فندقك
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="week" className="text-white focus:bg-white/10 focus:text-white">هذا الأسبوع</SelectItem>
                    <SelectItem value="month" className="text-white focus:bg-white/10 focus:text-white">هذا الشهر</SelectItem>
                    <SelectItem value="quarter" className="text-white focus:bg-white/10 focus:text-white">هذا الربع</SelectItem>
                    <SelectItem value="year" className="text-white focus:bg-white/10 focus:text-white">هذا العام</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
                
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {kpiCards.map((kpi, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 group hover:scale-105">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${kpi.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <kpi.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      kpi.changeType === 'increase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {kpi.changeType === 'increase' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {kpi.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-white/80 text-sm font-medium">{kpi.title}</h3>
                    <div className="text-2xl lg:text-3xl font-bold text-white">{kpi.value}</div>
                    <p className="text-white/60 text-xs">{kpi.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-xs">الهدف: {kpi.target}</span>
                      <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${kpi.color} rounded-full w-4/5`}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-green-400" />
                  الإيرادات الشهرية
                </CardTitle>
                <CardDescription className="text-white/70">
                  تطور الإيرادات خلال الـ 12 شهر الماضية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2 p-4">
                  {[2.1, 1.8, 2.3, 2.0, 2.5, 2.2, 2.7, 2.4, 2.6, 2.3, 2.8, 2.4].map((value, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div 
                        className="w-8 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:scale-105"
                        style={{ height: `${(value / 3) * 100}%` }}
                      ></div>
                      <span className="text-white/60 text-xs">
                        {['ج', 'ف', 'م', 'أ', 'م', 'ج', 'ج', 'أ', 'س', 'أ', 'ن', 'د'][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
                      <span className="text-white/80">الإيرادات (مليون ريال)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-blue-400" />
                  أداء الأقسام
                </CardTitle>
                <CardDescription className="text-white/70">
                  توزيع الإيرادات حسب القسم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${dept.color} rounded-lg flex items-center justify-center`}>
                            <dept.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-medium">{dept.name}</span>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-semibold">{dept.revenue}</div>
                          <div className="text-green-400 text-sm">{dept.growth}</div>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${dept.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${dept.percentage}%` }}
                          ></div>
                        </div>
                        <span className="absolute left-2 top-0 text-white/60 text-xs">{dept.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Ratings */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  تقييمات العملاء
                </CardTitle>
                <CardDescription className="text-white/70">
                  توزيع التقييمات الحالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ratingsData.map((rating, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-medium">{rating.rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${rating.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm min-w-[40px]">
                        {rating.count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">متوسط التقييم: 4.8/5</span>
                  </div>
                  <p className="text-yellow-200/80 text-sm mt-1">
                    أداء ممتاز! 91% من العملاء راضون جداً
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-400" />
                  الأهداف والمؤشرات
                </CardTitle>
                <CardDescription className="text-white/70">
                  تتبع تحقيق الأهداف الشهرية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{goal.title}</h4>
                        <Badge className={
                          goal.status === 'achieved' ? 'bg-green-500/20 text-green-400' :
                          goal.status === 'on-track' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {goal.status === 'achieved' && <CheckCircle className="w-3 h-3 ml-1" />}
                          {goal.status === 'on-track' && <TrendingUp className="w-3 h-3 ml-1" />}
                          {goal.status === 'behind' && <AlertTriangle className="w-3 h-3 ml-1" />}
                          {goal.status === 'achieved' ? 'محقق' : goal.status === 'on-track' ? 'على المسار' : 'متأخر'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">الحالي: {goal.current}</span>
                        <span className="text-white/80 text-sm">الهدف: {goal.target}</span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              goal.status === 'achieved' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              goal.status === 'on-track' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-white/60 text-xs mt-2">{goal.period}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-3">
                <Activity className="w-6 h-6 text-green-400" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => router.push('/dashboard/rooms')}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 h-20 flex flex-col gap-2"
                >
                  <Bed className="w-6 h-6" />
                  <span className="text-sm">إدارة الغرف</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/crm/whatsapp')}
                  className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 h-20 flex flex-col gap-2"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">CRM</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard/accounting')}
                  className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 h-20 flex flex-col gap-2"
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">المحاسبة</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 h-20 flex flex-col gap-2"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">لوحة التحكم</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}