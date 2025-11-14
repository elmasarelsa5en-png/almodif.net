import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { addSmartNotification } from './notification-service';

let lastNotificationTime: number = Date.now();

/**
 * تشغيل مراقبة الطلبات الجديدة وإرسال الإشعارات
 */
export function startGuestRequestNotifications() {
  const q = query(
    collection(db, 'guest-requests'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const request = change.doc.data();
        const requestTime = request.createdAt ? new Date(request.createdAt).getTime() : Date.now();

        // Only notify for new requests that came after we started listening
        if (requestTime > lastNotificationTime) {
          // إضافة إشعار ذكي مع صوت
          addSmartNotification({
            title: 'طلب جديد من نزيل',
            message: `غرفة ${request.room}: ${request.description || request.type}`,
            time: new Date().toISOString(),
            unread: true,
            type: 'guest_request',
            priority: 'high',
            category: 'guests',
            requestId: change.doc.id,
            actionRequired: true,
            actionUrl: `/dashboard/requests/${change.doc.id}`,
          });
        }
      }
    });

    lastNotificationTime = Date.now();
  });
}