/**
 * The comments on one lesson, oldest first, with one level of replies.
 *
 * Public: a question and its answer are as useful to the next reader as to
 * the person who asked. Name and avatar only — never an email or a user id.
 * Cached for 20s per isolate, because a popular lesson is read far more often
 * than it is commented on.
 */
export default defineEventHandler(async (event) => {
  const path = String(getQuery(event).path ?? '')
  if (!/^\/[a-z0-9/-]*$/.test(path) || path.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }

  const rows = await memo(`comments:${path}`, 20_000, () => {
    const sql = useDb()
    return sql`
      select c.id, c.parent_id, c.body, c.created_at, c.edited_at, c.user_id,
             u.name, u.image
      from app.comment c
      left join neon_auth."user" u on u.id::text = c.user_id
      where c.lesson_path = ${path} and c.status = 'visible'
      order by c.created_at asc
      limit 300
    `
  })

  // Whose comments are "mine" is decided here, from the session, so the
  // client never needs a user id to know which ones it may delete.
  const me = await getSessionUser(event)

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    comments: rows.map(r => ({
      id: Number(r.id),
      parentId: r.parent_id ? Number(r.parent_id) : null,
      body: r.body as string,
      createdAt: String(r.created_at),
      edited: Boolean(r.edited_at),
      name: (r.name as string | null)?.trim() || 'Anonymous learner',
      image: r.image as string | null,
      mine: Boolean(me && me.id === r.user_id)
    }))
  }
})
