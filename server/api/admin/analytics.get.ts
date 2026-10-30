/**
 * Traffic for /admin → Analytics, from app.page_view and app.event.
 *
 *   GET /api/admin/analytics?days=30&humans=1     (1–365; humans=0 includes unverified visitors)
 *
 * By default every number counts only visitors the browser has shown to be
 * human (app.human_page_view / app.human_event). `bots` says how much was
 * left out and how much the collector dropped outright; `journeys` is the
 * path of the most recent visitors, from source to sign-up.
 *
 * One round trip of parallel queries. Durations are the median and average
 * of views that reported a time (a view closed before 0.5 s reports none).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const days = Math.min(Math.max(Number(getQuery(event).days) || 30, 1), 365)
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const sql = useDb()
  const humans = getQuery(event).humans !== '0'
  const PVT = humans ? 'app.human_page_view' : 'app.page_view'
  const EVT = humans ? 'app.human_event' : 'app.event'
  const PV = sql.unsafe(PVT)
  const EV = sql.unsafe(EVT)

  const top = (column: 'path' | 'country' | 'device' | 'browser' | 'os' | 'referrer' | 'locale', limit = 10) => sql.query(
    `select ${column} as key, count(*)::int as views, count(distinct visitor)::int as visitors,
            coalesce(round(avg(nullif(duration_ms, 0)) / 1000), 0)::int as avg_s
     from ${PVT} where created_at >= $1 and ${column} is not null
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
      from ${PV} where created_at >= ${since}
    `,
    sql`
      select date_trunc('day', created_at)::date::text as day, count(*)::int as views, count(distinct visitor)::int as visitors
      from ${PV} where created_at >= ${since}
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
      from ${EV} where created_at >= ${since}
      group by 1 order by n desc
    `,
    sql`
      select path, label, name, count(*)::int as n
      from ${EV} where created_at >= ${since} and name in ('sign_in_click', 'sign_up_click')
      group by 1, 2, 3 order by n desc limit 15
    `,
    sql`select count(distinct visitor)::int as n from ${PV} where created_at >= now() - interval '5 minutes'`,
    sql`
      select path, country, device, browser, duration_ms, created_at, user_id is not null as signed_in
      from ${PV} order by id desc limit 25
    `
  ])

  // Conversion. Per visitor in the window: engaged (2+ views or 30 s+),
  // clicked sign-up, signed up, and took a learning action. Sources and
  // landing pages come from each visitor's first view in the window.
  const perVisitor = `
    v as (select visitor, count(*) as n, sum(duration_ms) as d from ${PVT} where created_at >= $1 group by visitor),
    e as (select visitor,
                 bool_or(name = 'sign_up_click') as clicked,
                 bool_or(name = 'sign_up') as signed_up,
                 bool_or(name in ('lesson_complete', 'quiz_submit', 'exam_start', 'exam_finish')) as learned
          from ${EVT} where created_at >= $1 group by visitor),
    f as (select distinct on (visitor) visitor, path, referrer from ${PVT} where created_at >= $1 order by visitor, created_at)`
  const [conv, bySource, byLanding] = await Promise.all([
    sql.query(`with ${perVisitor}
      select count(*)::int as visitors,
             count(*) filter (where v.n >= 2 or v.d >= 30000)::int as engaged,
             count(*) filter (where e.clicked)::int as clicked,
             count(*) filter (where e.signed_up)::int as signed_up,
             count(*) filter (where e.learned)::int as learned
      from v left join e using (visitor)`, [since]),
    sql.query(`with ${perVisitor}
      select coalesce(nullif(regexp_replace(coalesce(f.referrer, ''), '^https?://(www\\.)?([^/]+).*$', '\\2'), ''), 'direct') as key,
             count(*)::int as visitors, count(*) filter (where e.signed_up)::int as signups,
             count(*) filter (where e.learned)::int as learners
      from f left join e using (visitor) group by 1 order by visitors desc limit 12`, [since]),
    sql.query(`with ${perVisitor}
      select f.path as key, count(*)::int as visitors, count(*) filter (where e.signed_up)::int as signups,
             count(*) filter (where e.learned)::int as learners
      from f left join e using (visitor) group by 1 order by visitors desc limit 15`, [since])
  ])
  // Buying intent, per visitor: saw pricing → clicked a plan → redeemed Pro
  // with points or asked for seats/help (a lead). Plus where leads and
  // sign-ups came from, by each person's first recorded source.
  const [intent, leadSources, signupSources, interests] = await Promise.all([
    sql`
      select count(distinct visitor) filter (where name = 'pricing_view')::int as pricing,
             count(distinct visitor) filter (where name = 'plan_click')::int as plan_click,
             count(distinct visitor) filter (where name = 'redeem')::int as redeemed,
             count(distinct visitor) filter (where name = 'lead')::int as leads,
             count(distinct visitor) filter (where name = 'pro_locked')::int as locked,
             count(distinct visitor) filter (where name = 'salesforce_interest')::int as salesforce,
             count(distinct visitor) filter (where name = 'org_join')::int as org_join
      from ${EV} where created_at >= ${since}`,
    sql`
      select coalesce(source, 'direct') as key, count(*)::int as n, coalesce(sum(seats), 0)::int as seats,
             count(*) filter (where status = 'won')::int as won
      from app.lead where created_at >= ${since} group by 1 order by n desc limit 12`,
    sql`
      select coalesce(first_source, 'direct') as key, count(*)::int as n,
             coalesce(round(avg(views_before)), 0)::int as views
      from app.user_attribution where created_at >= ${since} group by 1 order by n desc limit 12`,
    sql`select interest as key, count(*)::int as n from app.lead where created_at >= ${since} group by 1 order by n desc`
  ])
  const [botRow, dropped, journeys] = await Promise.all([
    sql`
      select count(*)::int as views,
             count(*) filter (where h.visitor is null)::int as unverified_views,
             count(distinct p.visitor)::int as visitors,
             count(distinct p.visitor) filter (where h.visitor is null)::int as unverified_visitors
      from app.page_view p left join app.human_visitor h using (visitor)
      where p.created_at >= ${since}`,
    sql`select reason, sum(n)::int as n from app.bot_drop where day >= ${since}::date group by 1 order by 2 desc`,
    // The latest visitors' paths: source → pages in order → what they did.
    sql`
      with recent as (
        select visitor, max(created_at) as last_at from ${PV}
        where created_at >= ${since} group by visitor order by last_at desc limit 30
      )
      select r.visitor, r.last_at,
             (select coalesce(v.referrer, 'direct') from app.page_view v where v.visitor = r.visitor order by v.created_at limit 1) as source,
             (select v.country from app.page_view v where v.visitor = r.visitor and v.country is not null order by v.created_at desc limit 1) as country,
             (select v.device from app.page_view v where v.visitor = r.visitor order by v.created_at desc limit 1) as device,
             (select min(v.created_at) from app.page_view v where v.visitor = r.visitor) as first_at,
             (select coalesce(sum(v.duration_ms), 0)::int from app.page_view v where v.visitor = r.visitor) as ms,
             (select bool_or(v.user_id is not null) from app.page_view v where v.visitor = r.visitor) as signed_in,
             exists (select 1 from app.human_visitor h where h.visitor = r.visitor) as human,
             (select json_agg(x order by x.at) from (
                select 'view' as kind, v.path as label, v.created_at as at, round(v.duration_ms / 1000.0)::int as s from app.page_view v where v.visitor = r.visitor
                union all
                select 'event', e.name || coalesce(' · ' || e.label, ''), e.created_at, null from app.event e
                  where e.visitor = r.visitor and e.name in ('sign_up_click', 'sign_up', 'sign_in', 'lead', 'redeem', 'org_join', 'pricing_view', 'plan_click', 'lesson_complete', 'quiz_submit', 'exam_start', 'pro_locked', 'outbound', 'youtube_click')
                order by at desc limit 25
             ) x) as steps
      from recent r order by r.last_at desc`
  ])
  const b = botRow[0] ?? {}
  const i = intent[0] ?? {}
  const c = conv[0] ?? {}
  const convRows = (list: Record<string, unknown>[]) => list.map(r => ({ key: String(r.key), visitors: Number(r.visitors), signups: Number(r.signups), learners: Number(r.learners) }))

  // Bounce: sessions with exactly one view.
  const [bounce] = await sql`
    select coalesce(round(100.0 * count(*) filter (where n = 1) / nullif(count(*), 0)), 0)::int as pct
    from (select session, count(*) as n from ${PV} where created_at >= ${since} group by session) s
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
    funnel: [
      { step: 'visitors', count: Number(c.visitors ?? 0) },
      { step: 'engaged', count: Number(c.engaged ?? 0) },
      { step: 'clicked', count: Number(c.clicked ?? 0) },
      { step: 'signed_up', count: Number(c.signed_up ?? 0) },
      { step: 'learned', count: Number(c.learned ?? 0) }
    ],
    humansOnly: humans,
    bots: {
      views: Number(b.views ?? 0),
      unverifiedViews: Number(b.unverified_views ?? 0),
      visitors: Number(b.visitors ?? 0),
      unverifiedVisitors: Number(b.unverified_visitors ?? 0),
      dropped: dropped.map(r => ({ reason: String(r.reason), count: Number(r.n) }))
    },
    journeys: journeys.map(r => ({
      visitor: String(r.visitor).slice(0, 6),
      source: String(r.source ?? 'direct'),
      country: r.country as string | null,
      device: r.device as string | null,
      firstAt: r.first_at,
      lastAt: r.last_at,
      seconds: Math.round(Number(r.ms) / 1000),
      signedIn: Boolean(r.signed_in),
      human: Boolean(r.human),
      steps: ((r.steps ?? []) as { kind: string, label: string, at: string, s: number | null }[]).map(x => ({ kind: x.kind, label: x.label, at: x.at, seconds: x.s }))
    })),
    intent: [
      { step: 'pricing', count: Number(i.pricing ?? 0) },
      { step: 'locked', count: Number(i.locked ?? 0) },
      { step: 'plan_click', count: Number(i.plan_click ?? 0) },
      { step: 'redeemed', count: Number(i.redeemed ?? 0) },
      { step: 'leads', count: Number(i.leads ?? 0) },
      { step: 'org_join', count: Number(i.org_join ?? 0) },
      { step: 'salesforce', count: Number(i.salesforce ?? 0) }
    ],
    leadSources: leadSources.map(r => ({ key: String(r.key), count: Number(r.n), seats: Number(r.seats), won: Number(r.won) })),
    signupSources: signupSources.map(r => ({ key: String(r.key), count: Number(r.n), views: Number(r.views) })),
    interests: interests.map(r => ({ key: String(r.key ?? 'other'), count: Number(r.n) })),
    conversionBySource: convRows(bySource),
    conversionByLanding: convRows(byLanding),
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
