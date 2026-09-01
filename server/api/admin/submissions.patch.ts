/**
 * Approve, reject or delete a submission.
 *
 * Approving is what makes it public and what awards its points — app.user_points
 * counts `status = 'approved'` rows, so there is no separate "give them the
 * points" step that could be forgotten or double-run.
 *
 * Rejection keeps the row. A rejected submission with a note is how the person
 * finds out what was wrong with it (server/api/submissions.get.ts returns
 * review_note to its author); deleting it silently means they resubmit the
 * same thing. Deletion is reserved for spam, where there is nobody to inform.
 */
const ACTIONS = ['approve', 'reject', 'delete'] as const
type Action = typeof ACTIONS[number]

export default defineEventHandler(async (event) => {
  const moderator = await requireModerator(event)
  const body = await readBody<{ id?: number, action?: string, note?: string }>(event)

  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Which submission?' })
  }

  const action = String(body?.action ?? '') as Action
  if (!(ACTIONS as readonly string[]).includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
  }

  const note = body?.note ? String(body.note).slice(0, 500) : null
  const sql = useDb()

  if (action === 'delete') {
    await sql`delete from app.submission where id = ${id}`
    setResponseHeader(event, 'cache-control', 'no-store')
    return { ok: true, deleted: true }
  }

  const status = action === 'approve' ? 'approved' : 'rejected'
  const rows = await sql`
    update app.submission
       set status = ${status},
           review_note = ${note},
           reviewed_by = ${moderator.id},
           reviewed_at = now()
     where id = ${id}
    returning id, status
  `

  if (!rows[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, id: Number(rows[0].id), status: rows[0].status as string }
})
