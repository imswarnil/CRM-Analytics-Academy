/** Work a lead: move its status, assign an owner, keep notes. */
const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost', 'spam']

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id.' })
  const body = await readBody<{ status?: unknown, owner?: unknown, notes?: unknown }>(event) ?? {}

  const status = body.status === undefined ? null : String(body.status)
  if (status !== null && !STATUSES.includes(status)) throw createError({ statusCode: 400, statusMessage: 'Bad status.' })
  const owner = body.owner === undefined ? undefined : (String(body.owner ?? '').trim().slice(0, 120) || null)
  const notes = body.notes === undefined ? undefined : (String(body.notes ?? '').trim().slice(0, 8000) || null)

  const sql = useDb()
  const rows = await sql`
    update app.lead set
      status = coalesce(${status}, status),
      owner = case when ${owner !== undefined} then ${owner ?? null} else owner end,
      notes = case when ${notes !== undefined} then ${notes ?? null} else notes end,
      updated_at = now()
    where id = ${id}
    returning id
  `
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Lead not found.' })
  return { ok: true }
})
