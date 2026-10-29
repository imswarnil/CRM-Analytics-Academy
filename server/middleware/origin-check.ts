/**
 * CSRF guard: a state-changing request to /api that says it comes from
 * another site is refused. Browsers always send Origin on cross-site POSTs, so
 * this closes the door even if a cookie's SameSite setting ever changes.
 * Requests with no Origin (curl, server-to-server) are left to each route's
 * own auth; /mcp is a public read-only endpoint other tools call.
 */
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  if (SAFE.has(event.method)) return
  if (!event.path.startsWith('/api/')) return
  const origin = getRequestHeader(event, 'origin')
  if (!origin || origin === 'null') return
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  if (host !== getRequestHost(event, { xForwardedHost: false })) {
    throw createError({ statusCode: 403, statusMessage: 'Cross-site request refused' })
  }
})
