/**
 * Hourly (scheduledTasks in nuxt.config.ts + triggers.crons in wrangler.jsonc).
 * Sends whatever journey emails are due; without RESEND_API_KEY it only logs
 * how many would have gone.
 */
export default defineTask({
  meta: { name: 'email:journeys', description: 'Send due journey emails' },
  async run() {
    const r = await runJourneys()
    console.log(`journeys: ${r.due.length} due, ${r.sent} sent${r.dry ? ' (dry: no RESEND_API_KEY)' : ''}${r.failed.length ? `, failed: ${r.failed.join('; ')}` : ''}`)
    return { result: { due: r.due.length, sent: r.sent, failed: r.failed.length } }
  }
})
