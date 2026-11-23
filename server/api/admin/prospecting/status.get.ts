/**
 * /admin → Prospecting: which providers are connected (by env var — keys are
 * never returned), the Gmail mailbox, settings, the last run, counts.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sql = useDb()
  const [settings, [account], [last], statuses, [sent], [supp], usage] = await Promise.all([
    prospectSettings(),
    sql`select email, status, connected_at from app.mail_account order by connected_at desc limit 1`,
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
    gmail: {
      configured: Boolean(googleConfigFromEnv()),
      email: (account?.email as string | undefined) ?? null,
      status: (account?.status as string | undefined) ?? null,
      connectedAt: account?.connected_at ? String(account.connected_at) : null,
      redirectUri: gmailRedirectUri()
    },
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
