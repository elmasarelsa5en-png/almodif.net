'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Loader2, 
  Download,
  Edit3,
  AlertCircle,
  Home,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  CreditCard,
  Clock,
  Shield
} from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { notificationService } from '@/lib/notifications/notification-service';

interface ContractSettings {
  hotelName: string;
  hotelNameEn: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  commercialRegister: string;
  taxNumber: string;
  logoUrl: string;
  terms: string[];
  checkInTime: string;
  checkOutTime: string;
  securityDeposit: number;
  penaltyAmount: number;
}

interface BookingDetails {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestNationalId: string;
  assignedRoomNumber?: string;
  roomType: string;
  checkInDate: any;
  checkOutDate: any;
  totalNights: number;
  pricePerNight: number;
  totalAmount: number;
  paidAmount?: number;
  status: string;
  contractSigned?: boolean;
  signatureData?: string;
  signedAt?: any;
  signatureMethod?: 'electronic' | 'on-arrival';
}

function ContractContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [contractSettings, setContractSettings] = useState<ContractSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'electronic' | 'on-arrival' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  const loadData = async () => {
    if (!bookingId) return;

    try {
      // تحميل بيانات الحجز
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (bookingDoc.exists()) {
        setBooking({ id: bookingDoc.id, ...bookingDoc.data() } as BookingDetails);
      }

      // تحميل إعدادات العقد من Firebase
      const settingsDoc = await getDoc(doc(db, 'settings', 'contract'));
      if (settingsDoc.exists()) {
        setContractSettings(settingsDoc.data() as ContractSettings);
      } else {
        // إعدادات افتراضية
        setContractSettings({
          hotelName: 'فندق سيفن سون',
          hotelNameEn: 'Seven Son Hotel',
          address: 'العنوان الجديد - ابها',
          city: 'ابها',
          phone: '+966504755400',
          email: 'info@almodif.net',
          commercialRegister: '30092765750003',
          taxNumber: '1090030246',
          logoUrl: '/images/seven-son-logo.jpeg',
          terms: [
            'على المستأجر دفع مبلغ 500 ريال كتأمين مسترد',
            'موعد الخروج في تمام الساعة 12 ظهراً',
            'يتم دفع قيم الإيجار مقدماً',
            'المستأجر مسؤول عن كامل ممتلكات الشقة'
          ],
          checkInTime: '14:00',
          checkOutTime: '12:00',
          securityDeposit: 500,
          penaltyAmount: 350
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Canvas Drawing Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSignElectronically = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('يرجى التوقيع أولاً');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // التحقق من وجود توقيع
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some(channel => channel !== 0);

    if (!hasSignature) {
      alert('يرجى التوقيع أولاً');
      return;
    }

    setSigning(true);
    try {
      const signatureDataUrl = canvas.toDataURL('image/png');

      // رفع التوقيع إلى Firebase Storage
      const signatureRef = ref(storage, `contracts/${bookingId}/signature.png`);
      await uploadString(signatureRef, signatureDataUrl, 'data_url');
      const signatureUrl = await getDownloadURL(signatureRef);

      // تحديث الحجز
      await updateDoc(doc(db, 'bookings', bookingId!), {
        contractSigned: true,
        signatureData: signatureUrl,
        signedAt: Timestamp.now(),
        signatureMethod: 'electronic',
        updatedAt: Timestamp.now()
      });

      // إرسال إشعار للموظفين
      await notificationService.sendNotification('in_app', 'admin', {
        subject: 'توقيع إلكتروني على عقد',
        body: `تم التوقيع على العقد إلكترونياً - الحجز ${bookingId}`,
        type: 'custom',
        priority: 'normal',
        metadata: {
          bookingId,
          guestName: booking?.guestName,
          roomNumber: booking?.assignedRoomNumber,
          signatureMethod: 'electronic'
        }
      });

      // إرسال إشعار للضيف
      if (booking?.guestPhone) {
        await notificationService.sendNotification('whatsapp', booking.guestPhone, {
          subject: 'تم التوقيع على العقد',
          body: `✅ تم التوقيع على العقد بنجاح!\n\n🎉 حجزك مؤكد بالكامل\n🏨 الغرفة: ${booking.assignedRoomNumber}\n📅 موعد الوصول: ${new Date(booking.checkInDate.toDate()).toLocaleDateString('ar-SA')}\n\nننتظرك في فندق سيفن سون!`,
          metadata: { bookingId }
        });
      }

      alert('✅ تم التوقيع على العقد بنجاح!');
      
      // إظهار رابط التتبع
      if (confirm('✅ تم التوقيع بنجاح!\n\n📊 هل تريد الذهاب لصفحة تتبع الحجز؟')) {
        router.push(`/track/${bookingId}`);
      } else {
        router.push('/guest-app');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('حدث خطأ في حفظ التوقيع. يرجى المحاولة مرة أخرى.');
    } finally {
      setSigning(false);
    }
  };

  const handleSignOnArrival = async () => {
    if (!confirm('هل أنت متأكد من اختيار التوقيع عند الوصول؟')) {
      return;
    }

    setSigning(true);
    try {
      await updateDoc(doc(db, 'bookings', bookingId!), {
        contractSigned: false,
        signatureMethod: 'on-arrival',
        updatedAt: Timestamp.now()
      });

      // إرسال إشعار للموظفين
      await notificationService.sendNotification('in_app', 'admin', {
        subject: 'توقيع عند الوصول',
        body: `الضيف اختار التوقيع عند الوصول - الحجز ${bookingId}`,
        type: 'custom',
        priority: 'normal',
        metadata: {
          bookingId,
          guestName: booking?.guestName,
          roomNumber: booking?.assignedRoomNumber
        }
      });

      alert('✅ تم تسجيل اختيارك. سيتم التوقيع على العقد عند الوصول.');
      
      // إظهار رابط التتبع
      if (confirm('📊 هل تريد متابعة حالة حجزك عبر صفحة التتبع؟')) {
        router.push(`/track/${bookingId}`);
      } else {
        router.push('/guest-app');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العقد...</p>
        </div>
      </div>
    );
  }

  if (!booking || !contractSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">البيانات غير متوفرة</h2>
          <Button onClick={() => router.push('/guest-app')} className="w-full">
            <Home className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">عقد الإيجار</h1>
          <p className="text-gray-600 text-lg">يرجى قراءة العقد والتوقيع عليه</p>
        </div>

        {/* Contract Document */}
        <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-6">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            {contractSettings.logoUrl && (
              <div className="mb-4">
                <img 
                  src={contractSettings.logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <h2 className="text-3xl font-bold mb-2">{contractSettings.hotelName}</h2>
            <p className="text-blue-100">{contractSettings.hotelNameEn}</p>
            <p className="text-sm mt-2">{contractSettings.address} - {contractSettings.city}</p>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span>📞 {contractSettings.phone}</span>
              <span>📧 {contractSettings.email}</span>
            </div>
            <p className="text-xs mt-2">
              السجل التجاري: {contractSettings.commercialRegister} | الرقم الضريبي: {contractSettings.taxNumber}
            </p>
          </div>

          {/* Contract Details */}
          <div className="p-8 space-y-6">
            {/* Booking Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">اسم النزيل</p>
                    <p className="font-bold text-gray-900">{booking.guestName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الجوال</p>
                    <p className="font-bold text-gray-900" dir="ltr">{booking.guestPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الهوية</p>
                    <p className="font-bold text-gray-900">{booking.guestNationalId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الغرفة</p>
                    <p className="font-bold text-gray-900 text-2xl">{booking.assignedRoomNumber || 'قيد التخصيص'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الدخول</p>
                    <p className="font-bold text-gray-900">
                      {new Date(booking.checkInDate.toDate()).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الخروج</p>
                    <p className="font-bold text-gray-900">
                      {new Date(booking.checkOutDate.toDate()).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Financial Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">التفاصيل المالية</h3>
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
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold">مبلغ التأمين</span>
                  </div>
                  <span className="text-xl font-bold text-amber-600">{contractSettings.securityDeposit} ر.س</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">قابل للاسترداد عند المغادرة</p>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Contract Times */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">موعد الدخول:</span>
                  <span className="text-blue-600">{contractSettings.checkInTime}</span>
                </div>
                <div className="h-6 w-px bg-blue-300"></div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">موعد الخروج:</span>
                  <span className="text-purple-600">{contractSettings.checkOutTime}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Terms & Conditions */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                شروط وأحكام عقد الإيجار
              </h3>
              <div className="space-y-3">
                {contractSettings.terms.map((term, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{term}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6"></div>

            {/* Agreement Statement */}
            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-xl">
              <p className="text-center text-gray-900 leading-relaxed">
                <strong>إقرار:</strong> بتوقيعي على هذا العقد، أُقر بموافقتي على جميع الشروط والأحكام المذكورة أعلاه، 
                وأتعهد بالالتزام بها طوال فترة الإقامة في <strong>{contractSettings.hotelName}</strong>.
              </p>
            </div>
          </div>
        </Card>

        {/* Signature Section */}
        {!booking.contractSigned && (
          <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">التوقيع على العقد</h2>
              <p>اختر طريقة التوقيع المناسبة لك</p>
            </div>

            <div className="p-8">
              {/* Signature Method Selection */}
              {!signatureMethod && (
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setSignatureMethod('electronic')}
                    className="p-8 border-2 border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-center group"
                  >
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                      <Edit3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">التوقيع الإلكتروني</h3>
                    <p className="text-gray-600 mb-4">وقّع الآن باستخدام القلم الإلكتروني</p>
                    <div className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full inline-block">
                      ✨ موصى به - يوفر الوقت عند الوصول
                    </div>
                  </button>

                  <button
                    onClick={() => setSignatureMethod('on-arrival')}
                    className="p-8 border-2 border-gray-300 rounded-xl hover:border-gray-500 hover:bg-gray-50 transition text-center group"
                  >
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                      <Building2 className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">التوقيع عند الوصول</h3>
                    <p className="text-gray-600 mb-4">التوقيع الورقي في الاستقبال</p>
                    <div className="bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full inline-block">
                      ⏱️ قد يستغرق وقتاً إضافياً
                    </div>
                  </button>
                </div>
              )}

              {/* Electronic Signature Canvas */}
              {signatureMethod === 'electronic' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      💡 <strong>نصيحة:</strong> التوقيع الإلكتروني يوفر عليك الوقت والمجهود عند الوصول للفندق. 
                      ستتمكن من الذهاب مباشرة لغرفتك بعد تسجيل الوصول السريع!
                    </p>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      وقّع هنا باستخدام الماوس أو الإصبع:
                    </label>
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={200}
                      className="w-full border-2 border-blue-400 rounded-lg bg-white cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="flex-1"
                      >
                        مسح التوقيع
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSignatureMethod(null)}
                        className="flex-1"
                      >
                        تغيير الطريقة
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleSignElectronically}
                    disabled={signing}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg"
                  >
                    {signing ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="ml-2 h-5 w-5" />
                        تأكيد التوقيع الإلكتروني
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* On Arrival Confirmation */}
              {signatureMethod === 'on-arrival' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">⚠️ ملاحظة مهمة</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>سيتطلب منك التوقيع على النسخة الورقية عند الوصول</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>قد يستغرق إجراء تسجيل الدخول وقتاً إضافياً (5-10 دقائق)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>البديل:</strong> التوقيع الإلكتروني الآن يسمح لك بالذهاب مباشرة للغرفة!</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSignatureMethod(null)}
                      className="flex-1"
                    >
                      العودة للخيارات
                    </Button>
                    <Button
                      onClick={handleSignOnArrival}
                      disabled={signing}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      {signing ? (
                        <>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          تأكيد التوقيع عند الوصول
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Already Signed */}
        {booking.contractSigned && (
          <Card className="bg-green-50 border-2 border-green-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">تم التوقيع على العقد بنجاح!</h3>
                <p className="text-gray-700">
                  تاريخ التوقيع: {booking.signedAt ? new Date(booking.signedAt.toDate()).toLocaleString('ar-SA') : '-'}
                </p>
              </div>
              <Button onClick={() => router.push('/guest-app')} className="bg-green-600 hover:bg-green-700">
                <Home className="ml-2 h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </div>
          </Card>
        )}

        {/* Contact Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <h3 className="text-xl font-bold mb-2">لديك استفسار؟</h3>
          <p className="mb-4">تواصل معنا على مدار الساعة</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href={`tel:${contractSettings.phone}`} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <Phone className="h-4 w-4" />
              <span>{contractSettings.phone}</span>
            </a>
            <a href={`mailto:${contractSettings.email}`} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <Mail className="h-4 w-4" />
              <span>{contractSettings.email}</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <ContractContent />
    </Suspense>
  );
}
