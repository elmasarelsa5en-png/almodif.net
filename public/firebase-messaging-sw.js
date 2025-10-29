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

  const notificationTitle = payload.notification?.title || 'رسالة جديدة';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك رسالة جديدة',
    icon: '/app-logo.png',
    badge: '/app-logo.png',
    tag: 'chat-notification',
    requireInteraction: true,
    data: payload.data,
    actions: [
      { action: 'open', title: 'فتح المحادثة' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/dashboard/chat')
    );
  }
});
