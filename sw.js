// =========================================================
// YarKeshavarz Service Worker
// Modular V17
// =========================================================

const CACHE = 'yar-keshavarz-shell-v17-modular';

const CORE = [
  './',
  './index.html',

  // CSS
  './css/style.css',

  // Core
  './modules/app.js',
  './modules/fun.js',

  // Modules
  './modules/land.js',
  './modules/inventory.js',
  './modules/cultivation.js',
  './modules/weather.js',
  './modules/yar.js',
  './modules/game.js',
  './modules/equipment.js',
  './modules/manager.js',
  './modules/settings.js',
  './modules/backup.js',
  './modules/offline-loader.js',

  // Pages
  './pages/views.js',

  // Online measurement
  './modules/measurement.js',

  // Offline agriculture system
  './offline/offline-ai.js',
  './offline/agriculture-db.js',
  './offline/agriculture-db-extended.js',
  './offline/calculators.js',
  './offline/context-engine.js',
  './offline/crop-profiles-universal.js',
  './offline/crop-profiles.js',
  './offline/crop-ui.js',
  './offline/global-agriculture-brain.js',
  './offline/global-crop-registry.js',
  './offline/intent-engine.js',
  './offline/specialized-crop-profiles.js',
  './offline/universal-crop-engine.js',

  // PWA
  './manifest.webmanifest',

  // Assets
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo.png',
  './assets/wheat-hero.jpg',

  // Admin
  './admin.html',
  './admin.js',
  './admin.css',

  // Data
  './data/knowledge/knowledge.json'
];


// =========================================================
// INSTALL
// =========================================================

self.addEventListener('install', event => {

  event.waitUntil(

    caches
      .open(CACHE)
      .then(cache => {

        return cache
          .addAll(CORE)
          .catch(error => {

            console.warn(
              'Some cache files could not be stored:',
              error
            );

          });

      })
      .then(() => {

        return self.skipWaiting();

      })

  );

});


// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener('activate', event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))

        );

      })
      .then(() => {

        return self.clients.claim();

      })

  );

});


// =========================================================
// FETCH
// =========================================================

self.addEventListener('fetch', event => {

  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // فقط فایل‌های همین سایت
  if (url.origin !== location.origin) {
    return;
  }


  // -------------------------------------------------------
  // صفحه اصلی و صفحات HTML
  // اول نسخه جدید شبکه را امتحان می‌کنیم
  // -------------------------------------------------------

  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches
            .open(CACHE)
            .then(cache => cache.put(request, copy));

          return response;

        })
        .catch(() => {

          return caches.match(request)
            .then(cached => {

              return cached ||
                caches.match('./index.html');

            });

        })

    );

    return;
  }


  // -------------------------------------------------------
  // فایل‌های JS / CSS / تصاویر
  // -------------------------------------------------------

  event.respondWith(

    caches
      .match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {

            // فقط پاسخ معتبر را ذخیره کن
            if (
              response &&
              response.status === 200 &&
              response.type === 'basic'
            ) {

              const copy = response.clone();

              caches
                .open(CACHE)
                .then(cache => {

                  cache.put(request, copy);

                });

            }

            return response;

          });

      })
      .catch(() => {

        return caches.match('./index.html');

      })

  );

});
