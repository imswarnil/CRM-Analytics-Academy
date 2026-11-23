/**
 * Lists with member counts. ?export=<id> (or ?export=all) returns the members
 * as CSV — the same columns the importer reads.
 */
const COLUMNS = ['first_name', 'last_name', 'email', 'email_status', 'title', 'company', 'domain', 'linkedin', 'country', 'timezone', 'status', 'source', 'lawful_basis', 'created_at']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const q = getQuery(event)
  const sql = useDb()
  if (q.export !== undefined) {
    const list = q.export === 'all' ? null : Number(q.export)
    if (list !== null && !Number.isInteger(list)) throw createError({ statusCode: 400, statusMessage: 'Bad list' })
    const rows = await sql`
      select p.first_name, p.last_name, p.email, p.email_status, p.title, c.name as company, c.domain, p.linkedin, p.country, p.timezone,
             p.status, p.source, p.lawful_basis, p.created_at
        from app.prospect p left join app.prospect_company c on c.id = p.company_id
       where ${list}::bigint is null or exists (select 1 from app.prospect_list_member m where m.list_id = ${list} and m.prospect_id = p.id)
       order by p.created_at`
    setResponseHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'content-disposition', `attachment; filename="prospects-${list ?? 'all'}.csv"`)
    return toCsv(rows.map(r => ({ ...r, created_at: r.created_at ? new Date(r.created_at as string).toISOString() : '' })), COLUMNS)
  }
  const rows = await sql`select l.id, l.name, l.created_at, (select count(*) from app.prospect_list_member m where m.list_id = l.id)::int as n
                           from app.prospect_list l order by l.created_at desc`
  return { lists: rows.map(r => ({ id: Number(r.id), name: String(r.name), count: Number(r.n), createdAt: String(r.created_at) })) }
})
