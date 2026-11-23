/** Sequences with their steps and enrollment counts by status. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sql = useDb()
  const [seqs, steps, counts] = await Promise.all([
    sql`select * from app.prospect_sequence order by created_at desc`,
    sql`select * from app.prospect_step order by sequence_id, position`,
    sql`select sequence_id, status, count(*)::int as n from app.prospect_enrollment group by 1, 2`
  ])
  return {
    sequences: seqs.map(s => ({
      id: Number(s.id), name: String(s.name), status: String(s.status), reviewedAt: s.reviewed_at ? String(s.reviewed_at) : null,
      startedAt: s.started_at ? String(s.started_at) : null,
      steps: steps.filter(x => Number(x.sequence_id) === Number(s.id)).map(x => ({ delayDays: Number(x.delay_days), subject: String(x.subject), body: String(x.body) })),
      enrollments: Object.fromEntries(counts.filter(c => Number(c.sequence_id) === Number(s.id)).map(c => [String(c.status), Number(c.n)]))
    }))
  }
})
