const CACHE_VER = 'v1';
const CACHE_SHELL = `orfeones-shell-${CACHE_VER}`;
const CACHE_FONTS = `orfeones-fonts-${CACHE_VER}`;
const CACHE_CDN   = `orfeones-cdn-${CACHE_VER}`;
const CACHE_PDF   = `orfeones-pdf-${CACHE_VER}`;

const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
  './src/styles/main.css',
  './src/main.js',
  './src/components/Component.js',
  './src/components/App.js',
  './src/components/Header.js',
  './src/components/Toolbar.js',
  './src/components/HymnIndex.js',
  './src/components/Viewer.js',
  './src/data/hymns.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// ── Install: pre-cachear la shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: limpiar cachés viejas ───────────────────────────────────────
self.addEventListener('activate', event => {
  const current = new Set([CACHE_SHELL, CACHE_FONTS, CACHE_CDN, CACHE_PDF]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !current.has(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: estrategia por tipo de recurso ─────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts → stale-while-revalidate (permite actualizar fuentes)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(CACHE_FONTS, request));
    return;
  }

  // CDN (PDF.js) → cache-first (URLs versionadas, no cambian)
  if (url.hostname === 'cdnjs.cloudflare.com') {
    event.respondWith(cacheFirst(CACHE_CDN, request));
    return;
  }

  // PDFs de partitura → cache-first (se cachean al abrirlos por primera vez)
  if (url.pathname.endsWith('.pdf')) {
    event.respondWith(cacheFirst(CACHE_PDF, request));
    return;
  }

  // Shell de la app (mismo origen) → cache-first con fallback a red
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(CACHE_SHELL, request));
    return;
  }

  // Resto → red directa
  event.respondWith(fetch(request));
});

// ── Helpers de estrategia ─────────────────────────────────────────────────
async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkFetch;
}
