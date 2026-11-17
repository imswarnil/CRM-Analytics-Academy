/**
 * GTM, the light way. No page-view or click beacons from this site: traffic
 * is Cloudflare Web Analytics (a static beacon, see app.vue), search is Search
 * Console. This plugin does two small things:
 *
 *  1. First touch. On a visitor's first page view it records where they came
 *     from — `utm_source/medium/campaign` if the link was tagged, else the
 *     referring host, else "direct" — in localStorage (`crma-src`), once.
 *     `firstTouch()` returns it; sign-ups and leads carry it to Salesforce.
 *  2. Milestones. `useNuxtApp().$track(name, label)` posts only the names in
 *     MILESTONES (server/api/collect.post.ts); anything else is dropped here.
 *
 * No cookies: the visitor id and the first touch live in localStorage.
 */
const MILESTONES = new Set(['sign_up', 'sign_in', 'lesson_complete', 'exam_finish', 'checkout'])

function store(key: string, make: () => string) {
  try {
    const v = localStorage.getItem(key)
    if (v) return v
    const n = make()
    localStorage.setItem(key, n)
    return n
  } catch {
    return make()
  }
}

export default defineNuxtPlugin(() => {
  const visitor = store('crma-v', () => crypto.randomUUID().replace(/-/g, '').slice(0, 24))
  const source = store('crma-src', () => {
    const q = new URLSearchParams(location.search)
    const clean = (v: string | null) => (v ?? '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40)
    const utm = clean(q.get('utm_source'))
    if (utm) return [utm, clean(q.get('utm_medium')), clean(q.get('utm_campaign'))].filter(Boolean).join('/')
    try {
      const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''
      if (host && host !== location.hostname) return host
    } catch { /* invalid referrer */ }
    return 'direct'
  })
  const automated = Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver) || /headless/i.test(navigator.userAgent)

  const track = (name: string, label?: string) => {
    if (automated || !MILESTONES.has(name)) return
    // A sign-up's label is its first touch, so Salesforce knows the source.
    const lb = name === 'sign_up' ? source : label
    const body = JSON.stringify({ v: visitor, n: name, p: location.pathname, lb })
    fetch('/api/collect', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => null)
  }

  return { provide: { track, firstTouch: () => source } }
})
