const CACHE_VER = 'v2';
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
  './src/components/InstallBanner.js',
  './src/data/hymns.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// Safari rechaza respuestas con response.redirected=true servidas por el SW.
// Esta función reconstruye la respuesta sin el flag de redirección.
async function fetchNoRedirect(request) {
  const response = await fetch(request);
  if (!response.redirected) return response;
  const body = await response.blob();
  return new Response(body, { status: 200, headers: response.headers });
}

// ── Install: pre-cachear la shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then(cache =>
      Promise.all(
        SHELL_ASSETS.map(url =>
          fetchNoRedirect(url)
            .then(r => { if (r.ok) cache.put(url, r); })
            .catch(e => console.warn('[SW] No se pudo cachear:', url, e))
        )
      )
    ).then(() => self.skipWaiting())
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

  // Navegación SPA → servir index.html del caché directamente.
  // Evita que Cloudflare Pages u otro servidor devuelva un redirect
  // que Safari rechazaría al ser servido por el SW.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html', { cacheName: CACHE_SHELL })
        .then(r => r || fetch(request))
    );
    return;
  }

  // Google Fonts → stale-while-revalidate
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
    const response = await fetchNoRedirect(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetchNoRedirect(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkFetch;
}
