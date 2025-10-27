'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CalendarView from '@/components/CalendarView';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import * as BookingService from '@/lib/bookings';

type ViewMode = 'list' | 'calendar';
type BookingStatus = 'غير مؤكدة' | 'قائمة' | 'جاهز_دخول' | 'جاهز_خروج' | 'قادمة' | 'مكتملة' | 'ملغية';

export default function BookingsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // States - بدون بيانات وهمية
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'الكل'>('الكل');
  const [selectedSource, setSelectedSource] = useState<string>('الكل');
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Calculate stats from bookings
  const stats = {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    totalPaid: bookings.reduce((sum, b) => sum + b.paidAmount, 0),
    activeBookings: bookings.filter(b => b.status === 'قائمة').length,
    collectedPayments: bookings.reduce((sum, b) => sum + b.paidAmount, 0),
    pendingPayments: bookings.reduce((sum, b) => sum + b.remainingBalance, 0)
  };

  // New booking form state
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    roomName: '',
    status: 'غير مؤكدة' as BookingStatus,
    source: 'حجز_مباشر' as const,
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    basePrice: 0,
    paidAmount: 0,
  });

  // Apply filters
  useEffect(() => {
    let result = bookings;

    // Search filter
    if (searchTerm) {
      result = result.filter(b =>
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'الكل') {
      result = result.filter(b => b.status === selectedStatus);
    }

    // Source filter
    if (selectedSource !== 'الكل') {
      result = result.filter(b => b.source === selectedSource);
    }

    setFilteredBookings(result);
  }, [bookings, searchTerm, selectedStatus, selectedSource]);

  // Add new booking
  const handleCreateBooking = () => {
    if (!newBooking.guestName || !newBooking.roomName || !newBooking.checkInDate || !newBooking.checkOutDate) {
      alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const checkInDate = new Date(newBooking.checkInDate);
    const checkOutDate = new Date(newBooking.checkOutDate);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      alert('⚠️ تاريخ الخروج يجب أن يكون بعد تاريخ الدخول');
      return;
    }

    const totalPrice = newBooking.basePrice * nights;
    const remainingBalance = totalPrice - newBooking.paidAmount;

    const booking = BookingService.createBooking({
      guestId: Date.now().toString(),
      guestName: newBooking.guestName,
      roomId: Date.now().toString(),
      roomName: newBooking.roomName,
      status: newBooking.status,
      source: newBooking.source,
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      nights,
      basePrice: newBooking.basePrice,
      totalPrice,
      paidAmount: newBooking.paidAmount,
      remainingBalance,
      paymentStatus: newBooking.paidAmount >= totalPrice ? 'مسدد' : 'جزئي',
      numberOfGuests: newBooking.numberOfGuests,
    });

    setBookings([...bookings, booking]);
    setShowNewBookingDialog(false);
    setNewBooking({
      guestName: '',
      roomName: '',
      status: 'غير مؤكدة',
      source: 'حجز_مباشر',
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: 1,
      basePrice: 0,
      paidAmount: 0,
    });

    alert('✅ تم إنشاء الحجز بنجاح!');
  };

  // Delete booking
  const handleDeleteBooking = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      BookingService.deleteBooking(id);
      setBookings(BookingService.getBookings());
    }
  };

  // View booking details
  const handleViewDetails = (booking: any) => {
    alert(`تفاصيل الحجز:\n\nرقم الحجز: ${booking.bookingNumber}\nالضيف: ${booking.guestName}\nالغرفة: ${booking.roomName}\nالحالة: ${booking.status}\nتاريخ الدخول: ${booking.checkInDate}\nتاريخ الخروج: ${booking.checkOutDate}\nعدد الليالي: ${booking.nights}\nالإجمالي: ${booking.totalPrice} ر.ع\nالمدفوع: ${booking.paidAmount} ر.ع\nالمتبقي: ${booking.remainingBalance} ر.ع`);
  };

  // Edit booking
  const handleEditBooking = (booking: any) => {
    router.push(`/bookings/edit/${booking.id}`);
  };

  // Status badge colors
  const getStatusColor = (status: BookingStatus) => {
    const colors: Record<BookingStatus, string> = {
      'غير مؤكدة': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'قائمة': 'bg-green-500/20 text-green-300 border-green-500/30',
      'جاهز_دخول': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'جاهز_خروج': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'قادمة': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'مكتملة': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'ملغية': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return colors[status];
  };

  // Payment status color
  const getPaymentColor = (status: string) => {
    return status === 'مسدد'
      ? 'text-green-400'
      : status === 'جزئي'
      ? 'text-yellow-400'
      : 'text-red-400';
  };

  const statCards = [
    {
      icon: Calendar,
      label: 'إجمالي الحجوزات',
      value: stats.totalBookings,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      label: 'الحجوزات النشطة',
      value: stats.activeBookings,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: DollarSign,
      label: 'الدائن (الإيرادات)',
      value: `${stats.collectedPayments.toLocaleString()} ر.ع`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingDown,
      label: 'المدين (المتأخرات)',
      value: `${stats.pendingPayments.toLocaleString()} ر.ع`,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6 relative overflow-hidden" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    إدارة الحجوزات
                  </h1>
                  <p className="text-blue-200/80 text-sm md:text-base">
                    إدارة شاملة لجميع حجوزات الفندق والعملاء
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  onClick={() => setShowNewBookingDialog(true)}
                  className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  حجز جديد
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                    <DropdownMenuItem className="text-white hover:bg-slate-800">
                      تصدير كـ CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-800">
                      تصدير كـ PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-800">
                      طباعة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-blue-200/70 text-sm mb-2">{stat.label}</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                        `bg-gradient-to-r ${stat.color}`
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters and Search */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <Input
                    placeholder="ابحث بـ: اسم الضيف، رقم الحجز، اسم الغرفة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-white/5 border-white/20 text-white placeholder:text-blue-200/50"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-white/5 border border-white/20 rounded-lg p-1">
                  <Button
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "rounded",
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'bg-transparent text-blue-200 hover:bg-white/10'
                    )}
                  >
                    قائمة
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                      "rounded",
                      viewMode === 'calendar'
                        ? 'bg-blue-500 text-white'
                        : 'bg-transparent text-blue-200 hover:bg-white/10'
                    )}
                  >
                    تقويم
                  </Button>
                </div>

                {/* Filter Button */}
                <Button
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilter && (
                <div className="pt-4 border-t border-white/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">الحالة</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as BookingStatus | 'الكل')}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                      >
                        <option value="الكل">جميع الحالات</option>
                        <option value="غير مؤكدة">غير مؤكدة</option>
                        <option value="قائمة">قائمة</option>
                        <option value="جاهز_دخول">جاهز لتسجيل الدخول</option>
                        <option value="جاهز_خروج">جاهز لتسجيل الخروج</option>
                        <option value="قادمة">قادمة</option>
                        <option value="مكتملة">مكتملة</option>
                        <option value="ملغية">ملغية</option>
                      </select>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">مصدر الحجز</label>
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                      >
                        <option value="الكل">جميع المصادر</option>
                        <option value="حجز_مباشر">حجز مباشر</option>
                        <option value="موقع_الكتروني">موقع إلكتروني</option>
                        <option value="وكيل_سفر">وكيل سفر</option>
                        <option value="تطبيق_الهاتف">تطبيق الهاتف</option>
                      </select>
                    </div>

                    {/* Advanced Options */}
                    <div>
                      <label className="block text-sm text-blue-200 mb-2">خيارات متقدمة</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                            المزيد
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 w-48">
                          <DropdownMenuLabel className="text-white">خيارات بحث متقدمة</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-white hover:bg-slate-800">
                            رقم الهوية/الجواز
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-slate-800">
                            تاريخ الوصول
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-slate-800">
                            تاريخ المغادرة
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-slate-800">
                            اسم أو رقم الغرفة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-white/20 p-6">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                الحجوزات ({filteredBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">لا توجد حجوزات</p>
                </div>
              ) : viewMode === 'calendar' ? (
                <CalendarView bookings={filteredBookings} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5">
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">المصدر</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">العقد</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الضيف</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الوحدة</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الليالي</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الإجمالي</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الحالة</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الدخول</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الخروج</th>
                        <th className="px-6 py-4 text-right text-blue-300 font-semibold">الخيارات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs text-blue-300">{booking.source === 'حجز_مباشر' ? '📞' : booking.source === 'موقع_الكتروني' ? '💻' : '🏢'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{booking.bookingNumber}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white">{booking.guestName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-blue-300">{booking.roomName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white">{booking.nights} ليلة</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">{booking.totalPrice.toLocaleString()} ر.ع</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn('text-xs', getStatusColor(booking.status))}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-blue-300 text-sm">{booking.checkInDate}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-blue-300 text-sm">{booking.checkOutDate}</span>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-white bg-blue-600 hover:bg-blue-700 border-blue-500 px-4"
                                >
                                  الإجراءات
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                className="bg-slate-800 border-slate-600 shadow-xl min-w-[180px] mt-2"
                              >
                                <DropdownMenuItem 
                                  onClick={() => handleViewDetails(booking)}
                                  className="text-white hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:text-white"
                                >
                                  <Eye className="w-4 h-4 ml-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEditBooking(booking)}
                                  className="text-white hover:bg-slate-700 cursor-pointer focus:bg-slate-700 focus:text-white"
                                >
                                  <Edit className="w-4 h-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="text-red-400 hover:bg-red-900/20 cursor-pointer focus:bg-red-900/20 focus:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New Booking Dialog */}
        <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
          <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">إنشاء حجز جديد</DialogTitle>
              <DialogDescription className="text-slate-400">
                أدخل بيانات الحجز الجديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Guest Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الضيف *</label>
                <Input
                  value={newBooking.guestName}
                  onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
                  placeholder="أدخل اسم الضيف"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Room Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم/رقم الغرفة *</label>
                <Input
                  value={newBooking.roomName}
                  onChange={(e) => setNewBooking({ ...newBooking, roomName: e.target.value })}
                  placeholder="مثال: غرفة 101 أو جناح A"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Check-in Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ الدخول *</label>
                  <Input
                    type="date"
                    value={newBooking.checkInDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ الخروج *</label>
                  <Input
                    type="date"
                    value={newBooking.checkOutDate}
                    onChange={(e) => setNewBooking({ ...newBooking, checkOutDate: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Number of Guests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد النزلاء</label>
                  <Input
                    type="number"
                    value={newBooking.numberOfGuests}
                    onChange={(e) => setNewBooking({ ...newBooking, numberOfGuests: parseInt(e.target.value) })}
                    min="1"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {/* Base Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">سعر الليلة *</label>
                  <Input
                    type="number"
                    value={newBooking.basePrice}
                    onChange={(e) => setNewBooking({ ...newBooking, basePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الحالة</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({ ...newBooking, status: e.target.value as BookingStatus })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="غير مؤكدة">غير مؤكدة</option>
                    <option value="قائمة">قائمة</option>
                    <option value="جاهز_دخول">جاهز لتسجيل الدخول</option>
                    <option value="جاهز_خروج">جاهز لتسجيل الخروج</option>
                    <option value="قادمة">قادمة</option>
                  </select>
                </div>

                {/* Paid Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">المبلغ المدفوع</label>
                  <Input
                    type="number"
                    value={newBooking.paidAmount}
                    onChange={(e) => setNewBooking({ ...newBooking, paidAmount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <label className="text-sm font-medium">مصدر الحجز</label>
                <select
                  value={newBooking.source}
                  onChange={(e) => setNewBooking({ ...newBooking, source: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="حجز_مباشر">حجز مباشر</option>
                  <option value="موقع_الكتروني">موقع إلكتروني</option>
                  <option value="وكيل_سفر">وكيل سفر</option>
                  <option value="تطبيق_الهاتف">تطبيق الهاتف</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewBookingDialog(false)}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateBooking}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 ml-2" />
                إنشاء الحجز
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
