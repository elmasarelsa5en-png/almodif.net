'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  Home,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  CreditCard,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

interface BookingData {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestNationalId: string;
  roomType: string;
  assignedRoomNumber?: string;
  checkInDate: any;
  checkOutDate: any;
  totalNights: number;
  pricePerNight: number;
  totalAmount: number;
  paidAmount?: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus?: 'pending' | 'partial' | 'paid';
  contractSigned?: boolean;
  signatureMethod?: string;
  createdAt: any;
  updatedAt: any;
}

export default function TrackBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (bookingDoc.exists()) {
        setBooking({ id: bookingDoc.id, ...bookingDoc.data() } as BookingData);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error loading booking:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any; bg: string }> = {
      'pending': { 
        label: 'قيد الانتظار', 
        color: 'text-amber-600', 
        icon: Clock,
        bg: 'bg-amber-50 border-amber-200'
      },
      'confirmed': { 
        label: 'مؤكد', 
        color: 'text-green-600', 
        icon: CheckCircle,
        bg: 'bg-green-50 border-green-200'
      },
      'checked-in': { 
        label: 'تم تسجيل الدخول', 
        color: 'text-blue-600', 
        icon: CheckCircle,
        bg: 'bg-blue-50 border-blue-200'
      },
      'checked-out': { 
        label: 'تم المغادرة', 
        color: 'text-gray-600', 
        icon: CheckCircle,
        bg: 'bg-gray-50 border-gray-200'
      },
      'cancelled': { 
        label: 'ملغي', 
        color: 'text-red-600', 
        icon: AlertCircle,
        bg: 'bg-red-50 border-red-200'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getTimelineSteps = () => {
    const steps = [
      {
        id: 1,
        title: 'الحجز',
        description: 'تم إنشاء الحجز',
        completed: true,
        date: booking?.createdAt
      },
      {
        id: 2,
        title: 'الدفع',
        description: booking?.paymentStatus === 'paid' ? 'تم الدفع بالكامل' : booking?.paidAmount ? `تم دفع ${booking.paidAmount} ر.س` : 'في انتظار الدفع',
        completed: !!booking?.paidAmount,
        date: booking?.updatedAt
      },
      {
        id: 3,
        title: 'تخصيص الغرفة',
        description: booking?.assignedRoomNumber ? `غرفة رقم ${booking.assignedRoomNumber}` : 'قيد التخصيص',
        completed: !!booking?.assignedRoomNumber,
        date: booking?.assignedRoomNumber ? booking?.updatedAt : null
      },
      {
        id: 4,
        title: 'التوقيع على العقد',
        description: booking?.contractSigned ? 'تم التوقيع' : 'في انتظار التوقيع',
        completed: booking?.contractSigned || false,
        date: booking?.contractSigned ? booking?.updatedAt : null
      },
      {
        id: 5,
        title: 'تسجيل الدخول',
        description: booking?.status === 'checked-in' ? 'مرحباً بك!' : 'في انتظار الوصول',
        completed: booking?.status === 'checked-in',
        date: booking?.status === 'checked-in' ? booking?.updatedAt : booking?.checkInDate
      }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل بيانات الحجز...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الحجز غير موجود</h2>
          <p className="text-gray-600 mb-6">رقم الحجز غير صحيح أو تم حذفه</p>
          <Button onClick={() => router.push('/public/landing')} className="w-full">
            <Home className="ml-2 h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;
  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${statusInfo.bg} border-2 rounded-full mb-4`}>
            <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">تتبع الحجز</h1>
          <p className="text-gray-600 text-lg">رقم الحجز: {bookingId}</p>
          <div className={`inline-block mt-2 px-4 py-2 ${statusInfo.bg} border-2 rounded-full`}>
            <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>

        {/* Timeline */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">مراحل الحجز</h2>
          <div className="space-y-4">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                {/* Line and Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-0.5 h-12 ${
                      step.completed ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className={step.completed ? 'text-green-600' : 'text-gray-500'}>
                    {step.description}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(step.date.toDate ? step.date.toDate() : step.date).toLocaleString('ar-SA')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">تفاصيل الحجز</h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Guest Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-bold text-gray-900">{booking.guestName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الهاتف</p>
                  <p className="font-bold text-gray-900" dir="ltr">{booking.guestPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">البريد</p>
                  <p className="font-bold text-gray-900" dir="ltr">{booking.guestEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Building2 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الغرفة</p>
                  <p className="font-bold text-gray-900 text-xl">
                    {booking.assignedRoomNumber || 'قيد التخصيص'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-gray-900">تاريخ الدخول</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {new Date(booking.checkInDate.toDate()).toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <p className="font-semibold text-gray-900">تاريخ الخروج</p>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {new Date(booking.checkOutDate.toDate()).toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">الملخص المالي</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">السعر لليلة</p>
                  <p className="text-xl font-bold text-gray-900">{booking.pricePerNight} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">عدد الليالي</p>
                  <p className="text-xl font-bold text-gray-900">{booking.totalNights}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الإجمالي</p>
                  <p className="text-xl font-bold text-green-600">{booking.totalAmount} ر.س</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المدفوع</p>
                  <p className="text-xl font-bold text-blue-600">{booking.paidAmount || 0} ر.س</p>
                </div>
              </div>

              {booking.paidAmount && booking.paidAmount < booking.totalAmount && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">المتبقي</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {booking.totalAmount - booking.paidAmount} ر.س
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Status */}
            {booking.contractSigned && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">تم التوقيع على العقد</p>
                  <p className="text-sm text-gray-600">
                    {booking.signatureMethod === 'electronic' ? 'توقيع إلكتروني' : 'سيتم التوقيع عند الوصول'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            onClick={() => router.push('/public/landing')}
            variant="outline"
            size="lg"
          >
            <Home className="ml-2 h-5 w-5" />
            الصفحة الرئيسية
          </Button>
          
          {!booking.contractSigned && booking.assignedRoomNumber && (
            <Button 
              onClick={() => router.push(`/guest-app/contract?bookingId=${bookingId}`)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <FileText className="ml-2 h-5 w-5" />
              توقيع العقد
            </Button>
          )}
        </div>

        {/* Contact Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center mt-6">
          <h3 className="text-xl font-bold mb-2">تحتاج مساعدة؟</h3>
          <p className="mb-4">تواصل معنا على مدار الساعة</p>
          <div className="flex justify-center gap-4">
            <a href="tel:+966504755400" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              📞 +966 50 475 5400
            </a>
            <a href="mailto:info@almodif.net" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              📧 info@almodif.net
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
