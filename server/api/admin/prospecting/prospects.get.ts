/**
 * Prospects. ?id=N → one prospect with its timeline, lists and enrollments.
 * Otherwise a list (newest first, 500 max) filtered by ?q, ?status, ?list, ?company.
 */
const row = (r: Record<string, unknown>) => ({
  id: Number(r.id), firstName: (r.first_name as string | null) ?? null, lastName: (r.last_name as string | null) ?? null,
  title: (r.title as string | null) ?? null, seniority: (r.seniority as string | null) ?? null, email: (r.email as string | null) ?? null,
  emailStatus: (r.email_status as string | null) ?? null, emailDetail: (r.email_detail as string | null) ?? null,
  linkedin: (r.linkedin as string | null) ?? null, country: (r.country as string | null) ?? null, city: (r.city as string | null) ?? null,
  timezone: (r.timezone as string | null) ?? null, source: String(r.source), lawfulBasis: String(r.lawful_basis), status: String(r.status),
  leadId: r.lead_id === null ? null : Number(r.lead_id), companyId: r.company_id === null ? null : Number(r.company_id),
  company: (r.company as string | null) ?? null, domain: (r.domain as string | null) ?? null, createdAt: String(r.created_at)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const q = getQuery(event)
  const sql = useDb()

  if (q.id !== undefined) {
    const id = Number(q.id)
    if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Bad id' })
    const [p] = await sql`select p.*, c.name as company, c.domain from app.prospect p left join app.prospect_company c on c.id = p.company_id where p.id = ${id}`
    if (!p) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    const [activity, lists, enrollments] = await Promise.all([
      sql`select kind, detail, at from app.prospect_activity where prospect_id = ${id} order by at desc limit 200`,
      sql`select l.id, l.name from app.prospect_list_member m join app.prospect_list l on l.id = m.list_id where m.prospect_id = ${id}`,
      sql`select e.id, e.status, e.step, e.next_at, q.name from app.prospect_enrollment e join app.prospect_sequence q on q.id = e.sequence_id where e.prospect_id = ${id}`
    ])
    return {
      prospect: row(p),
      activity: activity.map(a => ({ kind: String(a.kind), detail: (a.detail as string | null) ?? null, at: String(a.at) })),
      lists: lists.map(l => ({ id: Number(l.id), name: String(l.name) })),
      enrollments: enrollments.map(e => ({ id: Number(e.id), sequence: String(e.name), status: String(e.status), step: Number(e.step), nextAt: String(e.next_at) }))
    }
  }

  const search = typeof q.q === 'string' && q.q.trim() ? `%${q.q.trim().toLowerCase().slice(0, 80)}%` : null
  const status = typeof q.status === 'string' && /^[a-z_]{2,20}$/.test(q.status) ? q.status : null
  const list = Number.isInteger(Number(q.list)) && q.list !== undefined && q.list !== '' ? Number(q.list) : null
  const company = Number.isInteger(Number(q.company)) && q.company !== undefined && q.company !== '' ? Number(q.company) : null
  const rows = await sql`
    select p.*, c.name as company, c.domain from app.prospect p
      left join app.prospect_company c on c.id = p.company_id
     where (${search}::text is null or lower(concat_ws(' ', p.first_name, p.last_name, p.email, p.title, c.name)) like ${search})
       and (${status}::text is null or p.status = ${status})
       and (${company}::bigint is null or p.company_id = ${company})
       and (${list}::bigint is null or exists (select 1 from app.prospect_list_member m where m.list_id = ${list} and m.prospect_id = p.id))
     order by p.created_at desc limit 500`
  return { prospects: rows.map(row) }
})
