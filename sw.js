const CACHE='fortune-fables-offline-v8';
const BASE=new URL(self.registration.scope).pathname.replace(/\/$/,'');
const path=(value)=>`${BASE}${value}`;
const SHELL=['/','/manifest.webmanifest','/app-icon.svg','/fortune-fables-mark.png','/assets/app.js','/assets/app.css'].map(path);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match(path('/')))));
});

