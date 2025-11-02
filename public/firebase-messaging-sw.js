// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCelygg7SjT7KY7U7E0EPuvMzfFvJpb7mM",
  authDomain: "almodif-49af5.firebaseapp.com",
  projectId: "almodif-49af5",
  storageBucket: "almodif-49af5.firebasestorage.app",
  messagingSenderId: "509688533109",
  appId: "1:509688533109:web:72ebf7c69c00862ed5f1a3"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 [SW] Received background message:', payload);

  // تحديد نوع الإشعار
  const notificationType = payload.data?.type || 'chat';
  
  let notificationTitle = payload.notification?.title || 'رسالة جديدة';
  let notificationOptions = {
    body: payload.notification?.body || 'لديك رسالة جديدة',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    requireInteraction: true,
    data: payload.data,
    vibrate: [200, 100, 200, 100, 200, 100, 200], // نمط اهتزاز قوي
    silent: false // تشغيل الصوت
  };

  // تخصيص حسب نوع الإشعار
  if (notificationType === 'new_request') {
    notificationOptions.tag = `request-${payload.data?.requestId}`;
    notificationOptions.actions = [
      { action: 'accept', title: '✅ قبول الطلب' },
      { action: 'open', title: '👁️ عرض التفاصيل' },
      { action: 'close', title: '❌ إغلاق' }
    ];
  } else {
    notificationOptions.tag = 'chat-notification';
    notificationOptions.actions = [
      { action: 'open', title: 'فتح المحادثة' },
      { action: 'close', title: 'إغلاق' }
    ];
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [SW] Notification clicked:', event);
  
  event.notification.close();

  // التعامل مع أزرار الإشعار
  if (event.action === 'close') {
    return; // مجرد إغلاق الإشعار
  }

  // تحديد الصفحة المستهدفة
  let targetUrl = '/dashboard/chat';
  
  if (event.notification.data?.type === 'new_request') {
    if (event.action === 'accept') {
      targetUrl = `/dashboard/employee-requests?action=accept&requestId=${event.notification.data?.requestId}`;
    } else {
      targetUrl = '/dashboard/employee-requests';
    }
  }

  // فتح أو التركيز على التبويب
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // البحث عن تبويب مفتوح
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes('/dashboard') && 'focus' in client) {
            // إعادة توجيه التبويب الموجود
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl
            });
            return client.focus();
          }
        }
        
        // إذا لم يوجد تبويب، افتح واحد جديد
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
