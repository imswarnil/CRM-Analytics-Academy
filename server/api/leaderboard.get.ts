/**
 * The public leaderboard, all-time or for the last 30 days.
 *
 * All-time reads app.user_points, which derives every total from the
 * underlying rows rather than from a counter column. The 30-day board uses the
 * same weights (10 a lesson, 2 a quiz point on the best attempt, 25/50 an
 * approved contribution) restricted to activity inside the window — which is
 * what gives a newcomer a board they can actually climb.
 *
 * Deliberately NOT authenticated: a leaderboard nobody can see until they sign
 * in cannot do the one thing a leaderboard is for. Name and avatar only —
 * never email, never the user id. Learners with zero points are left out.
 *
 * When the caller is signed in, their own standing comes back too, so the
 * page can show "you" even when they are not in the visible top N.
 */
const MAX_LIMIT = 100

interface Row {
  user_id: string
  name: string | null
  image: string | null
  points: number
  lessons_done: number
  contributions: number
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const take = Math.min(Number(q.limit) || 25, MAX_LIMIT)
  const period = q.period === 'month' ? 'month' : 'all'

  // Identical for every visitor, so one query per minute per isolate serves
  // all of them; this is what removes the database round trip from most loads.
  const rows = await memo(`leaderboard:${period}`, 60_000, async () => {
    const sql = useDb()
    if (period === 'all') {
      return await sql`
        select user_id, name, image, points, lessons_done, contributions
        from app.user_points
        where points > 0
        order by points desc, lessons_done desc, name asc
        limit ${MAX_LIMIT}
      ` as Row[]
    }
    return await sql`
      with lp as (
        select user_id, count(*) * 10 as pts, count(*)::int as lessons_done
        from app.progress where completed_at > now() - interval '30 days'
        group by user_id
      ),
      qp as (
        select user_id, sum(best) * 2 as pts from (
          select user_id, lesson_path, max(score) as best
          from app.quiz_attempt where created_at > now() - interval '30 days'
          group by user_id, lesson_path
        ) b group by user_id
      ),
      cp as (
        select user_id, sum(case kind when 'showcase' then 50 else 25 end) as pts, count(*)::int as contributions
        from app.submission where status = 'approved' and coalesce(reviewed_at, created_at) > now() - interval '30 days'
        group by user_id
      )
      select u.id::text as user_id, u.name, u.image,
             coalesce(lp.lessons_done, 0) as lessons_done,
             coalesce(cp.contributions, 0) as contributions,
             coalesce(lp.pts, 0) + coalesce(qp.pts, 0) + coalesce(cp.pts, 0) as points
      from neon_auth."user" u
      left join lp on lp.user_id = u.id::text
      left join qp on qp.user_id = u.id::text
      left join cp on cp.user_id = u.id::text
      where coalesce(lp.pts, 0) + coalesce(qp.pts, 0) + coalesce(cp.pts, 0) > 0
      order by points desc, lessons_done desc, u.name asc
      limit ${MAX_LIMIT}
    ` as Row[]
  })

  const me = await getSessionUser(event)
  const myIndex = me ? rows.findIndex(r => r.user_id === me.id) : -1

  setResponseHeader(event, 'cache-control', me ? 'private, no-store' : 'public, max-age=60')

  const shape = (r: Row, i: number) => ({
    rank: i + 1,
    // A learner who never set a name is shown as Anonymous rather than as a
    // blank row or, worse, an email local-part.
    name: r.name?.trim() || 'Anonymous learner',
    image: r.image,
    points: Number(r.points),
    lessonsDone: Number(r.lessons_done),
    contributions: Number(r.contributions),
    isMe: i === myIndex
  })

  return {
    period,
    entries: rows.slice(0, take).map(shape),
    me: myIndex >= 0 ? shape(rows[myIndex]!, myIndex) : null
  }
})
