const CACHE_NAME = "studyflow-v20";

const FILES = [
  "./",
  "./index.html",
  "./programacao.html",
  "./dados.txt"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});