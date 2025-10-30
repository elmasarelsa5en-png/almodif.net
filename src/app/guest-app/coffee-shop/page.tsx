'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoffeeShopPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/guest-app/menu/coffee-shop');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">جاري تحميل قائمة الكوفي شوب...</div>
    </div>
  );
}
