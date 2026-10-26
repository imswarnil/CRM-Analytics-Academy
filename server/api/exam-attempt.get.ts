/** The signed-in learner's best score and attempt count per practice paper. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await useDb()`
    select paper, max(round(100.0 * score / total))::int as best, count(*)::int as attempts, max(created_at) as last_at
    from app.exam_attempt where user_id = ${user.id} group by paper`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return Object.fromEntries(rows.map(r => [String(r.paper), { best: Number(r.best), attempts: Number(r.attempts), lastAt: r.last_at }]))
})
