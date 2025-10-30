'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomServicePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/guest-app/menu/room-service');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">جاري تحميل قائمة خدمة الغرف...</div>
    </div>
  );
}
