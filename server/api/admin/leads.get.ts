/**
 * /admin → Leads.
 *   ?view=requests (default) — "talk to us" requests, newest first, with their
 *     enrichment (company, location, network, domain type), score and reasons,
 *     product signals, Web-to-Lead status and account-sync state.
 *   ?view=accounts — self-serve accounts by score (app.enrichment by user),
 *     with the same enrichment and their Salesforce sync state.
 */
interface Enriched {
  emailDomain: string | null
  domainKind: string | null
  company: string | null
  website: string | null
  linkedin: string | null
  logo: string | null
  description: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  networkOrg: string | null
  networkKind: string | null
  firstTouch: string | null
  lastEvent: string | null
  score: number
  fit: number
  engagement: number
  grade: string
  reasons: { points: number, kind: string, why: string }[]
  signals: Record<string, unknown>
  enrichedAt: string | null
}

function enriched(r: Record<string, unknown>): Enriched | null {
  if (r.e_score === null || r.e_score === undefined) return null
  return {
    emailDomain: (r.email_domain as string | null) ?? null,
    domainKind: (r.domain_kind as string | null) ?? null,
    company: (r.e_company as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    linkedin: (r.linkedin as string | null) ?? null,
    logo: (r.logo as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    country: (r.e_country as string | null) ?? null,
    region: (r.region as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    timezone: (r.timezone as string | null) ?? null,
    networkOrg: (r.as_org as string | null) ?? null,
    networkKind: (r.network_kind as string | null) ?? null,
    firstTouch: (r.first_touch as string | null) ?? null,
    lastEvent: (r.last_event as string | null) ?? null,
    score: Number(r.e_score),
    fit: Number(r.fit ?? 0),
    engagement: Number(r.engagement ?? 0),
    grade: String(r.grade ?? 'Cold'),
    reasons: (r.reasons as Enriched['reasons']) ?? [],
    signals: (r.signals as Record<string, unknown>) ?? {},
    enrichedAt: r.enriched_at ? String(r.enriched_at) : null
  }
}

const sync = (r: Record<string, unknown>) => (r.sync_status ? { status: String(r.sync_status), at: String(r.synced_at), sfId: (r.sf_id as string | null) ?? null } : null)

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const status = String(q.status ?? '')
  const sql = useDb()
  setResponseHeader(event, 'cache-control', 'private, no-store')

  if (q.view === 'accounts') {
    const rows = await sql`
      select e.*, e.score as e_score, e.company as e_company, e.country as e_country, e.updated_at as enriched_at,
             d.website, d.linkedin, d.logo, d.description, u.email, u.name, u."createdAt" as signed_up,
             s.status as sync_status, s.synced_at, s.sf_id
        from app.enrichment e
        join neon_auth."user" u on u.id::text = e.user_id
        left join app.company_domain d on d.domain = e.email_domain
        left join app.sf_sync s on s.kind = 'learner' and s.ext_id = e.user_id
       where e.user_id is not null
       order by e.score desc, e.updated_at desc
       limit 200`
    return {
      accounts: rows.map(r => ({
        userId: String(r.user_id), email: String(r.email), name: (r.name as string | null) ?? null, signedUp: String(r.signed_up),
        enrichment: enriched(r), sync: sync(r)
      }))
    }
  }

  const leadFilter = /^(new|contacted|won|lost)$/.test(status) ? status : null
  const rows = await sql`
    select l.*, e.score as e_score, e.company as e_company, e.country as e_country, e.updated_at as enriched_at,
           e.email_domain, e.domain_kind, e.region, e.city, e.timezone, e.as_org, e.network_kind, e.first_touch, e.last_event,
           e.fit, e.engagement, e.grade, e.reasons, e.signals,
           d.website, d.linkedin, d.logo, d.description,
           s.status as sync_status, s.synced_at, s.sf_id
      from app.lead l
      left join app.enrichment e on e.lead_id = l.id
      left join app.company_domain d on d.domain = e.email_domain
      left join app.sf_sync s on s.kind = 'learner' and s.ext_id = l.user_id
     where (${leadFilter}::text is null or l.status = ${leadFilter})
     order by l.created_at desc limit 500`
  const totals = await sql`select product, status, count(*)::int as n, coalesce(sum(seats), 0)::int as seats from app.lead group by 1, 2`
  return {
    leads: rows.map(r => ({
      id: Number(r.id), product: String(r.product), firstName: r.first_name as string | null, lastName: String(r.last_name),
      email: String(r.email), company: r.company as string | null, title: r.title as string | null, country: r.country as string | null,
      phone: r.phone as string | null, teamSize: r.team_size as string | null, message: r.message as string | null,
      userId: r.user_id as string | null, source: r.source as string | null, landing: r.landing as string | null,
      lessonsDone: Number(r.lessons_done), points: Number(r.points), status: String(r.status), sfStatus: String(r.sf_status), createdAt: r.created_at,
      seats: r.seats === null ? null : Number(r.seats), orgKind: r.org_kind as string | null, firstLanding: null as string | null,
      viewsBefore: null as number | null, enrichment: enriched(r), sync: sync(r)
    })),
    totals: totals.map(r => ({ product: String(r.product), status: String(r.status), count: Number(r.n), seats: Number(r.seats) }))
  }
})
