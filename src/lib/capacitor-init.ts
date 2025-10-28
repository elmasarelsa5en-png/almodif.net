// تهيئة Capacitor للموبايل
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export const initCapacitor = async () => {
  // التحقق إذا كان التطبيق يعمل على موبايل
  const isNative = Capacitor.isNativePlatform();
  
  if (!isNative) {
    console.log('Running in browser - Capacitor features disabled');
    return;
  }

  console.log('Initializing Capacitor for mobile...');
  console.log('Platform:', Capacitor.getPlatform());

  try {
    // إعداد Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1e3a8a' });

    // إخفاء Splash Screen بعد التحميل
    await SplashScreen.hide();

    // إعداد معالجات الأحداث
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // معالج App State
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
    });

    // معالج الروابط العميقة
    App.addListener('appUrlOpen', (data: any) => {
      console.log('App opened with URL:', data);
      // يمكن معالجة الروابط العميقة هنا
    });

    console.log('✅ Capacitor initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Capacitor:', error);
  }
};

// دالة للتحقق إذا كان التطبيق على موبايل
export const isMobileApp = () => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

// دالة للحصول على platform
export const getMobilePlatform = () => {
  if (!isMobileApp()) return null;
  return Capacitor.getPlatform(); // 'ios', 'android', 'web'
};
