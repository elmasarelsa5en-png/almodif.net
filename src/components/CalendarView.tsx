'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  paidAmount: number;
  remainingBalance: number;
  numberOfGuests?: number;
  childrenCount?: number;
  specialRequests?: string;
  source?: string;
  paymentMethod?: string;
  companyName?: string;
}

interface CalendarViewProps {
  bookings: any[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const dayNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Parse date helper
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Get bookings for specific day
  const getBookingsForDay = (day: number): Booking[] => {
    const targetDate = new Date(year, month, day);
    
    return bookings.filter(booking => {
      const checkIn = parseDate(booking.checkInDate);
      const checkOut = parseDate(booking.checkOutDate);
      return targetDate >= checkIn && targetDate <= checkOut;
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  // Calculate totals
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'قائمة': 'bg-blue-500',
      'جاهز_دخول': 'bg-green-500',
      'جاهز_خروج': 'bg-yellow-500',
      'غير مؤكدة': 'bg-gray-500',
      'قادمة': 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const statusOptions = ['قادمة', 'جارية', 'مكتمل', 'لم يسجل وصول'];
  
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const getStatusBadgeColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'قائمة': 'bg-blue-500 text-white',
      'جاهز_دخول': 'bg-green-500 text-white',
      'جاهز_خروج': 'bg-yellow-500 text-white',
      'غير مؤكدة': 'bg-gray-500 text-white',
      'قادمة': 'bg-purple-500 text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header with Stats and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Left side - Add Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-all">
          <span className="text-xl">+</span>
          <span>حجز جديد</span>
        </button>

        {/* Center - Stats */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-1">المجموع</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-white font-bold text-lg">{totalRevenue.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/60 mb-1">الدفع</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-white font-bold text-lg">{totalPaid.toLocaleString('ar-SA')} ر.س</span>
            </div>
          </div>
        </div>

        {/* Right side - View Toggle Buttons */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            <span>القائمة</span>
          </button>
          <button className="px-4 py-2 bg-white text-slate-900 rounded-md font-medium flex items-center gap-2 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
            </svg>
            <span>التقويم</span>
          </button>
        </div>
      </div>

      {/* Filters and Date Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white/80 font-medium">نوع الوحدة</span>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg border transition-all font-medium",
                selectedFilters.includes(status)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
              )}
            >
              {status}
              {selectedFilters.includes(status) && (
                <span className="ml-2 text-white">✕</span>
              )}
            </button>
          ))}
          <button className="text-white/60 hover:text-white transition-all flex items-center gap-1">
            <span className="text-sm">المزيد</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="text-blue-400 hover:text-blue-300 font-medium transition-all"
          >
            اليوم
          </button>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <button
              onClick={goToPreviousMonth}
              className="text-white/60 hover:text-white transition-all p-1"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-white font-bold min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={goToNextMonth}
              className="text-white/60 hover:text-white transition-all p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">من تاريخ</span>
            <input
              type="date"
              defaultValue="2025-10-18"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-white/60">إلى تاريخ</span>
            <input
              type="date"
              defaultValue="2025-10-31"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-800/50 border-b border-white/10">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center py-4 text-white/80 font-bold text-sm border-l border-white/10 last:border-l-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayBookings = day ? getBookingsForDay(day) : [];
            const isTodayCell = day ? isToday(day) : false;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border-b border-l border-white/10 last:border-l-0 p-2 transition-all hover:bg-white/5",
                  day ? "bg-slate-800/30" : "bg-slate-900/50",
                  isTodayCell && "bg-blue-500/20 border-blue-500/40"
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      "text-right mb-2",
                      isTodayCell ? "text-blue-400 font-bold" : "text-white/60"
                    )}>
                      <span className={cn(
                        "inline-block w-8 h-8 leading-8 text-center rounded-full",
                        isTodayCell && "bg-blue-600 text-white"
                      )}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => handleBookingClick(booking)}
                          className="group bg-gradient-to-l from-blue-600/80 to-blue-700/80 hover:from-blue-500 hover:to-blue-600 rounded-md px-2 py-1.5 cursor-pointer transition-all shadow-lg text-white text-xs font-medium border border-blue-500/30"
                          title={`${booking.guestName} - ${booking.roomName}`}
                        >
                          <div className="font-bold truncate">{booking.roomName}</div>
                          <div className="text-blue-100 truncate text-[10px]">{booking.guestName}</div>
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-blue-400 text-xs font-medium text-center py-1">
                          +{dayBookings.length - 3} أخرى
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-white/80 text-sm">حجز نشط</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600/20 border border-blue-500/40 rounded"></div>
          <span className="text-white/80 text-sm">اليوم</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-800/30 border border-white/10 rounded"></div>
          <span className="text-white/80 text-sm">يوم عادي</span>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl">
          <DialogHeader className="relative pb-4">
            <button
              onClick={() => setShowBookingDetails(false)}
              className="absolute left-4 top-0 text-white/80 hover:text-white transition-all hover:rotate-90 duration-300"
            >
              <X className="w-6 h-6" />
            </button>
            <DialogTitle className="text-center text-lg font-bold text-gray-400 pt-2">
              تفاصيل الحجز
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2">
              {/* Booking Number & Status */}
              <div className="text-center space-y-3 pb-4 border-b border-white/10">
                <div className="text-sm text-gray-400 mb-1">رقم الحجز</div>
                <div className="text-2xl font-bold text-blue-400">{selectedBooking.bookingNumber}</div>
                <div className="flex justify-center">
                  <Badge className={cn(
                    'text-sm px-6 py-2 rounded-full font-bold',
                    selectedBooking.status === 'جاهز_خروج' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    selectedBooking.status === 'قائمة' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    selectedBooking.status === 'جاهز_دخول' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    selectedBooking.status === 'قادمة' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  )}>
                    {selectedBooking.status === 'جاهز_خروج' ? 'جاهز خروج' : 
                     selectedBooking.status === 'جاهز_دخول' ? 'جاهز دخول' :
                     selectedBooking.status}
                  </Badge>
                </div>
              </div>

              {/* Guest & Room Info in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">رقم الغرفة</div>
                  <div className="text-3xl font-bold text-white">{selectedBooking.roomName}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">اسم الضيف</div>
                  <div className="text-xl font-bold text-white truncate">{selectedBooking.guestName}</div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">تاريخ الدخول</div>
                  <div className="text-lg font-bold text-white">{selectedBooking.checkInDate}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">تاريخ الخروج</div>
                  <div className="text-lg font-bold text-white">{selectedBooking.checkOutDate}</div>
                </div>
              </div>

              {/* Guests Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">عدد الضيوف</div>
                  <div className="text-3xl font-bold text-white">{selectedBooking.numberOfGuests || 0}</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">عدد الأطفال</div>
                  <div className="text-3xl font-bold text-white">{selectedBooking.childrenCount || 0}</div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-blue-900/60 via-purple-900/60 to-blue-900/60 backdrop-blur-md rounded-2xl p-5 border border-blue-500/30 shadow-xl">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-base">المبلغ الإجمالي</span>
                    <span className="text-2xl font-bold text-white">{selectedBooking.totalPrice.toLocaleString('ar-EG')} ر.ع</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-base">المبلغ المدفوع</span>
                    <span className="text-2xl font-bold text-green-400">{selectedBooking.paidAmount.toLocaleString('ar-EG')} ر.ع</span>
                  </div>
                  <div className="h-px bg-white/20"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-base">المتبقي</span>
                    <span className={cn(
                      "text-2xl font-bold",
                      selectedBooking.remainingBalance > 0 ? "text-red-400" : "text-green-400"
                    )}>
                      {selectedBooking.remainingBalance.toLocaleString('ar-EG')} ر.ع
                    </span>
                  </div>
                </div>
              </div>

              {/* Source */}
              {selectedBooking.source && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-sm text-gray-400 mb-2">مصدر الحجز</div>
                  <div className="text-lg font-bold text-white">{selectedBooking.source}</div>
                </div>
              )}

              {/* Payment Method & Company */}
              {(selectedBooking.paymentMethod || selectedBooking.companyName) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedBooking.paymentMethod && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center">
                      <div className="text-sm text-gray-400 mb-2">طريقة الدفع</div>
                      <div className="text-lg font-bold text-white">{selectedBooking.paymentMethod}</div>
                    </div>
                  )}
                  {selectedBooking.companyName && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 text-center col-span-2">
                      <div className="text-sm text-gray-400 mb-2">اسم الشركة</div>
                      <div className="text-lg font-bold text-white">{selectedBooking.companyName}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="text-sm text-gray-400 mb-2 text-center">طلبات خاصة</div>
                  <div className="text-base text-white text-center">{selectedBooking.specialRequests}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
