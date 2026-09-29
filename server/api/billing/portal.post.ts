/** A Dodo customer-portal link, where a subscriber manages or cancels. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const rows = await sql`select dodo_customer_id from app.entitlement where user_id = ${user.id}`
  const customer = rows[0]?.dodo_customer_id as string | undefined
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'No billing account yet' })

  const res = await dodoFetch<{ link: string }>(`/customers/${customer}/customer-portal/session`, { method: 'POST' })
  setResponseHeader(event, 'cache-control', 'no-store')
  return { url: res.link }
})
