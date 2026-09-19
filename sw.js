const CACHE='yar-keshavarz-offline-v2';
const CORE=['./','./index.html','./app.js','./sw.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo.png','./wheat-hero.jpg','./offline/offline-ai.js','./offline/agriculture-db.js','./admin.html','./admin.js','./admin.css','./admin-reset.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return res}).catch(()=>caches.match('./index.html'))))});
