const CACHE = 'yar-keshavarz-offline-v4';

const CORE = [
  './',
  './index.html',
  './sw.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  './wheat-hero.jpg',
  './offline/offline-ai.js?v=20260919-v4',
  './offline/agriculture-db-extended.js?v=20260919-v4'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  const isAppScript =
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json');

  if (isAppScript) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE).then(cache => {
            cache.put(event.request, copy);
          });

          return response;
        })
        .catch(() => caches.match(event.request))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            const copy = response.clone();

            caches.open(CACHE).then(cache => {
              cache.put(event.request, copy);
            });

            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
  );
});
