/**
 * A Dodo customer-portal link, where a subscriber manages or cancels — and a
 * team owner changes seats. A personal subscription wins; otherwise the
 * customer behind a team the caller owns.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const sql = useDb()
  const rows = await sql`
    select dodo_customer_id from app.entitlement where user_id = ${user.id} and dodo_customer_id is not null
    union all
    select dodo_customer_id from app.team where owner_user_id = ${user.id} and dodo_customer_id is not null
    limit 1
  `
  const customer = rows[0]?.dodo_customer_id as string | undefined
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'No billing account yet' })

  const res = await dodoFetch<{ link: string }>(`/customers/${customer}/customer-portal/session`, { method: 'POST' })
  setResponseHeader(event, 'cache-control', 'no-store')
  return { url: res.link }
})
