/**
 * Create a roster profile — usually by approving an `expert` application.
 *
 * With `leadId`, the profile is seeded from the application (name, email,
 * LinkedIn, portfolio, areas of expertise as skills, years, country, time
 * zone); anything else in the body overrides the seed. Approving the same
 * application twice updates the profile it already made rather than adding a
 * second one, and the application itself is marked qualified.
 *
 * Without `leadId`, it adds someone by hand; `name` is then required.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event) ?? {}
  const leadId = body.leadId == null ? null : Number(body.leadId)
  if (leadId !== null && (!Number.isInteger(leadId) || leadId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad application id.' })
  }

  const sql = useDb()
  let seed: Record<string, unknown> = {}
  if (leadId !== null) {
    const rows = await sql`select name, email, country, details from app.lead where id = ${leadId} and type = 'expert'`
    const lead = rows[0]
    if (!lead) throw createError({ statusCode: 404, statusMessage: 'Application not found.' })
    const d = (lead.details ?? {}) as Record<string, string>
    seed = {
      name: lead.name,
      email: lead.email,
      linkedinUrl: d.linkedin ?? null,
      portfolioUrl: d.portfolio ?? null,
      skills: String(d.expertise ?? '').split(',').map(s => s.trim()).filter(Boolean),
      years: yearsFromRange(d.experienceYears),
      country: lead.country ?? null,
      timezone: d.timezone ?? null
    }
  }

  const input = cleanExpert({ ...seed, status: 'approved', ...body }, true)

  const rows = await sql`
    insert into app.expert (lead_id, name, email, headline, bio, photo_url, linkedin_url, portfolio_url,
                            skills, years, country, timezone, status, sort_order)
    values (${leadId}, ${input.name}, ${input.email ?? null}, ${input.headline ?? null}, ${input.bio ?? null},
            ${input.photoUrl ?? null}, ${input.linkedinUrl ?? null}, ${input.portfolioUrl ?? null},
            ${input.skills ?? []}, ${input.years ?? null}, ${input.country ?? null}, ${input.timezone ?? null},
            ${input.status ?? 'approved'}, ${input.sortOrder ?? 100})
    on conflict (lead_id) do update set
      status = excluded.status,
      updated_at = now()
    returning *
  `
  if (leadId !== null) {
    await sql`update app.lead set status = 'qualified', updated_at = now() where id = ${leadId} and status in ('new', 'contacted')`
  }
  forget('experts:')
  return { expert: adminExpert(rows[0]!) }
})
