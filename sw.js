var CACHE_NAME = "farmer-friend-v4";

var FILES_TO_CACHE = [
    "/index.html",
    "/css/style.css",
    "/js/app.js",
    "/manifest.json",
    "/icons/icon.svg",
    "/assets/farmer-character.webp"
];

self.addEventListener("install", function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.map(function (name) {
                    if (name !== CACHE_NAME) return caches.delete(name);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    // Never cache API calls
    if (event.request.url.includes("googleapis.com")) return;

    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(function () {
                return caches.match(event.request);
            })
    );
});
