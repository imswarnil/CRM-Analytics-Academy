/**
 * What a user may open — the one definition every route uses.
 *
 *   pro      app.entitlement: the $99 All Access purchase (written by the
 *            Stripe webhook) or an admin grant
 *   youtube  app.youtube_link: a subscription to the channel, verified with
 *            Google within YOUTUBE_RECHECK_DAYS
 *   free     everyone else
 *
 * One query answers both, so a lesson request costs a single round trip.
 */
export async function accessFor(userId: string): Promise<Access> {
  const [row] = await useDb()`
    select
      exists (select 1 from app.entitlement where user_id = ${userId} and pro and (expires_at is null or expires_at > now())) as pro,
      exists (select 1 from app.youtube_link where user_id = ${userId} and subscribed
              and verified_at > now() - make_interval(days => ${YOUTUBE_RECHECK_DAYS})) as youtube`
  return row?.pro ? 'pro' : row?.youtube ? 'youtube' : 'free'
}

/** All Access (paid or granted). */
export async function hasPro(userId: string): Promise<boolean> {
  return (await accessFor(userId)) === 'pro'
}

/** The spendable points balance (welcome + earned + ledger). */
export async function pointsBalance(userId: string): Promise<number> {
  const [row] = await useDb()`select balance from app.wallet where user_id = ${userId}`
  return Number(row?.balance ?? WELCOME_POINTS)
}
