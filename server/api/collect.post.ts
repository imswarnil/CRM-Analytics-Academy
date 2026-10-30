/**
 * First-party analytics: page views, time on page and a few named clicks.
 * Sent by app/plugins/analytics.client.ts, read by /admin → Analytics.
 *
 *   { t: 'pv', v, s, p, l, r }      a page view → returns { id }
 *   { t: 'leave', v, id, ms }       time spent on that view
 *   { t: 'ev', v, s, n, p, lb }     a named event (sign_in_click, sign_up_click, …)
 *   { t: 'human', v }               the browser saw a real interaction → app.human_visitor
 *
 * Bots are dropped and counted per day in app.bot_drop: a crawler user agent,
 * an automated browser (the client sends `a: 1` when navigator.webdriver is
 * set), or a visitor sending more than FLOOD views in ten minutes.
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
const EVENTS = new Set(['sign_in_click', 'sign_up_click', 'sign_up', 'sign_in', 'lesson_complete', 'quiz_submit', 'search_open', 'outbound', 'bookmark', 'copy_page', 'youtube_click', 'popup_close', 'promo_close', 'share', 'exam_start', 'exam_finish', 'interview_submit', 'contribute', 'product_view', 'lead', 'waitlist', 'pro_locked', 'pricing_view', 'plan_click', 'redeem', 'org_join', 'salesforce_interest', 'visualiser_run', 'exam_open'])

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

const FLOOD = 120
async function dropBot(reason: 'ua' | 'automation' | 'flood') {
  await useDb()`insert into app.bot_drop (reason, n) values (${reason}, 1) on conflict (day, reason) do update set n = app.bot_drop.n + 1`.catch(() => null)
  return { ok: true }
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const ua = getRequestHeader(event, 'user-agent') || ''
  if (!ua || BOT.test(ua)) return dropBot('ua')

  let body: Record<string, unknown>
  try {
    const raw = await readRawBody(event, 'utf8')
    body = JSON.parse(raw || '{}')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Bad payload' })
  }

  const visitor = clip(body.v, 40)
  if (!ID.test(visitor)) throw createError({ statusCode: 400, statusMessage: 'Bad visitor' })
  if (body.a === 1) return dropBot('automation')
  const sql = useDb()

  if (body.t === 'human') {
    // Only a visitor the collector has already seen can be marked human.
    await sql`
      insert into app.human_visitor (visitor)
      select ${visitor} where exists (select 1 from app.page_view where visitor = ${visitor} and created_at > now() - interval '1 day')
      on conflict do nothing`
    return { ok: true }
  }

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
    // How this account found us, frozen at sign-up: the visitor's first view
    // and the sign-up link they clicked last.
    if (name === 'sign_up' && user) {
      const first = await sql`
        insert into app.user_attribution (user_id, visitor, first_source, first_landing, first_seen, signup_path, signup_label, views_before)
        select ${user.id}, ${visitor},
               coalesce((array_agg(v.referrer order by v.created_at))[1], 'direct'),
               (array_agg(v.path order by v.created_at))[1],
               min(v.created_at),
               (select e.path from app.event e where e.visitor = ${visitor} and e.name = 'sign_up_click' order by e.id desc limit 1),
               (select e.label from app.event e where e.visitor = ${visitor} and e.name = 'sign_up_click' order by e.id desc limit 1),
               count(v.*)::int
        from app.page_view v where v.visitor = ${visitor}
        on conflict (user_id) do nothing
        returning user_id
      `
      // First time only (the insert above is once per account): the new
      // account becomes a self-serve lead in Salesforce.
      if (first.length) event.waitUntil(sendAcademyEvent('signup', user))
    }
    return { ok: true }
  }

  if (body.t !== 'pv') throw createError({ statusCode: 400, statusMessage: 'Unknown type' })
  const [flood] = await sql`select count(*)::int as n from app.page_view where visitor = ${visitor} and created_at > now() - interval '10 minutes'`
  if (Number(flood?.n ?? 0) >= FLOOD) return dropBot('flood')

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
