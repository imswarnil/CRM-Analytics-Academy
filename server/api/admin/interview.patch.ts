/**
 * Approve, reject or delete a community interview question.
 *
 * The reward: when a question that names the company it was asked at is
 * approved for the first time, its author gets 30 days of Pro (a `grant`
 * entitlement; an existing timed grant is extended by 30 days). Lifetime
 * members and open-ended grants are left alone. Returns `rewarded`.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: number, action?: string, note?: string }>(event)
  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Which question?' })
  const sql = useDb()
  const [before] = await sql`select status, user_id, company from app.interview_question where id = ${id}`
  let rewarded = false
  if (body?.action === 'delete') {
    await sql`delete from app.interview_question where id = ${id}`
  } else if (body?.action === 'approve' || body?.action === 'reject') {
    await sql`update app.interview_question set status = ${body.action === 'approve' ? 'approved' : 'rejected'},
      review_note = ${body.note ? String(body.note).slice(0, 500) : null}, updated_at = now() where id = ${id}`
    if (body.action === 'approve' && before && before.status !== 'approved' && before.user_id && before.company) {
      const rows = await sql`
        insert into app.entitlement (user_id, product, note, expires_at)
        values (${before.user_id}, 'grant', 'Interview question reward', now() + interval '30 days')
        on conflict (user_id) do update
          set expires_at = greatest(app.entitlement.expires_at, now()) + interval '30 days',
              note = excluded.note, granted_at = now()
          where app.entitlement.product = 'grant' and app.entitlement.expires_at is not null
        returning user_id`
      rewarded = rows.length > 0
    }
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
  }
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, rewarded }
})
