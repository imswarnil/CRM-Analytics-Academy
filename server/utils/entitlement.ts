/**
 * Whether a user has Pro right now. The one definition, so the lesson API,
 * the progress payload and the account page cannot disagree.
 *
 * Pro is active when the flag is set and there is either no period end (an
 * admin grant, a lifetime purchase) or the paid period has not ended. The
 * three days of grace absorb a renewal webhook that arrives late.
 */
export async function hasPro(userId: string): Promise<boolean> {
  const sql = useDb()
  const rows = await sql`
    select 1 from app.entitlement
    where user_id = ${userId}
      and pro
      and (current_period_end is null or current_period_end > now() - interval '3 days')
  `
  return rows.length > 0
}
