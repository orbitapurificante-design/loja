// Service worker da loja e do index_vendas: primeiro tenta a internet (preços e produtos sempre atuais);
// se não houver ligação, usa a última cópia guardada (funciona offline depois de abrir uma vez).
const CACHE = 'loja-dumelhor-v2';
const BASE = ['./', './index.html', './index_vendas.html', './manifest.json', './manifest_vendas.json', './icon-192.png', './icon-512.png', './produtos_vendas.json', './produtos.json', './loja.json'];
const chave = u => { const x = new URL(u); x.search = ''; return x.href; };
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(BASE.map(u => c.add(u)))).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  if (r.headers.has('range')) return;
  e.respondWith(
    fetch(r).then(resp => {
      if (resp && resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(chave(r.url), cp)).catch(() => {}); }
      return resp;
    }).catch(() => caches.match(chave(r.url)).then(m => m || (r.mode === 'navigate' ? caches.match(chave(r.url).replace(/\/$/, '/index.html')).then(x => x || caches.match('./index.html')) : undefined)))
  );
});
