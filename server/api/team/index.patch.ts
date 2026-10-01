/** Rename the team, or change the extra domains members may sign in with. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const team = await requireTeamManager(user.id)
  const body = await readBody<{ name?: string, extraDomains?: string[] }>(event)

  const name = body?.name === undefined ? team.name : String(body.name).trim().slice(0, 80)
  if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Give the team a name.' })

  let extra = team.extra_domains
  if (Array.isArray(body?.extraDomains)) {
    extra = [...new Set(body.extraDomains.map(d => String(d).trim().toLowerCase().replace(/^@/, '')).filter(Boolean))].slice(0, 10)
    for (const d of extra) {
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) throw createError({ statusCode: 400, statusMessage: `"${d}" is not a domain.` })
      if (isPersonalMailbox(`x@${d}`)) throw createError({ statusCode: 400, statusMessage: `${d} is a personal mailbox provider, not a company domain.` })
    }
  }

  const sql = useDb()
  await sql`update app.team set name = ${name}, extra_domains = ${extra}, updated_at = now() where id = ${team.id}`
  return { ok: true, name, extraDomains: extra }
})
