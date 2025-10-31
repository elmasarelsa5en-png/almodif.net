const CACHE_NAME = 'almudif-smart-cache-v6'; // ✅ v6 - استثناء Firebase APIs
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
  const url = event.request.url;
  const method = event.request.method;
  
  // ⚠️ تجاهل أي request غير GET (POST, PUT, DELETE, etc)
  if (method !== 'GET') {
    return;
  }
  
  // ⚠️ استثناء Firebase وجميع Google APIs من الـ Service Worker
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    url.includes('google.com/recaptcha') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')
  ) {
    // اترك Firebase يشتغل بشكل طبيعي بدون تدخل
    return;
  }

  // استراتيجية Cache-First للملفات الثابتة فقط
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجد في الكاش، أرجعه
      if (response) {
        return response;
      }
      
      // إذا لم يوجد، اطلبه من الشبكة وحفظه في الكاش
      return fetch(event.request).then((fetchResponse) => {
        // تحقق أن الاستجابة صالحة قبل الحفظ
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        // نسخ الاستجابة (لأن الاستجابة يمكن استخدامها مرة واحدة فقط)
        const responseToCache = fetchResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      }).catch((error) => {
        console.log('Service Worker: Fetch failed, returning offline page', error);
        // يمكن إرجاع صفحة offline هنا إذا أردت
        return caches.match('/offline.html');
      });
    })
  );
});
