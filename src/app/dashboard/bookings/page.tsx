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
  Bell,
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
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(true);
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  // 🔥 جلب الحجوزات من Firebase في الوقت الفعلي
  useEffect(() => {
    if (!db) {
      console.log('⚠️ Firebase غير متصل - استخدام البيانات المحلية');
      setLoading(false);
      return;
    }

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));

      // الاشتراك في التحديثات الفورية
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          
          // تحويل التواريخ إلى ISO strings لتجنب مشاكل serialization
          const checkInDate = data.checkInDate?.toDate?.() || new Date();
          const checkOutDate = data.checkOutDate?.toDate?.() || new Date();
          const createdAt = data.createdAt?.toDate?.() || new Date();
          
          // حساب عدد الليالي
          const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: doc.id,
            bookingNumber: doc.id.slice(0, 8).toUpperCase(),
            guestName: data.guestName || '',
            roomName: data.roomType || `غرفة ${data.roomNumber}`,
            roomNumber: data.roomNumber || '',
            status: mapStatus(data.status),
            source: mapSource(data.source),
            checkInDate: checkInDate.toISOString(),
            checkOutDate: checkOutDate.toISOString(),
            nights: nights > 0 ? nights : 1,
            numberOfGuests: data.numberOfGuests || 1,
            basePrice: data.pricePerNight || 0,
            totalPrice: data.totalAmount || 0,
            paidAmount: data.paidAmount || 0,
            remainingBalance: (data.totalAmount || 0) - (data.paidAmount || 0),
            discountAmount: data.discountAmount || 0,
            taxAmount: data.taxAmount || 0,
            guestPhone: data.guestPhone || '',
            guestEmail: data.guestEmail || '',
            guestNationalId: data.guestNationalId || '',
            idCopyNumber: data.idCopyNumber || '',
            companions: data.companions || [],
            notes: data.notes || '',
            createdAt: createdAt.toISOString(),
            isNew: isNewBooking(data.createdAt),
          };
        });

        // حساب الحجوزات الجديدة (آخر 5 دقائق)
        const newCount = bookingsData.filter(b => b.isNew).length;
        setNewBookingsCount(newCount);

        // إشعار صوتي للحجوزات الجديدة
        if (newCount > 0 && bookings.length > 0) {
          showNotification('🔔 حجز جديد!', `لديك ${newCount} حجز جديد`);
          playNotificationSound();
        }

        setBookings(bookingsData);
        setLoading(false);
        console.log('✅ تم جلب الحجوزات:', bookingsData.length);
      }, (error) => {
        console.error('❌ خطأ في جلب الحجوزات:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ خطأ في الاتصال بـ Firebase:', error);
      setLoading(false);
    }
  }, []);

  // تحويل الحالة من الإنجليزية للعربية
  const mapStatus = (status: string): BookingStatus => {
    const statusMap: Record<string, BookingStatus> = {
      'pending': 'غير مؤكدة',
      'confirmed': 'قائمة',
      'checked-in': 'جاهز_دخول',
      'checked-out': 'جاهز_خروج',
      'upcoming': 'قادمة',
      'completed': 'مكتملة',
      'cancelled': 'ملغية',
    };
    return statusMap[status] || 'غير مؤكدة';
  };

  // تحويل المصدر
  const mapSource = (source: string): string => {
    const sourceMap: Record<string, string> = {
      'guest-app': 'تطبيق النزلاء',
      'direct': 'حجز_مباشر',
      'booking.com': 'Booking.com',
      'airbnb': 'Airbnb',
      'agoda': 'Agoda',
      'website': 'الموقع الإلكتروني',
    };
    return sourceMap[source] || source;
  };

  // التحقق إذا كان الحجز جديد (آخر 5 دقائق)
  const isNewBooking = (createdAt: any): boolean => {
    if (!createdAt || !createdAt.toDate) return false;
    const bookingTime = createdAt.toDate().getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return (now - bookingTime) < fiveMinutes;
  };

  // تنسيق التاريخ للعرض
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // إظهار إشعار المتصفح
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/icon-192.png' });
        }
      });
    }
  };

  // تشغيل صوت الإشعار
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('⚠️ لم يتمكن من تشغيل الصوت:', e));
    } catch (error) {
      console.log('⚠️ خطأ في تشغيل الصوت:', error);
    }
  };

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
  const [viewDetailsDialog, setViewDetailsDialog] = useState<{ open: boolean; booking: any | null }>({
    open: false,
    booking: null
  });

  const handleViewDetails = (booking: any) => {
    setViewDetailsDialog({ open: true, booking });
  };

  // Edit booking
  const handleEditBooking = (booking: any) => {
    router.push(`/dashboard/bookings/edit/${booking.id}`);
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
      onClick: () => setSelectedStatus('الكل')
    },
    {
      icon: TrendingUp,
      label: 'الحجوزات النشطة',
      value: stats.activeBookings,
      color: 'from-green-500 to-emerald-500',
      onClick: () => setSelectedStatus('قائمة')
    },
    {
      icon: DollarSign,
      label: 'الدائن (الإيرادات)',
      value: `${stats.collectedPayments.toLocaleString()} ر.ع`,
      color: 'from-purple-500 to-pink-500',
      onClick: () => {
        // فلتر الحجوزات المسددة
        setFilteredBookings(bookings.filter(b => b.paidAmount > 0));
      }
    },
    {
      icon: TrendingDown,
      label: 'المدين (المتأخرات)',
      value: `${stats.pendingPayments.toLocaleString()} ر.ع`,
      color: 'from-orange-500 to-red-500',
      onClick: () => {
        // فلتر الحجوزات المتأخرة
        setFilteredBookings(bookings.filter(b => b.remainingBalance > 0));
      }
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
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
                    إدارة الحجوزات
                    {newBookingsCount > 0 && (
                      <span className="relative">
                        <Bell className="w-8 h-8 text-yellow-400 animate-bounce" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {newBookingsCount}
                        </span>
                      </span>
                    )}
                  </h1>
                  <p className="text-blue-200/80 text-sm md:text-base">
                    إدارة شاملة لجميع حجوزات الفندق والعملاء
                    {newBookingsCount > 0 && (
                      <span className="text-yellow-400 font-bold mr-2">
                        • {newBookingsCount} حجز جديد!
                      </span>
                    )}
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
                  onClick={stat.onClick}
                  className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:bg-white/15"
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
                        <option value="تطبيق النزلاء">📱 تطبيق النزلاء</option>
                        <option value="حجز_مباشر">📞 حجز مباشر</option>
                        <option value="الموقع الإلكتروني">💻 الموقع الإلكتروني</option>
                        <option value="Booking.com">🏢 Booking.com</option>
                        <option value="Airbnb">🏠 Airbnb</option>
                        <option value="Agoda">✈️ Agoda</option>
                        <option value="وكيل_سفر">🎫 وكيل سفر</option>
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
                        <tr key={booking.id} className={cn(
                          "hover:bg-white/5 transition-colors",
                          booking.isNew && "bg-yellow-500/10 border-r-4 border-yellow-400"
                        )}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-blue-300">{booking.source === 'حجز_مباشر' ? '📞' : booking.source === 'تطبيق النزلاء' ? '📱' : booking.source === 'موقع_الكتروني' ? '💻' : '🏢'}</span>
                              {booking.isNew && (
                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
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
                            <span className="text-blue-300 text-sm">{formatDate(booking.checkInDate)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-blue-300 text-sm">{formatDate(booking.checkOutDate)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(booking)}
                                className="text-white bg-blue-600 hover:bg-blue-700 border-blue-500"
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBooking(booking)}
                                className="text-white bg-green-600 hover:bg-green-700 border-green-500"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="text-white bg-red-600 hover:bg-red-700 border-red-500"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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

        {/* View Details Dialog */}
        <Dialog open={viewDetailsDialog.open} onOpenChange={(open) => setViewDetailsDialog({ open, booking: null })}>
          <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                تفاصيل الحجز
              </DialogTitle>
              <DialogDescription className="text-white/70">
                معلومات كاملة عن الحجز والضيف
              </DialogDescription>
            </DialogHeader>

            {viewDetailsDialog.booking && (
              <div className="space-y-6 py-4">
                {/* Booking Number & Status */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">رقم الحجز</p>
                      <p className="text-2xl font-bold text-white">{viewDetailsDialog.booking.bookingNumber}</p>
                    </div>
                    <Badge className={cn("px-3 py-1", getStatusColor(viewDetailsDialog.booking.status))}>
                      {viewDetailsDialog.booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">مصدر الحجز</p>
                      <p className="text-white font-medium">{viewDetailsDialog.booking.source}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">تاريخ الإنشاء</p>
                      <p className="text-white font-medium">{formatDate(viewDetailsDialog.booking.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    معلومات الضيف
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">اسم الضيف</p>
                      <p className="text-white font-medium">{viewDetailsDialog.booking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">عدد الضيوف</p>
                      <p className="text-white font-medium">{viewDetailsDialog.booking.numberOfGuests} شخص</p>
                    </div>
                  </div>
                </div>

                {/* Room & Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">الغرفة</p>
                    <p className="text-xl font-bold text-white">{viewDetailsDialog.booking.roomName}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white/60 text-sm mb-1">عدد الليالي</p>
                    <p className="text-xl font-bold text-white">{viewDetailsDialog.booking.nights} ليلة</p>
                  </div>
                </div>

                {/* Check-in & Check-out */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <p className="text-green-300 text-sm font-medium">تاريخ الدخول</p>
                    </div>
                    <p className="text-white font-bold">{formatDate(viewDetailsDialog.booking.checkInDate)}</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-red-400" />
                      <p className="text-red-300 text-sm font-medium">تاريخ الخروج</p>
                    </div>
                    <p className="text-white font-bold">{formatDate(viewDetailsDialog.booking.checkOutDate)}</p>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    التفاصيل المالية
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">السعر الأساسي</span>
                      <span className="text-white font-bold">{viewDetailsDialog.booking.basePrice.toLocaleString()} ر.ع</span>
                    </div>
                    {viewDetailsDialog.booking.discountAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">الخصم</span>
                        <span className="text-green-400 font-bold">- {viewDetailsDialog.booking.discountAmount.toLocaleString()} ر.ع</span>
                      </div>
                    )}
                    {viewDetailsDialog.booking.taxAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">الضريبة</span>
                        <span className="text-orange-400 font-bold">+ {viewDetailsDialog.booking.taxAmount.toLocaleString()} ر.ع</span>
                      </div>
                    )}
                    <div className="h-px bg-white/20 my-2"></div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-white font-bold">الإجمالي</span>
                      <span className="text-blue-400 font-bold text-2xl">{viewDetailsDialog.booking.totalPrice.toLocaleString()} ر.ع</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">المدفوع</span>
                      <span className="text-green-400 font-bold">{viewDetailsDialog.booking.paidAmount.toLocaleString()} ر.ع</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">المتبقي</span>
                      <span className={cn(
                        "font-bold",
                        viewDetailsDialog.booking.remainingBalance > 0 ? "text-red-400" : "text-green-400"
                      )}>
                        {viewDetailsDialog.booking.remainingBalance.toLocaleString()} ر.ع
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">حالة الدفع</span>
                    <Badge className={cn(
                      "px-3 py-1",
                      viewDetailsDialog.booking.paymentStatus === 'مسدد' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : viewDetailsDialog.booking.paymentStatus === 'جزئي'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    )}>
                      {viewDetailsDialog.booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setViewDetailsDialog({ open: false, booking: null })}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                إغلاق
              </Button>
              <Button
                onClick={() => {
                  setViewDetailsDialog({ open: false, booking: null });
                  if (viewDetailsDialog.booking) {
                    handleEditBooking(viewDetailsDialog.booking);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل الحجز
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
