/** Saved companies with the GTM domain enrichment (app.company_domain) and prospect counts. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const rows = await useDb()`
    select c.*, d.company as d_company, d.description as d_description, d.logo as d_logo, d.linkedin as d_linkedin,
           d.website as d_website, d.status as d_status, d.fetched_at as d_fetched_at,
           (select count(*) from app.prospect p where p.company_id = c.id)::int as prospects
      from app.prospect_company c
      left join app.company_domain d on d.domain = c.domain
     order by c.created_at desc limit 500`
  return {
    companies: rows.map(r => ({
      id: Number(r.id), name: String(r.name), domain: (r.domain as string | null) ?? null, industry: (r.industry as string | null) ?? null,
      size: r.size === null ? null : Number(r.size), country: (r.country as string | null) ?? null, city: (r.city as string | null) ?? null,
      website: (r.website as string | null) ?? (r.d_website as string | null) ?? null, linkedin: (r.linkedin as string | null) ?? (r.d_linkedin as string | null) ?? null,
      usesSalesforce: (r.uses_salesforce as boolean | null) ?? null, provider: (r.provider as string | null) ?? null, notes: (r.notes as string | null) ?? null,
      prospects: Number(r.prospects), createdAt: String(r.created_at),
      enrichment: r.d_status ? { company: (r.d_company as string | null) ?? null, description: (r.d_description as string | null) ?? null, logo: (r.d_logo as string | null) ?? null, status: String(r.d_status), fetchedAt: r.d_fetched_at ? String(r.d_fetched_at) : null } : null
    }))
  }
})
