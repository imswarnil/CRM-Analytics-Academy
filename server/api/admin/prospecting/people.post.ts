/**
 * People at a company: { domain, titles?, seniorities?, provider?, page?, fresh? }.
 * Titles default to the CRM Analytics buyer list (DEFAULT_TITLES). Results
 * already saved as prospects are marked.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const domain = pdomain(body?.domain)
  if (!domain) throw createError({ statusCode: 400, statusMessage: 'A company domain is required' })
  const p = providerFor('people', process.env as Record<string, string | undefined>, pclean(body?.provider, 20) ?? undefined)
  if (!p?.searchPeople) throw createError({ statusCode: 409, statusMessage: 'Connect a provider with people search (APOLLO_API_KEY or HUNTER_API_KEY)' })
  const list = (v: unknown, n: number) => (Array.isArray(v) ? v.map(x => pclean(x, 60)).filter((x): x is string => !!x).slice(0, n) : [])
  const titles = list(body?.titles, 30)
  const seniorities = list(body?.seniorities, 10)
  const hits = await p.searchPeople({ domain, titles: titles.length ? titles : DEFAULT_TITLES, seniorities, page: Math.min(20, Math.max(1, Number(body?.page) || 1)) }, providerContext(p, { fresh: body?.fresh === true }))
  const emails = hits.map(h => h.email).filter((e): e is string => !!e)
  const saved = emails.length ? new Set((await useDb()`select lower(email) as e from app.prospect where lower(email) = any(${emails}::text[])`).map(r => String(r.e))) : new Set<string>()
  return { provider: p.label, people: hits.map(h => ({ ...h, saved: Boolean(h.email && saved.has(h.email)) })) }
})
