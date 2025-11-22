// service-worker.js

const CACHE_NAME = 'dtv-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest'
  // ถ้ามีไฟล์อื่น เช่น CSS หรือ icon ที่อยาก cache เพิ่ม ก็ใส่ได้
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // ไม่ยุ่งกับ video / HLS (ให้วิ่ง network ตรง)
  const dest = req.destination;
  if (dest === 'video' || req.url.endsWith('.m3u8') || req.url.includes('.ts')) {
    return; // default: network
  }

  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) {
        return cachedRes;
      }
      return fetch(req).catch(() => {
        // ถ้า offline และหาอะไรไม่เจอ จะลองคืน index.html ไว้เป็น shell
        return caches.match('./index.html');
      });
    })
  );
});
