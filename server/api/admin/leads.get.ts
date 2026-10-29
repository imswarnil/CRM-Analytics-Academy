/** Leads for /admin → Leads, newest first, with pipeline totals. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const status = String(getQuery(event).status ?? '')
  const sql = useDb()
  const rows = /^(new|contacted|won|lost)$/.test(status)
    ? await sql`select * from app.lead where status = ${status} order by created_at desc limit 500`
    : await sql`select * from app.lead order by created_at desc limit 500`
  const totals = await sql`select product, status, count(*)::int as n from app.lead group by 1, 2`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    leads: rows.map(r => ({
      id: Number(r.id), product: String(r.product), firstName: r.first_name as string | null, lastName: String(r.last_name),
      email: String(r.email), company: r.company as string | null, title: r.title as string | null, country: r.country as string | null,
      phone: r.phone as string | null, teamSize: r.team_size as string | null, message: r.message as string | null,
      userId: r.user_id as string | null, source: r.source as string | null, landing: r.landing as string | null,
      lessonsDone: Number(r.lessons_done), points: Number(r.points), status: String(r.status), sfStatus: String(r.sf_status), createdAt: r.created_at
    })),
    totals: totals.map(r => ({ product: String(r.product), status: String(r.status), count: Number(r.n) }))
  }
})
