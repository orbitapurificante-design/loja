// Service worker da loja: primeiro tenta a internet (preços e produtos sempre atuais);
// se não houver ligação, usa a última cópia guardada.
const CACHE = 'loja-dumelhor-v1';
const BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(r).then(resp => {
      if (resp && resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(r, cp)).catch(() => {}); }
      return resp;
    }).catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
