/** Every sponsorship with its totals, for /admin → Sponsors. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await settleSponsors()
  const rows = await useDb()`
    select s.*, coalesce(t.views, 0)::int as views, coalesce(t.clicks, 0)::int as clicks
    from app.sponsor s
    left join (select sponsor_id, sum(views) as views, sum(clicks) as clicks from app.sponsor_stat group by 1) t on t.sponsor_id = s.id
    order by s.created_at desc limit 300`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { sponsors: rows.map(r => ({ ...sponsorView(r), views: Number(r.views), clicks: Number(r.clicks) })) }
})
