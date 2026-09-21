const CACHE='yar-keshavarz-offline-crop-v2';
const CORE=[
  './','./index.html','./sw.js','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./logo.png','./wheat-hero.jpg',
  './offline/offline-ai.js?v=20260921-crop-v2',
  './offline/crop-profiles.js?v=20260921-crop-v2',
  './offline/agriculture-db-extended.js?v=20260921-crop-v2',
  './offline/global-agriculture-brain.js?v=20260921-crop-v2',
  './offline/intent-engine.js?v=20260921-crop-v2',
  './offline/context-engine.js?v=20260921-crop-v2'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(CORE).catch(()=>{}))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;

  e.respondWith(
    fetch(e.request)
      .then(r=>{
        const c=r.clone();
        caches.open(CACHE).then(x=>x.put(e.request,c));
        return r;
      })
      .catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html')))
  );
});
