/** Toggle the signed-in learner's upvote on an interview question (by slug). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const slug = String(getRouterParam(event, 'slug') ?? '')
  if (!/^[a-z0-9-]{3,100}$/.test(slug)) throw createError({ statusCode: 400, statusMessage: 'Bad question' })
  const sql = useDb()
  const removed = await sql`delete from app.interview_upvote where user_id = ${user.id} and slug = ${slug} returning 1`
  if (!removed.length) await sql`insert into app.interview_upvote (user_id, slug) values (${user.id}, ${slug}) on conflict do nothing`
  const [c] = await sql`select count(*)::int as n from app.interview_upvote where slug = ${slug}`
  forget('interview-votes')
  setResponseHeader(event, 'cache-control', 'no-store')
  return { voted: !removed.length, upvotes: Number(c?.n ?? 0) }
})
