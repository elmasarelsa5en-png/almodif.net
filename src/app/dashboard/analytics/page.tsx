'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Bed,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Percent,
  Eye,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Star,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Room {
  id: string;
  number: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  price: number;
}

interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
}

const AnalyticsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load rooms
      const savedRooms = localStorage.getItem('hotel-rooms');
      if (savedRooms) {
        setRooms(JSON.parse(savedRooms));
      }

      // Load bookings
      const savedBookings = localStorage.getItem('hotel-bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;

  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';
  const availabilityRate = totalRooms > 0 ? ((availableRooms / totalRooms) * 100).toFixed(1) : '0';

  // Active bookings
  const today = new Date();
  const activeBookings = bookings.filter(b => {
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    return checkIn <= today && checkOut >= today && b.status !== 'cancelled';
  });

  // Revenue
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const avgBookingValue = activeBookings.length > 0 ? (totalRevenue / activeBookings.length).toFixed(0) : '0';

  // Get occupancy status
  const getOccupancyStatus = () => {
    const rate = parseFloat(occupancyRate);
    if (rate < 50) return { status: 'منخفض', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: TrendingDown };
    if (rate < 70) return { status: 'متوسط', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: Activity };
    if (rate < 85) return { status: 'جيد', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: TrendingUp };
    return { status: 'ممتاز', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: Zap };
  };

  const occupancyStatus = getOccupancyStatus();
  const StatusIcon = occupancyStatus.icon;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">تحليلات الأداء</h1>
                <p className="text-slate-400">مؤشرات الأداء الرئيسية للفندق</p>
              </div>
            </div>
          </div>

          {/* Main Occupancy Card - Hero */}
          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border-blue-400/30 mb-8 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-16 h-16 ${occupancyStatus.bgColor} rounded-2xl flex items-center justify-center`}>
                      <StatusIcon className={`w-8 h-8 ${occupancyStatus.color}`} />
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm">معدل الإشغال الحالي</p>
                      <p className={`text-sm font-semibold ${occupancyStatus.color}`}>{occupancyStatus.status}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-6xl font-bold text-white">{occupancyRate}</span>
                      <span className="text-3xl text-slate-300">%</span>
                    </div>
                    <p className="text-slate-400">
                      {occupiedRooms} من {totalRooms} غرفة مشغولة حالياً
                    </p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">متاحة:</span>
                        <span className="text-green-400 font-bold ml-1">{availableRooms}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">صيانة:</span>
                        <span className="text-yellow-400 font-bold ml-1">{maintenanceRooms}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">تنظيف:</span>
                        <span className="text-blue-400 font-bold ml-1">{cleaningRooms}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Recommendations */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <Target className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-bold mb-2">توصيات الأداء</h4>
                        {parseFloat(occupancyRate) < 50 && (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-300">• تفعيل عروض ترويجية خاصة</p>
                            <p className="text-sm text-slate-300">• التواصل مع العملاء السابقين</p>
                            <p className="text-sm text-slate-300">• زيادة الحملات التسويقية</p>
                          </div>
                        )}
                        {parseFloat(occupancyRate) >= 50 && parseFloat(occupancyRate) < 85 && (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-300">• الأداء جيد، استمر في الاستراتيجية الحالية</p>
                            <p className="text-sm text-slate-300">• راقب التقييمات والمراجعات</p>
                            <p className="text-sm text-slate-300">• حسّن تجربة الضيوف</p>
                          </div>
                        )}
                        {parseFloat(occupancyRate) >= 85 && (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-300">• أداء ممتاز! يمكن رفع الأسعار</p>
                            <p className="text-sm text-slate-300">• ركز على العملاء المميزين</p>
                            <p className="text-sm text-slate-300">• حافظ على جودة الخدمة</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <p className="text-slate-400 text-xs">حجوزات نشطة</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{activeBookings.length}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-5 h-5 text-blue-400" />
                        <p className="text-slate-400 text-xs">نسبة التوفر</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{availabilityRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Rooms */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6 text-blue-400" />
                  </div>
                  <Eye className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">إجمالي الغرف</p>
                  <p className="text-3xl font-bold text-white">{totalRooms}</p>
                </div>
              </CardContent>
            </Card>

            {/* Occupied Rooms */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <ArrowUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">غرف مشغولة</p>
                  <p className="text-3xl font-bold text-white">{occupiedRooms}</p>
                </div>
              </CardContent>
            </Card>

            {/* Available Rooms */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">غرف متاحة</p>
                  <p className="text-3xl font-bold text-white">{availableRooms}</p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">ر.س</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Bookings Details */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  الحجوزات النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300 text-sm">عدد الحجوزات</span>
                    <span className="text-white font-bold">{activeBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300 text-sm">متوسط قيمة الحجز</span>
                    <span className="text-white font-bold">{avgBookingValue} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-slate-300 text-sm">الإجمالي</span>
                    <span className="text-green-400 font-bold">{totalRevenue.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Status Distribution */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  توزيع حالات الغرف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <span className="text-green-300 text-sm">متاحة</span>
                    <span className="text-white font-bold">{availableRooms}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <span className="text-blue-300 text-sm">مشغولة</span>
                    <span className="text-white font-bold">{occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <span className="text-yellow-300 text-sm">صيانة</span>
                    <span className="text-white font-bold">{maintenanceRooms}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <span className="text-purple-300 text-sm">تنظيف</span>
                    <span className="text-white font-bold">{cleaningRooms}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  مؤشرات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 text-sm">معدل الإشغال</span>
                      <span className={`font-bold ${occupancyStatus.color}`}>{occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 text-sm">نسبة التوفر</span>
                      <span className="text-green-400 font-bold">{availabilityRate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${availabilityRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${occupancyStatus.bgColor} border ${occupancyStatus.color.replace('text-', 'border-')}/30`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${occupancyStatus.color}`} />
                      <div>
                        <p className="text-white text-sm font-bold">الحالة: {occupancyStatus.status}</p>
                        <p className="text-slate-300 text-xs mt-1">
                          {parseFloat(occupancyRate) < 50 && 'يحتاج لتحسين'}
                          {parseFloat(occupancyRate) >= 50 && parseFloat(occupancyRate) < 70 && 'أداء متوسط'}
                          {parseFloat(occupancyRate) >= 70 && parseFloat(occupancyRate) < 85 && 'أداء جيد'}
                          {parseFloat(occupancyRate) >= 85 && 'أداء ممتاز!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;
