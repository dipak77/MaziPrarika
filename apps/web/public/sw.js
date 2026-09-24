/*
 * Mazi Patrika service worker.
 *
 * Deliberately small and boring — the four-level caching story in the platform
 * lives server-side (in-process → SQLite → HTTP cache → CDN), and a clever service
 * worker would fight it. This one only does two things:
 *
 *   1. assets  (fonts, icons, Next static chunks): cache-first, they are immutable
 *   2. pages:   network-first with a 4s budget, falling back to cache, then /offline
 *
 * Navigations are never served stale-on-purpose, so a family always sees the
 * latest RSVP or invitation edit the moment they have signal.
 */
const VERSION = 'mazi-v1';
const ASSET_CACHE = `${VERSION}-assets`;
const PAGE_CACHE = `${VERSION}-pages`;
const PRECACHE = ['/offline', '/icons/icon-192.png', '/icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(ASSET_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isAsset = (url) =>
  url.pathname.startsWith('/fonts/') ||
  url.pathname.startsWith('/icons/') ||
  url.pathname.startsWith('/_next/static/');

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            if (response.ok) caches.open(ASSET_CACHE).then((cache) => cache.put(request, response.clone()));
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request).then((response) => {
          if (response.ok) caches.open(PAGE_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]).catch(async () => (await caches.match(request)) ?? (await caches.match('/offline')) ?? Response.error()),
    );
  }
});
