/**
 * Whether a user has Pro right now — the one definition every route uses.
 * Pro comes from either their own entitlement (points or an admin grant) or a
 * seat in an active organisation (app.org_member).
 */
export async function hasPro(userId: string): Promise<boolean> {
  const rows = await useDb()`
    select 1 from app.entitlement
    where user_id = ${userId} and pro and (expires_at is null or expires_at > now())
    union all
    select 1 from app.org_member m join app.org o on o.id = m.org_id
    where m.user_id = ${userId} and (o.expires_at is null or o.expires_at > now())
    limit 1`
  return rows.length > 0
}

/** The spendable points balance (welcome + earned + ledger). */
export async function pointsBalance(userId: string): Promise<number> {
  const [row] = await useDb()`select balance from app.wallet where user_id = ${userId}`
  return Number(row?.balance ?? WELCOME_POINTS)
}

/** A fresh org join code: 8 characters, no 0/O/1/I to misread. */
export function newJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return [...bytes].map(b => alphabet[b % alphabet.length]).join('')
}
