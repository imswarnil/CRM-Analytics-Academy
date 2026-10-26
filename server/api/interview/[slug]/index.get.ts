/** One approved interview question with its markdown answer, and related ones. */
export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  if (!/^[a-z0-9-]{3,100}$/.test(slug)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const sql = useDb()
  const [row] = await sql`
    select id, slug, question, answer_md, type, topic, level, company, role, source, upvotes, created_at, updated_at
    from app.interview_question where slug = ${slug} and status = 'approved'`
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  const related = await sql`
    select slug, question, type, level from app.interview_question
    where status = 'approved' and topic = ${row.topic} and id <> ${row.id}
    order by upvotes desc, id limit 6`
  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300')
  return {
    slug: String(row.slug),
    question: String(row.question),
    answer: String(row.answer_md),
    type: String(row.type),
    topic: String(row.topic),
    level: String(row.level),
    company: row.company as string | null,
    role: row.role as string | null,
    community: row.source === 'community',
    upvotes: Number(row.upvotes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    related: related.map(r => ({ slug: String(r.slug), question: String(r.question), type: String(r.type), level: String(r.level) }))
  }
})
