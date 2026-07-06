// Minimal, safe service worker: caches immutable hashed static assets
// cache-first, caches HTML navigations network-first (falling back to the
// cache when offline), and never touches /api/* — dynamic, auth-bearing
// requests must always hit the network so Supabase sessions, moderation,
// and submissions behave exactly as without a service worker.
const CACHE_NAME = 'crma-v1'
const STATIC_ASSET_RE = /\/_nuxt\/|\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then((res) => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
        return res
      }))
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy))
        return res
      })
      .catch(() => caches.match(request))
  )
})
