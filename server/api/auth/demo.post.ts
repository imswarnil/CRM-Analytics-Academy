/**
 * "Test ride" — signs the caller into the shared demo account.
 *
 * The credentials live only in the server's environment. The browser posts an
 * empty request here and gets back a session cookie; it never sees, and never
 * needs, the password. That is the whole reason this is a server route rather
 * than a client-side sign-in call with a hardcoded password, which would put
 * working credentials for a real account into the JavaScript bundle.
 *
 * The demo account is deliberately shared and its data is disposable. This is
 * an unauthenticated endpoint that mints sessions, so it is rate-limited per
 * (hashed) address: 10 a minute.
 */
export default defineEventHandler(async (event) => {
  await rateLimit(event, 'demo', 10, 60)
  const email = process.env.DEMO_USER_EMAIL
  const password = process.env.DEMO_USER_PASSWORD
  const base = process.env.NEON_AUTH_BASE_URL

  if (!email || !password || !base) {
    throw createError({ statusCode: 503, statusMessage: 'Demo sign-in is not configured' })
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
