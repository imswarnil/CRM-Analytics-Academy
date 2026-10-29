import type { H3Event } from 'h3'

/**
 * Bot protection for public write endpoints, in three layers:
 *
 *   1. honeypot  — a hidden `website` field real people never fill in
 *   2. rate limit — per action and client address (hashed), counted in Neon
 *   3. captcha   — the site's own proof-of-work check (server/utils/pow.ts),
 *      solved silently in the browser by <HumanCheck>
 *
 * Call `await guard(event, 'comment', { limit: 10, perMinutes: 60, token })`
 * before doing any work.
 */
export async function guard(event: H3Event, action: string, opts: { limit: number, perMinutes: number, token?: string | null, honeypot?: unknown }) {
  if (opts.honeypot) throw createError({ statusCode: 400, statusMessage: 'Rejected' })
  await verifyHuman(event, opts.token)
  await rateLimit(event, action, opts.limit, opts.perMinutes)
}

export async function verifyHuman(_event: H3Event, token?: string | null) {
  await verifyPow(token)
}

export async function rateLimit(event: H3Event, action: string, limit: number, perMinutes: number) {
  const key = await sha256(`${action}:${clientAddress(event) ?? 'unknown'}`)
  const sql = useDb()
  const [row] = await sql`select count(*)::int as n from app.rate_hit where key = ${key} and at > now() - make_interval(mins => ${perMinutes})`
  if (Number(row?.n ?? 0) >= limit) throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Please try again later.' })
  await sql`insert into app.rate_hit (key) values (${key})`
  // Opportunistic cleanup, about one request in fifty.
  if (Math.random() < 0.02) await sql`delete from app.rate_hit where at < now() - interval '1 day'`
}

function clientAddress(event: H3Event) {
  return getRequestHeader(event, 'cf-connecting-ip') ?? getRequestIP(event, { xForwardedFor: true }) ?? null
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}
