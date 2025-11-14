/**
 * نظام الإشعارات الصوتية عبر Firebase Real-time
 * يراقب الطلبات الجديدة ويشغل الأصوات تلقائياً في جميع الأجهزة
 */

import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { playNotificationSound } from './notification-sounds';

// متغير لتتبع آخر وقت تم فيه فحص الإشعارات
let lastCheckTimestamp: number = Date.now();
let unsubscribeFunction: (() => void) | null = null;

// متغير لتتبع الطلبات التي تم إشعارها بالفعل (لتجنب التكرار)
const notifiedRequests = new Set<string>();

/**
 * بدء مراقبة الطلبات الجديدة في Firebase
 * يتم استدعاء هذه الدالة عند تحميل Dashboard
 */
export function startFirebaseNotifications() {
  // إيقاف أي مراقبة سابقة
  stopFirebaseNotifications();

  console.log('🔔 Starting Firebase notifications listener...');

  try {
    // إنشاء query لمراقبة الطلبات
    const requestsQuery = query(
      collection(db, 'guest-requests'),
      orderBy('createdAt', 'desc')
    );

    // الاشتراك في التحديثات الفورية
    unsubscribeFunction = onSnapshot(
      requestsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // نهتم فقط بالطلبات الجديدة
          if (change.type === 'added') {
            const request = change.doc.data();
            const requestId = change.doc.id;
            const requestTime = request.createdAt 
              ? (typeof request.createdAt === 'string' 
                  ? new Date(request.createdAt).getTime() 
                  : request.createdAt.toMillis?.() || Date.now())
              : Date.now();

            // تحقق: هل الطلب جديد (بعد بدء المراقبة)؟
            const isNewRequest = requestTime > lastCheckTimestamp;
            
            // تحقق: هل تم إشعار هذا الطلب من قبل؟
            const alreadyNotified = notifiedRequests.has(requestId);

            if (isNewRequest && !alreadyNotified) {
              console.log('🆕 New request detected:', {
                id: requestId,
                type: request.type,
                room: request.room,
                time: new Date(requestTime).toLocaleString('ar-SA')
              });

              // إضافة إلى قائمة الطلبات المُشعَر بها
              notifiedRequests.add(requestId);

              // تشغيل الصوت
              playNotificationSound('new-request');

              // إظهار إشعار المتصفح (إذا كان مسموحاً)
              showBrowserNotification(request, requestId);

              // إرسال event مخصص للتطبيق
              window.dispatchEvent(new CustomEvent('firebase-new-request', {
                detail: {
                  id: requestId,
                  ...request
                }
              }));
            }
          }
        });

        // تحديث آخر وقت فحص
        lastCheckTimestamp = Date.now();
      },
      (error) => {
        console.error('❌ Error in Firebase notifications listener:', error);
      }
    );

    console.log('✅ Firebase notifications listener started successfully');
  } catch (error) {
    console.error('❌ Failed to start Firebase notifications:', error);
  }
}

/**
 * إيقاف مراقبة الإشعارات
 */
export function stopFirebaseNotifications() {
  if (unsubscribeFunction) {
    console.log('🔕 Stopping Firebase notifications listener...');
    unsubscribeFunction();
    unsubscribeFunction = null;
  }
}

/**
 * إظهار إشعار المتصفح
 */
function showBrowserNotification(request: any, requestId: string) {
  // التحقق من دعم المتصفح للإشعارات
  if (!('Notification' in window)) {
    return;
  }

  // التحقق من الإذن
  if (Notification.permission === 'granted') {
    const notification = new Notification('طلب جديد من نزيل', {
      body: `${request.type || 'طلب'}\nغرفة: ${request.room}\n${request.description || ''}`,
      icon: '/app-logo.png',
      tag: requestId,
      requireInteraction: true, // يبقى الإشعار حتى يتفاعل المستخدم
      badge: '/app-logo.png'
    });

    notification.onclick = () => {
      // فتح صفحة الطلبات عند النقر
      window.focus();
      window.location.href = '/dashboard/requests';
      notification.close();
    };
  } else if (Notification.permission !== 'denied') {
    // طلب الإذن إذا لم يكن مرفوضاً
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showBrowserNotification(request, requestId);
      }
    });
  }
}

/**
 * طلب إذن الإشعارات من المستخدم
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('⚠️ Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('⚠️ Notification permission denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * التحقق من حالة إذن الإشعارات
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * تنظيف قائمة الطلبات المُشعَر بها (للحفاظ على الذاكرة)
 * يتم استدعاؤها دورياً أو عند الحاجة
 */
export function cleanupNotifiedRequests() {
  // الاحتفاظ بآخر 100 طلب فقط
  if (notifiedRequests.size > 100) {
    const requestsArray = Array.from(notifiedRequests);
    notifiedRequests.clear();
    // إعادة إضافة آخر 50 طلب
    requestsArray.slice(-50).forEach(id => notifiedRequests.add(id));
    console.log('🧹 Cleaned up notified requests cache');
  }
}

/**
 * إعادة تعيين النظام (للاختبار أو عند الحاجة)
 */
export function resetFirebaseNotifications() {
  stopFirebaseNotifications();
  notifiedRequests.clear();
  lastCheckTimestamp = Date.now();
  console.log('🔄 Firebase notifications system reset');
}
