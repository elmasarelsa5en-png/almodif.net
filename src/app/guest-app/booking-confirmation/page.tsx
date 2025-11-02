'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  CreditCard,
  DollarSign,
  FileText,
  ArrowRight,
  Home,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { notificationService } from '@/lib/notifications/notification-service';

interface BookingDetails {
  id: string;
  roomNumber: string;
  roomType: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: any;
  checkOutDate: any;
  totalNights: number;
  pricePerNight: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'pending' | 'partial' | 'paid';
  paidAmount?: number;
  createdAt: any;
}

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;

    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (bookingDoc.exists()) {
        setBooking({ id: bookingDoc.id, ...bookingDoc.data() } as BookingDetails);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMinimumPayment = () => {
    if (!booking) return 0;
    return booking.pricePerNight; // دفع يوم واحد على الأقل
  };

  const handleCopyAccountInfo = () => {
    const accountInfo = `
اسم البنك: البنك الأهلي السعودي
رقم الحساب: SA1234567890123456789012
اسم المستفيد: فندق سيفن سون
مبلغ الحجز: ${calculateMinimumPayment()} ريال
رقم الحجز: ${bookingId}
    `.trim();

    navigator.clipboard.writeText(accountInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!booking || !bookingId) return;

    setConfirming(true);
    try {
      // تحديث حالة الحجز
      await updateDoc(doc(db, 'bookings', bookingId), {
        paymentStatus: 'partial',
        paidAmount: calculateMinimumPayment(),
        status: 'confirmed',
        paymentDate: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // البحث عن غرفة متاحة بنفس النوع
      const assignedRoom = await findAndAssignRoom(booking.roomType);

      if (assignedRoom) {
        // تحديث الحجز برقم الغرفة
        await updateDoc(doc(db, 'bookings', bookingId), {
          assignedRoomNumber: assignedRoom.number,
          assignedRoomId: assignedRoom.id,
          autoAssigned: true
        });

        // إرسال إشعار للموظفين
        await notificationService.sendNotification('in_app', 'admin', {
          subject: 'تأكيد حجز جديد',
          body: `تم تأكيد الحجز ${bookingId} - تم تخصيص غرفة ${assignedRoom.number} تلقائياً`,
          type: 'custom',
          priority: 'high',
          metadata: {
            bookingId,
            roomNumber: assignedRoom.number,
            guestName: booking.guestName,
            paidAmount: calculateMinimumPayment()
          }
        });

        // توليد العقد وإرساله للضيف
        await generateAndSendContract(booking, assignedRoom.number);
      } else {
        // لا توجد غرف متاحة - إشعار للموظفين
        await notificationService.sendNotification('in_app', 'admin', {
          subject: 'حجز بدون غرفة متاحة',
          body: `تم الدفع للحجز ${bookingId} ولكن لا توجد غرف متاحة - يرجى التخصيص اليدوي`,
          type: 'custom',
          priority: 'urgent',
          metadata: {
            bookingId,
            guestName: booking.guestName,
            requestedType: booking.roomType
          }
        });
      }

      // الانتقال لصفحة العقد
      router.push(`/guest-app/contract?bookingId=${bookingId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('حدث خطأ. يرجى التواصل مع الاستقبال.');
    } finally {
      setConfirming(false);
    }
  };

  const findAndAssignRoom = async (requestedType: string) => {
    try {
      const roomsQuery = query(
        collection(db, 'rooms'),
        where('type', '==', requestedType),
        where('available', '==', true)
      );

      const snapshot = await getDocs(roomsQuery);
      if (!snapshot.empty) {
        const roomDoc = snapshot.docs[0];
        const roomData = { id: roomDoc.id, ...roomDoc.data() };

        // تحديث حالة الغرفة
        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          available: false,
          status: 'Reserved',
          guestName: booking?.guestName,
          guestId: bookingId,
          updatedAt: Timestamp.now()
        });

        return {
          id: roomDoc.id,
          number: roomData.name || roomData.number,
          type: roomData.type
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding room:', error);
      return null;
    }
  };

  const generateAndSendContract = async (bookingData: BookingDetails, roomNumber: string) => {
    try {
      const trackingUrl = `${window.location.origin}/track/${bookingId}`;
      
      // إرسال إشعار للضيف بالعقد
      await notificationService.sendNotification('whatsapp', bookingData.guestPhone, {
        subject: 'تأكيد الحجز والعقد',
        body: `🎉 تم تأكيد حجزك في فندق سيفن سون!\n\n📋 رقم الحجز: ${bookingId}\n🏨 الغرفة: ${roomNumber}\n📅 تاريخ الدخول: ${new Date(bookingData.checkInDate.toDate()).toLocaleDateString('ar-SA')}\n\n✍️ يرجى مراجعة العقد والتوقيع:\n🔗 ${window.location.origin}/guest-app/contract?bookingId=${bookingId}\n\n📊 تتبع حجزك:\n🔗 ${trackingUrl}`,
        metadata: {
          bookingId,
          roomNumber,
          trackingUrl
        }
      });
    } catch (error) {
      console.error('Error sending contract notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الحجز غير موجود</h2>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على تفاصيل الحجز</p>
          <Button onClick={() => router.push('/guest-app')} className="w-full">
            <Home className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const minimumPayment = calculateMinimumPayment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            {booking.status === 'confirmed' ? (
              <CheckCircle className="h-10 w-10 text-white" />
            ) : (
              <Clock className="h-10 w-10 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {booking.status === 'confirmed' ? 'تم تأكيد الحجز!' : 'الحجز قيد الانتظار'}
          </h1>
          <p className="text-gray-600 text-lg">
            {booking.status === 'confirmed' 
              ? 'شكراً لك! حجزك مؤكد وننتظر قدومك' 
              : 'حجزك غير مؤكد حتى إتمام الدفع'}
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">تفاصيل الحجز</h2>
            <p className="text-blue-100">رقم الحجز: {bookingId}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Guest Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-semibold text-gray-900">{booking.guestName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الهاتف</p>
                  <p className="font-semibold text-gray-900" dir="ltr">{booking.guestPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-semibold text-gray-900" dir="ltr">{booking.guestEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Building className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نوع الغرفة</p>
                  <p className="font-semibold text-gray-900">{booking.roomType}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4"></div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-gray-900">تاريخ الدخول</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
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
                <p className="text-xl font-bold text-purple-600">
                  {new Date(booking.checkOutDate.toDate()).toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4"></div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">السعر لليلة الواحدة</p>
                  <p className="text-2xl font-bold text-gray-900">{booking.pricePerNight} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">عدد الليالي</p>
                  <p className="text-2xl font-bold text-gray-900">{booking.totalNights} ليلة</p>
                </div>
              </div>
              <div className="border-t border-green-200 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">المبلغ الإجمالي</p>
                  <p className="text-3xl font-bold text-green-600">{booking.totalAmount} ريال</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Instructions */}
        {booking.status === 'pending' && (
          <Card className="bg-amber-50 border-2 border-amber-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ⚠️ الحجز غير مؤكد حتى إتمام الدفع
                </h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  لتأكيد حجزك، يرجى دفع مبلغ <strong className="text-amber-700">{minimumPayment} ريال</strong> (قيمة يوم واحد على الأقل)
                </p>

                {/* Bank Account Info */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">معلومات التحويل البنكي</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyAccountInfo}
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'تم النسخ' : 'نسخ'}
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم البنك:</span>
                      <span className="font-semibold">البنك الأهلي السعودي</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الحساب (IBAN):</span>
                      <span className="font-semibold" dir="ltr">SA1234567890123456789012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم المستفيد:</span>
                      <span className="font-semibold">فندق سيفن سون</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ المطلوب:</span>
                      <span className="font-semibold text-green-600">{minimumPayment} ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الحجز (ضعه في الملاحظات):</span>
                      <span className="font-semibold text-blue-600">{bookingId}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>ملاحظة مهمة:</strong> بعد التحويل، اضغط على زر "تأكيد الدفع" أدناه. سيتم التحقق من الدفع وتخصيص الغرفة المناسبة لك تلقائياً.
                  </p>
                </div>

                <Button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg"
                >
                  {confirming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      جاري التأكيد...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="ml-2 h-5 w-5" />
                      تأكيد الدفع ومتابعة التوقيع على العقد
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 mt-2 text-center">
                  سيتم إرسال العقد الإلكتروني لك عبر الواتساب والبريد الإلكتروني
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Success Message */}
        {booking.status === 'confirmed' && (
          <Card className="bg-green-50 border-2 border-green-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ✅ تم تأكيد حجزك بنجاح!
                </h3>
                <p className="text-gray-700 mb-4">
                  شكراً لاختيارك فندق سيفن سون. تم إرسال تفاصيل الحجز والعقد إلى بريدك الإلكتروني ورقم الواتساب.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => router.push(`/track/${bookingId}`)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    تتبع الحجز
                  </Button>
                  <Button
                    onClick={() => router.push(`/guest-app/contract?bookingId=${bookingId}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="ml-2 h-4 w-4" />
                    عرض العقد
                  </Button>
                  <Button
                    onClick={() => router.push('/guest-app')}
                    variant="outline"
                  >
                    <Home className="ml-2 h-4 w-4" />
                    الصفحة الرئيسية
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Contact */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <h3 className="text-xl font-bold mb-2">هل لديك استفسار؟</h3>
          <p className="mb-4">فريقنا جاهز لمساعدتك على مدار الساعة</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="tel:+966504755400" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <Phone className="h-4 w-4" />
              <span>+966 50 475 5400</span>
            </a>
            <a href="mailto:info@almodif.net" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <Mail className="h-4 w-4" />
              <span>info@almodif.net</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
