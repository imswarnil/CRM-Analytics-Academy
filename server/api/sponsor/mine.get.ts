/**
 * The signed-in sponsor's sponsorships, with their stats. A request made
 * before signing up is claimed by the same email on first visit.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  await sql`update app.sponsor set owner_user_id = ${user.id} where owner_user_id is null and lower(email) = ${user.email.toLowerCase()}`
  await settleSponsors()
  const rows = await sql`select * from app.sponsor where owner_user_id = ${user.id} order by created_at desc`
  const stats = rows.length
    ? await sql`
        select sponsor_id, day::text as day, sum(views)::int as views, sum(clicks)::int as clicks
        from app.sponsor_stat where sponsor_id = any(${rows.map(r => Number(r.id))}) group by 1, 2 order by 2`
    : []
  const pages = rows.length
    ? await sql`
        select sponsor_id, path, sum(views)::int as views, sum(clicks)::int as clicks
        from app.sponsor_stat where sponsor_id = any(${rows.map(r => Number(r.id))}) group by 1, 2 order by views desc limit 60`
    : []
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    sponsorships: rows.map(r => ({
      ...sponsorView(r),
      days: stats.filter(s => Number(s.sponsor_id) === Number(r.id)).map(s => ({ day: String(s.day), views: Number(s.views), clicks: Number(s.clicks) })),
      pages: pages.filter(s => Number(s.sponsor_id) === Number(r.id)).slice(0, 10).map(s => ({ path: String(s.path), views: Number(s.views), clicks: Number(s.clicks) })),
      packageDays: Number(r.days)
    }))
  }
})
