/**
 * The moderation queue.
 *
 * Oldest first, because a queue sorted newest-first is one where the oldest
 * item is never reached.
 *
 * Moderator-or-admin: reviewing submissions is the job the moderator role
 * exists for, while changing roles and creating users stays admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireModerator(event)

  const { status } = getQuery(event)
  const wanted = ['pending', 'approved', 'rejected'].includes(String(status))
    ? String(status)
    : 'pending'

  const sql = useDb()
  const rows = await sql`
    select s.id, s.user_id, s.kind, s.title, s.url, s.description, s.tags,
           s.image_url, s.status, s.review_note, s.created_at,
           u.email, u.name
    from app.submission s
    left join neon_auth."user" u on u.id::text = s.user_id
    where s.status = ${wanted}
    order by s.created_at asc
    limit 200
  `

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    submissions: rows.map(r => ({
      id: Number(r.id),
      kind: r.kind as string,
      title: r.title as string,
      url: r.url as string | null,
      description: r.description as string,
      tags: (r.tags as string[]) ?? [],
      imageUrl: r.image_url as string | null,
      status: r.status as string,
      reviewNote: r.review_note as string | null,
      createdAt: r.created_at,
      submittedBy: {
        name: (r.name as string | null) ?? null,
        email: (r.email as string | null) ?? null
      }
    }))
  }
})
