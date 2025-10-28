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

export default function BookingDialog({ room, isOpen, onClose, onSave }: BookingDialogProps) {
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
      // تعيين تاريخ ووقت الدخول الحالي
      const now = new Date();
      setCheckInDate(now.toISOString().split('T')[0]);
      setCheckInTime(now.toTimeString().slice(0, 5));
      
      // تعيين السعر اليومي من بيانات الغرفة
      setDailyRate(room.price || 0);
      
      // توليد رقم عقد تلقائي
      setContractNumber(`CONTRACT-${Date.now()}`);
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
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              إضافة حجز جديد
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
                    <SelectContent className="bg-slate-800 border-cyan-500/30">
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
                    <SelectContent className="bg-slate-800 border-green-500/30">
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
                    <SelectContent className="bg-slate-800 border-purple-500/30">
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
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeposits(deposits.filter((_, i) => i !== index))}
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
                          variant="destructive"
                          size="sm"
                          onClick={() => setAdvancePayments(advancePayments.filter((_, i) => i !== index))}
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
                    disabled={user?.role !== 'admin' && user?.role !== 'manager'}
                  />
                  {user?.role !== 'admin' && user?.role !== 'manager' && (
                    <p className="text-xs text-yellow-300/70">تعديل السعر يتطلب صلاحيات المدير</p>
                  )}
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
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSave={(guest) => {
          if (!selectedGuest) {
            setSelectedGuest(guest);
          } else {
            setCompanions([...companions, guest]);
          }
          setIsAddGuestOpen(false);
        }}
      />
    </>
  );
}
