// Push Notifications Manager with Firebase Cloud Messaging
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

let messaging: Messaging | null = null;

// تهيئة Firebase Messaging
export const initializeMessaging = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // استيراد ديناميكي لتجنب مشاكل SSR
    const { getMessaging } = await import('firebase/messaging');
    const app = (await import('./firebase')).default;
    
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
    return messaging;
  } catch (error) {
    console.error('❌ Error initializing Firebase Messaging:', error);
    return null;
  }
};

// طلب إذن الإشعارات
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('⚠️ Notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

// الحصول على FCM Token
export const getFCMToken = async (userId: string): Promise<string | null> => {
  try {
    if (!messaging) {
      messaging = await initializeMessaging();
    }

    if (!messaging) {
      console.error('❌ Messaging not initialized');
      return null;
    }

    // VAPID Key من Firebase Console
    const vapidKey = 'BKzV8QxQZ_Wj4vYmF3QxN9QZ5mF8yV9xR7kL3mN8pQ';

    console.log('🔑 Getting FCM token...');
    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log('✅ FCM Token received:', token.substring(0, 20) + '...');
      
      // حفظ Token في Firestore
      await saveFCMToken(userId, token);
      
      return token;
    } else {
      console.warn('⚠️ No FCM token received');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting FCM token:', error);
    
    if (error.code === 'messaging/permission-blocked') {
      console.error('🚫 Notification permission blocked by user');
    }
    
    return null;
  }
};

// حفظ FCM Token في Firestore
const saveFCMToken = async (userId: string, token: string) => {
  try {
    const userRef = doc(db, 'employees', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const tokens = data.fcmTokens || [];
      
      // إضافة Token جديد إذا لم يكن موجود
      if (!tokens.includes(token)) {
        await setDoc(userRef, {
          fcmTokens: [...tokens, token],
          lastTokenUpdate: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ FCM token saved to Firestore');
      }
    } else {
      // إنشاء document جديد
      await setDoc(userRef, {
        fcmTokens: [token],
        lastTokenUpdate: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ New user document created with FCM token');
    }
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
  }
};

// الاستماع للرسائل عندما التطبيق مفتوح
export const listenToForegroundMessages = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('⚠️ Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📨 Foreground message received:', payload);
    
    // عرض إشعار محلي
    if (payload.notification) {
      showLocalNotification(
        payload.notification.title || 'رسالة جديدة',
        payload.notification.body || '',
        payload.data
      );
    }
    
    callback(payload);
  });

  return unsubscribe;
};

// عرض إشعار محلي
const showLocalNotification = (title: string, body: string, data?: any) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/app-logo.png',
    badge: '/app-logo.png',
    tag: 'chat-notification',
    requireInteraction: true,
    data
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    
    if (data?.url) {
      window.location.href = data.url;
    }
  };
};

// تسجيل Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported');
    return null;
  }

  try {
    console.log('📝 Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

// إرسال إشعار لمستخدم معين (يتطلب Cloud Function)
export const sendPushNotification = async (
  targetUserId: string,
  title: string,
  body: string,
  data?: any
) => {
  try {
    // الحصول على FCM Tokens للمستخدم المستهدف
    const userRef = doc(db, 'employees', targetUserId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists() || !userDoc.data().fcmTokens) {
      console.warn('⚠️ No FCM tokens found for user:', targetUserId);
      return false;
    }

    const tokens = userDoc.data().fcmTokens;
    
    // إرسال عبر Cloud Function أو API
    // ملاحظة: يجب إنشاء Cloud Function في Firebase
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens,
        notification: { title, body },
        data: { ...data, url: '/dashboard/chat' }
      })
    });

    if (response.ok) {
      console.log('✅ Push notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send push notification:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return false;
  }
};

// تهيئة كاملة للـ Push Notifications
export const setupPushNotifications = async (userId: string) => {
  try {
    console.log('🚀 Setting up push notifications for user:', userId);

    // 1. تسجيل Service Worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker registration failed');
    }

    // 2. طلب إذن الإشعارات
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('⚠️ Notification permission not granted');
      return false;
    }

    // 3. تهيئة Messaging
    await initializeMessaging();

    // 4. الحصول على FCM Token
    const token = await getFCMToken(userId);
    if (!token) {
      throw new Error('Failed to get FCM token');
    }

    // 5. الاستماع للرسائل في المقدمة
    listenToForegroundMessages((payload) => {
      console.log('📬 New message in foreground:', payload);
      // يمكن إضافة callback هنا
    });

    console.log('✅ Push notifications setup complete');
    return true;
  } catch (error) {
    console.error('❌ Error setting up push notifications:', error);
    return false;
  }
};
