/** Whether a user has Pro right now — the one definition every route uses. */
export async function hasPro(userId: string): Promise<boolean> {
  const rows = await useDb()`
    select 1 from app.entitlement
    where user_id = ${userId} and pro and (expires_at is null or expires_at > now())
    limit 1`
  return rows.length > 0
}
