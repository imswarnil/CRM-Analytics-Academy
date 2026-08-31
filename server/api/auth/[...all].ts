/**
 * Reverse proxy in front of Neon Auth.
 *
 * The browser could talk to the Neon Auth host directly — it is CORS-enabled
 * for the trusted domains — but then the session cookie is third-party. Safari
 * and Firefox partition or drop those by default, and Chrome is heading the
 * same way, so a sign-in that works in development quietly stops working for a
 * chunk of real users.
 *
 * Proxying through our own origin makes the cookie first-party. It also means
 * the auth host never appears in client code, so it cannot be probed or
 * misconfigured from the browser.
 */
export default defineEventHandler(async (event) => {
  const base = process.env.NEON_AUTH_BASE_URL
  if (!base) {
    throw createError({ statusCode: 500, statusMessage: 'NEON_AUTH_BASE_URL is not configured' })
  }

  const path = (getRouterParam(event, 'all') || '').replace(/^\/+/, '')
  const query = getQuery(event)
  const search = new URLSearchParams(query as Record<string, string>).toString()
  const target = `${base}/${path}${search ? `?${search}` : ''}`

  const method = event.method
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await readRawBody(event)

  const upstream = await fetch(target, {
    method,
    headers: {
      'content-type': getRequestHeader(event, 'content-type') ?? 'application/json',
      // Forwarded so the session travels; nothing else from the request is
      // passed on, so a client cannot smuggle its own auth headers through.
      'cookie': getRequestHeader(event, 'cookie') ?? '',
      'origin': getRequestOrigin(event),
      'user-agent': getRequestHeader(event, 'user-agent') ?? ''
    },
    body,
    redirect: 'manual'
  })

  // Set-Cookie has to be relayed one header at a time; a joined string is a
  // single malformed cookie rather than several valid ones.
  const setCookies = upstream.headers.getSetCookie?.() ?? []
  for (const cookie of setCookies) {
    appendResponseHeader(event, 'set-cookie', cookie)
  }

  setResponseStatus(event, upstream.status)
  const contentType = upstream.headers.get('content-type')
  if (contentType) setResponseHeader(event, 'content-type', contentType)
  // A session response must never be cached by an intermediary.
  setResponseHeader(event, 'cache-control', 'no-store')

  return upstream.body ? await upstream.text() : null
})
