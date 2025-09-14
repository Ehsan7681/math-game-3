const CACHE_NAME = 'squirrel-game-v1';
// لیست فایل‌هایی که باید کش شوند
const urlsToCache = [
  './',
  './index.html',
  './success-sound.mp3',
  './tailwind.css', // یا فایل CSS محلی شما
  './fonts.css', // اگر فونت را محلی کرده‌اید
  './fonts/Vazirmatn-Regular.woff2', // مسیر فایل‌های فونت محلی
  // ... سایر فایل‌های مورد نیاز
];

// مرحله نصب Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// مرحله فعال‌سازی Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// مرحله واکشی (Fetch) - مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // اگر فایل در کش پیدا شد، آن را برگردان
        if (response) {
          return response;
        }
        // اگر نه، درخواست را به شبکه بفرست
        return fetch(event.request).then(
          (response) => {
            // اگر پاسخ خوب بود و از یک منبع معتبر بود، آن را کش کن
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // یک کپی از پاسخ را ذخیره کن
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});