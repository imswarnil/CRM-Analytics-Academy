/**
 * Live project analytics for the /sponsor pitch. Every number is counted,
 * never estimated; a source that is not configured or fails is left out
 * (null) rather than filled in.
 *
 * From Neon: learners (accounts), learners active in the last 30 days,
 * lessons completed, quiz attempts, visible comments.
 *
 * From Cloudflare, only when CF_API_TOKEN (Analytics: Read on the zone) and
 * CF_ZONE_TAG are set: HTML page views of this hostname over the last 30
 * days (status 200, real visitors — `requestSource: eyeball`), unique
 * countries, and the top five. The zone also serves other subdomains, so the
 * query filters on the site's own host.
 *
 * Cached for an hour in the isolate and at the edge; the page fetches it
 * client-side so the prerendered /sponsor never bakes in stale figures.
 */
interface Reach {
  learners: number | null
  active30d: number | null
  lessonsCompleted: number | null
  quizAttempts: number | null
  comments: number | null
  pageViews30d: number | null
  countries30d: number | null
  topCountries: { name: string, views: number }[]
  updatedAt: string
}

async function count(fn: () => Promise<Record<string, unknown>[]>): Promise<number | null> {
  try {
    const rows = await fn()
    return Number(rows[0]?.n ?? 0)
  } catch {
    return null
  }
}

async function cloudflare(host: string): Promise<Pick<Reach, 'pageViews30d' | 'countries30d' | 'topCountries'>> {
  const none = { pageViews30d: null, countries30d: null, topCountries: [] }
  const token = process.env.CF_API_TOKEN
  const zone = process.env.CF_ZONE_TAG
  if (!token || !zone) return none

  const until = new Date()
  // Adaptive datasets accept at most 30 days per query; stay just inside it.
  const since = new Date(until.getTime() - 30 * 86400_000 + 60_000)
  const query = `
    query Reach($zone: string!, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!) {
      viewer {
        zones(filter: { zoneTag: $zone }) {
          total: httpRequestsAdaptiveGroups(limit: 1, filter: $filter) { count }
          countries: httpRequestsAdaptiveGroups(limit: 250, filter: $filter, orderBy: [count_DESC]) {
            count
            dimensions { clientCountryName }
          }
        }
      }
    }`
  const filter = {
    datetime_geq: since.toISOString(),
    datetime_lt: until.toISOString(),
    clientRequestHTTPHost: host,
    requestSource: 'eyeball',
    edgeResponseContentTypeName: 'html',
    edgeResponseStatus: 200
  }
  try {
    const res = await $fetch<{
      data?: { viewer?: { zones?: { total?: { count: number }[], countries?: { count: number, dimensions: { clientCountryName: string } }[] }[] } }
      errors?: { message: string }[] | null
    }>('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { query, variables: { zone, filter } }
    })
    if (res.errors?.length) {
      console.error('reach: Cloudflare analytics error', res.errors.map(e => e.message).join('; '))
      return none
    }
    const z = res.data?.viewer?.zones?.[0]
    if (!z) return none
    const countries = (z.countries ?? []).filter(c => c.dimensions.clientCountryName && c.dimensions.clientCountryName !== 'XX')
    return {
      pageViews30d: z.total?.[0]?.count ?? 0,
      countries30d: countries.length,
      topCountries: countries.slice(0, 5).map(c => ({ name: c.dimensions.clientCountryName, views: c.count }))
    }
  } catch (e) {
    console.error('reach: Cloudflare analytics unavailable', e)
    return none
  }
}

export default defineEventHandler(async (event) => {
  const host = new URL(getRequestOrigin(event)).hostname
  const data = await memo('placement:reach', 3_600_000, () => edgeCached(event, `partner-reach-v1-${host}`, 3600, async (): Promise<Reach> => {
    let db: Pick<Reach, 'learners' | 'active30d' | 'lessonsCompleted' | 'quizAttempts' | 'comments'> = {
      learners: null, active30d: null, lessonsCompleted: null, quizAttempts: null, comments: null
    }
    if (process.env.DATABASE_URL) {
      const sql = useDb()
      const [learners, active30d, lessonsCompleted, quizAttempts, comments] = await Promise.all([
        count(() => sql`select count(*)::int as n from neon_auth."user"`),
        count(() => sql`
          select count(distinct user_id)::int as n from (
            select user_id from app.progress where completed_at > now() - interval '30 days'
            union all
            select user_id from app.quiz_attempt where created_at > now() - interval '30 days'
          ) a`),
        count(() => sql`select count(*)::int as n from app.progress`),
        count(() => sql`select count(*)::int as n from app.quiz_attempt`),
        count(() => sql`select count(*)::int as n from app.comment where status = 'visible'`)
      ])
      db = { learners, active30d, lessonsCompleted, quizAttempts, comments }
    }
    return { ...db, ...(await cloudflare(host)), updatedAt: new Date().toISOString() }
  }))
  setResponseHeader(event, 'cache-control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400')
  return data
})
