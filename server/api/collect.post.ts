/**
 * Milestone events only: { v, n, p, lb } from app/plugins/analytics.client.ts.
 * No page views, no reading time, no click tracking — traffic is Cloudflare
 * Web Analytics. One insert per milestone; the first `sign_up` of an account
 * also becomes a self-serve lead in Salesforce, and every milestone of a
 * signed-in person refreshes their first-party enrichment (server/utils/enrich.ts).
 *
 * No cookies are set and no IP address is stored.
 */
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|monitor|curl|wget|python|node-fetch/i
const ID = /^[a-z0-9]{8,40}$/i
const EVENTS = new Set(['sign_up', 'sign_in', 'lesson_complete', 'exam_finish', 'checkout'])

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : '')

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const ua = getRequestHeader(event, 'user-agent') || ''
  if (!ua || BOT.test(ua)) return { ok: true }

  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad payload' })

  const visitor = clip(body.v, 40)
  const name = clip(body.n, 40)
  const path = clip(body.p, 300)
  if (!ID.test(visitor) || !EVENTS.has(name) || !path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Bad event' })
  }

  await rateLimit(event, 'collect', 60, 10)
  const user = await getSessionUser(event).catch(() => null)
  const sql = useDb()
  await sql`
    insert into app.event (visitor, user_id, name, path, label)
    values (${visitor}, ${user?.id ?? null}, ${name}, ${path}, ${clip(body.lb, 200) || null})
  `
  if (!user) return { ok: true }
  // Every milestone of a signed-in person refreshes their enrichment after the
  // response (enrich.ts): geo + network now, product signals, score. Sign-ups,
  // checkouts and exams always; lessons and sign-ins at most every few hours.
  const touch = touchFrom(event)
  if (name === 'sign_up') {
    const [row] = await sql`select count(*)::int as n from app.event where user_id = ${user.id} and name = 'sign_up'`
    // The label of a sign_up is the visitor's first touch (utm/referrer/direct).
    const source = clip(body.lb, 60).replace(/[^a-z0-9./_-]/gi, '') || 'direct'
    // An account's first sign_up becomes a self-serve lead in Salesforce, enriched.
    if (Number(row?.n) === 1) {
      event.waitUntil(enrichUser(user.id, { touch, event: name, source }).then(en => sendAcademyEvent('signup', user, undefined, source, en)))
    }
  } else {
    const throttleHours = name === 'lesson_complete' ? 6 : name === 'sign_in' ? 24 : 0
    event.waitUntil(enrichUser(user.id, { touch, event: name, throttleHours }))
  }
  return { ok: true }
})
