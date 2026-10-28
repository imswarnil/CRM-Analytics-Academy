import type { H3Event } from 'h3'

/**
 * Bot protection for public write endpoints, in three layers:
 *
 *   1. honeypot  — a hidden `website` field real people never fill in
 *   2. rate limit — per action and client address (hashed), counted in Neon
 *   3. Turnstile — Cloudflare's invisible challenge, verified server-side.
 *      Active only once TURNSTILE_SECRET_KEY (Worker) and
 *      NUXT_PUBLIC_TURNSTILE_SITE_KEY (build) are set; until then it passes.
 *
 * Call `await guard(event, 'comment', { limit: 10, perMinutes: 60, token })`
 * before doing any work.
 */
export async function guard(event: H3Event, action: string, opts: { limit: number, perMinutes: number, token?: string | null, honeypot?: unknown }) {
  if (opts.honeypot) throw createError({ statusCode: 400, statusMessage: 'Rejected' })
  await verifyHuman(event, opts.token)
  await rateLimit(event, action, opts.limit, opts.perMinutes)
}

export async function verifyHuman(event: H3Event, token?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Please complete the human check.' })
  const form = new URLSearchParams({ secret, response: token })
  const ip = clientAddress(event)
  if (ip) form.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
    .then(r => r.json() as Promise<{ success?: boolean }>)
    .catch(() => ({ success: false }))
  if (!res.success) throw createError({ statusCode: 403, statusMessage: 'The human check failed. Please try again.' })
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
