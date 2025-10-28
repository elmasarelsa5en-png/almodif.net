'use client';

import { useEffect } from 'react';

/**
 * مكون تهيئة الإشعارات العامة
 * يعمل في كل الصفحات تلقائياً
 */
export default function GlobalNotificationInitializer() {
  useEffect(() => {
    // تحميل وتشغيل خدمة الإشعارات
    const initNotifications = async () => {
      try {
        const { startGlobalRequestMonitoring } = await import('@/lib/advanced-notifications');
        startGlobalRequestMonitoring();
        console.log('✅ Global notifications initialized from layout');
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
      }
    };

    // تأخير بسيط للسماح بتحميل الصفحة
    const timer = setTimeout(initNotifications, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // لا يعرض أي شيء
}
