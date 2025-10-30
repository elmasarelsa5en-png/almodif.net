'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  Plane,
  MapPin,
  Eye,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  Plus,
  Minus,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface RoomType {
  id: string;
  name: string;
  nameEn: string;
}

interface PlatformPrice {
  platformId: string;
  price: number;
  available: boolean;
  availableUnits: number;  // عدد الشقق المتاحة
  minStay?: number;
}

interface DayPrice {
  date: string;
  roomTypeId: string;
  platforms: PlatformPrice[];
}

const platforms = [
  { id: 'website', name: 'الموقع الإلكتروني', icon: Globe, color: 'from-cyan-500 to-cyan-600' },
  { id: 'booking', name: 'Booking.com', icon: Globe, color: 'from-blue-500 to-blue-600' },
  { id: 'almosafer', name: 'المسافر', icon: Building2, color: 'from-green-500 to-green-600' },
  { id: 'agoda', name: 'Agoda', icon: MapPin, color: 'from-purple-500 to-purple-600' },
  { id: 'airport', name: 'المطار', icon: Plane, color: 'from-orange-500 to-orange-600' },
  { id: 'expedia', name: 'Expedia', icon: Globe, color: 'from-yellow-500 to-yellow-600' },
  { id: 'airbnb', name: 'Airbnb', icon: Building2, color: 'from-pink-500 to-pink-600' },
  { id: 'elmasarelsa5en', name: 'المسار الساخن', icon: Building2, color: 'from-red-500 to-red-600' },
];

const roomTypes: RoomType[] = [
  { id: 'room1', name: 'غرفة', nameEn: 'Room' },
  { id: 'room-lounge', name: 'غرفة وصالة', nameEn: 'Room & Lounge' },
  { id: 'room2', name: 'غرفتين', nameEn: '2 Rooms' },
  { id: 'room2-lounge', name: 'غرفتين وصالة', nameEn: '2 Rooms & Lounge' },
  { id: 'room3', name: '3 غرف', nameEn: '3 Rooms' },
];

