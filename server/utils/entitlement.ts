/**
 * Whether a user has Pro — the one definition every route uses. Pro comes
 * from any of three places, answered in a single query:
 *
 *   app.entitlement   a lifetime purchase (Stripe webhook) or an admin grant
 *   app.subscription  a monthly subscription that is active, trialing or
 *                     past due, kept by the Stripe webhook
 *   app.org_member    a seat in an active organisation (company, college, team)
 */
export async function accessFor(userId: string): Promise<Access> {
  const [row] = await useDb()`
    select exists (
      select 1 from app.entitlement
       where user_id = ${userId} and (expires_at is null or expires_at > now())
      union all
      select 1 from app.subscription
       where user_id = ${userId} and status in ('active', 'trialing', 'past_due')
      union all
      select 1 from app.org_member m join app.org o on o.id = m.org_id
       where m.user_id = ${userId} and o.status = 'active' and (o.expires_at is null or o.expires_at > now())
    ) as pro`
  return row?.pro ? 'pro' : 'free'
}

export async function hasPro(userId: string): Promise<boolean> {
  return (await accessFor(userId)) === 'pro'
}

/** Points shown to the learner: the welcome grant + what they earned. */
export async function pointsBalance(userId: string): Promise<number> {
  const [row] = await useDb()`select points from app.user_points where user_id = ${userId}`
  return WELCOME_POINTS + Number(row?.points ?? 0)
}

/** A fresh org join code: 8 characters, no 0/O/1/I to misread. */
export function newJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return [...crypto.getRandomValues(new Uint8Array(8))].map(b => alphabet[b % alphabet.length]).join('')
}
