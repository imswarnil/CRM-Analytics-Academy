/** Interview questions for review in /admin, oldest pending first. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const status = ['pending', 'approved', 'rejected'].includes(String(getQuery(event).status)) ? String(getQuery(event).status) : 'pending'
  const rows = await useDb().query(`
    select q.id, q.slug, q.question, q.answer_md, q.type, q.topic, q.level, q.company, q.role, q.source, q.status, q.created_at, u.email
    from app.interview_question q left join neon_auth."user" u on u.id::text = q.user_id
    where q.status = $1 and (q.source = 'community' or $1 <> 'approved')
    order by q.created_at ${status === 'pending' ? 'asc' : 'desc'} limit 200`, [status])
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return rows.map(r => ({ id: Number(r.id), slug: String(r.slug), question: String(r.question), answer: String(r.answer_md), type: String(r.type), topic: String(r.topic), level: String(r.level), company: r.company as string | null, role: r.role as string | null, status: String(r.status), createdAt: r.created_at, email: r.email as string | null }))
})
