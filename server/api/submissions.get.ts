/**
 * The caller's own submissions, with their moderation state.
 *
 * Scoped to the session's user id and never to anything the client sends —
 * a `?userId=` here would let anyone read anyone's pending, unreviewed and
 * possibly rejected contributions.
 *
 * `review_note` is returned because a rejection a learner cannot see the
 * reason for is one they will simply resubmit.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()

  const rows = await sql`
    select id, kind, title, url, status, review_note, created_at
    from app.submission
    where user_id = ${user.id}
    order by created_at desc
    limit 50
  `

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    submissions: rows.map(r => ({
      id: Number(r.id),
      kind: r.kind as string,
      title: r.title as string,
      url: r.url as string | null,
      status: r.status as 'pending' | 'approved' | 'rejected',
      reviewNote: r.review_note as string | null,
      createdAt: r.created_at
    }))
  }
})
