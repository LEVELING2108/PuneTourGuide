/// <reference lib="webworker" />
/**
 * Service worker (TECH_DESIGN §10, PWA and offline):
 * - app shell precached, so Home and SOS open with no network
 * - map tiles: offline packs (caches named pack-<id>) first, then a small runtime cache
 * - public API reads: network first, cached copy when offline
 * Private data (plan, contacts, medical, profile) is never put in a service-worker cache.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Client-side routes load the app shell (works offline); API and safety calls are not pages.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//, /^\/safety\//] }));

// Map tiles: a saved offline pack wins, then tiles seen recently.
const tileRuntime = new CacheFirst({
  cacheName: 'tiles-runtime',
  plugins: [new ExpirationPlugin({ maxEntries: 600, maxAgeSeconds: 14 * 24 * 3600, purgeOnQuotaError: true })],
});
registerRoute(
  ({ request, url }) => request.destination === 'image' && /\/\d+\/\d+\/\d+(@2x)?\.(png|jpg|jpeg|webp)$/.test(url.pathname),
  async (opts) => (await caches.match(opts.request.url, { ignoreSearch: true })) ?? tileRuntime.handle(opts)
);

// Public reads only: places, help points, routes, offline-pack list, weather, nearby services.
const PUBLIC_API = /^\/api\/v1\/(places(\/|$|\?)|help(\/|$|\?)|routes(\/|$)|offline-packs(\/|$)|weather$)/;
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.origin === self.location.origin && (PUBLIC_API.test(url.pathname) || url.pathname.startsWith('/safety/api/emergency-services')),
  new NetworkFirst({
    cacheName: 'api-public',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600, purgeOnQuotaError: true })],
  })
);

// Profile photos have immutable URLs.
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/avatars/'),
  new CacheFirst({ cacheName: 'avatars', plugins: [new ExpirationPlugin({ maxEntries: 20 })] })
);

// Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({ cacheName: 'fonts', plugins: [new ExpirationPlugin({ maxEntries: 30 })] })
);

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') void self.skipWaiting();
});
