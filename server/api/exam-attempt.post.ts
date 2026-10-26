/** Record a finished certification practice paper for the signed-in learner. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ paper?: string, score?: number, total?: number, seconds?: number, domains?: Record<string, { score: number, total: number }> }>(event)
  const paper = String(body?.paper ?? '')
  const total = Number(body?.total)
  const score = Number(body?.score)
  const seconds = Math.min(Math.max(Math.round(Number(body?.seconds) || 0), 0), 6 * 3600)
  if (!/^[a-z0-9-]{2,40}$/.test(paper) || !Number.isInteger(total) || total <= 0 || total > 200 || !Number.isInteger(score) || score < 0 || score > total) {
    throw createError({ statusCode: 400, statusMessage: 'Bad attempt' })
  }
  const domains = Object.fromEntries(Object.entries(body?.domains ?? {}).slice(0, 12)
    .filter(([k, v]) => /^[a-z-]{2,40}$/.test(k) && Number.isInteger(v?.score) && Number.isInteger(v?.total))
    .map(([k, v]) => [k, { score: v.score, total: v.total }]))
  if (await isDemoUser(user.id)) return { ok: true, saved: false }
  await useDb()`insert into app.exam_attempt (user_id, paper, score, total, seconds, domains)
    values (${user.id}, ${paper}, ${score}, ${total}, ${seconds}, ${JSON.stringify(domains)}::jsonb)`
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, saved: true }
})
