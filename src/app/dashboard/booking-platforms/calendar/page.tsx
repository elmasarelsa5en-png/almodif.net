'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Building2, Users, Save, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

  const monthNames = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  useEffect(() => {
    loadRoomTypes();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadCalendarData();
    }
  }, [currentDate, selectedRoom]);

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
                  <div className="grid border-b border-white/20 bg-white/5" style={{ gridTemplateColumns: `150px repeat(${PLATFORMS.length}, 120px)` }}>
                    <div className="p-3 border-l border-white/20 text-white font-bold sticky right-0 bg-slate-800">
                      التاريخ
                    </div>
                    {PLATFORMS.map(platform => (
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
                          style={{ gridTemplateColumns: `150px repeat(${PLATFORMS.length}, 120px)` }}
                        >
                          <div className="p-3 border-l border-white/20 sticky right-0 bg-slate-800/90">
                            <div className="text-white font-bold text-lg">{day}</div>
                            <div className="text-white/60 text-xs">{weekDays[dayOfWeek]}</div>
                          </div>

                          {PLATFORMS.map(platform => {
                            const platformData = dayData?.platforms.find(p => p.platformId === platform.id);

                            return (
                              <div
                                key={platform.id}
                                className={cn(
                                  "p-2 border-l border-white/10",
                                  !platformData?.available && "bg-red-500/10"
                                )}
                              >
                                {platformData && (
                                  <div className="space-y-1">
                                    <Input
                                      type="number"
                                      value={platformData.price}
                                      onChange={(e) => updatePrice(dateStr, platform.id, Number(e.target.value))}
                                      className="h-8 text-sm bg-white/10 border-white/20 text-white text-center"
                                    />
                                    
                                    <div className="flex items-center justify-center gap-1 text-white/80 text-xs">
                                      <Users className="w-3 h-3" />
                                      <span>{platformData.units}</span>
                                    </div>

                                    <Button
                                      onClick={() => toggleAvailability(dateStr, platform.id)}
                                      size="sm"
                                      className={cn(
                                        "w-full h-6 text-xs",
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
    </div>
  );
}
