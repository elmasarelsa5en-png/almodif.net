'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestMenuRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/guest-login');
  }, [router]);

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center\">
      <div className=\"text-white text-center\">
        <div className=\"animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4\"></div>
        <p className=\"text-xl\">جاري التحويل...</p>
      </div>
    </div>
  );
}