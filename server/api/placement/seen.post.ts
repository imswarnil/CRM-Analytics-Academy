/**
 * Impression beacon: `{ ids: [creativeId, …] }`, one id per slot that came
 * into view, sent with navigator.sendBeacon. Ids that are not this month's
 * live creatives are ignored, so the counters cannot be pointed at anything
 * else. Nothing about the reader is stored — only a per-creative, per-day
 * count.
 */
export default defineEventHandler(async (event) => {
  let ids: string[] = []
  try {
    const raw = await readRawBody(event, 'utf8')
    const parsed = JSON.parse(raw || '{}') as { ids?: unknown }
    ids = Array.isArray(parsed.ids) ? parsed.ids.map(String).slice(0, 20) : []
  } catch {
    // Malformed beacon: nothing to count.
  }
  setResponseStatus(event, 204)
  if (!ids.length || !process.env.DATABASE_URL) return null

  const current = await memo('placement:current', 60_000, () =>
    edgeCached(event, PLACEMENT_CACHE_KEY, 300, loadCurrentPlacement)
  )
  const live = new Set(Object.values(current.creatives).map(c => c.id))
  const counts = new Map<string, number>()
  for (const id of ids) if (live.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1)
  if (!counts.size) return null

  const write = (async () => {
    const sql = useDb()
    for (const [id, n] of counts) {
      await sql`
        insert into app.sponsor_stat (creative_id, day, impressions) values (${id}::uuid, (now() at time zone 'utc')::date, ${n})
        on conflict (creative_id, day) do update set impressions = app.sponsor_stat.impressions + excluded.impressions
      `
    }
  })().catch(e => console.error('placement: impression write failed', e))

  // Answer the beacon at once; the write finishes in the background.
  const ctx = event.context.cloudflare?.context as { waitUntil?: (p: Promise<unknown>) => void } | undefined
  if (ctx?.waitUntil) ctx.waitUntil(write)
  else await write
  return null
})
