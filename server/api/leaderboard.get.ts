/**
 * The public leaderboard.
 *
 * Reads app.user_points, which derives every total from the underlying rows
 * rather than from a counter column — so it cannot drift out of step with the
 * progress and submissions it is built from.
 *
 * Deliberately NOT authenticated: a leaderboard nobody can see until they sign
 * in cannot do the one thing a leaderboard is for.
 *
 * What it exposes is the narrow part. Name and avatar only — never email, and
 * never the user id, which is the key the session cookie resolves to. Learners
 * with zero points are filtered out rather than listed at the bottom: they
 * have not opted into anything, and a public list of everyone who ever signed
 * up is a different feature from a leaderboard.
 */
const MAX_LIMIT = 100

export default defineEventHandler(async (event) => {
  const { limit } = getQuery(event)
  const take = Math.min(Number(limit) || 25, MAX_LIMIT)

  const sql = useDb()
  const rows = await sql`
    select name, image, points, lessons_done, contributions
    from app.user_points
    where points > 0
    order by points desc, lessons_done desc, name asc
    limit ${take}
  `

  // Public and identical for everyone, so it can be cached at the edge — but
  // briefly, because the whole point is that it moves.
  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=60')

  return {
    entries: rows.map((r, i) => ({
      rank: i + 1,
      // A learner who never set a name is shown as Anonymous rather than as a
      // blank row or, worse, an email local-part.
      name: (r.name as string | null)?.trim() || 'Anonymous learner',
      image: r.image as string | null,
      points: Number(r.points),
      lessonsDone: Number(r.lessons_done),
      contributions: Number(r.contributions)
    }))
  }
})
