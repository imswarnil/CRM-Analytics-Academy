/** The caller's sessions: allowance, used, remaining, bought, unlimited (and why). */
export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event).catch(() => null)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return meterStatus(event, user)
})
