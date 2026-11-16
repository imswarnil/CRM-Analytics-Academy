/** The signed-in user's access: what they hold and how they got it. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const [[ent], [yt], access] = await Promise.all([
    sql`select product, granted_at from app.entitlement where user_id = ${user.id} and pro and (expires_at is null or expires_at > now())`,
    sql`select subscribed, verified_at from app.youtube_link where user_id = ${user.id}`,
    accessFor(user.id)
  ])
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    configured: stripeConfigured(),
    access,
    pro: access === 'pro',
    purchase: ent ? { product: String(ent.product), at: ent.granted_at as string } : null,
    youtube: yt ? { subscribed: Boolean(yt.subscribed), verifiedAt: yt.verified_at as string } : null
  }
})
