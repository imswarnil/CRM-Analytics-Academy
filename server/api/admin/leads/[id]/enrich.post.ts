/** Re-read the lead's company website: name, logo, title, description. */
export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id.' })
  const lead = await loadLead(id)
  if (!lead) throw createError({ statusCode: 404, statusMessage: 'Lead not found.' })
  if (!lead.company_domain) throw createError({ statusCode: 400, statusMessage: 'This lead used a personal email, so there is no company domain to read.' })
  await enrichLead(id)
  const fresh = await loadLead(id)
  return { ok: true, companyName: fresh?.company_name ?? null, logoUrl: fresh?.logo_url ?? null, siteTitle: fresh?.site_title ?? null, siteDescription: fresh?.site_description ?? null }
})
