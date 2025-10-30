'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  Building2, 
  Plane, 
  MapPin,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PlatformBooking {
  id: string;
  bookingNumber: string;
  platform: 'booking' | 'almosafer' | 'agoda' | 'airport' | 'website' | 'elmasarelsa5en';
  guestName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  commission: number;
  status: string;
  createdAt: string;
}

export default function BookingPlatformsPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformBookings, setPlatformBookings] = useState<PlatformBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingsFromFirebase();
  }, []);

  const loadBookingsFromFirebase = async () => {
    try {
      setLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('source', '==', 'guest-app'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const websiteBookings: PlatformBooking[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const checkIn = data.checkInDate?.toDate ? data.checkInDate.toDate() : new Date(data.checkInDate);
        const checkOut = data.checkOutDate?.toDate ? data.checkOutDate.toDate() : new Date(data.checkOutDate);
        
        return {
          id: doc.id,
          bookingNumber: `WEB-${doc.id.substring(0, 6).toUpperCase()}`,
          platform: 'website' as const,
          guestName: data.guestName || 'ضيف',
          roomName: data.roomNumber || data.roomId || '-',
          checkInDate: checkIn.toLocaleDateString('ar-EG'),
          checkOutDate: checkOut.toLocaleDateString('ar-EG'),
          nights: data.totalNights || 1,
          totalPrice: data.totalAmount || 0,
          commission: 0, // لا عمولة للموقع الإلكتروني
          status: data.status === 'confirmed' ? 'مؤكد' : data.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('ar-EG') : '-'
        };
      });

      // بيانات وهمية للمنصات الأخرى
      const otherPlatformBookings: PlatformBooking[] = [
        {
          id: '1',
          bookingNumber: 'BKG-1001',
          platform: 'booking',
          guestName: 'John Smith',
          roomName: '201',
          checkInDate: '20-10-2025',
          checkOutDate: '25-10-2025',
          nights: 5,
          totalPrice: 2500,
          commission: 375,
          status: 'مؤكد',
          createdAt: '18-10-2025'
        },
        {
          id: '2',
          bookingNumber: 'ALM-5042',
          platform: 'almosafer',
          guestName: 'محمد أحمد',
          roomName: '305',
          checkInDate: '22-10-2025',
          checkOutDate: '28-10-2025',
          nights: 6,
          totalPrice: 3600,
          commission: 540,
          status: 'مؤكد',
          createdAt: '19-10-2025'
        },
        {
          id: '3',
          bookingNumber: 'AGD-7823',
          platform: 'agoda',
          guestName: 'Emma Watson',
          roomName: '102',
          checkInDate: '21-10-2025',
          checkOutDate: '24-10-2025',
          nights: 3,
          totalPrice: 1800,
          commission: 270,
          status: 'مؤكد',
          createdAt: '19-10-2025'
        },
        {
          id: '4',
          bookingNumber: 'APT-3401',
          platform: 'airport',
          guestName: 'عبدالله سعيد',
          roomName: '401',
          checkInDate: '19-10-2025',
          checkOutDate: '20-10-2025',
          nights: 1,
          totalPrice: 500,
          commission: 50,
          status: 'مكتمل',
          createdAt: '19-10-2025'
        }
      ];

      setPlatformBookings([...websiteBookings, ...otherPlatformBookings]);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // في حالة الخطأ، استخدم البيانات الوهمية فقط
      setPlatformBookings([
        {
          id: '1',
          bookingNumber: 'BKG-1001',
          platform: 'booking',
          guestName: 'John Smith',
          roomName: '201',
          checkInDate: '20-10-2025',
          checkOutDate: '25-10-2025',
          nights: 5,
          totalPrice: 2500,
          commission: 375,
          status: 'مؤكد',
          createdAt: '18-10-2025'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      name: 'الموقع الإلكتروني',
      value: 'website',
      icon: Globe,
      color: 'from-cyan-500 to-blue-600',
      count: platformBookings.filter(b => b.platform === 'website').length,
      revenue: platformBookings.filter(b => b.platform === 'website').reduce((sum, b) => sum + b.totalPrice, 0),
      description: 'حجوزات من تطبيق النزلاء'
    },
    {
      name: 'Booking.com',
      value: 'booking',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      count: platformBookings.filter(b => b.platform === 'booking').length,
      revenue: platformBookings.filter(b => b.platform === 'booking').reduce((sum, b) => sum + b.totalPrice, 0)
    },
    {
      name: 'المسافر',
      value: 'almosafer',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      count: platformBookings.filter(b => b.platform === 'almosafer').length,
      revenue: platformBookings.filter(b => b.platform === 'almosafer').reduce((sum, b) => sum + b.totalPrice, 0)
    },
    {
      name: 'Agoda',
      value: 'agoda',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      count: platformBookings.filter(b => b.platform === 'agoda').length,
      revenue: platformBookings.filter(b => b.platform === 'agoda').reduce((sum, b) => sum + b.totalPrice, 0)
    },
    {
      name: 'المطار',
      value: 'airport',
      icon: Plane,
      color: 'from-orange-500 to-orange-600',
      count: platformBookings.filter(b => b.platform === 'airport').length,
      revenue: platformBookings.filter(b => b.platform === 'airport').reduce((sum, b) => sum + b.totalPrice, 0)
    },
    {
      name: 'المسار الساخن',
      value: 'elmasarelsa5en',
      icon: Building2,
      color: 'from-red-500 to-red-600',
      count: 0,
      revenue: 0
    }
  ];

  const getPlatformBadge = (platform: string) => {
    const badges: { [key: string]: { label: string; color: string } } = {
      website: { label: 'الموقع الإلكتروني', color: 'bg-cyan-500' },
      booking: { label: 'Booking.com', color: 'bg-blue-500' },
      almosafer: { label: 'المسافر', color: 'bg-green-500' },
      agoda: { label: 'Agoda', color: 'bg-purple-500' },
      airport: { label: 'المطار', color: 'bg-orange-500' }
    };
    return badges[platform] || { label: platform, color: 'bg-gray-500' };
  };

  const filteredBookings = platformBookings.filter(booking => {
    const matchesPlatform = selectedPlatform === 'الكل' || booking.platform === selectedPlatform;
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalCommission = filteredBookings.reduce((sum, b) => sum + b.commission, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-400" />
                منصات الحجز
              </h1>
              <p className="text-white/60 mt-1">إدارة الحجوزات من بوكينج، المسافر، أجودا والمطار</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/dashboard/booking-platforms/room-types')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                <Building2 className="w-4 h-4 ml-2" />
                أنواع الوحدات
              </Button>
              <Button
                onClick={() => router.push('/dashboard/booking-platforms/calendar')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Calendar className="w-4 h-4 ml-2" />
                التقويم
              </Button>
              <Button
                onClick={() => router.push('/dashboard/booking-platforms/settings')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Settings className="w-4 h-4 ml-2" />
                إعدادات القنوات
              </Button>
            </div>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <Card
                key={platform.value}
                className={cn(
                  "bg-gradient-to-br cursor-pointer transition-all hover:scale-105 border-none shadow-xl",
                  platform.color,
                  selectedPlatform === platform.value && "ring-4 ring-white/50"
                )}
                onClick={() => setSelectedPlatform(selectedPlatform === platform.value ? 'الكل' : platform.value)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <platform.icon className="w-8 h-8 text-white" />
                    <Badge className="bg-white/20 text-white border-none">
                      {platform.count} حجز
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-bold text-white mb-1">{platform.name}</h3>
                  <p className="text-white/80 text-sm">
                    {platform.revenue.toLocaleString('ar-EG')} ر.ع
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  إجمالي الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {totalRevenue.toLocaleString('ar-EG')} ر.ع
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  إجمالي العمولات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {totalCommission.toLocaleString('ar-EG')} ر.ع
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  عدد الحجوزات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {filteredBookings.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن حجز..."
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setSelectedPlatform('الكل')}
                >
                  <Filter className="w-4 h-4 ml-2" />
                  {selectedPlatform === 'الكل' ? 'جميع المنصات' : getPlatformBadge(selectedPlatform).label}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-right p-4 text-white/80 font-medium">رقم الحجز</th>
                      <th className="text-right p-4 text-white/80 font-medium">المنصة</th>
                      <th className="text-right p-4 text-white/80 font-medium">اسم الضيف</th>
                      <th className="text-right p-4 text-white/80 font-medium">الغرفة</th>
                      <th className="text-right p-4 text-white/80 font-medium">التواريخ</th>
                      <th className="text-right p-4 text-white/80 font-medium">الليالي</th>
                      <th className="text-right p-4 text-white/80 font-medium">المبلغ</th>
                      <th className="text-right p-4 text-white/80 font-medium">العمولة</th>
                      <th className="text-right p-4 text-white/80 font-medium">الحالة</th>
                      <th className="text-right p-4 text-white/80 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const platformBadge = getPlatformBadge(booking.platform);
                      return (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-blue-400">{booking.bookingNumber}</div>
                          </td>
                          <td className="p-4">
                            <Badge className={cn('text-white border-none', platformBadge.color)}>
                              {platformBadge.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-white font-medium">{booking.guestName}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{booking.roomName}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white/80 text-xs">
                              <div>{booking.checkInDate}</div>
                              <div>{booking.checkOutDate}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{booking.nights}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white font-medium">{booking.totalPrice.toLocaleString('ar-EG')} ر.ع</div>
                          </td>
                          <td className="p-4">
                            <div className="text-red-400 font-medium">{booking.commission.toLocaleString('ar-EG')} ر.ع</div>
                          </td>
                          <td className="p-4">
                            <Badge className={cn(
                              booking.status === 'مؤكد' ? 'bg-green-500' : 'bg-blue-500',
                              'text-white border-none'
                            )}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white hover:bg-white/10"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-600 text-white">
                                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                  <Eye className="w-4 h-4 ml-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                                  <Edit className="w-4 h-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </div>
    </ProtectedRoute>
  );
}
