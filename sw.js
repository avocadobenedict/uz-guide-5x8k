// Узбекистан: офлайн-кэш. При изменении файлов поднимите номер версии.
const V='uz-guide-v7', TILES='uz-tiles-v1', MAXTILES=500;
const SHELL=['./','index.html','manifest.webmanifest','docs/kid.pdf','docs/pamyatka.pdf','docs/usloviya.pdf','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
async function trim(c){const ks=await c.keys();if(ks.length>MAXTILES)for(const k of ks.slice(0,ks.length-MAXTILES))await c.delete(k);}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('tile.openstreetmap.org')){
    e.respondWith(caches.open(TILES).then(async c=>{const m=await c.match(r);if(m)return m;try{const n=await fetch(r);if(n&&(n.ok||n.type==='opaque')){c.put(r,n.clone());trim(c);}return n;}catch(x){return m||Response.error();}}));return;
  }
  if(u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(V).then(async c=>{
      const m=await c.match(r,{ignoreSearch:true});
      const net=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n;}).catch(()=>null);
      if(m){e.waitUntil(net);return m;}
      const n=await net; if(n)return n;
      if(r.mode==='navigate'){const i=await c.match('index.html');if(i)return i;}
      return Response.error();
    }));
  }
});
