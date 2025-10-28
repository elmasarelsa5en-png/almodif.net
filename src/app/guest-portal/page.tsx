'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { 
  Hotel, 
  User, 
  Phone, 
  Home as HomeIcon,
  Calendar,
  Clock,
  ShoppingCart,
  LogOut,
  Menu,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  CalendarCheck,
  CalendarClock
} from 'lucide-react';

interface GuestSession {
  name: string;
  phone: string;
  roomNumber: string;
  loginTime: string;
  checkInDate?: string;
  checkOutDate?: string;
}

interface GuestRequest {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function GuestPortalPage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);
  const [hotelName, setHotelName] = useState('فندق سيفن سون');
  const [hotelLogo, setHotelLogo] = useState('');

  useEffect(() => {
    // التحقق من تسجيل دخول النزيل
    const sessionData = localStorage.getItem('guest_session');
    if (!sessionData) {
      router.push('/guest-login');
      return;
    }
    
    const session: GuestSession = JSON.parse(sessionData);
    setGuestSession(session);

    // جلب بيانات الغرفة
    const rooms = JSON.parse(localStorage.getItem('hotel_rooms_data') || '[]');
    const room = rooms.find((r: any) => r.number === session.roomNumber);
    setRoomData(room);

    // جلب طلبات النزيل
    const allRequests = JSON.parse(localStorage.getItem('guest_requests') || '[]');
    const myRequests = allRequests.filter((req: any) => 
      req.room === session.roomNumber && req.guest === session.name
    );
    setGuestRequests(myRequests);

    // جلب إعدادات الفندق
    const menuSettings = localStorage.getItem('guest_menu_settings');
    if (menuSettings) {
      const settings = JSON.parse(menuSettings);
      if (settings.logoUrl) setHotelLogo(settings.logoUrl);
      if (settings.hotelName) setHotelName(settings.hotelName);
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج من البورتال؟')) {
      localStorage.removeItem('guest_session');
      router.push('/guest-login');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (!guestSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const daysStaying = roomData?.checkInDate 
    ? Math.ceil((new Date().getTime() - new Date(roomData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen relative overflow-x-hidden" dir="rtl">
      <AnimatedBackground />
      
      {/* Content Layer */}
      <div className="relative z-10 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg shadow-lg border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* شعار الفندق */}
              <div className="flex items-center gap-3">
                {hotelLogo ? (
                  <img src={hotelLogo} alt="Logo" className="h-12 w-auto object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <Hotel className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {hotelName}
                  </h1>
                  <p className="text-blue-200/70 text-xs">بورتال النزلاء</p>
                </div>
              </div>

              {/* أزرار التنقل */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push('/guest-menu-unified')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  <Menu className="w-4 h-4 ml-2" />
                  المنيو
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ترحيب */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/10 p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  مرحباً بك {guestSession.name}
                </h2>
              </div>
              
              <p className="text-blue-100 text-lg mb-6">
                أنت الآن مقيم في {hotelName}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <HomeIcon className="w-5 h-5 text-white" />
                    <span className="text-blue-200 text-sm">غرفتك</span>
                  </div>
                  <p className="text-white text-2xl font-bold">#{guestSession.roomNumber}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-white" />
                    <span className="text-blue-200 text-sm">مدة الإقامة</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{daysStaying > 0 ? `${daysStaying} يوم` : 'جديد'}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <span className="text-blue-200 text-sm">طلباتك</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{guestRequests.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الأقسام */}
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* بيانات الإقامة */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <Hotel className="w-6 h-6" />
                تفاصيل الإقامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
                    <User className="w-4 h-4" />
                    <span>اسم النزيل</span>
                  </div>
                  <p className="text-white font-bold text-lg">{guestSession.name}</p>
                </div>

                {guestSession.phone && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
                      <Phone className="w-4 h-4" />
                      <span>رقم الهاتف</span>
                    </div>
                    <p className="text-white font-bold text-lg">{guestSession.phone}</p>
                  </div>
                )}

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
                    <HomeIcon className="w-4 h-4" />
                    <span>نوع الغرفة</span>
                  </div>
                  <p className="text-white font-bold text-lg">{roomData?.type || 'غرفة'}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
                    <CalendarCheck className="w-4 h-4" />
                    <span>حالة الغرفة</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                    مشغولة
                  </Badge>
                </div>
              </div>

              {roomData?.balance !== undefined && roomData.balance > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-yellow-300" />
                    <div>
                      <p className="text-yellow-200 text-sm font-medium">الرصيد المستحق</p>
                      <p className="text-white text-2xl font-bold">{roomData.balance.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* طلباتي */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xl">
                  <FileText className="w-6 h-6" />
                  طلباتي
                </div>
                <Badge className="bg-white/20 text-white border border-white/30">
                  {guestRequests.length} طلب
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {guestRequests.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-blue-300/30 mx-auto mb-4" />
                  <p className="text-blue-200/70 text-lg mb-4">لم تقم بأي طلبات بعد</p>
                  <Button
                    onClick={() => router.push('/guest-menu-unified')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Menu className="w-4 h-4 ml-2" />
                    اطلب الآن من المنيو
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {guestRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{request.type}</h4>
                          <p className="text-blue-200/80 text-sm">
                            {new Date(request.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1.5 px-3 py-1.5`}>
                          {getStatusIcon(request.status)}
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-blue-100/80 text-sm whitespace-pre-wrap">{request.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* إجراءات سريعة */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <Sparkles className="w-6 h-6" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/guest-menu-unified')}
                  className="h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold shadow-lg"
                >
                  <Menu className="w-6 h-6 ml-2" />
                  تصفح المنيو الإلكتروني
                </Button>

                <Button
                  onClick={() => alert('قريباً: احجز إقامتك القادمة!')}
                  className="h-20 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold shadow-lg"
                >
                  <CalendarClock className="w-6 h-6 ml-2" />
                  احجز إقامة قادمة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
