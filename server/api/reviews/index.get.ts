/**
 * Reviews of one product: the average, the count, the 1–5 star spread and the
 * twenty newest. Public — name and avatar only, never an email or user id.
 * Short shared cache: reviews change rarely and this is read far more than
 * written; the writer sees their own review straight from the POST response.
 */
export default defineEventHandler(async (event) => {
  const product = String(getQuery(event).product ?? '')
  if (!/^[a-z0-9-]{1,40}$/.test(product)) throw createError({ statusCode: 400, statusMessage: 'Unknown product' })

  const sql = useDb()
  const [summary, rows] = await Promise.all([
    sql`select rating, count(*)::int as n from app.review where product = ${product} and status = 'visible' group by rating`,
    sql`
      select r.rating, r.body, r.created_at, u.name, u.image
      from app.review r
      left join neon_auth."user" u on u.id::text = r.user_id
      where r.product = ${product} and r.status = 'visible'
      order by r.created_at desc
      limit 20
    `
  ])
  const dist = [0, 0, 0, 0, 0]
  for (const s of summary) dist[Number(s.rating) - 1] = Number(s.n)
  const count = dist.reduce((a, b) => a + b, 0)
  const avg = count ? dist.reduce((a, n, i) => a + n * (i + 1), 0) / count : 0

  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300')
  return {
    count,
    avg: Math.round(avg * 10) / 10,
    dist,
    reviews: rows.map(r => ({
      rating: Number(r.rating),
      body: r.body as string,
      createdAt: String(r.created_at),
      name: (r.name as string | null)?.trim() || 'Learner',
      image: r.image as string | null
    }))
  }
})
