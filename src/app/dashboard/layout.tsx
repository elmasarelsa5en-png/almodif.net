'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import NewsTicker from '@/components/NewsTicker';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import SmartAssistant from '@/components/SmartAssistant';
import { startGuestRequestNotifications } from '@/lib/guest-notifications';
import { startFirebaseNotifications, stopFirebaseNotifications, requestNotificationPermission } from '@/lib/firebase-notifications';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage(); // إضافة hook اللغة
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // مفتوحة افتراضياً
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  // Initialize Firebase Real-time Notifications
  useEffect(() => {
    if (user) {
      console.log('🔔 Initializing Firebase notifications for user:', user.username);
      
      // طلب إذن الإشعارات من المتصفح
      requestNotificationPermission().then((granted) => {
        if (granted) {
          console.log('✅ Notification permission granted');
        } else {
          console.warn('⚠️ Notification permission not granted');
        }
      });

      // بدء مراقبة الطلبات الجديدة عبر Firebase
      startFirebaseNotifications();
      
      // Cleanup on unmount
      return () => {
        console.log('🔕 Stopping Firebase notifications');
        stopFirebaseNotifications();
      };
    }
  }, [user]);

  // Initialize old notification system (للتوافق مع الكود القديم)
  useEffect(() => {
    if (user) {
      // Start listening for new guest requests (النظام القديم)
      const unsubscribe = startGuestRequestNotifications();
      
      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fetch latest requests for the ticker
  useEffect(() => {
    const guestRequests = JSON.parse(localStorage.getItem('guest-requests') || '[]');
    const latestItems = guestRequests
      .slice(-5) // Get last 5 items
      .reverse() // Show newest first
      .map((req: any) => 
        `طلب جديد: ${req.description} لغرفة ${req.room}`
      );
    
    setTickerItems([
      '✨ أهلاً بك في نظام المضيف سمارت ✨',
      ...latestItems
    ]);
  }, []);

  // القائمة الجانبية تبقى مفتوحة دائماً - المستخدم يقفلها بالضغط على الـ 3 شرط
  // (تم إلغاء الإغلاق التلقائي عند تغيير الصفحة)
  useEffect(() => {
    // القائمة مفتوحة دائماً ما لم يقفلها المستخدم يدوياً
  }, [pathname, isDesktop]);

  // إذا لم يكن المستخدم مسجل دخوله، إعادة توجيه لصفحة تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // شاشة تحميل أثناء التحقق من المصادقة أو إعادة التوجيه
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" dir="rtl">
      <AnimatedBackground />
      
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* News Ticker Section - يظهر فقط في الصفحة الرئيسية للداشبورد */}
        {pathname === '/dashboard' && (
          <div className="px-2 sm:px-3 md:px-6 pt-2 sm:pt-3">
            <NewsTicker items={tickerItems} />
          </div>
        )}
        
        {/* Page Content - مع Padding مناسب للموبايل */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* مساعد المضيف سمارت - يظهر فقط في الصفحة الرئيسية للداشبورد */}
      {pathname === '/dashboard' && <SmartAssistant />}
    </div>
  );
}