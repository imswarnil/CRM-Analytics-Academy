/**
 * Hourly (scheduledTasks in nuxt.config.ts): poll outreach threads for
 * replies and bounces, then send due sequence steps from the connected Gmail
 * mailbox under the daily cap (server/utils/prospect-send.ts). Without
 * GOOGLE_CLIENT_ID/SECRET or a connected mailbox it does nothing.
 */
export default defineTask({
  meta: { name: 'prospect:send', description: 'Send due outreach steps and poll replies' },
  async run() {
    const r = await runProspectSend({ trigger: 'cron' })
    console.log(`prospect:send ${r.status}: ${r.sent} sent (cap ${r.cap}, ${r.sentLastDay} in 24h), ${r.polled} polled, ${r.replies} replies, ${r.bounces} bounces, ${r.waiting} waiting${r.errors.length ? ` — ${r.errors[0]}` : ''}`)
    return { result: { status: r.status, sent: r.sent } }
  }
})
