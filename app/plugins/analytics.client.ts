/**
 * Milestones only (server/api/collect.post.ts). There are no page-view,
 * time-on-page or click beacons: traffic comes from Cloudflare Web Analytics,
 * which costs the Worker nothing. Code reports a milestone with
 * `useNuxtApp().$track(name, label)`; anything not in MILESTONES is dropped
 * here, before a request is made.
 *
 * No cookies: the visitor id lives in localStorage (per page load if blocked).
 */
const MILESTONES = new Set(['sign_up', 'sign_in', 'lesson_complete', 'exam_finish', 'youtube_verified', 'checkout'])

export default defineNuxtPlugin(() => {
  let visitor = ''
  try {
    visitor = localStorage.getItem('crma-v') || ''
    if (!visitor) {
      visitor = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
      localStorage.setItem('crma-v', visitor)
    }
  } catch {
    visitor = crypto.randomUUID().replace(/-/g, '').slice(0, 24)
  }
  const automated = Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver) || /headless/i.test(navigator.userAgent)

  const track = (name: string, label?: string) => {
    if (automated || !MILESTONES.has(name)) return
    const body = JSON.stringify({ v: visitor, n: name, p: location.pathname, lb: label })
    fetch('/api/collect', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => null)
  }

  return { provide: { track } }
})
