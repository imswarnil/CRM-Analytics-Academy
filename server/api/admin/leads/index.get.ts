/**
 * The leads inbox. Filters: type, status, q (name, email, company, domain),
 * page (50 per page). Newest first — the newest lead is the warmest.
 */
const PAGE = 50

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const query = getQuery(event)
  const type = LEAD_TYPES.includes(String(query.type) as LeadType) ? String(query.type) : null
  const status = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam'].includes(String(query.status)) ? String(query.status) : null
  const q = String(query.q ?? '').trim().slice(0, 100)
  const like = q ? `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%` : null
  const page = Math.max(1, Math.min(1000, Number.parseInt(String(query.page ?? '1'), 10) || 1))

  const sql = useDb()
  const rows = await sql`
    select id, type, name, email, company, company_domain, role, phone, country, seats, budget, message,
           source_page, utm, details, company_name, logo_url, site_title, site_description, enriched_at,
           n8n_status, n8n_attempts, n8n_last_error, n8n_sent_at, salesforce_id,
           status, owner, notes, created_at, updated_at,
           count(*) over () as total
    from app.lead
    where (${type}::text is null or type = ${type})
      and (${status}::text is null or status = ${status})
      and (${like}::text is null or name ilike ${like} or email ilike ${like} or company ilike ${like}
           or company_name ilike ${like} or company_domain ilike ${like})
    order by created_at desc
    limit ${PAGE} offset ${(page - 1) * PAGE}
  `
  const counts = await sql`select status, count(*)::int n from app.lead group by status`

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    page,
    pageSize: PAGE,
    total: Number(rows[0]?.total ?? 0),
    counts: Object.fromEntries(counts.map(c => [c.status as string, Number(c.n)])),
    leads: rows.map(r => ({
      id: Number(r.id),
      type: r.type as string,
      name: r.name as string,
      email: r.email as string,
      company: r.company as string | null,
      companyDomain: r.company_domain as string | null,
      role: r.role as string | null,
      phone: r.phone as string | null,
      country: r.country as string | null,
      seats: r.seats == null ? null : Number(r.seats),
      budget: r.budget as string | null,
      message: r.message as string | null,
      sourcePage: r.source_page as string | null,
      utm: (r.utm ?? {}) as Record<string, string>,
      details: (r.details ?? {}) as Record<string, string>,
      companyName: r.company_name as string | null,
      logoUrl: r.logo_url as string | null,
      siteTitle: r.site_title as string | null,
      siteDescription: r.site_description as string | null,
      enrichedAt: r.enriched_at ? String(r.enriched_at) : null,
      n8nStatus: r.n8n_status as string,
      n8nAttempts: Number(r.n8n_attempts),
      n8nLastError: r.n8n_last_error as string | null,
      n8nSentAt: r.n8n_sent_at ? String(r.n8n_sent_at) : null,
      salesforceId: r.salesforce_id as string | null,
      status: r.status as string,
      owner: r.owner as string | null,
      notes: r.notes as string | null,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at)
    }))
  }
})
