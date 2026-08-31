/**
 * The signed-in learner's progress and entitlement.
 *
 * The user id comes from the session Neon Auth resolves, never from the
 * request — a client-supplied id would let anyone read anyone's progress by
 * changing a number.
 *
 * No lesson total here on purpose. The denominator lives in the content tree,
 * which the browser already has for the sidebar; making the server re-derive
 * it would mean querying the content collection on every dashboard load to
 * produce a number the client can count for free.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()

  const [completed, entitlement] = await Promise.all([
    sql`select lesson_path from app.progress where user_id = ${user.id} order by completed_at desc`,
    sql`select pro from app.entitlement where user_id = ${user.id}`
  ])

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    completed: completed.map(r => r.lesson_path as string),
    pro: Boolean(entitlement[0]?.pro)
  }
})
