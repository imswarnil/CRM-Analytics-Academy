/** /admin → Integrations → "Sync now": one sync run, same caps as the hourly one. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await rateLimit(event, 'sf-sync', 6, 60)
  setResponseHeader(event, 'cache-control', 'no-store')
  return await runSalesforceSync({ trigger: 'admin' })
})
