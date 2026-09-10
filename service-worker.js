const CACHE_NAME = "estudiantes-cache-v3";
const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARCHIVOS_APP);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres
          .filter(function (nombre) {
            return nombre !== CACHE_NAME;
          })
          .map(function (nombre) {
            return caches.delete(nombre);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request).then(function (respuestaCache) {
      const solicitudRed = fetch(evento.request)
        .then(function (respuestaRed) {
          if (respuestaRed && respuestaRed.ok && evento.request.url.startsWith(self.location.origin)) {
            const copia = respuestaRed.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(evento.request, copia);
            });
          }
          return respuestaRed;
        })
        .catch(function () {
          return respuestaCache;
        });

      return respuestaCache || solicitudRed;
    })
  );
});
