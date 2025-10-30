'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LaundryPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/guest-app');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">جاري التحويل...</div>
    </div>
  );
}
