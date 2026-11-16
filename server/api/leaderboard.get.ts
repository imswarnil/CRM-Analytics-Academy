/**
 * The global leaderboard: the top ten by points, plus the caller's own row.
 * Signed-in only; names are shown first-name only, and only to other learners.
 * (Regional boards were retired with the page-view analytics they read.)
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await useDb()`
    with ranked as (
      select user_id, name, image, points, lessons_done, rank() over (order by points desc) as rank
      from app.user_points where points > 0
    )
    select * from ranked where rank <= 10 or user_id = ${user.id}
    order by rank, lessons_done desc limit 11
  `
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    scope: 'global' as const,
    country: null,
    region: null,
    regionName: null,
    rows: rows.map(r => ({
      me: r.user_id === user.id,
      rank: Number(r.rank),
      name: String(r.name || 'Learner').split(/\s+/)[0],
      image: r.image as string | null,
      country: null as string | null,
      points: Number(r.points),
      lessons: Number(r.lessons_done)
    }))
  }
})
