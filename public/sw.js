// CRM Analytics Academy service worker — the offline app.
//
//   install      precache the shell: the offline page and the core pages
//   activate     then, in the background, save every page listed in
//                /offline-pages.json (built by scripts/build-search-index.mjs):
//                the course page, the exam and its question bank, every
//                English lesson and its Nuxt payload
//   /_nuxt/, images, fonts   cache-first (content-hashed, safe to keep)
//   public pages, payloads   network-first; the saved copy when offline
//   private pages and /api/  never cached — they are per-user
//   an unsaved page offline  /offline.html
//
// Bump CACHE_NAME when a release must invalidate what returning visitors hold:
// `activate` deletes every cache that is not the current name.
//   v4 = Blueprint redesign; private routes excluded; offline page.
//   v5 = Namaste design; course at /start; full offline save of the course.
//   v6 = the course moved to /course and every lesson under /course/<section>/.
const CACHE_NAME = 'crma-v6'
const OFFLINE_URL = '/offline.html'
const SHELL = [OFFLINE_URL, '/', '/course', '/icon.svg', '/manifest.webmanifest']
const STATIC_ASSET_RE = /\/_nuxt\/|\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/
// Signed-in, per-user or rendered per request: caching any of these would hand
// one visit's page to the next (or to another account on the same device).
const PRIVATE_RE = /^\/(?:[a-z]{2}\/)?(?:api|admin|dashboard|account|team|submit|sign-in|sign-up|_studio|raw|media|mcp)(?:\/|$)/

// Only ever store a real, complete, same-origin success — a cached 404/5xx
// would otherwise be replayed forever.
function isCacheable(res) {
  return !!res && res.ok && res.status === 200 && res.type === 'basic'
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // One failed page must not fail the install: add each on its own.
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  )
})

// Save the course for offline use, a few requests at a time, after activation.
async function saveCourse() {
  try {
    const res = await fetch('/offline-pages.json', { cache: 'no-store' })
    if (!res.ok) return
    const { urls } = await res.json()
    const cache = await caches.open(CACHE_NAME)
    for (let i = 0; i < urls.length; i += 4) {
      await Promise.all(urls.slice(i, i + 4).map(async (url) => {
        if (await cache.match(url)) return
        const r = await fetch(url).catch(() => null)
        if (isCacheable(r)) await cache.put(url, r)
      }))
    }
  } catch { /* offline saving is best-effort */ }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => saveCourse())
  )
})

// The page can ask for a refresh of the offline copy ("Save for offline").
self.addEventListener('message', (event) => {
  if (event.data === 'save-course') event.waitUntil(saveCourse())
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
      .catch(() => caches.match(request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached
        if (request.mode === 'navigate') return caches.match(OFFLINE_URL)
        return Response.error()
      }))
  )
})
