/** "Run now": the hourly prospect:send run (same caps, same window). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await rateLimit(event, 'prospect-run', 10, 60)
  setResponseHeader(event, 'cache-control', 'no-store')
  return await runProspectSend({ trigger: 'admin' })
})
