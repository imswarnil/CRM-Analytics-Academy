// CRM Analytics Academy service worker.
//
//   /_nuxt/ and static files   cache-first (content-hashed, safe to keep)
//   public pages (lessons …)   network-first, cached copy when offline
//   private pages and /api/    never cached — they are per-user
//   an uncached page offline   /offline.html
//
// Bump CACHE_NAME whenever a release must invalidate what returning visitors
// already hold: `activate` deletes every cache that isn't the current name.
//   v3 = purge error pages poisoned during the Vercel→Pages move.
//   v4 = Blueprint redesign; private routes excluded; offline page.
const CACHE_NAME = 'crma-v4'
const OFFLINE_URL = '/offline.html'
const STATIC_ASSET_RE = /\/_nuxt\/|\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/
// Signed-in, per-user or server-rendered-per-request: caching any of these
// would hand one visit's page to the next (or to another account on the same
// device).
const PRIVATE_RE = /^\/(?:[a-z]{2}\/)?(?:api|admin|dashboard|submit|sign-in|sign-up|_studio|raw|media|mcp)(?:\/|$)/

// Only ever store a real, complete, same-origin success — a cached 404/5xx
// would otherwise be replayed forever.
function isCacheable(res) {
  return !!res && res.ok && res.status === 200 && res.type === 'basic'
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(OFFLINE_URL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

function putInCache(request, response) {
  if (!isCacheable(response)) return
  const copy = response.clone()
  caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (PRIVATE_RE.test(url.pathname)) return

  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (isCacheable(cached)) return cached
        return fetch(request).then((res) => {
          putInCache(request, res)
          return res
        })
      })
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        putInCache(request, res)
        return res
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached
        if (request.mode === 'navigate') return caches.match(OFFLINE_URL)
        return Response.error()
      }))
  )
})
