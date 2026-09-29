/**
 * The enquiries inbox: enrollments, quotations and implementation requests.
 * Newest first — unlike the moderation queue, these are leads, and the newest
 * one is the one most likely to still be warm.
 */
export default defineEventHandler(async (event) => {
  await requireModerator(event)

  const { status } = getQuery(event)
  const wanted = ['new', 'contacted', 'won', 'closed'].includes(String(status)) ? String(status) : 'new'

  const sql = useDb()
  const rows = await sql`
    select id, kind, name, email, company, phone, message, details, status, note, created_at
    from app.inquiry
    where status = ${wanted}
    order by created_at desc
    limit 200
  `

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    inquiries: rows.map(r => ({
      id: Number(r.id),
      kind: r.kind as string,
      name: r.name as string,
      email: r.email as string,
      company: r.company as string | null,
      phone: r.phone as string | null,
      message: r.message as string | null,
      details: (r.details ?? {}) as Record<string, string>,
      status: r.status as string,
      note: r.note as string | null,
      createdAt: String(r.created_at)
    }))
  }
})
