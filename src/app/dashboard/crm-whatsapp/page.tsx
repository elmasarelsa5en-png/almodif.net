'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialMediaPlatformsPage() {
  const router = useRouter();

  // تحويل مباشر لصفحة المحادثات الموحدة
  useEffect(() => {
    router.push('/dashboard/crm-whatsapp/unified-inbox');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-white">جاري التحويل إلى صندوق الوارد الموحد...</p>
      </div>
    </div>
  );
}
