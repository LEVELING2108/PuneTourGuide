/*
 * Bridge for phones that installed the app from puneexplorer.dev before it moved to
 * app.puneexplorer.dev. The old app's service worker updates to this one: it drops the old app's
 * caches and keeps one offline page that can still call 112 and text the emergency contacts saved
 * on this phone. Online, pages load normally (the landing forwards installed apps to the new
 * address). The landing page never registers it, so new visitors don't get it.
 */
const CACHE = 'pe-bridge-v1';
const OFFLINE = ['/sos-offline.html', '/sos-offline.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(OFFLINE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      // Open pages are left alone (one may be in the middle of an SOS); the next page load uses this worker
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/sos-offline.html')) || Response.error()));
  } else if (OFFLINE.includes(new URL(request.url).pathname)) {
    // The offline page's own script must load offline too
    event.respondWith(fetch(request).catch(async () => (await caches.match(request, { ignoreSearch: true })) || Response.error()));
  }
});
