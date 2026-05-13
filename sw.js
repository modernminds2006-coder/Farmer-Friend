/* ============================================
   SERVICE WORKER for Farmer Friend PWA

   WHAT: A background script that caches files
   HOW:  Saves HTML/CSS/JS so the app loads offline
   WHY:  Farmers may not always have internet.
         Cached files load instantly.
   ============================================ */

// Cache name — change the version number to force
// the browser to re-download all files
var CACHE_NAME = "farmdoc-v3";

// Files to save for offline use
var FILES_TO_CACHE = [
    "/index.html",
    "/css/style.css",
    "/js/app.js",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

// INSTALL — save files to cache when SW is first installed
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// ACTIVATE — delete old caches when a new version is installed
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.map(function (name) {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// FETCH — serve from network first, fall back to cache
self.addEventListener("fetch", function (event) {
    // Don't cache API calls — we need fresh AI responses
    if (event.request.url.includes("googleapis.com")) {
        return;
    }

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
