'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Save,
  Send,
  X,
  ArrowRight,
  User,
  Bed,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';
import * as BookingService from '@/lib/bookings';

type BookingSource = 'حجز_مباشر' | 'موقع_الكتروني' | 'وكيل_سفر' | 'تطبيق_الهاتف' | 'فندق_آخر';
type Gender = 'ذكر' | 'أنثى';

export default function NewBookingPage() {
  const router = useRouter();

  // Form state
  const [bookingData, setBookingData] = useState({
    // معلومات الحجز
    source: 'حجز_مباشر' as BookingSource,
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',

    // معلومات النزيل
    idNumber: '',
    guestName: '',
    nationality: '',
    phone: '',
    email: '',
    gender: 'ذكر' as Gender,
    birthDate: '',

    // معلومات الغرفة
    roomType: '',
    roomNumber: '',
    floor: '',
    roomStatus: 'متاح',
    pricePerNight: 0,

    // معلومات مالية
    totalAmount: 0,
    discount: 0,
    tax: 0,
    totalCost: 0,
    paidAmount: 0,
    remainingAmount: 0,

    // ملاحظات
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals when relevant fields change
  React.useEffect(() => {
    const checkIn = new Date(`${bookingData.checkInDate}T${bookingData.checkInTime || '00:00'}`);
    const checkOut = new Date(`${bookingData.checkOutDate}T${bookingData.checkOutTime || '00:00'}`);

    if (checkIn && checkOut && checkOut > checkIn && bookingData.pricePerNight > 0) {
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const subtotal = nights * bookingData.pricePerNight;
      const discountAmount = (subtotal * bookingData.discount) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * bookingData.tax) / 100;
      const totalCost = afterDiscount + taxAmount;
      const remainingAmount = totalCost - bookingData.paidAmount;

      setBookingData(prev => ({
        ...prev,
        totalAmount: subtotal,
        totalCost,
        remainingAmount,
      }));
    }
  }, [bookingData.checkInDate, bookingData.checkInTime, bookingData.checkOutDate, bookingData.checkOutTime, bookingData.pricePerNight, bookingData.discount, bookingData.tax, bookingData.paidAmount]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!bookingData.guestName) newErrors.guestName = 'اسم النزيل مطلوب';
    if (!bookingData.checkInDate) newErrors.checkInDate = 'تاريخ الوصول مطلوب';
    if (!bookingData.checkOutDate) newErrors.checkOutDate = 'تاريخ المغادرة مطلوب';
    if (!bookingData.roomNumber) newErrors.roomNumber = 'رقم الغرفة مطلوب';
    if (!bookingData.roomType) newErrors.roomType = 'نوع الغرفة مطلوب';
    if (bookingData.pricePerNight <= 0) newErrors.pricePerNight = 'سعر الليلة يجب أن يكون أكبر من صفر';

    // Date validation
    const checkIn = new Date(`${bookingData.checkInDate}T${bookingData.checkInTime || '00:00'}`);
    const checkOut = new Date(`${bookingData.checkOutDate}T${bookingData.checkOutTime || '00:00'}`);
    if (checkIn >= checkOut) {
      newErrors.checkOutDate = 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول';
    }

    // Email validation
    if (bookingData.email && !/\S+@\S+\.\S+/.test(bookingData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // Phone validation
    if (bookingData.phone && !/^(\+966|0)?[5][0-9]{8}$/.test(bookingData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الجوال غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (action: 'save' | 'send_nafaz' | 'send_booking_platform') => {
    if (!validateForm()) {
      alert('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setIsSubmitting(true);

    try {
      const checkIn = new Date(`${bookingData.checkInDate}T${bookingData.checkInTime || '00:00'}`);
      const checkOut = new Date(`${bookingData.checkOutDate}T${bookingData.checkOutTime || '00:00'}`);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      const booking = BookingService.createBooking({
        guestId: Date.now().toString(),
        guestName: bookingData.guestName,
        roomId: Date.now().toString(),
        roomName: `${bookingData.roomType} ${bookingData.roomNumber}`,
        status: 'غير مؤكدة',
        source: bookingData.source,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        nights,
        basePrice: bookingData.pricePerNight,
        totalPrice: bookingData.totalCost,
        paidAmount: bookingData.paidAmount,
        remainingBalance: bookingData.remainingAmount,
        paymentStatus: bookingData.paidAmount >= bookingData.totalCost ? 'مسدد' : 'جزئي',
        numberOfGuests: 1,
        specialRequests: bookingData.notes,
      });

      // Handle different actions
      switch (action) {
        case 'save':
          alert('✅ تم حفظ الحجز بنجاح!');
          router.push('/dashboard/bookings');
          break;
        case 'send_nafaz':
          alert('📤 تم إرسال الحجز إلى خدمة نفاذ');
          router.push('/dashboard/bookings');
          break;
        case 'send_booking_platform':
          alert('📤 تم إرسال الحجز إلى منصة الحجوزات');
          router.push('/dashboard/bookings');
          break;
      }
    } catch (error) {
      alert('❌ حدث خطأ أثناء حفظ الحجز');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6 relative overflow-hidden" dir="rtl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    حجز جديد
                  </h1>
                  <p className="text-blue-200/80 text-sm md:text-base">
                    إنشاء حجز جديد مع جميع التفاصيل المطلوبة
                  </p>
                </div>
              </div>

              <Button
                onClick={() => router.push('/dashboard/bookings')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </div>

          <form className="space-y-6">
            {/* معلومات الحجز */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  معلومات الحجز
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* مصدر الحجز */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">مصدر الحجز *</Label>
                    <Select
                      value={bookingData.source}
                      onValueChange={(value: BookingSource) => setBookingData(prev => ({ ...prev, source: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="حجز_مباشر">حجز مباشر</SelectItem>
                        <SelectItem value="موقع_الكتروني">موقع إلكتروني</SelectItem>
                        <SelectItem value="وكيل_سفر">وكيل سفر</SelectItem>
                        <SelectItem value="تطبيق_الهاتف">تطبيق الهاتف</SelectItem>
                        <SelectItem value="فندق_آخر">فندق آخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* تاريخ الوصول */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">تاريخ الوصول *</Label>
                    <Input
                      type="date"
                      value={bookingData.checkInDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkInDate: e.target.value }))}
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.checkInDate && "border-red-500"
                      )}
                    />
                    {errors.checkInDate && <p className="text-red-400 text-sm">{errors.checkInDate}</p>}
                  </div>

                  {/* وقت الوصول */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">وقت الوصول</Label>
                    <Input
                      type="time"
                      value={bookingData.checkInTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkInTime: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* تاريخ المغادرة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">تاريخ المغادرة *</Label>
                    <Input
                      type="date"
                      value={bookingData.checkOutDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.checkOutDate && "border-red-500"
                      )}
                    />
                    {errors.checkOutDate && <p className="text-red-400 text-sm">{errors.checkOutDate}</p>}
                  </div>

                  {/* وقت المغادرة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">وقت المغادرة</Label>
                    <Input
                      type="time"
                      value={bookingData.checkOutTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات النزيل */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  معلومات النزيل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* رقم الهوية */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">رقم الهوية</Label>
                    <Input
                      value={bookingData.idNumber}
                      onChange={(e) => setBookingData(prev => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="أدخل رقم الهوية"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* اسم النزيل */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">اسم النزيل *</Label>
                    <Input
                      value={bookingData.guestName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, guestName: e.target.value }))}
                      placeholder="أدخل اسم النزيل"
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.guestName && "border-red-500"
                      )}
                    />
                    {errors.guestName && <p className="text-red-400 text-sm">{errors.guestName}</p>}
                  </div>

                  {/* الجنسية */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الجنسية</Label>
                    <Input
                      value={bookingData.nationality}
                      onChange={(e) => setBookingData(prev => ({ ...prev, nationality: e.target.value }))}
                      placeholder="مثال: سعودي"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* رقم الجوال */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">رقم الجوال</Label>
                    <Input
                      value={bookingData.phone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="05xxxxxxxx"
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.phone && "border-red-500"
                      )}
                    />
                    {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                  </div>

                  {/* البريد الإلكتروني */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.email && "border-red-500"
                      )}
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  {/* الجنس */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الجنس</Label>
                    <Select
                      value={bookingData.gender}
                      onValueChange={(value: Gender) => setBookingData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* تاريخ الميلاد */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={bookingData.birthDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الغرفة */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  معلومات الغرفة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* نوع الغرفة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">نوع الغرفة *</Label>
                    <Select
                      value={bookingData.roomType}
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, roomType: value }))}
                    >
                      <SelectTrigger className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.roomType && "border-red-500"
                      )}>
                        <SelectValue placeholder="اختر نوع الغرفة" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="غرفة مفردة">غرفة مفردة</SelectItem>
                        <SelectItem value="غرفة مزدوجة">غرفة مزدوجة</SelectItem>
                        <SelectItem value="جناح">جناح</SelectItem>
                        <SelectItem value="جناح رئاسي">جناح رئاسي</SelectItem>
                        <SelectItem value="غرفة عائلية">غرفة عائلية</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.roomType && <p className="text-red-400 text-sm">{errors.roomType}</p>}
                  </div>

                  {/* رقم الغرفة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">رقم الغرفة *</Label>
                    <Input
                      value={bookingData.roomNumber}
                      onChange={(e) => setBookingData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="مثال: 101"
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.roomNumber && "border-red-500"
                      )}
                    />
                    {errors.roomNumber && <p className="text-red-400 text-sm">{errors.roomNumber}</p>}
                  </div>

                  {/* الدور */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الدور</Label>
                    <Input
                      value={bookingData.floor}
                      onChange={(e) => setBookingData(prev => ({ ...prev, floor: e.target.value }))}
                      placeholder="مثال: الدور الأول"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* الحالة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الحالة</Label>
                    <Select
                      value={bookingData.roomStatus}
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, roomStatus: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="متاح">متاح</SelectItem>
                        <SelectItem value="محجوز">محجوز</SelectItem>
                        <SelectItem value="قيد الصيانة">قيد الصيانة</SelectItem>
                        <SelectItem value="غير متاح">غير متاح</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* سعر الليلة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">سعر الليلة (ريال) *</Label>
                    <Input
                      type="number"
                      value={bookingData.pricePerNight}
                      onChange={(e) => setBookingData(prev => ({ ...prev, pricePerNight: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className={cn(
                        "bg-white/5 border-white/20 text-white",
                        errors.pricePerNight && "border-red-500"
                      )}
                    />
                    {errors.pricePerNight && <p className="text-red-400 text-sm">{errors.pricePerNight}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* القسم المالي */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  المعلومات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* الإجمالي */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الإجمالي (ريال)</Label>
                    <Input
                      type="number"
                      value={bookingData.totalAmount.toFixed(2)}
                      readOnly
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* الخصم */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الخصم (%)</Label>
                    <Input
                      type="number"
                      value={bookingData.discount}
                      onChange={(e) => setBookingData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* الضريبة */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">الضريبة (%)</Label>
                    <Input
                      type="number"
                      value={bookingData.tax}
                      onChange={(e) => setBookingData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* التكلفة الكلية */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">التكلفة الكلية (ريال)</Label>
                    <Input
                      type="number"
                      value={bookingData.totalCost.toFixed(2)}
                      readOnly
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* المدفوع */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">المدفوع (ريال)</Label>
                    <Input
                      type="number"
                      value={bookingData.paidAmount}
                      onChange={(e) => setBookingData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  {/* المتبقي */}
                  <div className="space-y-2">
                    <Label className="text-blue-200">المتبقي (ريال)</Label>
                    <Input
                      type="number"
                      value={bookingData.remainingAmount.toFixed(2)}
                      readOnly
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ملاحظات */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  ملاحظات إضافية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أدخل أي ملاحظات إضافية..."
                  className="bg-white/5 border-white/20 text-white min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleSubmit('save')}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>

                <Button
                  onClick={() => handleSubmit('send_nafaz')}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال إلى خدمة نفاذ
                </Button>

                <Button
                  onClick={() => handleSubmit('send_booking_platform')}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال إلى منصة الحجوزات
                </Button>

                <Button
                  onClick={() => router.push('/dashboard/bookings')}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
