'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ExecutivePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to GM dashboard by default
    router.replace('/dashboard/executive/gm');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">جاري التحويل...</p>
      </div>
    </div>
  );
}
