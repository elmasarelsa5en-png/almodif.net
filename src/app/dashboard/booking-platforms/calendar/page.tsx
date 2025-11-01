'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Building2, Users, Save, Plus, ChevronLeft, ChevronRight, Copy, Filter, BarChart3, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface RoomType {
  id: string;
  name: string;
  nameEn: string;
}

interface Platform {
  id: string;
  name: string;
}

interface DayData {
  date: string;
  roomTypeId: string;
  platforms: {
    platformId: string;
    price: number;
    available: boolean;
    units: number;
  }[];
}

const PLATFORMS: Platform[] = [
  { id: 'website', name: 'الموقع' },
  { id: 'booking', name: 'Booking.com' },
  { id: 'almosafer', name: 'المسافر' },
  { id: 'agoda', name: 'Agoda' },
  { id: 'airport', name: 'المطار' },
  { id: 'expedia', name: 'Expedia' },
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'elmasarelsa5en', name: 'المسار الساخن' }
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Mouse selection states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionStart, setSelectionStart] = useState<{date: string, platform: string} | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<number>(300);
  const [bulkUnits, setBulkUnits] = useState<number>(5);
  
  // Feature dialogs
  const [showCopyWeekDialog, setShowCopyWeekDialog] = useState(false);
  const [showCopyMonthDialog, setShowCopyMonthDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showHolidaysDialog, setShowHolidaysDialog] = useState(false);
  const [showDayEditDialog, setShowDayEditDialog] = useState(false);
  
  // Filter state
  const [visiblePlatforms, setVisiblePlatforms] = useState<Set<string>>(
    new Set(PLATFORMS.map(p => p.id))
  );
  
  // Copy week state
  const [selectedWeekStart, setSelectedWeekStart] = useState<number>(1);
  
  // Copy month state
  const [targetMonth, setTargetMonth] = useState<Date>(new Date());
  
  // Day edit state
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [dayEditPrice, setDayEditPrice] = useState<number>(300);
  const [dayEditUnits, setDayEditUnits] = useState<number>(5);

  const monthNames = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    loadRoomTypes();
  }, []);

  useEffect(() => {
    if (currentDate && selectedRoom) {
      loadCalendarData();
    }
  }, [currentDate, selectedRoom]);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting, selectedCells]);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rooms_catalog'));
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        nameEn: doc.data().nameEn || doc.data().name
      }));
      
      console.log('✅ تم تحميل الغرف:', rooms.length);
      setRoomTypes(rooms);
      
      if (rooms.length > 0) {
        setSelectedRoom(rooms[0].id);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الغرف:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = async () => {
    try {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      console.log('📅 تحميل بيانات:', monthKey);
      
      const docRef = doc(db, 'calendar_availability', monthKey);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pricesData) {
          const roomData = data.pricesData.filter((d: DayData) => d.roomTypeId === selectedRoom);
          setCalendarData(roomData);
          console.log('📊 تم تحميل', roomData.length, 'يوم');
        } else {
          setCalendarData([]);
        }
      } else {
        setCalendarData([]);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
      setCalendarData([]);
    }
  };

  const initializeMonth = async () => {
    try {
      setLoading(true);
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const newData: DayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        newData.push({
          date: dateStr,
          roomTypeId: selectedRoom,
          platforms: PLATFORMS.map(p => ({
            platformId: p.id,
            price: 300,
            available: true,
            units: 5
          }))
        });
      }

      setCalendarData(newData);
      await saveToFirebase(newData);
      console.log('✅ تم إنشاء البيانات');
    } catch (error) {
      console.error('❌ خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToFirebase = async (data?: DayData[]) => {
    try {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const dataToSave = data || calendarData;
      
      const docRef = doc(db, 'calendar_availability', monthKey);
      const docSnap = await getDoc(docRef);
      
      let allData: DayData[] = [];
      
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.pricesData) {
          allData = existingData.pricesData.filter((d: DayData) => d.roomTypeId !== selectedRoom);
        }
      }
      
      allData = [...allData, ...dataToSave];
      
      const pricesByDay = new Map<string, any>();
      
      allData.forEach(dayData => {
        const dayNum = parseInt(dayData.date.split('-')[2]);
        
        if (!pricesByDay.has(dayData.date)) {
          pricesByDay.set(dayData.date, {
            day: dayNum,
            date: dayData.date,
            platforms: []
          });
        }
        
        const dayInfo = pricesByDay.get(dayData.date);
        
        dayData.platforms.forEach(platform => {
          dayInfo.platforms.push({
            name: platform.platformId,
            platformId: platform.platformId,
            roomTypeId: dayData.roomTypeId,
            roomId: dayData.roomTypeId,
            price: platform.price,
            available: platform.available,
            units: platform.units,
            availableUnits: platform.units
          });
        });
      });
      
      const prices = Array.from(pricesByDay.values());
      
      await setDoc(docRef, {
        month: monthKey,
        pricesData: allData,
        prices: prices
      });
      
      console.log('💾 تم الحفظ بنجاح');
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
    }
  };

  const updatePrice = (dateStr: string, platformId: string, newPrice: number) => {
    setCalendarData(prev => {
      const updated = prev.map(day => {
        if (day.date === dateStr) {
          return {
            ...day,
            platforms: day.platforms.map(p =>
              p.platformId === platformId ? { ...p, price: newPrice } : p
            )
          };
        }
        return day;
      });
      
      setTimeout(() => saveToFirebase(updated), 1000);
      return updated;
    });
  };

  const toggleAvailability = (dateStr: string, platformId: string) => {
    setCalendarData(prev => {
      const updated = prev.map(day => {
        if (day.date === dateStr) {
          return {
            ...day,
            platforms: day.platforms.map(p =>
              p.platformId === platformId ? { ...p, available: !p.available } : p
            )
          };
        }
        return day;
      });
      
      saveToFirebase(updated);
      return updated;
    });
  };

  const getDayData = (dateStr: string) => {
    return calendarData.find(d => d.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Mouse selection handlers
  const getCellId = (date: string, platformId: string) => `${date}-${platformId}`;

  const handleMouseDown = (date: string, platformId: string) => {
    setIsSelecting(true);
    setSelectionStart({ date, platform: platformId });
    const cellId = getCellId(date, platformId);
    setSelectedCells(new Set([cellId]));
  };

  const handleMouseEnter = (date: string, platformId: string) => {
    if (!isSelecting || !selectionStart) return;
    
    // Only select cells in the same platform
    if (selectionStart.platform !== platformId) return;

    const cellId = getCellId(date, platformId);
    setSelectedCells(prev => new Set([...prev, cellId]));
  };

  const handleMouseUp = () => {
    if (isSelecting && selectedCells.size > 0) {
      setIsSelecting(false);
      
      // Get first selected cell data to use as default values
      const firstCell = Array.from(selectedCells)[0];
      const [dateStr, platformId] = firstCell.split('-');
      const dayData = getDayData(dateStr);
      const platformData = dayData?.platforms.find(p => p.platformId === platformId);
      
      if (platformData) {
        setBulkPrice(platformData.price);
        setBulkUnits(platformData.units);
      }
      
      setShowBulkDialog(true);
    }
  };

  const applyBulkEdit = async () => {
    const updatedData = [...calendarData];
    
    console.log('🔵 عدد الخلايا المحددة:', selectedCells.size);
    console.log('💰 السعر الجديد:', bulkPrice);
    console.log('🏠 عدد الوحدات:', bulkUnits);
    console.log('📋 الخلايا المحددة:', Array.from(selectedCells));
    
    selectedCells.forEach(cellId => {
      console.log('🔍 معالجة الخلية:', cellId);
      const parts = cellId.split('-');
      console.log('📦 الأجزاء:', parts);
      
      // التاريخ يتكون من 3 أجزاء (YYYY-MM-DD)، المنصة هي الجزء الرابع
      const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const platformId = parts[3];
      
      console.log('📅 التاريخ:', dateStr);
      console.log('🏢 المنصة:', platformId);
      
      const dayIndex = updatedData.findIndex(d => d.date === dateStr);
      console.log('📊 مؤشر اليوم:', dayIndex);
      
      if (dayIndex !== -1) {
        const platformIndex = updatedData[dayIndex].platforms.findIndex(p => p.platformId === platformId);
        console.log('🎯 مؤشر المنصة:', platformIndex);
        
        if (platformIndex !== -1) {
          console.log(`✅ تحديث ${dateStr} - المنصة ${platformId}`);
          updatedData[dayIndex].platforms[platformIndex].price = bulkPrice;
          updatedData[dayIndex].platforms[platformIndex].units = bulkUnits;
        } else {
          console.log(`❌ المنصة ${platformId} غير موجودة`);
        }
      } else {
        console.log(`❌ التاريخ ${dateStr} غير موجود`);
      }
    });
    
    console.log('📊 البيانات المحدثة:', updatedData.length, 'يوم');
    setCalendarData(updatedData);
    await saveToFirebase(updatedData);
    setShowBulkDialog(false);
    setSelectedCells(new Set());
    setSelectionStart(null);
  };

  const cancelBulkEdit = () => {
    setShowBulkDialog(false);
    setSelectedCells(new Set());
    setSelectionStart(null);
  };

  // Copy Week functionality
  const copyWeekToMonth = () => {
    const weekData = calendarData.filter(d => {
      const day = parseInt(d.date.split('-')[2]);
      return day >= selectedWeekStart && day < selectedWeekStart + 7;
    });
    
    if (weekData.length === 0) {
      alert('⚠️ لا توجد بيانات للأسبوع المحدد');
      return;
    }
    
    const updatedData = [...calendarData];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayIndex = updatedData.findIndex(d => d.date === dateStr);
      
      if (dayIndex !== -1) {
        const weekDayIndex = (day - selectedWeekStart) % 7;
        const sourceDay = weekData[weekDayIndex >= 0 ? weekDayIndex : weekDayIndex + 7];
        
        if (sourceDay) {
          updatedData[dayIndex].platforms = sourceDay.platforms.map(p => ({...p}));
        }
      }
    }
    
    setCalendarData(updatedData);
    saveToFirebase(updatedData);
    setShowCopyWeekDialog(false);
    alert('✅ تم نسخ الأسبوع بنجاح!');
  };

  // Copy Month functionality
  const copyMonthToAnother = async () => {
    const sourceMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const targetMonthKey = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}`;
    
    if (sourceMonthKey === targetMonthKey) {
      alert('⚠️ اختر شهراً مختلفاً');
      return;
    }
    
    try {
      const sourceDoc = await getDoc(doc(db, 'calendar_availability', sourceMonthKey));
      
      if (!sourceDoc.exists()) {
        alert('⚠️ لا توجد بيانات للشهر الحالي');
        return;
      }
      
      const sourceData = sourceDoc.data();
      const targetDaysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      
      const newData: DayData[] = [];
      
      for (let day = 1; day <= targetDaysInMonth; day++) {
        const dateStr = `${targetMonth.getFullYear()}-${String(targetMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const sourceDay = sourceData.pricesData?.find((d: DayData) => 
          parseInt(d.date.split('-')[2]) === day && d.roomTypeId === selectedRoom
        );
        
        if (sourceDay) {
          newData.push({
            ...sourceDay,
            date: dateStr
          });
        }
      }
      
      await setDoc(doc(db, 'calendar_availability', targetMonthKey), {
        pricesData: newData,
        prices: []
      }, { merge: true });
      
      setShowCopyMonthDialog(false);
      alert('✅ تم نسخ الشهر بنجاح!');
    } catch (error) {
      console.error('❌ خطأ:', error);
      alert('❌ فشل نسخ الشهر');
    }
  };

  // Edit all platforms in a day
  const openDayEdit = (dateStr: string) => {
    const dayData = getDayData(dateStr);
    if (dayData && dayData.platforms.length > 0) {
      setSelectedDay(dateStr);
      setDayEditPrice(dayData.platforms[0].price);
      setDayEditUnits(dayData.platforms[0].units);
      setShowDayEditDialog(true);
    }
  };

  const applyDayEdit = () => {
    const updatedData = calendarData.map(day => {
      if (day.date === selectedDay) {
        return {
          ...day,
          platforms: day.platforms.map(p => ({
            ...p,
            price: dayEditPrice,
            units: dayEditUnits
          }))
        };
      }
      return day;
    });
    
    setCalendarData(updatedData);
    saveToFirebase(updatedData);
    setShowDayEditDialog(false);
    alert('✅ تم تحديث جميع المنصات!');
  };

  // Calculate statistics
  const getStats = () => {
    if (calendarData.length === 0) return null;
    
    let totalPrice = 0;
    let totalUnits = 0;
    let availableDays = 0;
    let count = 0;
    
    calendarData.forEach(day => {
      day.platforms.forEach(platform => {
        if (visiblePlatforms.has(platform.platformId)) {
          totalPrice += platform.price;
          totalUnits += platform.units;
          if (platform.available) availableDays++;
          count++;
        }
      });
    });
    
    return {
      avgPrice: Math.round(totalPrice / count),
      avgUnits: Math.round(totalUnits / count),
      availableDays,
      totalDays: count,
      occupancyRate: Math.round((availableDays / count) * 100)
    };
  };

  // Holiday presets
  const applyHolidayPricing = (holidayType: string) => {
    let multiplier = 1;
    
    switch (holidayType) {
      case 'eid': multiplier = 2; break;
      case 'weekend': multiplier = 1.5; break;
      case 'summer': multiplier = 1.3; break;
      case 'winter': multiplier = 0.8; break;
    }
    
    const updatedData = calendarData.map(day => ({
      ...day,
      platforms: day.platforms.map(p => ({
        ...p,
        price: Math.round(p.price * multiplier)
      }))
    }));
    
    setCalendarData(updatedData);
    saveToFirebase(updatedData);
    setShowHolidaysDialog(false);
    alert(`✅ تم تطبيق أسعار ${holidayType === 'eid' ? 'العيد' : holidayType === 'weekend' ? 'نهاية الأسبوع' : holidayType === 'summer' ? 'الصيف' : 'الشتاء'}!`);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[95%] mx-auto space-y-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-3xl flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              تقويم الأسعار والتوافر
            </CardTitle>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                onClick={() => setShowCopyWeekDialog(true)}
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                size="sm"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ أسبوع
              </Button>
              
              <Button 
                onClick={() => setShowCopyMonthDialog(true)}
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                size="sm"
              >
                <CalendarIcon className="w-4 h-4 ml-2" />
                نسخ شهر
              </Button>
              
              <Button 
                onClick={() => setShowFilterDialog(true)}
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                size="sm"
              >
                <Filter className="w-4 h-4 ml-2" />
                فلترة المنصات
              </Button>
              
              <Button 
                onClick={() => setShowStatsDialog(true)}
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 ml-2" />
                الإحصائيات
              </Button>
              
              <Button 
                onClick={() => setShowHolidaysDialog(true)}
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                size="sm"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                أسعار المناسبات
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              اختر نوع الوحدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white text-center py-4">جاري التحميل...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {roomTypes.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={cn(
                      "p-4 rounded-lg transition-all border-2",
                      selectedRoom === room.id
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                    )}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-bold">{room.name}</div>
                    <div className="text-xs opacity-70">{room.nameEn}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRoom && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button onClick={previousMonth} variant="outline" className="text-white border-white/20">
                  <ChevronRight className="w-5 h-5" />
                </Button>
                
                <div className="text-white text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>

                <Button onClick={nextMonth} variant="outline" className="text-white border-white/20">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex gap-2 mt-4">
                {calendarData.length === 0 ? (
                  <Button onClick={initializeMonth} className="bg-green-500 hover:bg-green-600 text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    تهيئة الشهر
                  </Button>
                ) : (
                  <Button onClick={() => saveToFirebase()} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {calendarData.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="grid border-b border-white/20 bg-white/5" style={{ gridTemplateColumns: `150px repeat(${PLATFORMS.filter(p => visiblePlatforms.has(p.id)).length}, 120px)` }}>
                    <div className="p-3 border-l border-white/20 text-white font-bold sticky right-0 bg-slate-800">
                      التاريخ
                    </div>
                    {PLATFORMS.filter(p => visiblePlatforms.has(p.id)).map(platform => (
                      <div key={platform.id} className="p-3 border-l border-white/20 text-white text-center text-sm font-bold">
                        {platform.name}
                      </div>
                    ))}
                  </div>

                  <div className="max-h-[600px] overflow-y-auto">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayData = getDayData(dateStr);
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const dayOfWeek = date.getDay();
                      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

                      return (
                        <div
                          key={day}
                          className={cn(
                            "grid border-b border-white/10",
                            isWeekend && "bg-orange-500/5"
                          )}
                          style={{ gridTemplateColumns: `150px repeat(${PLATFORMS.filter(p => visiblePlatforms.has(p.id)).length}, 120px)` }}
                        >
                          <div 
                            className="p-3 border-l border-white/20 sticky right-0 bg-slate-800/90 cursor-pointer hover:bg-slate-700/90"
                            onClick={() => openDayEdit(dateStr)}
                            title="اضغط لتعديل جميع المنصات في هذا اليوم"
                          >
                            <div className="text-white font-bold text-lg">{day}</div>
                            <div className="text-white/60 text-xs">{weekDays[dayOfWeek]}</div>
                            <div className="text-blue-400 text-xs mt-1">✏️ تعديل الكل</div>
                          </div>

                          {PLATFORMS.filter(p => visiblePlatforms.has(p.id)).map(platform => {
                            const platformData = dayData?.platforms.find(p => p.platformId === platform.id);
                            const cellId = getCellId(dateStr, platform.id);
                            const isSelected = selectedCells.has(cellId);

                            return (
                              <div
                                key={platform.id}
                                className={cn(
                                  "p-2 border-l border-white/10 cursor-pointer transition-colors select-none",
                                  !platformData?.available && "bg-red-500/10",
                                  isSelected && "bg-blue-500/30 ring-2 ring-blue-400"
                                )}
                                onMouseDown={() => handleMouseDown(dateStr, platform.id)}
                                onMouseEnter={() => handleMouseEnter(dateStr, platform.id)}
                                onMouseUp={handleMouseUp}
                              >
                                {platformData && (
                                  <div className="space-y-1 pointer-events-none">
                                    <Input
                                      type="number"
                                      value={platformData.price}
                                      onChange={(e) => updatePrice(dateStr, platform.id, Number(e.target.value))}
                                      className="h-8 text-sm bg-white/10 border-white/20 text-white text-center pointer-events-auto"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    
                                    <div className="flex items-center justify-center gap-1 text-white/80 text-xs">
                                      <Users className="w-3 h-3" />
                                      <span>{platformData.units}</span>
                                    </div>

                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAvailability(dateStr, platform.id);
                                      }}
                                      size="sm"
                                      className={cn(
                                        "w-full h-6 text-xs pointer-events-auto",
                                        platformData.available
                                          ? "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                                          : "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                      )}
                                    >
                                      {platformData.available ? 'متاح' : 'غير متاح'}
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
                </div>
              ) : (
                <div className="text-center py-20">
                  <CalendarIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">لا توجد بيانات لهذا الشهر</p>
                  <Button onClick={initializeMonth} className="bg-green-500 hover:bg-green-600 text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء بيانات الشهر
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              تعديل جماعي - {selectedCells.size} خلية محددة
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulkPrice" className="text-white">
                السعر (ريال)
              </Label>
              <Input
                id="bulkPrice"
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkUnits" className="text-white">
                عدد الوحدات المتاحة
              </Label>
              <Input
                id="bulkUnits"
                type="number"
                value={bulkUnits}
                onChange={(e) => setBulkUnits(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
                min="0"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={cancelBulkEdit}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={applyBulkEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              تطبيق على الكل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Week Dialog */}
      <Dialog open={showCopyWeekDialog} onOpenChange={setShowCopyWeekDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">نسخ أسبوع إلى الشهر كامل</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Label className="text-white">اختر اليوم الأول من الأسبوع (1-30)</Label>
            <Input
              type="number"
              min="1"
              max={daysInMonth - 6}
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(Number(e.target.value))}
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-sm text-white/60">
              سيتم نسخ الأيام من {selectedWeekStart} إلى {selectedWeekStart + 6} على باقي الشهر
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowCopyWeekDialog(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={copyWeekToMonth}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ الأسبوع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Month Dialog */}
      <Dialog open={showCopyMonthDialog} onOpenChange={setShowCopyMonthDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">نسخ الشهر الحالي إلى شهر آخر</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">الشهر المستهدف</Label>
              <select
                value={targetMonth.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(targetMonth);
                  newDate.setMonth(Number(e.target.value));
                  setTargetMonth(newDate);
                }}
                className="w-full p-2 bg-white/10 border border-white/20 text-white rounded"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx} className="bg-slate-800">{name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">السنة</Label>
              <Input
                type="number"
                min="2024"
                max="2030"
                value={targetMonth.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(targetMonth);
                  newDate.setFullYear(Number(e.target.value));
                  setTargetMonth(newDate);
                }}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowCopyMonthDialog(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={copyMonthToAnother}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <CalendarIcon className="w-4 h-4 ml-2" />
              نسخ الشهر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Platforms Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">فلترة المنصات</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {PLATFORMS.map(platform => (
              <div key={platform.id} className="flex items-center gap-3">
                <Checkbox
                  id={platform.id}
                  checked={visiblePlatforms.has(platform.id)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(visiblePlatforms);
                    if (checked) {
                      newSet.add(platform.id);
                    } else {
                      newSet.delete(platform.id);
                    }
                    setVisiblePlatforms(newSet);
                  }}
                  className="border-white/20"
                />
                <Label htmlFor={platform.id} className="text-white cursor-pointer">
                  {platform.name}
                </Label>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setVisiblePlatforms(new Set(PLATFORMS.map(p => p.id)))}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 ml-2" />
              إظهار الكل
            </Button>
            <Button
              onClick={() => setShowFilterDialog(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              تطبيق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              إحصائيات الشهر
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {getStats() && (
              <>
                <div className="p-4 bg-blue-500/20 rounded-lg">
                  <div className="text-sm text-white/60">متوسط السعر</div>
                  <div className="text-3xl font-bold text-white">{getStats()?.avgPrice} ريال</div>
                </div>
                
                <div className="p-4 bg-green-500/20 rounded-lg">
                  <div className="text-sm text-white/60">متوسط الوحدات المتاحة</div>
                  <div className="text-3xl font-bold text-white">{getStats()?.avgUnits} وحدة</div>
                </div>
                
                <div className="p-4 bg-purple-500/20 rounded-lg">
                  <div className="text-sm text-white/60">نسبة التوافر</div>
                  <div className="text-3xl font-bold text-white">{getStats()?.occupancyRate}%</div>
                </div>
                
                <div className="p-4 bg-orange-500/20 rounded-lg">
                  <div className="text-sm text-white/60">الأيام المتاحة</div>
                  <div className="text-3xl font-bold text-white">{getStats()?.availableDays} / {getStats()?.totalDays}</div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowStatsDialog(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Holidays Dialog */}
      <Dialog open={showHolidaysDialog} onOpenChange={setShowHolidaysDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              أسعار المناسبات الخاصة
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button
              onClick={() => applyHolidayPricing('eid')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              أسعار العيد (× 2)
            </Button>
            
            <Button
              onClick={() => applyHolidayPricing('weekend')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              نهاية الأسبوع (× 1.5)
            </Button>
            
            <Button
              onClick={() => applyHolidayPricing('summer')}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              الصيف (× 1.3)
            </Button>
            
            <Button
              onClick={() => applyHolidayPricing('winter')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              الشتاء (× 0.8)
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowHolidaysDialog(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Edit All Platforms Dialog */}
      <Dialog open={showDayEditDialog} onOpenChange={setShowDayEditDialog}>
        <DialogContent className="bg-slate-800 text-white border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              تعديل جميع المنصات - {selectedDay}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dayPrice" className="text-white">
                السعر لجميع المنصات (ريال)
              </Label>
              <Input
                id="dayPrice"
                type="number"
                value={dayEditPrice}
                onChange={(e) => setDayEditPrice(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayUnits" className="text-white">
                عدد الوحدات لجميع المنصات
              </Label>
              <Input
                id="dayUnits"
                type="number"
                value={dayEditUnits}
                onChange={(e) => setDayEditUnits(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
                min="0"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setShowDayEditDialog(false)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={applyDayEdit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              تطبيق على جميع المنصات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
