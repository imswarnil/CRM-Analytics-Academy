/**
 * The leaderboard, globally or within the reader's region or country.
 *
 *   GET /api/leaderboard?scope=global|region|country
 *
 * A learner's country is the one they most often read the site from
 * (app.page_view, first-party analytics — no IP is stored), and their region
 * comes from COUNTRY_REGION in shared/utils/regions.ts. Signed-in only: names
 * are shown first-name only, and only to other learners.
 */
const SCOPES = ['global', 'region', 'country'] as const
type Scope = typeof SCOPES[number]

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const scope: Scope = SCOPES.includes(getQuery(event).scope as Scope) ? getQuery(event).scope as Scope : 'global'
  const sql = useDb()

  const [mine] = await sql`
    select country from app.page_view
    where user_id = ${user.id} and country is not null
    group by country order by count(*) desc limit 1
  `
  const country = (mine?.country as string | undefined) ?? null
  const region = regionOf(country)
  const countries = scope === 'country'
    ? (country ? [country] : [])
    : scope === 'region'
      ? Object.entries(COUNTRY_REGION).filter(([, r]) => r === region).map(([c]) => c)
      : null

  const rows = countries && !countries.length
    ? []
    : await sql`
      -- Everyone's home country: where they read from most.
      with home as (
        select distinct on (user_id) user_id, country
        from (
          select user_id, country, count(*) as n
          from app.page_view
          where user_id is not null and country is not null
          group by 1, 2
        ) c
        order by user_id, n desc
      ),
      ranked as (
        select p.user_id, p.name, p.image, p.points, p.lessons_done, h.country,
               rank() over (order by p.points desc) as rank
        from app.user_points p
        left join home h on h.user_id = p.user_id
        where p.points > 0
          and (${countries}::text[] is null or h.country = any(${countries}::text[]))
      )
      select * from ranked
      where rank <= 10 or user_id = ${user.id}
      order by rank, lessons_done desc
      limit 11
    `

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    scope,
    country,
    region,
    regionName: region ? REGIONS[region] : null,
    rows: rows.map(r => ({
      me: r.user_id === user.id,
      rank: Number(r.rank),
      name: String(r.name || 'Learner').split(/\s+/)[0],
      image: r.image as string | null,
      country: r.country as string | null,
      points: Number(r.points),
      lessons: Number(r.lessons_done)
    }))
  }
})
