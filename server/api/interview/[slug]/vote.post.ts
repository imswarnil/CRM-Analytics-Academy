/** Toggle the signed-in learner's upvote on an interview question. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const slug = String(getRouterParam(event, 'slug') ?? '')
  const sql = useDb()
  const [q] = await sql`select id from app.interview_question where slug = ${slug} and status = 'approved'`
  if (!q) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const removed = await sql`delete from app.interview_vote where user_id = ${user.id} and question_id = ${q.id} returning 1`
  if (!removed.length) await sql`insert into app.interview_vote (user_id, question_id) values (${user.id}, ${q.id}) on conflict do nothing`
  const [c] = await sql`
    update app.interview_question
    set upvotes = (select count(*) from app.interview_vote where question_id = ${q.id})
    where id = ${q.id} returning upvotes`
  setResponseHeader(event, 'cache-control', 'no-store')
  return { voted: !removed.length, upvotes: Number(c?.upvotes ?? 0) }
})
