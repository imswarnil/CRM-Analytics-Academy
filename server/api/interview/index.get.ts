/**
 * The approved interview questions, filtered and paged, with facet counts.
 *
 *   GET /api/interview?type=&topic=&level=&company=&q=&page=1
 *
 * Public and cached at the edge for five minutes; read by /interview-questions
 * during server rendering, so the list is crawlable.
 */
const PAGE = 24

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = INTERVIEW_TYPES.includes(query.type as InterviewType) ? String(query.type) : null
  const level = INTERVIEW_LEVELS.includes(query.level as InterviewLevel) ? String(query.level) : null
  const topic = /^[a-z0-9-]{2,40}$/.test(String(query.topic ?? '')) ? String(query.topic) : null
  const company = String(query.company ?? '').trim().slice(0, 80) || null
  const q = String(query.q ?? '').trim().slice(0, 100) || null
  const page = Math.max(1, Math.min(200, Number(query.page) || 1))
  const like = q ? `%${q.replace(/[%_]/g, '')}%` : null
  const sql = useDb()

  // One WHERE for the page and its count; $1–$5 are always the same filters.
  const cond = `status = 'approved'
    and ($1::text is null or type = $1)
    and ($2::text is null or level = $2)
    and ($3::text is null or topic = $3)
    and ($4::text is null or lower(company) = lower($4))
    and ($5::text is null or question ilike $5 or answer_md ilike $5)`
  const params = [type, level, topic, company, like]

  const [rows, [count], types, topics, companies, levels] = await Promise.all([
    sql.query(`select slug, question, answer_md, type, topic, level, company, role, source, upvotes, created_at
      from app.interview_question where ${cond}
      order by upvotes desc, (source = 'community') desc, id
      limit ${PAGE} offset ${(page - 1) * PAGE}`, params),
    sql.query(`select count(*)::int as n from app.interview_question where ${cond}`, params),
    sql`select type as key, count(*)::int as n from app.interview_question where status = 'approved' group by 1 order by 2 desc`,
    sql`select topic as key, count(*)::int as n from app.interview_question where status = 'approved' group by 1 order by 2 desc`,
    sql`select company as key, count(*)::int as n from app.interview_question where status = 'approved' and company is not null group by 1 order by 2 desc limit 30`,
    sql`select level as key, count(*)::int as n from app.interview_question where status = 'approved' group by 1`
  ])

  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300')
  const facet = (r: Record<string, unknown>[]) => r.map(x => ({ key: String(x.key), count: Number(x.n) }))
  return {
    page,
    pageSize: PAGE,
    total: Number(count?.n ?? 0),
    items: rows.map(r => ({
      slug: String(r.slug),
      question: String(r.question),
      excerpt: excerpt(String(r.answer_md)),
      type: String(r.type),
      topic: String(r.topic),
      level: String(r.level),
      company: r.company as string | null,
      role: r.role as string | null,
      community: r.source === 'community',
      upvotes: Number(r.upvotes)
    })),
    facets: { types: facet(types), topics: facet(topics), companies: facet(companies), levels: facet(levels) }
  }
})
