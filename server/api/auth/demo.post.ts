/**
 * "Try the demo" — signs the caller into the shared demo account.
 *
 * The credentials live only in the server's environment. The browser posts an
 * empty request here and gets back a session cookie; it never sees, and never
 * needs, the password. That is the whole reason this is a server route rather
 * than a client-side sign-in call with a hardcoded password, which would put
 * working credentials for a real account into the JavaScript bundle.
 *
 * The demo account is deliberately shared and its data is disposable, so this
 * is rate-limited per IP: it is an unauthenticated endpoint that mints
 * sessions, which is exactly the shape of thing that gets hammered.
 */
const attempts = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

export default defineEventHandler(async (event) => {
  const email = process.env.DEMO_USER_EMAIL
  const password = process.env.DEMO_USER_PASSWORD
  const base = process.env.NEON_AUTH_BASE_URL

  if (!email || !password || !base) {
    throw createError({ statusCode: 503, statusMessage: 'Demo sign-in is not configured' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()
  const seen = attempts.get(ip)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many demo sign-ins. Try again in a minute.' })
    }
    seen.count += 1
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const upstream = await fetch(`${base}/sign-in/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': getRequestOrigin(event)
    },
    body: JSON.stringify({ email, password })
  })

  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Demo account is unavailable' })
  }

  for (const cookie of upstream.headers.getSetCookie?.() ?? []) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, demo: true }
})
