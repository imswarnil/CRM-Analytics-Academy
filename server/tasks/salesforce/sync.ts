/**
 * Hourly (scheduledTasks in nuxt.config.ts, the same cron as the journeys).
 * Upserts changed active self-serve learners, team orgs and seats into
 * Salesforce (server/utils/sf-sync.ts). Without SF_INSTANCE_URL /
 * SF_CLIENT_ID / SF_CLIENT_SECRET it does nothing and says so.
 */
export default defineTask({
  meta: { name: 'salesforce:sync', description: 'Sync active accounts, orgs and seats to Salesforce' },
  async run() {
    const r = await runSalesforceSync({ trigger: 'cron' })
    console.log(`salesforce:sync ${r.status}: ${r.changed} changed, ${r.sent} sent (${r.created} new, ${r.updated} updated), ${r.failed} failed, ${r.calls} calls${r.errors.length ? ` — ${r.errors[0]}` : ''}`)
    return { result: { status: r.status, sent: r.sent, failed: r.failed } }
  }
})
