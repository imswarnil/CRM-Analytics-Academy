/**
 * Hourly (scheduledTasks in nuxt.config.ts): send due outreach steps through
 * the outreach transport — Hostinger SMTP from the Worker, or n8n — under the
 * daily cap (server/utils/prospect-send.ts). Replies and bounces come in from
 * n8n (/api/prospect/inbound). Without SMTP/n8n settings it does nothing.
 */
export default defineTask({
  meta: { name: 'prospect:send', description: 'Send due outreach steps' },
  async run() {
    const r = await runProspectSend({ trigger: 'cron' })
    console.log(`prospect:send ${r.status} via ${r.transport}: ${r.sent} sent (cap ${r.cap}, ${r.sentLastDay} in 24h), ${r.waiting} waiting, ${r.stopped} stopped${r.errors.length ? ` — ${r.errors[0]}` : ''}`)
    return { result: { status: r.status, sent: r.sent } }
  }
})
