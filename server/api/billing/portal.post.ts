/**
 * Stripe's customer portal: change plan, update the card, see invoices,
 * cancel. { team: true } opens the team's billing (admins only).
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ team?: boolean }>(event).catch(() => null)
  const sql = useDb()
  let customer: string | null
  if (body?.team) {
    const [org] = await sql`select stripe_customer from app.org where admin_user_id = ${user.id} and stripe_customer is not null order by id desc limit 1`
    customer = (org?.stripe_customer as string) ?? null
  } else {
    const [sub] = await sql`select stripe_customer from app.subscription where user_id = ${user.id}`
    customer = (sub?.stripe_customer as string) ?? null
  }
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'No billing account yet.' })
  const origin = getRequestOrigin(event)
  const portal = await stripe<{ url: string }>('POST', 'billing_portal/sessions', { customer, return_url: `${origin}${body?.team ? '/team' : '/dashboard'}` })
  return { url: portal.url }
})
