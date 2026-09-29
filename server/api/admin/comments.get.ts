/** Recent comments across all lessons, for moderation. Newest first. */
export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const status = getQuery(event).status === 'hidden' ? 'hidden' : 'visible'
  const sql = useDb()
  const rows = await sql`
    select c.id, c.lesson_path, c.parent_id, c.body, c.status, c.created_at, u.name, u.email
    from app.comment c
    left join neon_auth."user" u on u.id::text = c.user_id
    where c.status = ${status}
    order by c.created_at desc
    limit 200
  `
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    comments: rows.map(r => ({
      id: Number(r.id),
      path: r.lesson_path as string,
      isReply: Boolean(r.parent_id),
      body: r.body as string,
      status: r.status as string,
      createdAt: String(r.created_at),
      name: r.name as string | null,
      email: r.email as string | null
    }))
  }
})
