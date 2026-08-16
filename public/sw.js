/**
 * Service Worker — Caching & Offline PWA Engine
 * Cache Version: v3 (Modular Architecture)
 */

const CACHE_NAME = 'rafi-portfolio-v3';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './src/css/main.css',
  './src/css/base/variables.css',
  './style.css',
  './src/js/main.js',
  './src/js/core/theme.js',
  './src/js/core/scroll.js',
  './src/js/core/nav.js',
  './src/js/features/analytics.js',
  './src/js/features/bottom-sheet.js',
  './src/js/features/haptic.js',
  './src/js/features/pull-refresh.js',
  './src/js/features/skill-bars.js',
  './src/js/features/swipe.js',
  './src/js/features/command-palette.js',
  './src/js/features/lead-capture.js',
  './src/js/ui/counter.js',
  './src/js/ui/typing.js',
  './src/js/ui/contact-form.js',
  './assets/img/profile.jpeg',
  './img.jpeg',
  './manifest.json'
];

// Install: Pre-cache static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for local assets, network-only for Supabase/External APIs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not cache Supabase, OAuth, or external API endpoints
  if (url.hostname.includes('supabase.co') || url.hostname.includes('ipapi.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
