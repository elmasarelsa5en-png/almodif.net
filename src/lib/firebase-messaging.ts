import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './firebase';
import { db } from './firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

let messagingInstance: any = null;

// VAPID Key من Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'BI62r8W2y-23vLzM3qezLHfj_q70LJadYdRO7VXBdHSQPfIsmKEnTAp-PFvB2YKc2uhfZlmK_P7iq89h-YxssO4';

/**
 * تهيئة Firebase Cloud Messaging
 */
export async function initializeMessaging() {
  try {
    // التحقق من دعم المتصفح
    const supported = await isSupported();
    if (!supported) {
      console.warn('❌ FCM: المتصفح لا يدعم Push Notifications');
      return null;
    }

    // التحقق من Service Worker
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ FCM: Service Worker غير مدعوم');
      return null;
    }

    messagingInstance = getMessaging(app);
    console.log('✅ FCM: تم تهيئة Firebase Messaging');
    
    return messagingInstance;
  } catch (error) {
    console.error('❌ FCM: خطأ في التهيئة:', error);
    return null;
  }
}

/**
 * طلب إذن المستخدم للإشعارات والحصول على Device Token
 */
export async function requestNotificationPermission(employeeId: string, employeeName: string): Promise<string | null> {
  try {
    // طلب إذن المتصفح
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('⚠️ FCM: المستخدم رفض الإذن للإشعارات');
      return null;
    }

    console.log('✅ FCM: تم منح إذن الإشعارات');

    // تهيئة Messaging إذا لم تكن مهيأة
    if (!messagingInstance) {
      messagingInstance = await initializeMessaging();
    }

    if (!messagingInstance) {
      return null;
    }

    // تسجيل Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ FCM: تم تسجيل Service Worker');

    // الحصول على Device Token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('✅ FCM: تم الحصول على Device Token:', token.substring(0, 20) + '...');
      
      // حفظ Token في Firestore
      await saveDeviceToken(employeeId, token, employeeName);
      
      return token;
    } else {
      console.warn('⚠️ FCM: لم يتم الحصول على Token');
      return null;
    }
  } catch (error) {
    console.error('❌ FCM: خطأ في طلب الإذن:', error);
    return null;
  }
}

/**
 * حفظ Device Token في Firestore
 */
async function saveDeviceToken(employeeId: string, token: string, employeeName: string) {
  try {
    const employeeRef = doc(db, 'employees', employeeId);
    const employeeDoc = await getDoc(employeeRef);

    if (employeeDoc.exists()) {
      // تحديث Token الموجود
      await updateDoc(employeeRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
        notificationsEnabled: true
      });
      console.log(`✅ FCM: تم تحديث Token للموظف ${employeeName}`);
    } else {
      // إنشاء سجل جديد (في حالة عدم وجود الموظف)
      await setDoc(employeeRef, {
        id: employeeId,
        name: employeeName,
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
        notificationsEnabled: true,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✅ FCM: تم حفظ Token للموظف الجديد ${employeeName}`);
    }
  } catch (error) {
    console.error('❌ FCM: خطأ في حفظ Token:', error);
    throw error;
  }
}

/**
 * الاستماع للإشعارات عندما يكون التطبيق مفتوح (Foreground)
 */
export function listenToForegroundMessages(callback: (payload: any) => void) {
  if (!messagingInstance) {
    console.warn('⚠️ FCM: Messaging غير مهيأ');
    return () => {};
  }

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log('📨 FCM: رسالة جديدة (Foreground):', payload);
    
    // استدعاء الـ callback
    callback(payload);

    // عرض إشعار متصفح
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'طلب جديد';
      const notificationOptions = {
        body: payload.notification?.body || 'لديك طلب جديد',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: payload.data?.requestId || 'default',
        requireInteraction: true,
        data: payload.data
      };

      new Notification(notificationTitle, notificationOptions);
    }
  });

  return unsubscribe;
}

/**
 * إلغاء تسجيل Device Token (عند تسجيل الخروج)
 */
export async function unregisterDeviceToken(employeeId: string) {
  try {
    const employeeRef = doc(db, 'employees', employeeId);
    await updateDoc(employeeRef, {
      fcmToken: null,
      notificationsEnabled: false,
      fcmTokenUpdatedAt: new Date().toISOString()
    });
    console.log('✅ FCM: تم إلغاء تسجيل Token');
  } catch (error) {
    console.error('❌ FCM: خطأ في إلغاء التسجيل:', error);
  }
}

/**
 * التحقق من حالة الإشعارات
 */
export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * التحقق من تفعيل الإشعارات للموظف
 */
export async function isNotificationsEnabled(employeeId: string): Promise<boolean> {
  try {
    const employeeRef = doc(db, 'employees', employeeId);
    const employeeDoc = await getDoc(employeeRef);
    
    if (employeeDoc.exists()) {
      const data = employeeDoc.data();
      return data.notificationsEnabled === true && !!data.fcmToken;
    }
    
    return false;
  } catch (error) {
    console.error('❌ FCM: خطأ في التحقق من حالة الإشعارات:', error);
    return false;
  }
}
