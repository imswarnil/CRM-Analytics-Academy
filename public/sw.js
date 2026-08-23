// Minimal, safe service worker: caches immutable hashed static assets
// cache-first, and caches HTML navigations network-first (falling back to the
// cache when offline). The site is fully static, so every response here is
// public — there are no per-user or auth-bearing requests to keep out.
//
// It earns its keep on GitHub Pages specifically: Pages sends a flat
// `cache-control: max-age=600` on everything — including content-hashed
// /_nuxt/ files that could safely be immutable — and allows no custom headers.
// Caching those cache-first here is what stops repeat visits re-fetching them.
//
// Bump CACHE_NAME whenever a release must invalidate what returning visitors
// already hold: `activate` deletes every cache that isn't the current name.
//   v2 = the static rewrite (dropped accounts, quizzes, comments, admin).
//   v3 = purge error pages poisoned into v1/v2 during the Vercel→Pages move.
const CACHE_NAME = 'crma-v3'
const STATIC_ASSET_RE = /\/_nuxt\/|\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/

// Only ever store a real, complete, same-origin success. Without this guard a
// transient 404/5xx gets written to the cache — and for cache-first assets it
// would then be served forever, never retrying the network. That is exactly
// how Vercel's DEPLOYMENT_NOT_FOUND page survived the DNS cutover for some
// visitors: cached once, replayed indefinitely.
function isCacheable(res) {
  return !!res && res.ok && res.status === 200 && res.type === 'basic'
}

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

  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Ignore a cached entry that isn't a clean success, so a previously
        // poisoned cache heals itself on the next load instead of sticking.
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
      // Offline only: serve the cached copy if we have a good one.
      .catch(() => caches.match(request).then(cached => cached || Response.error()))
  )
})
