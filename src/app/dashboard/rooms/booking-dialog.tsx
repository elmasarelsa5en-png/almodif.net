'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  Plus,
  Briefcase,
  Plane,
  FileText,
  Users
} from 'lucide-react';
import { Room } from '@/lib/rooms-data';
import AddGuestDialog from '@/components/AddGuestDialog';

interface BookingDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => void;
  onStatusChange?: (roomId: string, newStatus: string, guestName?: string) => void;
}

// مصادر الحجز
const BOOKING_SOURCES = [
  { value: 'reception', label: 'استقبال', icon: '🏨' },
  { value: 'booking', label: 'بوكينج دوت كوم', icon: '🌐' },
  { value: 'almosafer', label: 'المسافر', icon: '✈️' },
  { value: 'airport', label: 'المطار', icon: '🛫' },
  { value: 'agoda', label: 'أجودا', icon: '🏷️' },
  { value: 'expedia', label: 'إكسبيديا', icon: '🌍' },
  { value: 'airbnb', label: 'إير بي إن بي', icon: '🏠' },
  { value: 'trivago', label: 'تريفاجو', icon: '🔍' },
  { value: 'direct', label: 'حجز مباشر', icon: '📞' },
  { value: 'company', label: 'شركة', icon: '🏢' },
  { value: 'other', label: 'أخرى', icon: '📋' }
];

