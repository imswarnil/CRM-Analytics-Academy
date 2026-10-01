/**
 * Whether a user has Pro right now. The one definition, so the lesson API,
 * the progress payload and the account page cannot disagree.
 *
 * Pro comes from a personal entitlement or from a seat on an active team.
 * A personal one is active when the flag is set and there is either no period end (an
 * admin grant, a lifetime purchase) or the paid period has not ended. The
 * three days of grace absorb a renewal webhook that arrives late.
 */
export async function hasPro(userId: string): Promise<boolean> {
  const sql = useDb()
  // One round trip: a personal entitlement, or a seat on a team whose
  // subscription is live (with the same three days of grace).
  const rows = await sql`
    select 1 from app.entitlement
    where user_id = ${userId}
      and pro
      and (current_period_end is null or current_period_end > now() - interval '3 days')
    union all
    select 1 from app.team_member m
    join app.team t on t.id = m.team_id
    where m.user_id = ${userId}
      and t.status in ('active', 'past_due', 'cancelled')
      and (t.current_period_end is null or t.current_period_end > now() - interval '3 days')
    limit 1
  `
  return rows.length > 0
}
