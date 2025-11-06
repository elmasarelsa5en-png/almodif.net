'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
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
import ReceiptDialog from '@/components/ReceiptDialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { createReceipt } from '@/lib/receipts-system';

interface BookingDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: any) => void;
  onStatusChange?: (roomId: string, newStatus: string, guestName?: string) => void;
  onRoomChange?: (oldRoomId: string, newRoomNumber: string) => Promise<boolean>;
  allRooms?: Room[]; // قائمة كل الغرف للتحقق من التوفر
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
export default function BookingDialog({ room, isOpen, onClose, onSave, onStatusChange, onRoomChange, allRooms }: BookingDialogProps) {
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
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [companions, setCompanions] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [visitType, setVisitType] = useState('tourism');
  
  // المالية
  const [deposits, setDeposits] = useState<number[]>([]);
  const [advancePayments, setAdvancePayments] = useState<number[]>([]);
  const [dailyRate, setDailyRate] = useState(0);
  const [baseDailyRate, setBaseDailyRate] = useState(0); // السعر الأساسي من الكتالوج (ثابت)
  const [discount, setDiscount] = useState(0); // الخصم
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed'); // نوع الخصم
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
        setBaseDailyRate(priceToUse || room.price || 0); // حفظ السعر الأساسي
        setDailyRate(priceToUse || room.price || 0); // السعر الفعلي
        console.log('✅ تم تحميل السعر من الكتالوج:', priceToUse);
      } else {
        // استخدام السعر من بيانات الغرفة كبديل
        setBaseDailyRate(room.price || 0);
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

  // حساب السعر بعد الخصم
  useEffect(() => {
    if (baseDailyRate > 0) {
      let finalPrice = baseDailyRate;
      
      if (discount > 0) {
        if (discountType === 'percentage') {
          // خصم بالنسبة المئوية
          finalPrice = baseDailyRate - (baseDailyRate * discount / 100);
        } else {
          // خصم ثابت
          finalPrice = baseDailyRate - discount;
        }
      }
      
      // التأكد من أن السعر لا يكون سالب
      finalPrice = Math.max(0, finalPrice);
      setDailyRate(finalPrice);
    }
  }, [baseDailyRate, discount, discountType]);

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
      // استخدام نظام سندات القبض المحدث
      const receiptId = await createReceipt({
        type: 'booking_deposit',
        amount: paymentData.amount,
        roomNumber: paymentData.roomNumber,
        guestName: paymentData.guestName,
        paymentMethod: paymentData.method,
        description: `دفعة حجز غرفة ${paymentData.roomNumber} - ${paymentData.guestName} - عقد ${paymentData.contractNumber}`,
        category: 'room_rent',
        paidBy: 'الاستقبال',
        createdBy: 'النظام',
        notes: `رقم العقد: ${paymentData.contractNumber}`
      });

      if (receiptId) {
        console.log('✅ تم حفظ سند القبض:', receiptId);
        
        // إضافة أيضاً في معاملات المحاسبة
        await addDoc(collection(db, 'accounting-transactions'), {
          type: 'receipt',
          amount: paymentData.amount,
          paymentMethod: paymentData.method,
          paymentMethodAr: paymentData.method === 'cash' ? 'نقدي' : 
                           paymentData.method === 'card' ? 'بطاقة' : 'تحويل بنكي',
          guestName: paymentData.guestName,
          roomNumber: paymentData.roomNumber,
          contractNumber: paymentData.contractNumber,
          description: `دفعة حجز غرفة ${paymentData.roomNumber} - ${paymentData.guestName}`,
          category: 'room-revenue',
          categoryAr: 'إيرادات الغرف',
          date: new Date().toISOString(),
          createdAt: serverTimestamp(),
          createdBy: 'النظام',
          status: 'completed',
          receiptId // ربط بسند القبض
        });
        
        return receiptId;
      }
    } catch (error) {
      console.error('❌ خطأ في حفظ سند القبض:', error);
      alert('⚠️ حدث خطأ في حفظ سند القبض. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSave = async () => {
    // 1. التحقق من اختيار النزيل
    if (!selectedGuest) {
      alert('❌ يرجى اختيار نزيل');
      return;
    }

    // 2. التحقق من مصدر الحجز
    if (!bookingSource) {
      alert('❌ يرجى تحديد مصدر الحجز');
      return;
    }

    // 3. التحقق من سبب الزيارة
    if (!visitType) {
      alert('❌ يرجى تحديد سبب الزيارة (سياحة أو عمل)');
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
        baseDailyRate, // السعر الأساسي من الكتالوج
        discount, // مقدار الخصم
        discountType, // نوع الخصم
        dailyRate, // السعر النهائي بعد الخصم
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

  // 🖨️ طباعة العقد الاحترافي
  const handlePrintContract = async () => {
    if (!selectedGuest || !room) {
      alert('يرجى حفظ بيانات الحجز أولاً');
      return;
    }

    // تحميل إعدادات العقد من Firebase
    let contractSettings: any = {
      hotelName: 'فندق المضيف',
      hotelNameEn: 'Al Modif Hotel',
      address: 'العنوان الجديد - ابها',
      city: 'ابها',
      phone: '+966504755400',
      email: 'info@almodif.net',
      commercialRegister: '30092765750003',
      taxNumber: '1090030246',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      securityDeposit: 500,
      penaltyAmount: 350,
      terms: []
    };

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const settingsDoc = await getDoc(doc(db, 'settings', 'contract'));
      if (settingsDoc.exists()) {
        contractSettings = { ...contractSettings, ...settingsDoc.data() };
      }
    } catch (error) {
      console.error('خطأ في تحميل إعدادات العقد:', error);
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // تنسيق التاريخ بالهجري
    const formatHijriDate = (date: string) => {
      const gregorianDate = new Date(date);
      return gregorianDate.toLocaleDateString('ar-SA-u-ca-islamic', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const contractHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>عقد إيجار - غرفة ${room.number}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body {
            font-family: 'Traditional Arabic', 'Arial', sans-serif;
            padding: 0;
            margin: 0;
            direction: rtl;
            text-align: right;
            background: white;
            color: #000;
            font-size: 11px;
          }
          
          .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 5mm;
          }
          
          /* الرأسية */
          .header {
            text-align: center;
            border: 2px solid #1e40af;
            padding: 8px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            position: relative;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 5px;
          }
          
          .logo {
            max-width: 100px;
            max-height: 50px;
            object-fit: contain;
          }
          
          .header h1 {
            color: #1e40af;
            margin: 0 0 5px 0;
            font-size: 20px;
            font-weight: bold;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 10px;
            color: #1e40af;
          }
          
          .header-info div {
            flex: 1;
          }
          
          /* بيانات الفندق */
          .hotel-info {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            border: 2px solid #1e40af;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 8px;
            text-align: center;
            box-shadow: 0 2px 3px rgba(30, 64, 175, 0.15);
          }
          
          .hotel-info h2 {
            color: #ffffff;
            font-size: 16px;
            margin: 0 0 3px 0;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          .hotel-info p {
            margin: 2px 0;
            color: #e0e7ff;
            font-size: 10px;
            font-weight: 500;
          }
          
          .hotel-info p strong {
            color: #ffffff;
          }
          
          /* جدول العقد */
          .contract-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            border: 2px solid #1e40af;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(30, 64, 175, 0.1);
          }
          
          .contract-table th {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 6px;
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          .contract-table td {
            border: 1px solid #cbd5e1;
            padding: 5px;
            font-size: 10px;
          }
          
          .contract-table .label {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            font-weight: bold;
            color: #1e40af;
            width: 35%;
          }
          
          .contract-table .value {
            background: white;
            color: #1e293b;
            font-weight: 600;
          }
          
          /* البنود */
          .terms-section {
            margin: 10px 0;
            border: 2px solid #1e40af;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .terms-section h3 {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 6px;
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          .terms-content {
            padding: 8px 10px;
            background: #ffffff;
          }
          
          .term-item {
            display: flex;
            gap: 6px;
            margin-bottom: 6px;
            font-size: 9px;
            line-height: 1.4;
          }
          
          .term-number {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10px;
            box-shadow: 0 1px 2px rgba(30, 64, 175, 0.2);
          }
          
          .term-text {
            flex: 1;
            color: #334155;
            text-align: justify;
          }
          
          /* التوقيعات */
          .signatures {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 8px 0;
          }
          
          .signature-box {
            flex: 1;
            text-align: center;
            border: 2px solid #1e40af;
            border-radius: 4px;
            padding: 8px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          }
          
          .signature-title {
            color: #1e40af;
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 25px;
          }
          
          .signature-line {
            border-top: 2px solid #1e40af;
            margin-top: 30px;
            padding-top: 5px;
            font-weight: bold;
            color: #1e40af;
            font-size: 10px;
          }
          
          .signature-image {
            max-width: 150px;
            max-height: 40px;
            margin: 5px auto;
            display: block;
            border: 1px solid #e2e8f0;
            border-radius: 2px;
          }
          
          /* الفوتر */
          .footer {
            margin-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
          
          .footer p {
            margin: 2px 0;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- الرأسية - معلومات العقد والفندق في صف واحد مضغوط -->
          <div class="header" style="text-align: center; padding: 15px; border-bottom: 2px solid #e5e7eb;">
            ${contractSettings.logoUrl ? `
            <div class="logo-container" style="margin-bottom: 10px;">
              <img src="${contractSettings.logoUrl}" alt="شعار الفندق" class="logo" style="max-width: 120px; height: auto;" />
            </div>
            ` : ''}
            
            <!-- عنوان العقد -->
            <h1 style="color: #1e40af; font-size: 28px; margin: 10px 0;">عقد إيجار</h1>
            
            <!-- معلومات العقد في سطر واحد -->
            <div style="font-size: 13px; color: #374151; margin: 8px 0;">
              <strong>رقم العقد:</strong> ${contractNumber} | 
              <strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')} | 
              <strong>الموافق:</strong> ${formatHijriDate(new Date().toISOString().split('T')[0])}
            </div>
            
            <!-- معلومات الفندق الكاملة في 3 أسطر مضغوطة -->
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <h2 style="color: #1e40af; font-size: 20px; margin: 5px 0;">${contractSettings.hotelName}</h2>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.8;">
                ${contractSettings.address} - ${contractSettings.city} | 
                📞 <strong>${contractSettings.phone}</strong> | 
                📧 <strong>${contractSettings.email}</strong> | 
                الرقم الضريبي: <strong>${contractSettings.taxNumber}</strong> | 
                السجل التجاري: <strong>${contractSettings.commercialRegister}</strong>
              </div>
            </div>
          </div>
          
          <!-- جدول بيانات العقد -->
          <table class="contract-table">
            <thead>
              <tr>
                <th colspan="4">بيانات الحجز</th>
              </tr>
            </thead>
            <tbody>
              <!-- تاريخ الدخول والخروج -->
              <tr>
                <td class="label">تاريخ الدخول (ميلادي)</td>
                <td class="value">${checkInDate}</td>
                <td class="label">تاريخ الدخول (هجري)</td>
                <td class="value">${formatHijriDate(checkInDate)}</td>
              </tr>
              <tr>
                <td class="label">تاريخ الخروج (ميلادي)</td>
                <td class="value">${checkOutDate}</td>
                <td class="label">تاريخ الخروج (هجري)</td>
                <td class="value">${formatHijriDate(checkOutDate)}</td>
              </tr>
              <tr>
                <td class="label">الشقة</td>
                <td class="value">${room.number}</td>
                <td class="label">نوع الإيجار</td>
                <td class="value">${rentalType === 'daily' ? 'يومي' : 'شهري'}</td>
              </tr>
              <tr>
                <td class="label">الإيجار اليومي</td>
                <td class="value">${dailyRate} ر.س</td>
                <td class="label">الأيام</td>
                <td class="value">${numberOfDays}</td>
              </tr>
              <tr>
                <td class="label">الإجمالي</td>
                <td class="value"><strong>${totalAmount}</strong> ر.س</td>
                <td class="label">المدفوع</td>
                <td class="value" style="color: green"><strong>${totalDeposits}</strong> ر.س</td>
              </tr>
            </tbody>
          </table>
          
          <!-- بيانات العميل -->
          <table class="contract-table">
            <thead>
              <tr>
                <th colspan="6">بيانات العميل</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="label">اسم العميل</td>
                <td class="value"><strong>${selectedGuest.name}</strong></td>
                <td class="label">الجنسية</td>
                <td class="value">${selectedGuest.nationality || 'السعودية'}</td>
                <td class="label">نوع الإثبات</td>
                <td class="value">${selectedGuest.idType || 'بطاقة هوية مدنية'}</td>
              </tr>
              <tr>
                <td class="label">رقم الإثبات</td>
                <td class="value">${selectedGuest.idNumber || '—'}</td>
                <td class="label">جوال</td>
                <td class="value">${selectedGuest.phone}</td>
                <td class="label">عدد المرافقين</td>
                <td class="value">${companions.length}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- الشروط والأحكام -->
          <div class="terms-section">
            <h3>شروط وأحكام عقد الإيجار</h3>
            <div class="terms-content">
              ${contractSettings.terms && contractSettings.terms.length > 0 
                ? contractSettings.terms.map((term: string, index: number) => `
                  <div class="term-item">
                    <div class="term-number">${index + 1}</div>
                    <div class="term-text">${term}</div>
                  </div>
                `).join('')
                : '<p style="text-align: center; color: #64748b; padding: 20px;">لا توجد بنود محددة</p>'
              }
            </div>
          </div>
          
          <!-- التوقيعات -->
          <div class="signatures">
            <div class="signature-box">
              ${room.bookingDetails?.guestSignature 
                ? `<img src="${room.bookingDetails.guestSignature}" class="signature-image" alt="توقيع النزيل" />`
                : ''
              }
              <div class="signature-line">توقيع المستأجر</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">توقيع المسؤول</div>
            </div>
          </div>
          
          <!-- الفوتر -->
          <div class="footer" style="text-align: center; line-height: 1.6;">
            <p style="margin-bottom: 10px; font-size: 13px; color: #4b5563;">
              بتوقيع هذا العقد، يُقر المستأجر بموافقته على جميع الشروط والأحكام المذكورة وفقاً للأنظمة والسياسات الخاصة بالمنشأة
            </p>
            <p style="font-size: 14px; margin: 5px 0;">
              <strong style="color: #1e40af;">${contractSettings.hotelName}</strong>
            </p>
            <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
              ${contractSettings.address} - ${contractSettings.city}
            </p>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">
              📞 <strong>${contractSettings.phone}</strong> | 
              📧 <strong>${contractSettings.email}</strong>
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">
              الرقم الضريبي: <strong>${contractSettings.taxNumber}</strong> | 
              السجل التجاري: <strong>${contractSettings.commercialRegister}</strong>
            </p>
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
          <DialogDescription className="sr-only">
            نموذج تفاصيل وإدارة حجز الغرفة مع معلومات النزيل والدفعات المالية
          </DialogDescription>
          
          {/* Header with modern gradient */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-4 py-3 mb-4 flex items-center justify-between shadow-xl">
            <DialogTitle className="text-xl font-bold text-white drop-shadow-lg">
              {room.status === 'Occupied' || room.status === 'Reserved' 
                ? `تفاصيل الحجز - غرفة ${room.number}` 
                : `حجز جديد - غرفة ${room.number}`}
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* زر تغيير الحالة */}
              <Button
                variant="outline"
                onClick={() => setShowStatusChange(!showStatusChange)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-lg font-bold text-sm h-8 px-3"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                تغيير الحالة
              </Button>
              
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-3 px-4">
            {/* قسم تغيير الحالة */}
            {showStatusChange && onStatusChange && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-300 shadow-lg">
                <h3 className="text-base font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  تغيير حالة الغرفة
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Available');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm h-9"
                  >
                    متاحة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Reserved');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm h-9"
                  >
                    محجوزة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'Maintenance');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm h-9"
                  >
                    صيانة
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'NeedsCleaning');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm h-9"
                  >
                    تحتاج تنظيف
                  </Button>
                  <Button
                    onClick={() => {
                      onStatusChange(room.id, 'CheckoutToday');
                      setShowStatusChange(false);
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm h-9"
                  >
                    خروج اليوم
                  </Button>
                  <Button
                    onClick={() => setShowStatusChange(false)}
                    variant="outline"
                    className="border border-gray-400 text-gray-700 hover:bg-gray-100 text-sm h-9"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
            
            {/* عرض بيانات النزيل الحالي */}
            {selectedGuest && (room.status === 'Occupied' || room.status === 'Reserved') && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    بيانات النزيل الحالي
                  </h3>
                  {/* علامة التحقق من شموس */}
                  {selectedGuest.shamoosVerified !== undefined && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                      selectedGuest.shamoosVerified 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {selectedGuest.shamoosVerified ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          مُحقق من شموس
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          غير محقق
                        </>
                      )}
                    </div>
                  )}
                </div>
                
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
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-base font-bold text-gray-800 mb-3">معلومات الحجز</h3>
              <div className="grid grid-cols-4 gap-3">
                {/* رقم العقد */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">رقم العقد</label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="تلقائي"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                  />
                </div>
                
                {/* مصدر الحجز */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    مصدر الحجز <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={bookingSource} 
                    onChange={(e) => setBookingSource(e.target.value)}
                    className="w-full h-9 px-2 text-sm border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:border-blue-400 focus:border-blue-500 transition-all"
                  >
                    <option value="">اختر المصدر</option>
                    {BOOKING_SOURCES.map(source => (
                      <option key={source.value} value={source.value}>
                        {source.icon} {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* نوع الإيجار */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">نوع الإيجار</label>
                  <select 
                    value={rentalType} 
                    onChange={(e) => setRentalType(e.target.value as 'daily' | 'monthly')}
                    className="w-full h-9 px-2 text-sm border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:border-blue-400 focus:border-blue-500 transition-all"
                  >
                    <option value="">اختر النوع</option>
                    <option value="daily">📅 يومي</option>
                    <option value="monthly">📆 شهري</option>
                  </select>
                </div>

                {/* نوع الزيارة */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    نوع الزيارة <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={visitType} 
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full h-9 px-2 text-sm border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium hover:border-blue-400 focus:border-blue-500 transition-all"
                  >
                    <option value="">اختر نوع الزيارة</option>
                    {VISIT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* الفترة - Period Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-800">الفترة</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الأيام</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الوقت</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">إلى</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">من</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-3 py-2 text-center">
                      <input 
                        type="number" 
                        min="1"
                        value={numberOfDays}
                        onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center font-bold bg-white" 
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-col gap-1">
                        <input 
                          type="time" 
                          value={checkOutTime}
                          onChange={(e) => setCheckOutTime(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs" 
                        />
                        <input 
                          type="time" 
                          value={checkInTime}
                          onChange={(e) => setCheckInTime(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs" 
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">ميلادي</span>
                        <input 
                          type="date" 
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs" 
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">ميلادي</span>
                        <input 
                          type="date" 
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs" 
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* الشقة والعميل - Two Column Tables */}
            <div className="grid grid-cols-2 gap-3">
              {/* الشقة - Left Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-800">الشقة</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600 w-1/3">رقم الشقة</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-bold text-sm">#{room.number}</span>
                          {(room.status === 'Occupied' || room.status === 'Reserved') && onRoomChange && allRooms && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                // عرض الغرف المتاحة فقط
                                const availableRooms = allRooms.filter(r => r.status === 'Available' && r.id !== room.id);
                                
                                if (availableRooms.length === 0) {
                                  alert('❌ لا توجد غرف متاحة حالياً');
                                  return;
                                }
                                
                                const roomsList = availableRooms.map(r => `${r.number} - ${r.type}`).join('\\n');
                                const newRoomNumber = prompt(`تغيير الغرفة من ${room.number}\\n\\nالغرف المتاحة:\\n${roomsList}\\n\\nأدخل رقم الغرفة الجديدة:`);
                                
                                if (!newRoomNumber || newRoomNumber === room.number) return;
                                
                                // التحقق من أن الغرفة الجديدة متاحة
                                const targetRoom = allRooms.find(r => r.number === newRoomNumber);
                                if (!targetRoom) {
                                  alert('❌ رقم الغرفة غير صحيح');
                                  return;
                                }
                                
                                if (targetRoom.status !== 'Available') {
                                  alert('❌ الغرفة المطلوبة غير متاحة');
                                  return;
                                }
                                
                                if (confirm(`✅ تأكيد النقل\\n\\nسيتم نقل: ${selectedGuest?.name || 'النزيل'}\\nمن غرفة: ${room.number}\\nإلى غرفة: ${newRoomNumber}\\n\\nهل تريد المتابعة؟`)) {
                                  const success = await onRoomChange(room.id, newRoomNumber);
                                  if (success) {
                                    alert(`✅ تم نقل النزيل بنجاح إلى غرفة ${newRoomNumber}`);
                                    handleClose();
                                  } else {
                                    alert('❌ فشل نقل النزيل. حاول مرة أخرى.');
                                  }
                                }
                              }}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-xs px-2 py-1"
                            >
                              🔄 تغيير
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">نوع الشقة</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{room.type}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">المرافقون</td>
                      <td className="px-3 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddGuestOpen(true)}
                          className="border-gray-300 text-gray-700 text-xs px-2 py-1 h-7"
                        >
                          <Users className="h-3 w-3 ml-1" />
                          إضافة ({companions.length})
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">نوع الزيارة</td>
                      <td className="px-3 py-2">
                        <select 
                          value={visitType} 
                          onChange={(e) => setVisitType(e.target.value)}
                          className="w-full h-8 px-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                        >
                          <option value="">اختر نوع الزيارة</option>
                          {VISIT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* العميل - Right Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-800">العميل</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600 w-1/3">اسم العميل</td>
                      <td className="px-3 py-2">
                        {selectedGuest ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-900 font-bold text-sm">{selectedGuest.name}</p>
                              <p className="text-gray-500 text-xs">{selectedGuest.phone}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAddGuestOpen(true)}
                              className="border-gray-300 text-xs px-2 py-1 h-7"
                            >
                              تغيير
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setIsAddGuestOpen(true)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-sm h-8"
                          >
                            <User className="h-3 w-3 ml-1" />
                            اختيار نزيل
                          </Button>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">سعر الوحدة</td>
                      <td className="px-3 py-2">
                        <input 
                          type="number" 
                          min="0"
                          value={dailyRate}
                          onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded" 
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">الإيجار</td>
                      <td className="px-3 py-2">
                        <span className="font-bold text-blue-600 text-sm">{totalAmount.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 mr-2">ر.س</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-xs font-semibold text-gray-600">الإجمالي</td>
                      <td className="px-3 py-2">
                        <span className="font-bold text-base text-green-600">{totalAmount.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 mr-1">ر.س</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* المالية - Financial Section - Compact 3 Columns */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-800">المالية</h3>
              </div>
              
              {/* Section 1: المقبوضات و بدل الإيجار و الإيجار اليومي - في صف واحد */}
              <div className="grid grid-cols-3 gap-3 p-3 border-b border-gray-200">
                {/* المقبوضات */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">المقبوضات</h4>
                  {deposits.map((amount, index) => (
                    <div key={index} className="flex gap-1">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const newDeposits = [...deposits];
                          newDeposits[index] = parseFloat(e.target.value) || 0;
                          setDeposits(newDeposits);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeposits(deposits.filter((_, i) => i !== index))}
                        className="border-red-500 text-red-600 hover:bg-red-50 px-1 h-7 w-7"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔵 زر المقبوضات تم الضغط عليه');
                      console.log('📊 البيانات:', {
                        roomNumber: room?.number,
                        guestName: selectedGuest?.fullName || selectedGuest?.name,
                        totalAmount,
                        isReceiptDialogOpen
                      });
                      setIsReceiptDialogOpen(true);
                    }}
                    className="w-full border-gray-300 text-xs h-7"
                  >
                    <Plus className="h-3 w-3 ml-1" />
                    إضافة سند قبض
                  </Button>
                  <p className="text-xs text-gray-600 font-semibold bg-green-50 px-2 py-1 rounded">
                    الإجمالي: <span className="text-green-600">{totalDeposits} ر.س</span>
                  </p>
                </div>

                {/* بدل الإيجار */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">بدل الإيجار (من الفندق)</h4>
                  {advancePayments.map((amount, index) => (
                    <div key={index} className="flex gap-1">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const newAdvance = [...advancePayments];
                          newAdvance[index] = parseFloat(e.target.value) || 0;
                          setAdvancePayments(newAdvance);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAdvancePayments(advancePayments.filter((_, i) => i !== index))}
                        className="border-red-500 text-red-600 hover:bg-red-50 px-1 h-7 w-7"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAdvancePayments([...advancePayments, 0])}
                    className="w-full border-gray-300 text-xs h-7"
                  >
                    <Plus className="h-3 w-3 ml-1" />
                    إضافة
                  </Button>
                  <p className="text-xs text-gray-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                    الإجمالي: <span className="text-blue-600">{totalAdvance} ر.س</span>
                  </p>
                </div>

                {/* الإيجار اليومي و عدد الأيام */}
                <div className="space-y-2">
                  {/* السعر الأساسي (ثابت من الكتالوج) */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">السعر الأساسي</label>
                    <div className="px-2 py-1 bg-gray-100 rounded text-sm font-bold text-gray-900 border border-gray-300">
                      {baseDailyRate.toFixed(2)} ر.س
                    </div>
                  </div>
                  
                  {/* الخصم */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">الخصم</label>
                    <div className="space-y-1">
                      {/* نوع الخصم */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setDiscountType('fixed')}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            discountType === 'fixed'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          مبلغ
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountType('percentage')}
                          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            discountType === 'percentage'
                              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          نسبة
                        </button>
                      </div>
                      
                      {/* مقدار الخصم */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={discountType === 'percentage' ? 100 : baseDailyRate}
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          placeholder={discountType === 'percentage' ? '0-100' : '0'}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <span className="text-xs text-gray-600 w-6">
                          {discountType === 'percentage' ? '%' : 'ر.س'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* السعر بعد الخصم */}
                  <div>
                    <label className="text-xs font-bold text-green-700 block mb-1">السعر النهائي</label>
                    <div className="px-2 py-1 bg-green-100 rounded text-sm font-bold text-green-900 border border-green-400">
                      {dailyRate.toFixed(2)} ر.س
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">عدد الأيام</label>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-900">
                      {numberOfDays} يوم
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: الملخص المالي - في صف واحد */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-gradient-to-r from-blue-50 via-green-50 to-red-50">
                <div className="text-center p-2 bg-blue-100 rounded-lg border border-blue-300">
                  <p className="text-xs text-gray-600 mb-0.5">المبلغ الإجمالي</p>
                  <p className="text-lg font-bold text-blue-600">{totalAmount}</p>
                  <p className="text-xs text-gray-500">ر.س</p>
                </div>
                <div className="text-center p-2 bg-green-100 rounded-lg border border-green-300">
                  <p className="text-xs text-gray-600 mb-0.5">المدفوع</p>
                  <p className="text-lg font-bold text-green-600">{totalDeposits}</p>
                  <p className="text-xs text-gray-500">ر.س</p>
                </div>
                <div className="text-center p-2 bg-red-100 rounded-lg border border-red-300">
                  <p className="text-xs text-gray-600 mb-0.5">المتبقي</p>
                  <p className="text-lg font-bold text-red-600">{remaining}</p>
                  <p className="text-xs text-gray-500">ر.س</p>
                </div>
              </div>
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
        preselectedRoom={room?.number}
      />

      {/* حوار إضافة سند قبض */}
      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={() => {
          console.log('🔴 إغلاق ReceiptDialog');
          setIsReceiptDialogOpen(false);
        }}
        onSuccess={() => {
          console.log('✅ تم حفظ السند بنجاح');
          setIsReceiptDialogOpen(false);
          // إعادة تحميل البيانات بعد إضافة السند
          alert('✅ تم إضافة سند القبض بنجاح! يمكنك الآن رؤيته في صفحة سندات القبض.');
        }}
        defaultRoomNumber={room?.number}
        defaultGuestName={selectedGuest?.fullName || selectedGuest?.name}
        defaultAmount={totalAmount > 0 ? totalAmount : undefined}
        defaultCategory="room_rent"
      />
    </>
  );
}
