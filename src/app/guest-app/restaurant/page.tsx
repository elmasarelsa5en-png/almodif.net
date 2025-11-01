'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceBlockedAlert } from '@/components/GuestRoomAlert';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function RestaurantPage() {
  const router = useRouter();
  const [guestSession, setGuestSession] = useState<any>(null);
  
  useEffect(() => {
    const session = localStorage.getItem('guest_session');
    if (!session) {
      router.push('/guest-app/login');
      return;
    }

    const guestData = JSON.parse(session);
    setGuestSession(guestData);

    if (guestData.roomNumber && guestData.status === 'checked-in') {
      router.push('/guest-app/menu/restaurant');
    }
  }, [router]);

  if (guestSession && (!guestSession.roomNumber || guestSession.status === 'pending')) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <ServiceBlockedAlert serviceName="المطعم" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">جاري تحميل قائمة المطعم...</div>
    </div>
  );
}
