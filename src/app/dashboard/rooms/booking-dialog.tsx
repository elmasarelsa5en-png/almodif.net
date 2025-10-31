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
  Users,
  Printer
} from 'lucide-react';
import { Room } from '@/lib/rooms-data';
import AddGuestDialog from '@/components/AddGuestDialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

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
  
  // تحميل أسعار الغرف من Firebase
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  
  // تحميل أنواع الغرف والأسعار
  useEffect(() => {
    const loadRoomTypes = async () => {
      if (!db) return;
      
      try {
        const roomTypesSnapshot = await getDocs(collection(db, 'room-types'));
        const types = roomTypesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRoomTypes(types);
        console.log('✅ تم تحميل أنواع الغرف:', types);
      } catch (error) {
        console.error('❌ خطأ في تحميل أنواع الغرف:', error);
      }
    };
    
    if (isOpen) {
      loadRoomTypes();
    }
  }, [isOpen]);
  
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
      
      // 🔥 تحميل السعر من الكتالوج (room-types) بناءً على نوع الغرفة
      const roomTypeData = roomTypes.find(rt => rt.name === room.type || rt.nameAr === room.type);
      if (roomTypeData) {
        // استخدام السعر اليومي من الكتالوج
        const priceToUse = rentalType === 'daily' ? roomTypeData.pricePerDay : roomTypeData.pricePerMonth;
        setDailyRate(priceToUse || room.price || 0);
        console.log('✅ تم تحميل السعر من الكتالوج:', priceToUse);
      } else {
        // استخدام السعر من بيانات الغرفة كبديل
        setDailyRate(room.price || 0);
        console.log('ℹ️ استخدام السعر من بيانات الغرفة:', room.price);
      }
      
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
  }, [isOpen, room, roomTypes, rentalType]);

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

  // 💰 حفظ سند قبض في Firebase
  const saveReceiptVoucher = async (paymentData: {
    amount: number;
    method: 'cash' | 'card' | 'transfer';
    guestName: string;
    roomNumber: string;
    contractNumber: string;
  }) => {
    if (!db) {
      console.warn('⚠️ Firebase غير متصل - لن يتم حفظ سند القبض');
      return;
    }

    try {
      const receiptData = {
        type: 'receipt',
        amount: paymentData.amount,
        paymentMethod: paymentData.method,
        paymentMethodAr: paymentData.method === 'cash' ? 'نقدي' : 
                         paymentData.method === 'card' ? 'بطاقة' : 'تحويل بنكي',
        guestName: paymentData.guestName,
        roomNumber: paymentData.roomNumber,
        contractNumber: paymentData.contractNumber,
        description: `مقبوضات من ${paymentData.guestName} - غرفة ${paymentData.roomNumber}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        createdBy: 'النظام',
        status: 'completed'
      };

      const docRef = await addDoc(collection(db, 'receipts'), receiptData);
      console.log('✅ تم حفظ سند القبض:', docRef.id);
      
      // إضافة أيضاً في الحسابات العامة
      await addDoc(collection(db, 'accounting-transactions'), {
        ...receiptData,
        category: 'room-revenue',
        categoryAr: 'إيرادات الغرف'
      });
      
      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في حفظ سند القبض:', error);
    }
  };

  const handleSave = async () => {
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

    // 🔥 حفظ سند قبض لكل دفعة مقبوضات
    if (deposits.length > 0 && room) {
      for (const deposit of deposits) {
        if (deposit > 0) {
          await saveReceiptVoucher({
            amount: deposit,
            method: 'cash', // يمكن تحسينه لاحقاً لاختيار طريقة الدفع لكل مقبوضة
            guestName: selectedGuest.name,
            roomNumber: room.number,
            contractNumber
          });
        }
      }
    }

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

  // 🖨️ طباعة العقد
  const handlePrintContract = () => {
    if (!selectedGuest || !room) {
      alert('يرجى حفظ بيانات الحجز أولاً');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contractHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عقد إيجار - غرفة ${room.number}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            direction: rtl;
            text-align: right;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 32px;
          }
          .header p {
            color: #64748b;
            margin: 5px 0;
          }
          .section {
            margin: 25px 0;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .section h2 {
            color: #1e40af;
            font-size: 20px;
            margin: 0 0 15px 0;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 8px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            color: #475569;
          }
          .value {
            color: #0f172a;
          }
          .financial-summary {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .total {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            text-align: center;
            margin: 15px 0;
          }
          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature div {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 2px solid #0f172a;
            margin-top: 60px;
            padding-top: 10px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>عقد إيجار غرفة فندقية</h1>
          <p>رقم العقد: ${contractNumber}</p>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        <div class="section">
          <h2>معلومات الغرفة</h2>
          <div class="row">
            <span class="label">رقم الغرفة:</span>
            <span class="value">${room.number}</span>
          </div>
          <div class="row">
            <span class="label">نوع الغرفة:</span>
            <span class="value">${room.type}</span>
          </div>
          <div class="row">
            <span class="label">نوع الإيجار:</span>
            <span class="value">${rentalType === 'daily' ? 'يومي' : 'شهري'}</span>
          </div>
        </div>

        <div class="section">
          <h2>بيانات النزيل</h2>
          <div class="row">
            <span class="label">الاسم:</span>
            <span class="value">${selectedGuest.name}</span>
          </div>
          <div class="row">
            <span class="label">رقم الهاتف:</span>
            <span class="value">${selectedGuest.phone || '-'}</span>
          </div>
          <div class="row">
            <span class="label">الجنسية:</span>
            <span class="value">${selectedGuest.nationality || '-'}</span>
          </div>
          <div class="row">
            <span class="label">نوع الهوية:</span>
            <span class="value">${selectedGuest.idType || '-'}</span>
          </div>
          <div class="row">
            <span class="label">رقم الهوية:</span>
            <span class="value">${selectedGuest.idNumber || '-'}</span>
          </div>
        </div>

        <div class="section">
          <h2>مدة الإقامة</h2>
          <div class="row">
            <span class="label">تاريخ الدخول:</span>
            <span class="value">${checkInDate} - ${checkInTime}</span>
          </div>
          <div class="row">
            <span class="label">تاريخ الخروج:</span>
            <span class="value">${checkOutDate} - ${checkOutTime}</span>
          </div>
          <div class="row">
            <span class="label">عدد الأيام:</span>
            <span class="value">${numberOfDays} يوم</span>
          </div>
        </div>

        <div class="financial-summary">
          <h2>البيانات المالية</h2>
          <div class="row">
            <span class="label">السعر اليومي:</span>
            <span class="value">${dailyRate} ر.س</span>
          </div>
          <div class="row">
            <span class="label">عدد الأيام:</span>
            <span class="value">${numberOfDays}</span>
          </div>
          <div class="row">
            <span class="label">المبلغ الإجمالي:</span>
            <span class="value">${totalAmount} ر.س</span>
          </div>
          <div class="row">
            <span class="label">المقبوضات:</span>
            <span class="value">${totalDeposits} ر.س</span>
          </div>
          <div class="total">
            المتبقي: ${remaining} ر.س
          </div>
        </div>

        <div class="signature">
          <div>
            <div class="signature-line">توقيع النزيل</div>
          </div>
          <div>
            <div class="signature-line">توقيع الإدارة</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(contractHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!room) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[98vw] w-full max-h-[98vh] h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 border-0 p-0">
          {/* Header with modern gradient */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-6 py-5 mb-6 flex items-center justify-between shadow-xl">
            <DialogTitle className="text-3xl font-bold text-white drop-shadow-lg">
              {room.status === 'Occupied' || room.status === 'Reserved' 
                ? `تفاصيل الحجز - غرفة ${room.number}` 
                : `حجز جديد - غرفة ${room.number}`}
            </DialogTitle>
            
            <div className="flex items-center gap-3">
              {/* زر تغيير الحالة */}
              <Button
                variant="outline"
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-lg font-bold"
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
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 shadow-lg">
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
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                  >
                    متاحة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Reserved');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md"
                  >
                    محجوزة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Maintenance');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                  >
                    صيانة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'NeedsCleaning');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                  >
                    تحتاج تنظيف
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'CheckoutToday');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
                  >
                    خروج اليوم
                  </Button>
                  <Button
                    onClick={() => setShowStatusChange(false)}
                    variant="outline"
                    className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 shadow-md"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* عرض بيانات النزيل الحالي */}
            {selectedGuest && (room.status === 'Occupied' || room.status === 'Reserved') && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  بيانات النزيل الحالي
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-blue-600 mb-1 font-semibold">الاسم</p>
                    <p className="text-gray-900 font-bold">{selectedGuest.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-blue-600 mb-1 font-semibold">رقم الهاتف</p>
                    <p className="text-gray-900 font-bold">{selectedGuest.phone || '-'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-blue-600 mb-1 font-semibold">الجنسية</p>
                    <p className="text-gray-900 font-bold">{selectedGuest.nationality || '-'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-blue-600 mb-1 font-semibold">الرصيد المستحق</p>
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
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-14 text-lg font-semibold"
            >
              إلغاء
            </Button>
            
            {/* زر طباعة العقد - يظهر فقط للغرف المحجوزة */}
            {(room.status === 'Occupied' || room.status === 'Reserved') && selectedGuest && (
              <Button
                variant="outline"
                onClick={handlePrintContract}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 h-14 text-lg font-bold shadow-lg"
              >
                <Printer className="w-5 h-5 ml-2" />
                طباعة العقد
              </Button>
            )}
            
            {/* زر إنهاء العقد - يظهر فقط للغرف المشغولة */}
            {(room.status === 'Occupied' || room.status === 'Reserved') && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm(`هل أنت متأكد من إنهاء عقد ${selectedGuest?.name || 'النزيل'} في غرفة ${room.number}؟\n\n⚠️ سيتم:\n• حذف بيانات النزيل\n• تغيير حالة الغرفة إلى "تحتاج تنظيف"\n• إعادة تعيين الرصيد`)) {
                    if (onStatusChange) {
                      // تغيير الحالة لـ NeedsCleaning وحذف البيانات
                      onStatusChange(room.id, 'NeedsCleaning');
                    }
                    handleClose();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 h-14 text-lg font-bold shadow-lg"
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 حفظ الحجز
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
