/**
 * Every user, with what app.* knows about them: lessons done, points, last
 * activity and whether they are the demo account. One query, so the numbers
 * on a row all come from the same moment.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()

  const rows = await sql`
    select u.id::text as id, u.email, u.name, u.image, u."createdAt" as created_at, u."emailVerified" as email_verified,
           coalesce(p.points, 0)::int as points,
           coalesce(p.lessons_done, 0)::int as lessons_done,
           (select max(completed_at) from app.progress pr where pr.user_id = u.id::text) as last_lesson_at,
           (select count(*)::int from app.quiz_attempt q where q.user_id = u.id::text) as quizzes,
           (select count(*)::int from app.comment c where c.user_id = u.id::text) as comments,
           exists (select 1 from app.demo_account d where d.user_id = u.id::text) as is_demo
    from neon_auth."user" u
    left join app.user_points p on p.user_id = u.id::text
    order by u."createdAt" desc
    limit 1000
  `

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    users: rows.map(r => ({
      id: r.id as string,
      email: r.email as string,
      name: r.name as string | null,
      image: r.image as string | null,
      createdAt: r.created_at,
      emailVerified: Boolean(r.email_verified),
      points: Number(r.points),
      lessonsDone: Number(r.lessons_done),
      quizzes: Number(r.quizzes),
      comments: Number(r.comments),
      lastLessonAt: r.last_lesson_at ?? null,
      isDemo: Boolean(r.is_demo),
      admin: String(r.email).toLowerCase() === ADMIN_EMAIL
    }))
  }
})
