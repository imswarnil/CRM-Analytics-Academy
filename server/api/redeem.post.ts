/**
 * Spend points on Pro: { plan: 'pro' } → PRO_DAYS more of Pro for PRO_POINTS.
 *
 * One transaction: an advisory lock on the user (so two clicks cannot spend
 * the same balance twice), then a ledger row that only exists if the balance
 * covers it, then the entitlement extended from whichever is later — now or
 * the current end date. A lifetime grant (no end date) is left alone.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ plan?: string }>(event).catch(() => null)
  if (body?.plan !== 'pro') throw createError({ statusCode: 400, statusMessage: 'Pick a plan.' })
  await rateLimit(event, 'redeem', 10, 60)

  const sql = useDb()
  const [current] = await sql`select expires_at from app.entitlement where user_id = ${user.id} and pro`
  if (current && current.expires_at === null) throw createError({ statusCode: 409, statusMessage: 'You already have Pro with no end date.' })

  const days = `${PRO_DAYS} days`
  const [, spent] = await sql.transaction([
    sql`select pg_advisory_xact_lock(hashtext(${`redeem:${user.id}`}))`,
    sql`
      insert into app.points_ledger (user_id, delta, reason, note)
      select ${user.id}, ${-PRO_POINTS}, 'redeem_pro', ${`Pro · ${PRO_DAYS} days`}
      where coalesce((select balance from app.wallet where user_id = ${user.id}), ${WELCOME_POINTS}) >= ${PRO_POINTS}
      returning id`,
    sql`
      insert into app.entitlement (user_id, pro, product, note, expires_at)
      select ${user.id}, true, 'points', 'Bought with points', now() + ${days}::interval
      where exists (select 1 from app.points_ledger where user_id = ${user.id} and reason = 'redeem_pro' and created_at = now())
      on conflict (user_id) do update
        set pro = true, product = 'points',
            expires_at = greatest(coalesce(app.entitlement.expires_at, now()), now()) + ${days}::interval,
            granted_at = now()
        where app.entitlement.expires_at is not null or not app.entitlement.pro`
  ])
  if (!spent?.length) throw createError({ statusCode: 402, statusMessage: `You need ${PRO_POINTS} points — keep learning to earn the rest.` })

  const [ent] = await sql`select expires_at from app.entitlement where user_id = ${user.id}`
  // Paid (in points): Salesforce turns them into a self-serve customer.
  event.waitUntil(sendAcademyEvent('redeem', user))
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, balance: await pointsBalance(user.id), proUntil: ent?.expires_at ?? null }
})
