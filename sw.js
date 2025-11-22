// sw.js — MCOT Radio PWA Service Worker (Minimal + Stable)

const CACHE_NAME = "mcot-radio-cache-v1";
const OFFLINE_FILES = [
  "radio.html",
  "manifest.json",
  "logo.png"
];

// ติดตั้งครั้งแรก: Cache ไฟล์พื้นฐาน
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

// Activate + ทำความสะอาด cache เก่า (ถ้ามี)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler — Network-first แต่ fallback เป็น cache เพื่อให้เปิดหน้าได้แม้ offline
self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith(
    fetch(req)
      .then((res) => res)
      .catch(() => caches.match(req).then((r) => r))
  );
});
