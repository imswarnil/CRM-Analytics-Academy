/**
 * Buy session packs with points: { packs } (1–10) → packs × PACK_SESSIONS
 * sessions for packs × PACK_POINTS points. One transaction under an advisory
 * lock on the user: the points row only exists if the balance covers it, and
 * the sessions row only if the points row does. Salesforce hears about it as
 * a self-serve purchase (Web-to-Lead event `pack`).
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'meter-buy', 20, 60)
  const body = await readBody<{ packs?: number }>(event).catch(() => null)
  const packs = Math.round(Number(body?.packs ?? 1))
  if (!(packs >= 1 && packs <= 10)) throw createError({ statusCode: 400, statusMessage: 'Buy 1 to 10 packs at a time.' })
  const points = packs * PACK_POINTS
  const sessions = packs * PACK_SESSIONS

  const sql = useDb()
  const [, spent] = await sql.transaction([
    sql`select pg_advisory_xact_lock(hashtext(${`points:${user.id}`}))`,
    sql`
      with paid as (
        insert into app.points_ledger (user_id, delta, reason, note)
        select ${user.id}, ${-points}, 'session_pack', ${`${sessions} sessions`}
        where coalesce((select balance from app.wallet where user_id = ${user.id}), ${WELCOME_POINTS}) >= ${points}
        returning id
      )
      insert into app.session_ledger (user_id, sessions, points, reason)
      select ${user.id}, ${sessions}, ${points}, 'pack' from paid
      returning id`
  ])
  if (!spent?.length) throw createError({ statusCode: 402, statusMessage: `A pack costs ${PACK_POINTS} points — finish a lesson or a quiz to earn more.` })

  event.waitUntil(sendAcademyEvent('pack', user, { packs, points, sessions }))
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, balance: await pointsBalance(user.id), status: await meterStatus(event, user) }
})
