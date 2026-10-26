const CACHE_NAME = 'studyflow-ranking-entry-20261026';
const urlsToCache = ['./', './index.html', './manifest.json'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || request.headers.has('Authorization')) return;
  event.respondWith(fetch(request, {cache:'no-store'}).then(response => {
    if (response.ok && response.type !== 'opaque' && !/private|no-store/i.test(response.headers.get('Cache-Control') || '')) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  }).catch(async () => (await caches.match(request)) || new Response('Você está sem conexão. Reconecte para abrir esta página.', {status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})));
});
