/** The signed-in user's billing: their Pro subscription and any team they run or belong to. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const [[sub], [team]] = await Promise.all([
    sql`select plan, status, current_period_end, cancel_at_period_end from app.subscription where user_id = ${user.id}`,
    sql`select o.id, o.name, o.seats, o.status, o.billing, o.admin_user_id = ${user.id} as admin from app.org o
        left join app.org_member m on m.org_id = o.id and m.user_id = ${user.id}
        where m.user_id is not null or o.admin_user_id = ${user.id} order by (o.status = 'active') desc, o.id desc limit 1`
  ])
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    configured: stripeConfigured(),
    pro: await hasPro(user.id),
    subscription: sub ? { plan: String(sub.plan), status: String(sub.status), periodEnd: sub.current_period_end, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) } : null,
    team: team ? { id: Number(team.id), name: String(team.name), seats: Number(team.seats), status: String(team.status), billing: String(team.billing), admin: Boolean(team.admin) } : null
  }
})
