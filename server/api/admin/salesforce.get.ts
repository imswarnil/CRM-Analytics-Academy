/**
 * /admin → Integrations: the Salesforce account sync — configured or not, the
 * last runs, what is in sync, the latest record errors. Never returns a secret:
 * only the instance host.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const cfg = sfConfigFromEnv()
  const sql = useDb()
  const [runs, counts, errors] = await Promise.all([
    sql`select id, trigger, status, candidates, changed, sent, created, updated, failed, calls, error, started_at, finished_at
          from app.sf_sync_run order by id desc limit 10`,
    sql`select kind, count(*)::int as n, count(*) filter (where status <> 'ok')::int as failing, max(synced_at) as last
          from app.sf_sync group by kind`,
    sql`select kind, ext_id, status, synced_at from app.sf_sync where status <> 'ok' order by synced_at desc limit 10`
  ])
  const recent = runs.slice(0, 3)
  return {
    configured: Boolean(cfg),
    instance: cfg ? new URL(cfg.instanceUrl).host : null,
    apiVersion: cfg?.apiVersion ?? null,
    paused: recent.length === 3 && recent.every(r => r.status === 'auth_failed'),
    runs: runs.map(r => ({
      id: Number(r.id), trigger: String(r.trigger), status: String(r.status), candidates: Number(r.candidates), changed: Number(r.changed),
      sent: Number(r.sent), created: Number(r.created), updated: Number(r.updated), failed: Number(r.failed), calls: Number(r.calls),
      error: (r.error as string | null) ?? null, startedAt: String(r.started_at), finishedAt: r.finished_at ? String(r.finished_at) : null
    })),
    counts: counts.map(r => ({ kind: String(r.kind), count: Number(r.n), failing: Number(r.failing), last: r.last ? String(r.last) : null })),
    errors: errors.map(r => ({ kind: String(r.kind), extId: String(r.ext_id), status: String(r.status), at: String(r.synced_at) }))
  }
})