// أنواع الزيارة
const VISIT_TYPES = [
  { value: 'tourism', label: 'سياحة', icon: '🏖️' },
  { value: 'business', label: 'عمل', icon: '💼' }
];
export default function BookingDialog({ room, isOpen, onClose, onSave, onStatusChange }: BookingDialogProps) {
  // حالة زر تغيير الحالة
  const [showStatusChange, setShowStatusChange] = useState(false);
  
  // تتبع فتح النافذة
  useEffect(() => {
    console.log('🔷 BookingDialog - isOpen تغيرت إلى:', isOpen, 'الغرفة:', room?.number);
  }, [isOpen, room]);

  // بيانات الحجز
  const [contractNumber, setContractNumber] = useState('');
  const [bookingSource, setBookingSource] = useState('reception');
  
  // الفترة
  const [rentalType, setRentalType] = useState<'daily' | 'monthly'>('daily');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(1);
  
  // بيانات النزيل
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [companions, setCompanions] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [visitType, setVisitType] = useState('tourism');
  
  // المالية
  const [deposits, setDeposits] = useState<number[]>([]);
  const [advancePayments, setAdvancePayments] = useState<number[]>([]);
  const [dailyRate, setDailyRate] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // تهيئة البيانات عند فتح الحوار
  useEffect(() => {
    if (isOpen && room) {
      console.log('🔄 تحميل بيانات الغرفة:', room);
      
      // تعيين تاريخ ووقت الدخول الحالي
      const now = new Date();
      setCheckInDate(now.toISOString().split('T')[0]);
      setCheckInTime(now.toTimeString().slice(0, 5));
      
      // تعيين السعر اليومي من بيانات الغرفة
      setDailyRate(room.price || 0);
      
      // توليد رقم عقد تلقائي
      setContractNumber(`CONTRACT-${Date.now()}`);
      
      // إذا كانت الغرفة مشغولة أو محجوزة، حمّل بيانات النزيل الحالي
      if ((room.status === 'Occupied' || room.status === 'Reserved') && room.guestName) {
        console.log('✅ الغرفة مشغولة - تحميل بيانات النزيل:', room.guestName);
        
        // تحميل بيانات النزيل من بيانات الغرفة
        setSelectedGuest({
          name: room.guestName,
          phone: room.guestPhone || '',
          nationality: room.guestNationality || '',
          idType: room.guestIdType || '',
          idNumber: room.guestIdNumber || '',
          idExpiry: room.guestIdExpiry || '',
          email: room.guestEmail || '',
          address: room.guestAddress || ''
        });
        
        // تحميل بيانات الحجز إذا كانت موجودة
        if (room.bookingDetails) {
          const booking = room.bookingDetails;
          setContractNumber(booking.contractNumber || contractNumber);
          setBookingSource(booking.bookingSource || 'reception');
          setRentalType(booking.rentalType || 'daily');
          setCheckInDate(booking.checkIn?.date || checkInDate);
          setCheckInTime(booking.checkIn?.time || checkInTime);
          setCheckOutDate(booking.checkOut?.date || '');
          setCheckOutTime(booking.checkOut?.time || '');
          setNumberOfDays(booking.numberOfDays || 1);
          setVisitType(booking.visitType || 'tourism');
          
          // تحميل البيانات المالية
          if (booking.financial) {
            setDailyRate(booking.financial.dailyRate || room.price || 0);
            setDeposits(booking.financial.deposits || []);
            setAdvancePayments(booking.financial.advancePayments || []);
          }
          
          console.log('✅ تم تحميل بيانات الحجز الحالية');
        }
      } else {
        console.log('ℹ️ الغرفة متاحة - حجز جديد');
        // إعادة تعيين البيانات لحجز جديد
        setSelectedGuest(null);
        setCompanions([]);
        setCompany(null);
        setDeposits([]);
        setAdvancePayments([]);
      }
    }
  }, [isOpen, room]);

  // حساب عدد الأيام عند تغيير التواريخ
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNumberOfDays(diffDays || 1);
    }
  }, [checkInDate, checkOutDate]);

  // حساب تاريخ الخروج عند تغيير عدد الأيام
  const handleDaysChange = (days: number) => {
    setNumberOfDays(days);
    if (checkInDate) {
      const start = new Date(checkInDate);
      start.setDate(start.getDate() + days);
      setCheckOutDate(start.toISOString().split('T')[0]);
    }
  };

  // حساب المبلغ الإجمالي
  useEffect(() => {
    const total = dailyRate * numberOfDays;
    setTotalAmount(total);
  }, [dailyRate, numberOfDays]);

  // حساب إجمالي المقبوضات
  const totalDeposits = deposits.reduce((sum, amount) => sum + amount, 0);
  const totalAdvance = advancePayments.reduce((sum, amount) => sum + amount, 0);
  const remaining = totalAmount - totalDeposits;

  const handleSave = () => {
    if (!selectedGuest) {
      alert('يرجى اختيار نزيل');
      return;
    }

    const bookingData = {
      contractNumber,
      bookingSource,
      rentalType,
      checkIn: {
        date: checkInDate,
        time: checkInTime
      },
      checkOut: {
        date: checkOutDate,
        time: checkOutTime
      },
      numberOfDays,
      guest: selectedGuest,
      companions,
      company,
      visitType,
      financial: {
        dailyRate,
        totalAmount,
        deposits,
        advancePayments,
        totalDeposits,
        totalAdvance,
        remaining
      },
      createdAt: new Date().toISOString()
    };

    onSave(bookingData);
    handleClose();
  };

  const handleClose = () => {
    // إعادة تعيين الحقول
    setContractNumber('');
    setBookingSource('reception');
    setRentalType('daily');
    setCheckInDate('');
    setCheckInTime('');
    setCheckOutDate('');
    setCheckOutTime('');
    setNumberOfDays(1);
    setSelectedGuest(null);
    setCompanions([]);
    setCompany(null);
    setVisitType('tourism');
    setDeposits([]);
    setAdvancePayments([]);
    setDailyRate(0);
    onClose();
  };

  if (!room) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <DialogHeader className="border-b border-cyan-500/20 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {room.status === 'Occupied' || room.status === 'Reserved' 
                  ? `تفاصيل الحجز - غرفة ${room.number}` 
                  : `حجز جديد - غرفة ${room.number}`}
              </DialogTitle>
              
              {/* زر تغيير الحالة */}
              <Button
                variant="outline"
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50 text-purple-200 hover:from-purple-600/50 hover:to-pink-600/50 hover:border-purple-400 transition-all duration-200 shadow-lg shadow-purple-500/20"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                تغيير الحالة
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* قسم تغيير الحالة (يظهر عند الضغط على الزر) */}
            {showStatusChange && onStatusChange && (
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-500/30 animate-in slide-in-from-top duration-300">
                <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  تغيير حالة الغرفة
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* متاحة */}
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Available');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    متاحة
                  </Button>
                  
                  {/* محجوزة */}
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Reserved');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    محجوزة
                  </Button>
                  
                  {/* صيانة */}
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Maintenance');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    صيانة
                  </Button>
                  
                  {/* تحتاج تنظيف */}
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'NeedsCleaning');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    تحتاج تنظيف
                  </Button>
                  
                  {/* تنظيف معلق */}
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'PendingCleaning');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    خروج اليوم
                  </Button>
                  
                  {/* إلغاء */}
                  <Button
                    onClick={() => setShowStatusChange(false)}
                    variant="outline"
                    className="border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* عرض بيانات النزيل الحالي إذا كانت الغرفة مشغولة */}
            {selectedGuest && (room.status === 'Occupied' || room.status === 'Reserved') && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-500/30">
                <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  بيانات النزيل الحالي
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">الاسم</p>
                    <p className="text-white font-semibold">{selectedGuest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">رقم الهاتف</p>
                    <p className="text-white font-semibold">{selectedGuest.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">الجنسية</p>
                    <p className="text-white font-semibold">{selectedGuest.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">رقم الهوية</p>
                    <p className="text-white font-semibold">{selectedGuest.idNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">البريد الإلكتروني</p>
                    <p className="text-white font-semibold">{selectedGuest.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200/70 mb-1">الرصيد المستحق</p>
                    <p className={`font-bold text-lg ${room.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {room.balance} ر.س
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* معلومات الحجز */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20">
              <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                معلومات الحجز
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* رقم العقد */}
                <div className="space-y-2">
                  <Label className="text-cyan-200 font-semibold">رقم العقد</Label>
                  <Input
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="أدخل رقم العقد"
                    className="bg-white/10 border-cyan-500/30 text-white placeholder:text-cyan-300/50"
                  />
                </div>

                {/* مصدر الحجز */}
                <div className="space-y-2">
                  <Label className="text-cyan-200 font-semibold">مصدر الحجز</Label>
                  <Select value={bookingSource} onValueChange={setBookingSource}>
                    <SelectTrigger className="bg-white/10 border-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-800 border-cyan-500/30 max-h-[250px] overflow-y-auto z-[100]"
                    >
                      {BOOKING_SOURCES.map(source => (
                        <SelectItem key={source.value} value={source.value} className="text-white">
                          <span className="flex items-center gap-2">
                            <span>{source.icon}</span>
                            <span>{source.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* الفترة */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
              <h3 className="text-lg font-bold text-green-300 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                الفترة
              </h3>
              
              <div className="space-y-4">
                {/* نوع الإيجار */}
                <div className="space-y-2">
                  <Label className="text-green-200 font-semibold">نوع الإيجار</Label>
                  <Select value={rentalType} onValueChange={(value: 'daily' | 'monthly') => setRentalType(value)}>
                    <SelectTrigger className="bg-white/10 border-green-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-800 border-green-500/30 z-[100]"
                    >
                      <SelectItem value="daily" className="text-white">📅 حجز يومي</SelectItem>
                      <SelectItem value="monthly" className="text-white">📆 حجز شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* من - إلى */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-200 font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      من (التاريخ)
                    </Label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="bg-white/10 border-green-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-200 font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      الوقت
                    </Label>
                    <Input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="bg-white/10 border-green-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-200 font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      إلى (التاريخ)
                    </Label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="bg-white/10 border-green-500/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-200 font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      الوقت
                    </Label>
                    <Input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="bg-white/10 border-green-500/30 text-white"
                    />
                  </div>
                </div>

                {/* عدد الأيام */}
                <div className="space-y-2">
                  <Label className="text-green-200 font-semibold">عدد الأيام</Label>
                  <Input
                    type="number"
                    min="1"
                    value={numberOfDays}
                    onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                    className="bg-white/10 border-green-500/30 text-white"
                  />
                  <p className="text-xs text-green-300/70">
                    تحديد عدد الأيام سيحدث التواريخ تلقائياً
                  </p>
                </div>
              </div>
            </div>

            {/* الشقة / العميل */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                الشقة / العميل
              </h3>
              
              <div className="space-y-4">
                {/* معلومات الغرفة */}
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-purple-200 text-sm">نوع الشقة</Label>
                      <p className="text-white font-bold text-lg">{room.type}</p>
                    </div>
                    <div>
                      <Label className="text-purple-200 text-sm">رقم الشقة</Label>
                      <p className="text-white font-bold text-lg">#{room.number}</p>
                    </div>
                  </div>
                </div>

                {/* اختيار العميل */}
                <div className="space-y-2">
                  <Label className="text-purple-200 font-semibold">العميل</Label>
                  {selectedGuest ? (
                    <div className="bg-white/10 rounded-lg p-4 border border-purple-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold">{selectedGuest.name}</p>
                        <p className="text-purple-300 text-sm">{selectedGuest.phone}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddGuestOpen(true)}
                        className="bg-purple-500/20 border-purple-500/30 text-purple-200"
                      >
                        تغيير
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsAddGuestOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <User className="h-4 w-4 ml-2" />
                      اختيار نزيل
                    </Button>
                  )}
                </div>

                {/* المرافقين */}
                {selectedGuest && (
                  <div className="space-y-2">
                    <Label className="text-purple-200 font-semibold">المرافقين</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddGuestOpen(true)}
                      className="w-full bg-white/5 border-purple-500/30 text-purple-200"
                    >
                      <Users className="h-4 w-4 ml-2" />
                      إضافة مرافق ({companions.length})
                    </Button>
                  </div>
                )}

                {/* نوع الزيارة */}
                <div className="space-y-2">
                  <Label className="text-purple-200 font-semibold">نوع الزيارة</Label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-slate-800 border-purple-500/30 z-[100]"
                    >
                      {VISIT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* المالية */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                المالية
              </h3>
              
              <div className="space-y-4">
                {/* المقبوضات */}
                <div className="space-y-2">
                  <Label className="text-yellow-200 font-semibold">المقبوضات</Label>
                  <div className="space-y-2">
                    {deposits.map((amount, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newDeposits = [...deposits];
                            newDeposits[index] = parseFloat(e.target.value) || 0;
                            setDeposits(newDeposits);
                          }}
                          className="bg-white/10 border-yellow-500/30 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeposits(deposits.filter((_, i) => i !== index))}
                          className="bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeposits([...deposits, 0])}
                      className="w-full bg-white/5 border-yellow-500/30 text-yellow-200"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة مقبوض
                    </Button>
                  </div>
                  <p className="text-yellow-300 font-bold">الإجمالي: {totalDeposits} ريال</p>
                </div>

                {/* بدل الإيجار */}
                <div className="space-y-2">
                  <Label className="text-yellow-200 font-semibold">بدل الإيجار (مدفوع من الفندق)</Label>
                  <div className="space-y-2">
                    {advancePayments.map((amount, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newAdvance = [...advancePayments];
                            newAdvance[index] = parseFloat(e.target.value) || 0;
                            setAdvancePayments(newAdvance);
                          }}
                          className="bg-white/10 border-yellow-500/30 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdvancePayments(advancePayments.filter((_, i) => i !== index))}
                          className="bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAdvancePayments([...advancePayments, 0])}
                      className="w-full bg-white/5 border-yellow-500/30 text-yellow-200"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة بدل إيجار
                    </Button>
                  </div>
                  <p className="text-yellow-300 font-bold">الإجمالي: {totalAdvance} ريال</p>
                </div>

                {/* الإيجار اليومي */}
                <div className="space-y-2">
                  <Label className="text-yellow-200 font-semibold">الإيجار اليومي</Label>
                  <Input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                    className="bg-white/10 border-yellow-500/30 text-white"
                  />
                  <p className="text-xs text-yellow-300/70">يمكن تعديل السعر حسب الاتفاق</p>
                </div>

                {/* الملخص المالي */}
                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30 space-y-2">
                  <div className="flex justify-between text-yellow-200">
                    <span>الإيجار اليومي:</span>
                    <span className="font-bold">{dailyRate} ريال</span>
                  </div>
                  <div className="flex justify-between text-yellow-200">
                    <span>عدد الأيام:</span>
                    <span className="font-bold">{numberOfDays} يوم</span>
                  </div>
                  <div className="h-px bg-yellow-500/30 my-2" />
                  <div className="flex justify-between text-yellow-100 text-lg">
                    <span className="font-bold">المبلغ الإجمالي:</span>
                    <span className="font-bold text-2xl">{totalAmount} ريال</span>
                  </div>
                  <div className="flex justify-between text-green-300">
                    <span>المقبوضات:</span>
                    <span className="font-bold">{totalDeposits} ريال</span>
                  </div>
                  <div className="flex justify-between text-red-300">
                    <span className="font-bold">المتبقي:</span>
                    <span className="font-bold text-xl">{remaining} ريال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white/5 border-red-500/30 text-red-300 hover:bg-red-500/20"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedGuest}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              حفظ الحجز
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* حوار إضافة نزيل */}
      <AddGuestDialog
        open={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSubmit={(guest) => {
          if (!selectedGuest) {
            setSelectedGuest(guest);
          } else {
            setCompanions([...companions, guest]);
          }
          setIsAddGuestOpen(false);
        }}
        availableRooms={room ? [room.number] : []}
      />
    </>
  );
}
