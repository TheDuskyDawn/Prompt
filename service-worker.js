const CACHE_NAME = "prompt-vault-v5";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./guide.html",
  "./privacy.html",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./data/resources.json",
  "./assets/favicon.svg",
  "./assets/app-icon.svg",
  "./manifest.webmanifest"
];

const INDEX_URL = new URL("./index.html", self.location.href).toString();
const OFFLINE_URL = new URL("./offline.html", self.location.href).toString();
const CORE_URLS = CORE_ASSETS.map((asset) => new URL(asset, self.location.href).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("prompt-vault-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          return (await caches.match(INDEX_URL)) || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
