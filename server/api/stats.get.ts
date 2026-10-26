/**
 * The project's public numbers for the home page: learners, lessons completed,
 * quizzes taken, readers and countries, and readers ranked by region and
 * country. Aggregates only — nothing here identifies anyone. Cached for ten
 * minutes in the isolate and at the edge.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=600, s-maxage=600')
  return memo('public-stats', 600_000, async () => {
    const sql = useDb()
    const [[totals], countries] = await Promise.all([
      sql`
        select
          (select count(*)::int from neon_auth."user") as learners,
          (select count(*)::int from app.progress) as lessons_completed,
          (select count(*)::int from app.quiz_attempt) as quizzes,
          (select count(distinct visitor)::int from app.page_view where created_at >= now() - interval '30 days') as readers_30d,
          (select count(*)::int from app.page_view) as views
      `,
      sql`
        select country, count(distinct visitor)::int as readers
        from app.page_view
        where country is not null and created_at >= now() - interval '365 days'
        group by 1 order by 2 desc
      `
    ])

    const byRegion = new Map<string, number>()
    for (const c of countries) {
      const region = regionOf(String(c.country))
      if (region) byRegion.set(region, (byRegion.get(region) ?? 0) + Number(c.readers))
    }
    const regions = [...byRegion.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, readers], i) => ({ rank: i + 1, key, name: REGIONS[key as RegionKey], readers }))

    return {
      learners: Number(totals?.learners ?? 0),
      lessonsCompleted: Number(totals?.lessons_completed ?? 0),
      quizzes: Number(totals?.quizzes ?? 0),
      readers30d: Number(totals?.readers_30d ?? 0),
      views: Number(totals?.views ?? 0),
      countryCount: countries.length,
      regions,
      countries: countries.slice(0, 10).map(c => ({ country: String(c.country), readers: Number(c.readers) }))
    }
  })
})
