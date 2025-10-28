'use client';

import { useAuth } from '@/contexts/auth-context';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshPermissionsButton() {
  const { refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      // إعادة تحميل الصفحة بعد التحديث
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing:', error);
      alert('حدث خطأ أثناء تحديث الصلاحيات');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
      title="تحديث الصلاحيات"
    >
      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="text-sm font-medium">
        {isRefreshing ? 'جاري التحديث...' : 'تحديث الصلاحيات'}
      </span>
    </button>
  );
}
