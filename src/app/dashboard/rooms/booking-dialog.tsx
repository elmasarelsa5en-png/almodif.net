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
        <DialogContent className="max-w-[98vw] w-full max-h-[98vh] h-full overflow-y-auto bg-white text-gray-900 border-0 p-0">
          {/* Header with blue background */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 mb-6 flex items-center justify-between shadow-lg">
            <DialogTitle className="text-3xl font-bold text-white">
              {room.status === 'Occupied' || room.status === 'Reserved' 
                ? `تفاصيل الحجز - غرفة ${room.number}` 
                : `حجز جديد - غرفة ${room.number}`}
            </DialogTitle>
            
            <div className="flex items-center gap-3">
              {/* زر تغيير الحالة */}
              <Button
                variant="outline"
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="bg-purple-600 hover:bg-purple-700 border-0 text-white"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                تغيير الحالة
              </Button>
              
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6">
            {/* قسم تغيير الحالة */}
            {showStatusChange && onStatusChange && (
              <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  تغيير حالة الغرفة
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Available');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    متاحة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Reserved');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    محجوزة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Maintenance');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    صيانة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'NeedsCleaning');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    تحتاج تنظيف
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'CheckoutToday');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    خروج اليوم
                  </Button>
                  <Button
                    onClick={() => setShowStatusChange(false)}
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* عرض بيانات النزيل الحالي */}
            {selectedGuest && (room.status === 'Occupied' || room.status === 'Reserved') && (
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  بيانات النزيل الحالي
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">الاسم</p>
                    <p className="text-gray-900 font-semibold">{selectedGuest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">رقم الهاتف</p>
                    <p className="text-gray-900 font-semibold">{selectedGuest.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">الجنسية</p>
                    <p className="text-gray-900 font-semibold">{selectedGuest.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">الرصيد المستحق</p>
                    <p className={`font-bold text-lg ${room.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {room.balance} ر.س
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* معلومات الحجز - Header Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات الحجز</h3>
              <div className="grid grid-cols-4 gap-4">
                {/* رقم العقد */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">رقم العقد</label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="تلقائي"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
                
                {/* مصدر الحجز */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">مصدر الحجز</label>
                  <Select value={bookingSource} onValueChange={setBookingSource}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      {BOOKING_SOURCES.map(source => (
                        <SelectItem key={source.value} value={source.value} className="text-gray-900">
                          <span className="flex items-center gap-2">
                            <span>{source.icon}</span>
                            <span>{source.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* نوع الإيجار */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">نوع الإيجار</label>
                  <Select value={rentalType} onValueChange={(value: 'daily' | 'monthly') => setRentalType(value)}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      <SelectItem value="daily" className="text-gray-900">يومي</SelectItem>
                      <SelectItem value="monthly" className="text-gray-900">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* نوع الزيارة */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">نوع الزيارة</label>
                  <Select value={visitType} onValueChange={setVisitType}>
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300">
                      {VISIT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value} className="text-gray-900">
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

            {/* الفترة - Period Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">الفترة</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الأيام</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الوقت</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">إلى</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">من</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        min="1"
                        value={numberOfDays}
                        onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-bold bg-white" 
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-1">
                        <input 
                          type="time" 
                          value={checkOutTime}
                          onChange={(e) => setCheckOutTime(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm" 
                        />
                        <input 
                          type="time" 
                          value={checkInTime}
                          onChange={(e) => setCheckInTime(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">ميلادي</span>
                        <input 
                          type="date" 
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm" 
                        />
                        <span className="text-sm text-gray-500">هجري</span>
                        <input type="date" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">ميلادي</span>
                        <input 
                          type="date" 
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm" 
                        />
                        <span className="text-sm text-gray-500">هجري</span>
                        <input type="date" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* الشقة والعميل - Two Column Tables */}
            <div className="grid grid-cols-2 gap-4">
              {/* الشقة - Left Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">الشقة</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600 w-1/3">رقم الشقة</td>
                      <td className="px-4 py-3 text-gray-900 font-bold">#{room.number}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">نوع الشقة</td>
                      <td className="px-4 py-3 text-gray-900">{room.type}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">المرافقون</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddGuestOpen(true)}
                          className="border-gray-300 text-gray-700"
                        >
                          <Users className="h-4 w-4 ml-2" />
                          إضافة ({companions.length})
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">نوع الزيارة</td>
                      <td className="px-4 py-3">
                        <Select value={visitType} onValueChange={setVisitType}>
                          <SelectTrigger className="w-full border-gray-300 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {VISIT_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <span className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* العميل - Right Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">العميل</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600 w-1/3">اسم العميل</td>
                      <td className="px-4 py-3">
                        {selectedGuest ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 font-bold">{selectedGuest.name}</p>
                              <p className="text-gray-500 text-xs">{selectedGuest.phone}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAddGuestOpen(true)}
                              className="border-gray-300"
                            >
                              تغيير
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setIsAddGuestOpen(true)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                          >
                            <User className="h-4 w-4 ml-2" />
                            اختيار نزيل
                          </Button>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">سعر الوحدة</td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          min="0"
                          value={dailyRate}
                          onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded" 
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">الإيجار</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-600">{totalAmount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 mr-2">ر.س</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-600">الإجمالي</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg text-green-600">{totalAmount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 mr-2">ر.س</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* المالية - Financial Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">المالية</h3>
              </div>
              <table className="w-full">
                <tbody>
                  {/* المقبوضات */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600 w-1/3">المقبوضات</td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {deposits.map((amount, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => {
                                const newDeposits = [...deposits];
                                newDeposits[index] = parseFloat(e.target.value) || 0;
                                setDeposits(newDeposits);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeposits(deposits.filter((_, i) => i !== index))}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              حذف
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeposits([...deposits, 0])}
                          className="w-full border-gray-300"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة
                        </Button>
                        <p className="text-sm text-gray-600">الإجمالي: <span className="font-bold text-green-600">{totalDeposits} ر.س</span></p>
                      </div>
                    </td>
                  </tr>

                  {/* بدل الإيجار */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600">بدل الإيجار (مدفوع من الفندق)</td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {advancePayments.map((amount, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => {
                                const newAdvance = [...advancePayments];
                                newAdvance[index] = parseFloat(e.target.value) || 0;
                                setAdvancePayments(newAdvance);
                              }}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAdvancePayments(advancePayments.filter((_, i) => i !== index))}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              حذف
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdvancePayments([...advancePayments, 0])}
                          className="w-full border-gray-300"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة
                        </Button>
                        <p className="text-sm text-gray-600">الإجمالي: <span className="font-bold text-blue-600">{totalAdvance} ر.س</span></p>
                      </div>
                    </td>
                  </tr>

                  {/* الإيجار اليومي */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600">الإيجار اليومي</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-500 mr-2">ر.س</span>
                    </td>
                  </tr>

                  {/* عدد الأيام */}
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600">عدد الأيام</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{numberOfDays} يوم</td>
                  </tr>

                  {/* المبلغ الإجمالي */}
                  <tr className="border-b border-gray-200 bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">المبلغ الإجمالي</td>
                    <td className="px-4 py-3 font-bold text-xl text-blue-600">{totalAmount} ر.س</td>
                  </tr>

                  {/* المقبوضات */}
                  <tr className="border-b border-gray-200 bg-green-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">المدفوع</td>
                    <td className="px-4 py-3 font-bold text-lg text-green-600">{totalDeposits} ر.س</td>
                  </tr>

                  {/* المتبقي */}
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">المتبقي</td>
                    <td className="px-4 py-3 font-bold text-2xl text-red-600">{remaining} ر.س</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 px-6 pb-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-12 text-lg"
            >
              إلغاء
            </Button>
            
            {/* زر إنهاء العقد - يظهر فقط للغرف المشغولة */}
            {(room.status === 'Occupied' || room.status === 'Reserved') && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('هل أنت متأكد من إنهاء هذا العقد؟')) {
                    if (onStatusChange) {
                      onStatusChange(room.id, 'Available');
                    }
                    handleClose();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 h-12 text-lg font-bold"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إنهاء العقد
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={!selectedGuest}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-12 text-lg font-bold"
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
