'use client';

import { useEffect } from 'react';
import { initCapacitor } from '@/lib/capacitor-init';

export default function CapacitorInitializer() {
  useEffect(() => {
    // تهيئة Capacitor عند تحميل التطبيق
    initCapacitor().catch(console.error);
  }, []);

  return null; // هذا المكون لا يعرض شيء
}
