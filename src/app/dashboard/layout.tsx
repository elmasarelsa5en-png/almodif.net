'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import NewsTicker from '@/components/NewsTicker';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import SmartAssistant from '@/components/SmartAssistant';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // مقفول افتراضياً على الموبايل فقط
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  // تحديد نوع الجهاز
  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      // في وضع الويب: القائمة مفتوحة دائماً
      if (desktop) {
        setSidebarCollapsed(false);
      }
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

  // إغلاق القائمة عند تغيير الصفحة (للموبايل فقط)
  useEffect(() => {
    if (!isDesktop) {
      setSidebarCollapsed(true);
    }
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
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden pt-16">
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