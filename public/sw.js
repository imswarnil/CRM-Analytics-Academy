// Minimal, safe service worker: caches immutable hashed static assets
// cache-first, and caches HTML navigations network-first (falling back to the
// cache when offline). The site is fully static, so every response here is
// public — there are no per-user or auth-bearing requests to keep out.
//
// Bump CACHE_NAME whenever a release must invalidate what returning visitors
// already hold: `activate` deletes every cache that isn't the current name.
// v2 = the static rewrite (dropped accounts, quizzes, comments, admin), so
// stale HTML for those removed routes had to go.
const CACHE_NAME = 'crma-v2'
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
