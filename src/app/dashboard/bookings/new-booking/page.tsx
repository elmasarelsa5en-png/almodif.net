'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ChevronDown, Lock, Edit, Search, Printer, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  const [bookingSource, setBookingSource] = useState('اختر...');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('00:00');
  const [checkOutTime, setCheckOutTime] = useState('00:00');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(roomId || 'غرفة وصالة 201');
  const [guestName, setGuestName] = useState('محمد علي الشهراني');
  const [company, setCompany] = useState('------');
  const [companions, setCompanions] = useState(0);
  const [roomPrice, setRoomPrice] = useState(330);
  const [rentReason, setRentReason] = useState('-- اختر --');
  const [notes, setNotes] = useState('');
  
  const bookingSources = [
    'اختر...', 'Booking.com', 'Agoda', 'Almosafer المسافر', 'Expedia', 
    'Airbnb', 'HRS', 'Almatar المطار', 'Rihla رحلة', 'Wego ويجو', 
    'Trivago', 'حجز مباشر', 'وكيل سياحي'
  ];

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) setNumberOfDays(days);
    }
  }, [checkInDate, checkOutDate]);

  const handleDaysChange = (days: number) => {
    if (checkInDate && days > 0) {
      const checkIn = new Date(checkInDate);
      checkIn.setDate(checkIn.getDate() + days);
      setNumberOfDays(days);
      setCheckOutDate(checkIn.toISOString().split('T')[0]);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-blue-700 text-white px-6 py-3 flex items-center gap-3 shadow-md">
          <button onClick={() => router.back()} className="text-white hover:bg-blue-800 px-2 py-1 rounded">
            <X size={20} />
          </button>
          <h1 className="text-lg font-bold">إضافة حجز</h1>
        </div>

        <div className="p-4 max-w-7xl mx-auto">
          <Card className="shadow-lg border border-gray-300">
            <CardContent className="p-0">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <h2 className="text-sm font-bold text-gray-700">معلومات الحجز</h2>
              </div>
              <div className="p-4">
                <p className="text-gray-600">سيتم إضافة الحقول قريباً...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">جاري التحميل...</div>}>
      <NewBookingContent />
    </Suspense>
  );
}
