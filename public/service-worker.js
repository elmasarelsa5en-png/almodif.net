const CACHE_NAME = 'almudif-smart-cache-v3'; // ✅ تحديث الكاش لإزالة redirect القديم
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  // أضف هنا أي صفحات أو ملفات CSS/JS رئيسية أخرى
  // سيتم إضافتها تلقائياً عند أول زيارة
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // حذف الكاش القديم
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // استراتيجية Cache-First للسرعة
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجد في الكاش، أرجعه
      if (response) {
        return response;
      }
      // إذا لم يوجد، اطلبه من الشبكة
      return fetch(event.request);
    })
  );
});
