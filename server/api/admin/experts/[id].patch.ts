/**
 * Edit a roster profile: what its public card shows (photo, headline,
 * skills, links, years, country), its place in the order, and whether it is
 * shown at all (status approved / hidden / pending). Only the fields sent
 * are changed.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id.' })

  const input = cleanExpert(await readBody<Record<string, unknown>>(event) ?? {}, false)
  const set = (k: keyof typeof input) => input[k] !== undefined

  const sql = useDb()
  const rows = await sql`
    update app.expert set
      name          = case when ${set('name')} then ${input.name ?? null} else name end,
      email         = case when ${set('email')} then ${input.email ?? null} else email end,
      headline      = case when ${set('headline')} then ${input.headline ?? null} else headline end,
      bio           = case when ${set('bio')} then ${input.bio ?? null} else bio end,
      photo_url     = case when ${set('photoUrl')} then ${input.photoUrl ?? null} else photo_url end,
      linkedin_url  = case when ${set('linkedinUrl')} then ${input.linkedinUrl ?? null} else linkedin_url end,
      portfolio_url = case when ${set('portfolioUrl')} then ${input.portfolioUrl ?? null} else portfolio_url end,
      skills        = case when ${set('skills')} then ${input.skills ?? []}::text[] else skills end,
      years         = case when ${set('years')} then ${input.years ?? null}::smallint else years end,
      country       = case when ${set('country')} then ${input.country ?? null} else country end,
      timezone      = case when ${set('timezone')} then ${input.timezone ?? null} else timezone end,
      status        = case when ${set('status')} then ${input.status ?? null} else status end,
      sort_order    = case when ${set('sortOrder')} then ${input.sortOrder ?? null}::integer else sort_order end,
      updated_at    = now()
    where id = ${id}
    returning *
  `
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Profile not found.' })
  forget('experts:')
  return { expert: adminExpert(rows[0]!) }
})
