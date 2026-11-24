/**
 * /admin → Integrations → Outreach mailbox:
 *   { action: 'check' } — SMTP connection check: EHLO + AUTH, then QUIT. Sends nothing.
 *   { action: 'test' }  — one test email to the signed-in admin, through the configured transport.
 * Never returns the password or the AUTH exchange.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  await rateLimit(event, 'outreach-test', 10, 60)
  setResponseHeader(event, 'cache-control', 'no-store')
  const body = await readBody<{ action?: string }>(event).catch(() => null)
  const cfg = outreachConfigFromEnv()

  if (body?.action === 'check') {
    if (!cfg.smtp) throw createError({ statusCode: 409, statusMessage: 'Set SMTP_USER and SMTP_PASS first' })
    try {
      const r = await smtpCheck(cfg.smtp, workerSockets, cfg.from?.address.split('@')[1])
      return { ok: true, transcript: r.transcript.filter(l => !/^C: \[redacted\]/.test(l)).slice(0, 30) }
    } catch (e) {
      return { ok: false, error: String((e as Error).message).slice(0, 200) }
    }
  }

  if (body?.action === 'test') {
    const why = outreachReady(cfg)
    if (why) throw createError({ statusCode: 409, statusMessage: why })
    const settings = await prospectSettings()
    const messageId = newMessageId(cfg.from!.address)
    const unsubscribeUrl = 'https://crmanalytics.imswarnil.com/api/prospect/unsubscribe?p=0&s=test'
    const subject = 'Outreach test from CRM Analytics Academy'
    const text = `This is a test of the outreach mailbox (${cfg.transport}). If it arrived, sending works.\n\nCheck its headers: SPF, DKIM and DMARC should all say pass.`
    const raw = buildMime({ from: cfg.from!.address, fromName: cfg.from!.name ?? settings.senderName, to: admin.email, subject, body: text, unsubscribeUrl, footer: settings.footer, messageId })
    const bodies = mailBodies({ body: text, footer: settings.footer, unsubscribeUrl })
    try {
      const r = await deliver(cfg, { to: admin.email, subject, raw, ...bodies, messageId, inReplyTo: null, references: [], unsubscribeUrl }, { connect: workerSockets, fetch: fetch as never })
      return { ok: true, to: admin.email, transport: r.transport, detail: r.detail }
    } catch (e) {
      return { ok: false, error: String((e as Error).message).slice(0, 200) }
    }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
