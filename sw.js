// Har naye deploy par sirf ye version number badhao.
// Naya version = purana cache automatically delete + naye files fetch.
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'app-cache-' + CACHE_VERSION;

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: naya cache banao, naye service worker ko turant activate hone do
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // purane SW ka wait mat karo, turant le lo
});

// Activate: purane sab caches delete karo, sab open tabs par turant control lo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // turant sab open tabs is naye SW ke control mein aa jaayen
});

// Fetch: HTML/pages ke liye "network-first" (hamesha latest try karo),
// baaki assets ke liye "cache-first" (fast load)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
});
