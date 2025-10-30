'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main guest app - they can access restaurant from there
    router.push('/guest-app');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">جاري التحويل...</div>
    </div>
  );
}
