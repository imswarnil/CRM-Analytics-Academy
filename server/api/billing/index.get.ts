/** The signed-in user's access and how they hold it. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const [[ent], [sub], [org], access] = await Promise.all([
    sql`select product, granted_at, expires_at from app.entitlement where user_id = ${user.id} and (expires_at is null or expires_at > now())`,
    sql`select status, current_period_end, cancel_at_period_end from app.subscription where user_id = ${user.id}`,
    sql`select o.name, o.kind, m.role from app.org_member m join app.org o on o.id = m.org_id where m.user_id = ${user.id}`,
    accessFor(user.id)
  ])
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    configured: stripeConfigured(),
    access,
    lifetime: ent ? { product: String(ent.product), at: ent.granted_at as string, until: (ent.expires_at as string | null) ?? null } : null,
    subscription: sub ? { status: String(sub.status), periodEnd: (sub.current_period_end as string | null) ?? null, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) } : null,
    org: org ? { name: String(org.name), kind: String(org.kind), role: String(org.role) } : null
  }
})
