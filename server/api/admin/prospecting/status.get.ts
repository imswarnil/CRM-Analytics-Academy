/**
 * /admin → Prospecting: which providers are connected (by env var — keys are
 * never returned), the outreach transport (SMTP or n8n; never the password),
 * the last event n8n posted, settings, the last run, counts.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sql = useDb()
  const [settings, [inbound], [last], statuses, [sent], [supp], usage] = await Promise.all([
    prospectSettings(),
    sql`select type, matched_by, at, (select count(*) from app.prospect_inbound where at > now() - interval '7 days')::int as week from app.prospect_inbound order by id desc limit 1`,
    sql`select value from app.prospect_setting where key = 'last_run'`,
    sql`select status, count(*)::int as n from app.prospect group by 1`,
    sql`select count(*) filter (where sent_at > now() - interval '24 hours')::int as day, count(*)::int as total from app.prospect_message`,
    sql`select count(*)::int as n from app.prospect_suppression`,
    sql`select provider, count(*) filter (where not cached)::int as paid, count(*) filter (where cached)::int as cached
          from app.provider_call where at > now() - interval '30 days' group by 1`
  ])
  const env = process.env as Record<string, string | undefined>
  return {
    providers: PROVIDERS.map(p => ({
      id: p.id,
      label: p.label,
      env: p.env,
      capabilities: p.capabilities,
      configured: Boolean(env[p.env]?.trim()),
      implemented: p.capabilities.length > 0,
      calls30d: Number(usage.find(u => u.provider === p.id)?.paid ?? 0),
      cacheHits30d: Number(usage.find(u => u.provider === p.id)?.cached ?? 0)
    })),
    outreach: (() => {
      const cfg = outreachConfigFromEnv()
      return {
        transport: cfg.transport,
        ready: outreachReady(cfg) === null,
        problem: outreachReady(cfg),
        from: cfg.from ? (cfg.from.name ? `${cfg.from.name} <${cfg.from.address}>` : cfg.from.address) : null,
        smtp: cfg.smtp ? { host: cfg.smtp.host, port: cfg.smtp.port, user: cfg.smtp.user } : null,
        n8nSend: Boolean(cfg.n8nSendUrl),
        inboundConfigured: Boolean(cfg.webhookSecret),
        lastInbound: inbound ? { type: String(inbound.type), matchedBy: (inbound.matched_by as string | null) ?? null, at: String(inbound.at), week: Number(inbound.week) } : null
      }
    })(),
    settings,
    lastRun: last?.value ?? null,
    counts: {
      byStatus: Object.fromEntries(statuses.map(r => [String(r.status), Number(r.n)])),
      sentLastDay: Number(sent?.day ?? 0),
      sentTotal: Number(sent?.total ?? 0),
      suppressed: Number(supp?.n ?? 0)
    }
  }
})
