/**
 * First-party analytics: page views, time on page and a few named clicks.
 * Sent by app/plugins/analytics.client.ts, read by /admin → Analytics.
 *
 *   { t: 'pv', v, s, p, l, r }      a page view → returns { id }
 *   { t: 'leave', v, id, ms }       time spent on that view
 *   { t: 'ev', v, s, n, p, lb }     a named event (sign_in_click, sign_up_click, …)
 *
 * No cookies are set and no IP address is stored: `v` (visitor) is a random id
 * the browser keeps in localStorage, `s` (session) one in sessionStorage. The
 * country is Cloudflare's two-letter code; device, browser and OS are read
 * from the user agent and only the family is kept. Bots are dropped.
 *
 * Accepts text/plain too, because navigator.sendBeacon sends that.
 */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|monitor|curl|wget|python|node-fetch/i
const ID = /^[a-z0-9]{8,40}$/i
const EVENTS = new Set(['sign_in_click', 'sign_up_click', 'sign_up', 'sign_in', 'lesson_complete', 'quiz_submit', 'search_open', 'outbound', 'bookmark', 'copy_page', 'youtube_click', 'popup_close', 'promo_close', 'share', 'exam_start', 'exam_finish', 'interview_submit', 'contribute'])

function device(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

function browser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/chrome|crios|chromium/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Other'
}

function os(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/android/i.test(ua)) return 'Android'
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os x|macintosh/i.test(ua)) return 'macOS'
  if (/cros/i.test(ua)) return 'ChromeOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Other'
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const ua = getRequestHeader(event, 'user-agent') || ''
  if (!ua || BOT.test(ua)) return { ok: true }

  let body: Record<string, unknown>
  try {
    const raw = await readRawBody(event, 'utf8')
    body = JSON.parse(raw || '{}')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Bad payload' })
  }

  const visitor = clip(body.v, 40)
  if (!ID.test(visitor)) throw createError({ statusCode: 400, statusMessage: 'Bad visitor' })
  const sql = useDb()

  if (body.t === 'leave') {
    const id = Number(body.id)
    const ms = Math.min(Math.max(Math.round(Number(body.ms) || 0), 0), 30 * 60_000)
    if (Number.isInteger(id) && id > 0 && ms > 0) {
      // Only the visitor who created the view can time it.
      await sql`update app.page_view set duration_ms = greatest(duration_ms, ${ms}) where id = ${id} and visitor = ${visitor}`
    }
    return { ok: true }
  }

  const session = clip(body.s, 40)
  const path = clip(body.p, 300)
  if (!ID.test(session) || !path.startsWith('/')) throw createError({ statusCode: 400, statusMessage: 'Bad view' })
  const user = await getSessionUser(event).catch(() => null)

  if (body.t === 'ev') {
    const name = clip(body.n, 40)
    if (!EVENTS.has(name)) throw createError({ statusCode: 400, statusMessage: 'Unknown event' })
    await sql`
      insert into app.event (visitor, session, user_id, name, path, label)
      values (${visitor}, ${session}, ${user?.id ?? null}, ${name}, ${path}, ${clip(body.lb, 200) || null})
    `
    return { ok: true }
  }

  if (body.t !== 'pv') throw createError({ statusCode: 400, statusMessage: 'Unknown type' })

  const cf = cloudflareOf(event).request?.cf
  const country = cf?.country || getRequestHeader(event, 'cf-ipcountry') || ''
  let referrer: string | null = null
  try {
    const host = new URL(clip(body.r, 500)).hostname.replace(/^www\./, '')
    if (host && host !== getRequestHost(event).replace(/^www\./, '')) referrer = host
  } catch { /* direct or invalid */ }
  // A campaign tag (?utm_source=linkedin) beats the referrer: most apps and
  // email clients send none, so tagged links are the only way to see them.
  const utm = clip(body.u, 40).toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (utm) referrer = `utm:${utm}`

  const rows = await sql`
    insert into app.page_view (visitor, session, user_id, path, locale, referrer, country, device, browser, os)
    values (${visitor}, ${session}, ${user?.id ?? null}, ${path}, ${clip(body.l, 5) || 'en'}, ${referrer},
            ${/^[A-Z]{2}$/.test(country) ? country : null}, ${device(ua)}, ${browser(ua)}, ${os(ua)})
    returning id
  `
  return { id: Number(rows[0]?.id) }
})
