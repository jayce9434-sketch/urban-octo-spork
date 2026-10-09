const CACHE='melodic-isles-nightfall-v5';
const CORE=['./','./index.html','./style.css','./catalog.js','./monster-art.js','./world-art.js','./save-tools.js','./audio-engine.js','./events.js','./game.js','./pwa.js','./manifest.webmanifest','./app-icon.png','./icon-192.png','./icon-512.png','./ui-tap.wav','./coin.wav','./hatch.wav','./quest.wav'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match('./index.html'))));});