export default function PlatformsCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>(roomTypes[0].id);
  const [editingCell, setEditingCell] = useState<{ date: string; platformId: string } | null>(null);
  const [bulkEditDialog, setBulkEditDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<string | null>(null);
  const [editDayDialog, setEditDayDialog] = useState<{ date: string; day: number } | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingAvailability, setPendingAvailability] = useState<boolean>(true);

  // بيانات تجريبية للأسعار
  const [pricesData, setPricesData] = useState<DayPrice[]>(() => {
    const data: DayPrice[] = [];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      
      roomTypes.forEach(room => {
        data.push({
          date: dateStr,
          roomTypeId: room.id,
          platforms: platforms.map(platform => ({
            platformId: platform.id,
            price: Math.floor(Math.random() * (800 - 200) + 200),
            available: Math.random() > 0.1,
            availableUnits: Math.floor(Math.random() * 10) + 1, // 1-10 شقق
            minStay: 1
          }))
        });
      });
    }
    
    return data;
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  const getDayData = (day: number, platformId: string): PlatformPrice | undefined => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayPrice = pricesData.find(d => d.date === dateStr && d.roomTypeId === selectedRoom);
    return dayPrice?.platforms.find(p => p.platformId === platformId);
  };

  const updatePrice = (day: number, platformId: string, newPrice: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    setPricesData(prev => prev.map(item => {
      if (item.date === dateStr && item.roomTypeId === selectedRoom) {
        return {
          ...item,
          platforms: item.platforms.map(p => 
            p.platformId === platformId ? { ...p, price: newPrice } : p
          )
        };
      }
      return item;
    }));
  };

  const toggleAvailability = (day: number, platformId: string) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    setPricesData(prev => prev.map(item => {
      if (item.date === dateStr && item.roomTypeId === selectedRoom) {
        return {
          ...item,
          platforms: item.platforms.map(p => 
            p.platformId === platformId ? { ...p, available: !p.available } : p
          )
        };
      }
      return item;
    }));
  };

  // التحقق من صحة القيم المدخلة
  const validateInputs = (price: number, units: number): string | null => {
    // تحذير إذا السعر صغير جداً (ممكن يكون عدد شقق بالغلط)
    if (price > 0 && price < 100) {
      return '⚠️ تحذير: السعر أقل من 100 ريال! هل أنت متأكد؟ ربما كتبت عدد الشقق بدلاً من السعر؟';
    }
    
    // تحذير إذا عدد الشقق كبير جداً (ممكن يكون سعر بالغلط)
    if (units > 20) {
      return '⚠️ تحذير: عدد الشقق أكثر من 20! هل أنت متأكد؟ ربما كتبت السعر بدلاً من عدد الشقق؟';
    }
    
    // تحذير إذا السعر كبير جداً بشكل غير طبيعي
    if (price > 5000) {
      return '⚠️ تحذير: السعر أكثر من 5000 ريال! هل أنت متأكد من هذا السعر؟';
    }
    
    return null;
  };

  const applyBulkUpdate = (price: number, available: boolean, availableUnits: number) => {
    // التحقق من القيم
    const warning = validateInputs(price, availableUnits);
    if (warning) {
      setValidationWarning(warning);
      setPendingAvailability(available); // حفظ الحالة المطلوبة
      return; // لا تنفذ حتى يتأكد المستخدم
    }
    
    setPricesData(prev => prev.map(item => {
      if (selectedDates.includes(item.date) && item.roomTypeId === selectedRoom) {
        return {
          ...item,
          platforms: item.platforms.map(p => ({
            ...p,
            price: price,
            available: available,
            availableUnits: availableUnits
          }))
        };
      }
      return item;
    }));
    
    // رسالة نجاح
    const statusText = available ? 'متاح للحجز' : 'غير متاح';
    setSuccessMessage(`✅ تم تحديث ${selectedDates.length} يوم - ${statusText}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    
    setSelectedDates([]);
    setBulkEditDialog(false);
  };
  
  // تنفيذ بعد التأكيد من التحذير
  const forceApplyBulkUpdate = () => {
    const price = Number((document.getElementById('bulk-price') as HTMLInputElement).value);
    const units = Number((document.getElementById('bulk-units') as HTMLInputElement).value);
    
    setPricesData(prev => prev.map(item => {
      if (selectedDates.includes(item.date) && item.roomTypeId === selectedRoom) {
        return {
          ...item,
          platforms: item.platforms.map(p => ({
            ...p,
            price: price,
            available: pendingAvailability,
            availableUnits: units
          }))
        };
      }
      return item;
    }));
    
    // رسالة نجاح
    const statusText = pendingAvailability ? 'متاح للحجز' : 'غير متاح';
    setSuccessMessage(`✅ تم تحديث ${selectedDates.length} يوم - ${statusText}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    
    setSelectedDates([]);
    setBulkEditDialog(false);
    setValidationWarning(null);
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (dateStr: string) => {
    setIsDragging(true);
    setDragStartDate(dateStr);
    setSelectedDates([dateStr]);
  };

  // Handle mouse enter - continue dragging
  const handleMouseEnter = (dateStr: string) => {
    if (isDragging && dragStartDate) {
      const start = new Date(dragStartDate);
      const current = new Date(dateStr);
      const dates: string[] = [];
      
      const startTime = start.getTime();
      const currentTime = current.getTime();
      const minTime = Math.min(startTime, currentTime);
      const maxTime = Math.max(startTime, currentTime);
      
      for (let time = minTime; time <= maxTime; time += 24 * 60 * 60 * 1000) {
        const date = new Date(time);
        if (date.getMonth() === currentDate.getMonth()) {
          dates.push(date.toISOString().split('T')[0]);
        }
      }
      
      setSelectedDates(dates);
    }
  };

  // Handle mouse up - stop dragging and open bulk edit dialog
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
    
    // إذا كان فيه أيام محددة، افتح dialog التحديث الجماعي تلقائياً
    if (selectedDates.length > 0) {
      setBulkEditDialog(true);
    }
  };

  // Update day prices from edit dialog
  const updateDayPrices = (date: string, platformPrices: { platformId: string; price: number; availableUnits: number }[]) => {
    setPricesData(prev => prev.map(item => {
      if (item.date === date && item.roomTypeId === selectedRoom) {
        return {
          ...item,
          platforms: item.platforms.map(p => {
            const update = platformPrices.find(pp => pp.platformId === p.platformId);
            return update ? { ...p, price: update.price, availableUnits: update.availableUnits } : p;
          })
        };
      }
      return item;
    }));
  };

  const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Add mouse up event listener
  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6" dir="rtl">
      <div className="relative z-10 max-w-[1800px] mx-auto space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-bold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4 ml-2" />
                رجوع
              </Button>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-400" />
                تقويم الأسعار والتوفر
              </h1>
            </div>
            <p className="text-white/60 mt-1">إدارة الأسعار والتوفر لجميع المنصات</p>
          </div>

          <Button
            onClick={() => setBulkEditDialog(true)}
            disabled={selectedDates.length === 0}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <Edit className="w-4 h-4 ml-2" />
            تعديل جماعي ({selectedDates.length})
          </Button>
        </div>

        {/* Room Type Selection */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-white/70 text-sm whitespace-nowrap">نوع الوحدة:</span>
              {roomTypes.map((room) => (
                <Button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  variant={selectedRoom === room.id ? "default" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    selectedRoom === room.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  )}
                >
                  {room.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center justify-between">
              <Button
                onClick={previousMonth}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <CardTitle className="text-2xl font-bold text-white">
                {getMonthName(currentDate)}
              </CardTitle>

              <Button
                onClick={nextMonth}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Platform Headers */}
            <div className="grid grid-cols-8 border-b border-white/10 bg-white/5">
              <div className="p-3 border-l border-white/10 sticky right-0 bg-slate-800/50 backdrop-blur-sm">
                <span className="text-white/70 text-sm font-medium">التاريخ</span>
              </div>
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.id} className="p-3 border-l border-white/10 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", platform.color)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">{platform.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calendar Days */}
            <div className="max-h-[600px] overflow-y-auto">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();
                const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                const isSelected = selectedDates.includes(dateStr);

                return (
                  <div
                    key={day}
                    className={cn(
                      "grid grid-cols-8 border-b border-white/10 hover:bg-white/5 transition-colors",
                      isWeekend && "bg-orange-500/5",
                      isSelected && "bg-blue-500/10"
                    )}
                  >
                    {/* Day Cell */}
                    <div
                      onMouseDown={() => handleMouseDown(dateStr)}
                      onMouseEnter={() => handleMouseEnter(dateStr)}
                      onClick={() => setEditDayDialog({ date: dateStr, day })}
                      className="p-3 border-l border-white/10 sticky right-0 bg-slate-800/50 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 select-none"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">{day}</span>
                        <span className="text-white/60 text-xs">{weekDays[dayOfWeek]}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-400 mt-1" />
                        )}
                        <Button
                          size="sm"
                          className="mt-1 h-5 text-xs bg-blue-500/50 hover:bg-blue-500/70 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditDayDialog({ date: dateStr, day });
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Platform Cells */}
                    {platforms.map((platform) => {
                      const dayData = getDayData(day, platform.id);
                      const isEditing = editingCell?.date === dateStr && editingCell?.platformId === platform.id;

                      return (
                        <div
                          key={platform.id}
                          className={cn(
                            "p-2 border-l border-white/10 relative group",
                            !dayData?.available && "bg-red-500/10"
                          )}
                        >
                          {dayData && (
                            <div className="space-y-1">
                              {/* Price */}
                              {isEditing ? (
                                <Input
                                  type="number"
                                  defaultValue={dayData.price}
                                  onBlur={(e) => {
                                    updatePrice(day, platform.id, Number(e.target.value));
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updatePrice(day, platform.id, Number((e.target as HTMLInputElement).value));
                                      setEditingCell(null);
                                    }
                                  }}
                                  autoFocus
                                  className="h-8 text-sm bg-white/10 border-white/20 text-white"
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingCell({ date: dateStr, platformId: platform.id })}
                                  className="flex items-center gap-1 cursor-pointer hover:bg-white/10 rounded px-2 py-1"
                                >
                                  <DollarSign className="w-3 h-3 text-green-400" />
                                  <span className="text-white font-bold text-sm">{dayData.price}</span>
                                  <span className="text-white/60 text-xs">ر.س</span>
                                </div>
                              )}

                              {/* Available Units */}
                              <div className="flex items-center justify-center gap-1 text-xs">
                                <Users className="w-3 h-3 text-blue-400" />
                                <span className="text-white/80">{dayData.availableUnits} شقة</span>
                              </div>

                              {/* Availability Toggle */}
                              <Button
                                onClick={() => toggleAvailability(day, platform.id)}
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full h-6 text-xs",
                                  dayData.available
                                    ? "bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30"
                                    : "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                )}
                              >
                                {dayData.available ? "متاح" : "غير متاح"}
                              </Button>

                              {/* Edit Button (appears on hover) */}
                              <Button
                                onClick={() => setEditingCell({ date: dateStr, platformId: platform.id })}
                                size="sm"
                                className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0 bg-blue-500/50 hover:bg-blue-500/70"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
                <span className="text-white/70 text-sm">متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
                <span className="text-white/70 text-sm">غير متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500/10 border border-orange-500/30 rounded"></div>
                <span className="text-white/70 text-sm">عطلة نهاية الأسبوع</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
                <span className="text-white/70 text-sm">محدد للتعديل</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialog} onOpenChange={(open) => {
        setBulkEditDialog(open);
        if (!open) {
          setValidationWarning(null);
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              تحديث {selectedDates.length} يوم محدد
            </DialogTitle>
            <DialogDescription className="text-white/70">
              حدد السعر وعدد الشقق المتاحة لكل الأيام المحددة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* عرض الأيام المحددة */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-blue-400">الأيام المحددة:</span>
              </div>
              <div className="text-sm text-white/80">
                {selectedDates.length} يوم من {new Date(selectedDates[0]).toLocaleDateString('ar-SA')} 
                {selectedDates.length > 1 && ` إلى ${new Date(selectedDates[selectedDates.length - 1]).toLocaleDateString('ar-SA')}`}
              </div>
            </div>

            {/* تحذير إذا كان موجود */}
            {validationWarning && (
              <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-orange-200 font-medium">{validationWarning}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={forceApplyBulkUpdate}
                        size="sm"
                        className="bg-orange-500/30 hover:bg-orange-500/50 text-white border border-orange-500/50"
                      >
                        نعم، متأكد - تنفيذ
                      </Button>
                      <Button
                        onClick={() => setValidationWarning(null)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        تعديل القيم
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">💰 السعر لليلة الواحدة (ريال)</label>
              <Input
                id="bulk-price"
                type="number"
                placeholder="500"
                className="bg-white/10 border-white/20 text-white text-lg"
              />
              <p className="text-xs text-white/50">مثال: 500 ريال لليلة</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">🏢 عدد الشقق المتاحة</label>
              <Input
                id="bulk-units"
                type="number"
                placeholder="5"
                min="0"
                max="20"
                className="bg-white/10 border-white/20 text-white text-lg"
              />
              <p className="text-xs text-white/50">مثال: 5 شقق متاحة للحجز</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">📊 حالة التوفر</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const price = Number((document.getElementById('bulk-price') as HTMLInputElement).value);
                    const units = Number((document.getElementById('bulk-units') as HTMLInputElement).value);
                    applyBulkUpdate(price, true, units);
                  }}
                  className="flex-1 bg-green-500/20 border border-green-500/50 text-green-300 hover:bg-green-500/30"
                >
                  ✅ متاح للحجز
                </Button>
                <Button
                  onClick={() => {
                    const price = Number((document.getElementById('bulk-price') as HTMLInputElement).value);
                    const units = Number((document.getElementById('bulk-units') as HTMLInputElement).value);
                    applyBulkUpdate(price, false, units);
                  }}
                  className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
                >
                  ❌ غير متاح
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setBulkEditDialog(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Day Dialog */}
      <Dialog open={!!editDayDialog} onOpenChange={(open) => !open && setEditDayDialog(null)}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              تعديل يوم {editDayDialog?.day} - {new Date(currentDate.getFullYear(), currentDate.getMonth(), editDayDialog?.day || 1).toLocaleDateString('ar-SA', { weekday: 'long' })}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              قم بتعديل السعر وعدد الشقق المتاحة لكل منصة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {platforms.map((platform) => {
              const dayData = editDayDialog ? getDayData(editDayDialog.day, platform.id) : null;
              return (
                <Card key={platform.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", platform.color)}>
                        <platform.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-white">{platform.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">السعر (ريال)</label>
                        <Input
                          id={`price-${platform.id}`}
                          type="number"
                          defaultValue={dayData?.price || 0}
                          placeholder="500"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-white/70">عدد الشقق المتاحة</label>
                        <Input
                          id={`units-${platform.id}`}
                          type="number"
                          defaultValue={dayData?.availableUnits || 0}
                          placeholder="5"
                          min="0"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setEditDayDialog(null)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (editDayDialog) {
                  const platformPrices = platforms.map(platform => ({
                    platformId: platform.id,
                    price: Number((document.getElementById(`price-${platform.id}`) as HTMLInputElement).value),
                    availableUnits: Number((document.getElementById(`units-${platform.id}`) as HTMLInputElement).value),
                  }));
                  updateDayPrices(editDayDialog.date, platformPrices);
                  setEditDayDialog(null);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
