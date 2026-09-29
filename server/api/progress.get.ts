/**
 * The signed-in learner's progress and entitlement.
 *
 * The user id comes from the session Neon Auth resolves, never from the
 * request — a client-supplied id would let anyone read anyone's progress by
 * changing a number.
 *
 * No lesson total here on purpose. The denominator lives in the content tree,
 * which the browser already has for the sidebar; making the server re-derive
 * it would mean querying the content collection on every dashboard load to
 * produce a number the client can count for free.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()

  // Points and rank ride along because the dashboard shows them next to the
  // progress they are computed from — a second round trip for two integers
  // that come out of the same request is a second chance for the two numbers
  // to disagree.
  //
  // Rank is computed here rather than read from a stored column: it is a
  // position in an ordering, so it changes when *other* people earn points,
  // and nothing would ever know to update this user's row.
  const [completed, entitlement, points, activity] = await Promise.all([
    sql`select lesson_path from app.progress where user_id = ${user.id} order by completed_at desc`,
    hasPro(user.id),
    sql`
      select p.points, p.contributions,
             (select count(*) + 1 from app.user_points q
               where q.points > p.points) as rank
      from app.user_points p
      where p.user_id = ${user.id}
    `,
    // Lessons completed per week for the last 12 weeks, for the dashboard's
    // activity chart. Weeks with nothing are filled in on the client.
    sql`
      select to_char(date_trunc('week', completed_at), 'YYYY-MM-DD') as week, count(*)::int as n
      from app.progress
      where user_id = ${user.id} and completed_at > now() - interval '12 weeks'
      group by 1 order by 1
    `
  ])

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    completed: completed.map(r => r.lesson_path as string),
    activity: activity.map(r => ({ week: r.week as string, count: Number(r.n) })),
    pro: entitlement,
    points: Number(points[0]?.points ?? 0),
    contributions: Number(points[0]?.contributions ?? 0),
    // Unranked until they have earned something — rank 1 of nobody is not a
    // fact worth showing.
    rank: Number(points[0]?.points ?? 0) > 0 ? Number(points[0]?.rank ?? 0) : null
  }
})
