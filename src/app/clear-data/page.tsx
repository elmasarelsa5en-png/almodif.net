'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearDataPage() {
  const router = useRouter();

  useEffect(() => {
    // مسح جميع البيانات الوهمية
    localStorage.clear();
    
    console.log('✅ تم مسح جميع البيانات الوهمية بنجاح!');
    
    // إعادة تحميل الصفحة للتأكد من مسح كل شيء
    setTimeout(() => {
      window.location.href = '/dashboard/rooms';
    }, 1500);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">جاري مسح البيانات...</h1>
        <p className="text-gray-600">سيتم تحويلك لصفحة الغرف خلال ثوانٍ</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
