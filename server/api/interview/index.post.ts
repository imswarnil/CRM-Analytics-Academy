/**
 * Submit an interview question with a model answer (markdown). Lands as
 * `pending`; nothing is public until an admin approves it in /admin.
 */
const RATE = new Map<string, { count: number, resetAt: number }>()

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) throw createError({ statusCode: 403, statusMessage: 'The demo account cannot submit.' })
  const now = Date.now()
  const seen = RATE.get(user.id)
  if (seen && seen.resetAt > now && seen.count >= 10) throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' })
  RATE.set(user.id, seen && seen.resetAt > now ? { ...seen, count: seen.count + 1 } : { count: 1, resetAt: now + 3_600_000 })

  const body = await readBody<Record<string, unknown>>(event)
  const fail = (m: string): never => { throw createError({ statusCode: 400, statusMessage: m }) }
  const question = String(body?.question ?? '').trim()
  const answer = String(body?.answer ?? '').trim()
  if (question.length < 10 || question.length > 300) fail('The question must be 10–300 characters.')
  if (answer.length < 30 || answer.length > 12000) fail('The answer must be 30–12,000 characters.')
  if (/\]\(\s*(javascript|data|vbscript):/i.test(answer)) fail('Links must be http(s).')
  const type = INTERVIEW_TYPES.includes(body?.type as InterviewType) ? String(body.type) : 'conceptual'
  const level = INTERVIEW_LEVELS.includes(body?.level as InterviewLevel) ? String(body.level) : 'mid'
  const topic = /^[a-z0-9-]{2,40}$/.test(String(body?.topic ?? '')) ? String(body.topic) : 'foundations'
  const company = String(body?.company ?? '').trim().slice(0, 80) || null
  const role = String(body?.role ?? '').trim().slice(0, 80) || null
  if (company && company.length < 2) fail('Company name is too short.')

  const sql = useDb()
  const base = slugifyQuestion(question)
  const [{ n }] = await sql`select count(*)::int as n from app.interview_question where slug like ${`${base}%`}` as { n: number }[]
  const slug = n ? `${base}-${n + 1}` : base
  const [row] = await sql`
    insert into app.interview_question (slug, question, answer_md, type, topic, level, company, role, source, status, user_id)
    values (${slug}, ${question}, ${answer}, ${type}, ${topic}, ${level}, ${company}, ${role}, 'community', 'pending', ${user.id})
    returning id, slug`
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, id: Number(row?.id), slug: String(row?.slug) }
})
