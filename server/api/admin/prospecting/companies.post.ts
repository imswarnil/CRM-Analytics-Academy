import type { CompanyHit } from '~~/server/utils/prospect-providers'

/**
 * Companies: { action: 'search', keywords?, industry?, sizes?, country?, usesSalesforce?, page?, fresh? }
 *            { action: 'save', companies: CompanyHit[] }   (also: { name, domain } by hand)
 *            { action: 'delete', id }
 * Saving a company enriches its domain (GTM cache) after the response.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const sql = useDb()

  if (body.action === 'search') {
    const p = providerFor('companies', process.env as Record<string, string | undefined>, pclean(body.provider, 20) ?? undefined)
    if (!p?.searchCompanies) throw createError({ statusCode: 409, statusMessage: 'Connect a provider with company search (APOLLO_API_KEY)' })
    const sizes = Array.isArray(body.sizes) ? body.sizes.map(x => pclean(x, 20)).filter((x): x is string => !!x && /^\d+,\d+$/.test(x)).slice(0, 8) : []
    const hits = await p.searchCompanies({
      keywords: pclean(body.keywords, 200) ?? undefined,
      industry: pclean(body.industry, 80) ?? undefined,
      sizes,
      country: pclean(body.country, 80) ?? undefined,
      usesSalesforce: body.usesSalesforce === true,
      page: Math.min(20, Math.max(1, Number(body.page) || 1))
    }, providerContext(p, { fresh: body.fresh === true }))
    const domains = hits.map(h => h.domain).filter((d): d is string => !!d)
    const saved = domains.length ? new Set((await sql`select domain from app.prospect_company where domain = any(${domains}::text[])`).map(r => String(r.domain))) : new Set<string>()
    return { provider: p.label, companies: hits.map(h => ({ ...h, saved: Boolean(h.domain && saved.has(h.domain)) })) }
  }

  if (body.action === 'save') {
    const list = (Array.isArray(body.companies) ? body.companies : [body]).slice(0, 100) as Partial<CompanyHit>[]
    const ids: number[] = []
    const toEnrich: string[] = []
    for (const c of list) {
      const name = pclean(c.name, 200)
      const domain = pdomain(c.domain ?? c.website)
      if (!name) continue
      const [row] = await sql`
        insert into app.prospect_company (domain, name, industry, size, country, city, website, linkedin, uses_salesforce, provider, provider_id)
        values (${domain}, ${name}, ${pclean(c.industry, 120)}, ${Number.isFinite(Number(c.size)) && c.size !== null ? Math.round(Number(c.size)) : null},
                ${pclean(c.country, 80)}, ${pclean(c.city, 80)}, ${pclean(c.website, 300)}, ${pclean(c.linkedin, 300)},
                ${typeof c.usesSalesforce === 'boolean' ? c.usesSalesforce : null}, ${pclean(c.provider, 20) ?? 'manual'}, ${pclean(c.providerId, 64)})
        on conflict (domain) do update set name = excluded.name, industry = coalesce(excluded.industry, app.prospect_company.industry),
          size = coalesce(excluded.size, app.prospect_company.size), country = coalesce(excluded.country, app.prospect_company.country),
          linkedin = coalesce(excluded.linkedin, app.prospect_company.linkedin),
          uses_salesforce = coalesce(excluded.uses_salesforce, app.prospect_company.uses_salesforce)
        returning id`
      ids.push(Number(row!.id))
      if (domain) toEnrich.push(domain)
    }
    // The company's own home page, through the GTM cache — after the response.
    if (toEnrich.length) event.waitUntil(Promise.all(toEnrich.slice(0, 10).map(d => domainInfo(d).catch(() => null))))
    return { ok: true, ids }
  }

  if (body.action === 'delete') {
    const id = Number(body.id)
    if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
    await sql`delete from app.prospect_company where id = ${id}`
    return { ok: true }
  }
  throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
})
