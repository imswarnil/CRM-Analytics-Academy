/**
 * First-party analytics (server/api/collect.post.ts; read in /admin →
 * Analytics). Records a page view on every navigation, how long the page was
 * visible, and clicks on any link to /sign-in or /sign-up.
 *
 * Humans vs bots: an automated browser (navigator.webdriver, a headless user
 * agent) sends `a: 1` and is dropped and counted by the server. Everyone else
 * is marked human on their first real interaction — a tap, a key, a scroll or
 * a few mouse movements — once per browser (`crma-h` in localStorage).
 *
 * No cookies: the visitor id lives in localStorage, the session id in
 * sessionStorage. If storage is blocked, ids are per page load and the view
 * is still counted. Other code reports milestones with `useNuxtApp().$track`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const id = () => crypto.randomUUID().replace(/-/g, '').slice(0, 24)
  const keep = (store: Storage | undefined, key: string) => {
    try {
      const v = store?.getItem(key)
      if (v) return v
      const n = id()
      store?.setItem(key, n)
      return n
    } catch {
      return id()
    }
  }
  const visitor = keep(globalThis.localStorage, 'crma-v')
  const session = keep(globalThis.sessionStorage, 'crma-s')
  const { locale } = nuxtApp.$i18n as { locale: { value: string } }

  const automated = Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver) || /headless/i.test(navigator.userAgent)
  const send = (payload: Record<string, unknown>, beacon = false) => {
    const body = JSON.stringify({ v: visitor, s: session, ...(automated ? { a: 1 } : {}), ...payload })
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/collect', new Blob([body], { type: 'text/plain' }))
      return Promise.resolve(null)
    }
    return fetch('/api/collect', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true })
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
  }

  // Time on page = time the tab was visible, not time it sat open.
  let view: { id: number | null, visibleMs: number, since: number | null } | null = null
  const flush = () => {
    if (!view) return
    const ms = view.visibleMs + (view.since ? performance.now() - view.since : 0)
    if (view.id && ms > 500) send({ t: 'leave', id: view.id, ms: Math.round(ms) }, true)
  }
  const start = async (path: string) => {
    flush()
    const current = { id: null as number | null, visibleMs: 0, since: document.visibilityState === 'visible' ? performance.now() : null }
    view = current
    // The visit's first source, kept for the session so a lead can say
    // where the person came from (POST /api/leads → Salesforce).
    try {
      if (!sessionStorage.getItem('crma-source')) {
        const utm = new URLSearchParams(location.search).get('utm_source')
        let ref = ''
        try {
          ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
        } catch { /* invalid referrer */ }
        sessionStorage.setItem('crma-source', utm ? `utm:${utm}` : ref && ref !== location.hostname ? ref : 'direct')
      }
    } catch { /* storage blocked */ }
    const res = await send({ t: 'pv', p: path, l: locale.value, r: document.referrer, u: new URLSearchParams(location.search).get('utm_source') ?? '' })
    current.id = (res as { id?: number } | null)?.id ?? null
  }

  document.addEventListener('visibilitychange', () => {
    if (!view) return
    if (document.visibilityState === 'hidden') {
      if (view.since) view.visibleMs += performance.now() - view.since
      view.since = null
      flush()
      // Already reported; count only the time after the reader comes back.
      view.visibleMs = 0
    } else {
      view.since = performance.now()
    }
  })

  // The first real interaction marks this browser human (once).
  let human = false
  try {
    human = localStorage.getItem('crma-h') === '1'
  } catch { /* storage blocked */ }
  if (!human && !automated) {
    let moves = 0
    const mark = (e: Event) => {
      if (e.type === 'mousemove' && ++moves < 4) return
      if (!view?.id) return // wait until the view is recorded
      human = true
      try {
        localStorage.setItem('crma-h', '1')
      } catch { /* storage blocked */ }
      send({ t: 'human' })
      for (const t of TYPES) window.removeEventListener(t, mark, true)
    }
    const TYPES = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const
    for (const t of TYPES) window.addEventListener(t, mark, { capture: true, passive: true })
  }

  const track = (name: string, label?: string) => send({ t: 'ev', n: name, p: location.pathname, lb: label })

  // Any link to sign-in or sign-up, wherever it is on the page.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!a) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin) {
      track('outbound', url.hostname)
      return
    }
    if (/\/sign-in\/?$/.test(url.pathname)) track('sign_in_click', a.textContent?.trim().slice(0, 60))
    else if (/\/sign-up\/?$/.test(url.pathname)) track('sign_up_click', a.textContent?.trim().slice(0, 60))
  }, { capture: true })

  const router = useRouter()
  router.afterEach((to, from) => {
    if (to.path !== from.path || !view) start(to.path)
  })
  nuxtApp.hook('app:mounted', () => {
    if (!view) start(router.currentRoute.value.path)
  })

  return { provide: { track } }
})
