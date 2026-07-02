const CACHE = "domajeur-__BUILD_ID__";
const APP_SHELL = "/index.html";
const NAVIGATION_TIMEOUT_MS = 3000;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    const networkFetch = fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(APP_SHELL, copy));

      return response;
    });
    event.waitUntil(networkFetch.catch(() => undefined));

    const timeout = new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, NAVIGATION_TIMEOUT_MS);
    });

    event.respondWith(
      Promise.race([networkFetch.catch(() => undefined), timeout])
        .then((networkResponse) => {
          if (networkResponse !== undefined) {
            return networkResponse;
          }

          return caches.match(APP_SHELL).then((cached) => cached ?? networkFetch);
        })
        .catch(() => Response.error()),
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));

          return response;
        })
        .catch(() => cached);

      return cached ?? networkFetch;
    }),
  );
});
