/**
 * Everything the signed-in learner's dashboard and the lesson player need,
 * in one round trip: completed lessons, bookmarks, best quiz scores, points,
 * rank, a day-by-day activity record (for the streak and the heatmap), and the
 * top of the leaderboard.
 *
 * The user id comes from the session Neon Auth resolves, never from the
 * request. No lesson total here: the denominator lives in the content tree,
 * which the browser already has for the sidebar.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()

  const [completed, points, days, quizzes, bookmarks, leaders, demo] = await Promise.all([
    sql`select lesson_path, completed_at from app.progress where user_id = ${user.id} order by completed_at desc`,
    // Rank is a position in an ordering, so it is computed, never stored.
    sql`
      select p.points, p.contributions,
             (select count(*) + 1 from app.user_points q where q.points > p.points) as rank,
             (select count(*) from app.user_points q where q.points > 0) as ranked
      from app.user_points p
      where p.user_id = ${user.id}
    `,
    // Every day with any learning activity in the last year: lessons
    // completed and quizzes taken. Drives the streak and the heatmap.
    sql`
      select day::text as day, sum(n)::int as n from (
        select completed_at::date as day, count(*) as n from app.progress
          where user_id = ${user.id} and completed_at > now() - interval '366 days' group by 1
        union all
        select created_at::date, count(*) from app.quiz_attempt
          where user_id = ${user.id} and created_at > now() - interval '366 days' group by 1
      ) a group by 1 order by 1
    `,
    sql`
      select lesson_path, max(score)::int as best, max(total)::int as total, count(*)::int as attempts, max(created_at) as last_at
      from app.quiz_attempt where user_id = ${user.id}
      group by 1 order by last_at desc
    `,
    sql`select lesson_path, created_at from app.bookmark where user_id = ${user.id} order by created_at desc`,
    sql`
      select user_id, name, image, points, lessons_done from app.user_points
      where points > 0 order by points desc, lessons_done desc limit 5
    `,
    isDemoUser(user.id)
  ])

  // Current streak: consecutive days with activity ending today or yesterday
  // (a streak is not broken until a whole day passes without learning).
  const active = new Set(days.map(r => String(r.day)))
  const dayKey = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10)
  let streak = 0
  for (let i = active.has(dayKey(0)) ? 0 : 1; active.has(dayKey(i)); i++) streak++
  let longest = 0
  let run = 0
  let prev = ''
  for (const d of [...active].sort()) {
    run = prev && (Date.parse(d) - Date.parse(prev)) === 86_400_000 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = d
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')
  const pts = Number(points[0]?.points ?? 0)
  return {
    completed: completed.map(r => r.lesson_path as string),
    completedAt: Object.fromEntries(completed.map(r => [r.lesson_path as string, String(r.completed_at)])),
    bookmarks: bookmarks.map(r => r.lesson_path as string),
    quizzes: quizzes.map(r => ({ path: r.lesson_path as string, best: Number(r.best), total: Number(r.total), attempts: Number(r.attempts) })),
    days: days.map(r => ({ day: String(r.day), count: Number(r.n) })),
    streak,
    longestStreak: longest,
    admin: isAdmin(user),
    demo,
    points: pts,
    contributions: Number(points[0]?.contributions ?? 0),
    // Unranked until they have earned something.
    rank: pts > 0 ? Number(points[0]?.rank ?? 0) : null,
    ranked: Number(points[0]?.ranked ?? 0),
    leaders: leaders.map(r => ({
      me: r.user_id === user.id,
      // First name only: the leaderboard is visible to every learner.
      name: String(r.name || 'Learner').split(/\s+/)[0],
      image: r.image as string | null,
      points: Number(r.points),
      lessons: Number(r.lessons_done)
    }))
  }
})
