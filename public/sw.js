// SmartAgriSense Service Worker v1.0.0
const CACHE_VERSION = 'smartagrisense-v1.0.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
];

// ─── Install: pre-cache essential assets ───────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker…');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching essential assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// ─── Activate: clean up old caches ────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker…');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── Fetch strategies ─────────────────────────────────────────────

/**
 * Determine if a request is for a static asset (cache-first)
 */
function isStaticAsset(url) {
  const staticExtensions = [
    '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.avif'
  ];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

/**
 * Determine if a request is for an API call (network-first)
 */
function isApiCall(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('api.') ||
    url.hostname.includes('openweathermap.org') ||
    url.hostname.includes('googleapis.com')
  );
}

/**
 * Cache-first strategy: serve from cache, fall back to network
 * Used for static assets (CSS, JS, images, fonts)
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // If it's an image, return a transparent 1x1 pixel
    if (request.url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

/**
 * Network-first strategy: try network, fall back to cache
 * Used for API calls and dynamic content
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a JSON error for API calls
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. This data was not available in cache.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Stale-while-revalidate for navigation requests (HTML pages)
 */
async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Serve offline fallback page
    return caches.match('/offline.html');
  }
}

// ─── Main fetch handler ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-HTTP(S) requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Next.js internal requests to prevent caching development chunks
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationHandler(event.request));
    return;
  }

  // API calls → network-first
  if (isApiCall(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Static assets → cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Everything else → network-first with cache fallback
  event.respondWith(networkFirst(event.request));
});

// ─── Background sync (future enhancement) ─────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
