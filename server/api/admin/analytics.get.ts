/**
 * Traffic for /admin → Analytics, from app.page_view and app.event.
 *
 *   GET /api/admin/analytics?days=30     (1–365)
 *
 * One round trip of parallel queries. Durations are the median and average
 * of views that reported a time (a view closed before 0.5 s reports none).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const days = Math.min(Math.max(Number(getQuery(event).days) || 30, 1), 365)
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const sql = useDb()

  const top = (column: 'path' | 'country' | 'device' | 'browser' | 'os' | 'referrer' | 'locale', limit = 10) => sql.query(
    `select ${column} as key, count(*)::int as views, count(distinct visitor)::int as visitors,
            coalesce(round(avg(nullif(duration_ms, 0)) / 1000), 0)::int as avg_s
     from app.page_view where created_at >= $1 and ${column} is not null
     group by 1 order by views desc limit ${limit}`,
    [since]
  )

  const [totals, series, pages, countries, devices, browsers, oses, referrers, locales, events, funnel, live, recent] = await Promise.all([
    sql`
      select count(*)::int as views,
             count(distinct visitor)::int as visitors,
             count(distinct session)::int as sessions,
             coalesce(round(avg(nullif(duration_ms, 0)) / 1000), 0)::int as avg_s,
             coalesce(round(percentile_cont(0.5) within group (order by nullif(duration_ms, 0)) / 1000), 0)::int as median_s,
             count(distinct user_id)::int as signed_in_visitors
      from app.page_view where created_at >= ${since}
    `,
    sql`
      select date_trunc('day', created_at)::date::text as day, count(*)::int as views, count(distinct visitor)::int as visitors
      from app.page_view where created_at >= ${since}
      group by 1 order by 1
    `,
    top('path', 20),
    top('country', 15),
    top('device', 3),
    top('browser', 8),
    top('os', 8),
    top('referrer', 12),
    top('locale', 12),
    sql`
      select name, count(*)::int as n, count(distinct visitor)::int as visitors
      from app.event where created_at >= ${since}
      group by 1 order by n desc
    `,
    sql`
      select path, label, name, count(*)::int as n
      from app.event where created_at >= ${since} and name in ('sign_in_click', 'sign_up_click')
      group by 1, 2, 3 order by n desc limit 15
    `,
    sql`select count(distinct visitor)::int as n from app.page_view where created_at >= now() - interval '5 minutes'`,
    sql`
      select path, country, device, browser, duration_ms, created_at, user_id is not null as signed_in
      from app.page_view order by id desc limit 25
    `
  ])

  // Bounce: sessions with exactly one view.
  const [bounce] = await sql`
    select coalesce(round(100.0 * count(*) filter (where n = 1) / nullif(count(*), 0)), 0)::int as pct
    from (select session, count(*) as n from app.page_view where created_at >= ${since} group by session) s
  `

  // Dense daily series so the chart has every day, zeros included.
  const byDay = new Map(series.map(r => [String(r.day), r]))
  const dense = Array.from({ length: Math.min(days, 90) }, (_, i) => {
    const day = new Date(Date.now() - (Math.min(days, 90) - 1 - i) * 86_400_000).toISOString().slice(0, 10)
    const r = byDay.get(day)
    return { day, views: Number(r?.views ?? 0), visitors: Number(r?.visitors ?? 0) }
  })

  const rows = (list: Record<string, unknown>[]) => list.map(r => ({ key: String(r.key), views: Number(r.views), visitors: Number(r.visitors), avgSeconds: Number(r.avg_s) }))
  const t = totals[0] ?? {}

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    days,
    totals: {
      views: Number(t.views ?? 0),
      visitors: Number(t.visitors ?? 0),
      sessions: Number(t.sessions ?? 0),
      avgSeconds: Number(t.avg_s ?? 0),
      medianSeconds: Number(t.median_s ?? 0),
      signedInVisitors: Number(t.signed_in_visitors ?? 0),
      bouncePct: Number(bounce?.pct ?? 0),
      liveNow: Number(live[0]?.n ?? 0)
    },
    series: dense,
    pages: rows(pages),
    countries: rows(countries),
    devices: rows(devices),
    browsers: rows(browsers),
    os: rows(oses),
    referrers: rows(referrers),
    locales: rows(locales),
    events: events.map(r => ({ name: String(r.name), count: Number(r.n), visitors: Number(r.visitors) })),
    authClicks: funnel.map(r => ({ name: String(r.name), path: String(r.path), label: r.label ? String(r.label) : null, count: Number(r.n) })),
    recent: recent.map(r => ({ path: String(r.path), country: r.country as string | null, device: String(r.device), browser: r.browser as string | null, seconds: Math.round(Number(r.duration_ms) / 1000), at: r.created_at, signedIn: Boolean(r.signed_in) }))
  }
})
