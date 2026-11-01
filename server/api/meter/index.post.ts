/**
 * Opening a metered page: { path }. Returns { ok, charged, status }. `ok:
 * false` means no sessions are left — the page shows the wall. Non-metered
 * paths are always ok and never recorded.
 */
export default defineEventHandler(async (event) => {
  await rateLimit(event, 'meter', 120, 10)
  const body = await readBody<{ path?: string }>(event).catch(() => null)
  const raw = String(body?.path ?? '').slice(0, 200)
  // Locale-stripped, so one page is one session in any language.
  const path = raw.replace(/^\/(es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (!/^\/[a-z0-9/-]*$/.test(path)) throw createError({ statusCode: 400, statusMessage: 'Bad path' })
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const user = await getSessionUser(event).catch(() => null)
  if (!isMeteredPath(path)) return { ok: true, charged: false, status: await meterStatus(event, user) }
  return chargeSession(event, user, path)
})
