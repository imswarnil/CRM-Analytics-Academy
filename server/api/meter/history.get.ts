/** The signed-in learner's last 50 sessions: page and when. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const rows = await useDb()`
    select path, day::text as day, created_at from app.meter_view
    where subject = ${`u:${user.id}`} order by created_at desc limit 50`
  const packs = await useDb()`select sessions, points, created_at from app.session_ledger where user_id = ${user.id} order by created_at desc limit 20`
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    sessions: rows.map(r => ({ path: String(r.path), day: String(r.day), at: r.created_at })),
    packs: packs.map(r => ({ sessions: Number(r.sessions), points: Number(r.points), at: r.created_at }))
  }
})
