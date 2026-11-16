/**
 * Stripe → the Academy. Signature-checked (STRIPE_WEBHOOK_SECRET), each event
 * handled once (app.stripe_event). Subscribe the endpoint to:
 *
 *   checkout.session.completed
 *   charge.refunded
 *
 * All Access is one payment: a completed, paid checkout writes the buyer's
 * app.entitlement row (no expiry); a full refund removes it. The buyer reaches
 * Salesforce as a Web-to-Lead event.
 */
async function userById(id: string) {
  const [u] = await useDb()`select id::text as id, email, name from neon_auth."user" where id::text = ${id}`
  return u ? { id: String(u.id), email: String(u.email), name: u.name as string | null } : null
}

export default defineEventHandler(async (event) => {
  const payload = await readRawBody(event, 'utf8') ?? ''
  if (!(await verifyStripeSignature(payload, getRequestHeader(event, 'stripe-signature')))) {
    throw createError({ statusCode: 400, statusMessage: 'Bad signature' })
  }
  const evt = JSON.parse(payload) as { id: string, type: string, data: { object: Record<string, unknown> } }
  const sql = useDb()
  const fresh = await sql`insert into app.stripe_event (id, type) values (${evt.id}, ${evt.type}) on conflict do nothing returning id`
  if (!fresh.length) return { ok: true, duplicate: true }

  try {
    const obj = evt.data.object
    const meta = (obj.metadata ?? {}) as Record<string, string>
    if (evt.type === 'checkout.session.completed' && meta.kind === 'all_access' && meta.user_id && obj.payment_status === 'paid') {
      const added = await sql`
        insert into app.entitlement (user_id, pro, product, note)
        values (${meta.user_id}, true, 'all-access', ${`stripe ${String(obj.id)}`})
        on conflict (user_id) do update set pro = true, product = 'all-access', expires_at = null, note = excluded.note
        returning user_id`
      const user = added.length ? await userById(meta.user_id) : null
      if (user) await sendAcademyEvent('subscribe', user, { plan: 'allAccess', usd: Number(obj.amount_total ?? 0) / 100, seats: 1 })
    } else if (evt.type === 'charge.refunded' && obj.refunded === true && typeof obj.payment_intent === 'string') {
      // A charge does not carry the checkout's metadata: find the session.
      const found = await stripe<{ data: { metadata?: Record<string, string> }[] }>('GET', 'checkout/sessions', { payment_intent: obj.payment_intent, limit: 1 })
      const m = found.data[0]?.metadata
      if (m?.kind === 'all_access' && m.user_id) {
        await sql`delete from app.entitlement where user_id = ${m.user_id} and product = 'all-access'`
      }
    }
  } catch (e) {
    // Let Stripe retry: forget that this event was handled.
    await sql`delete from app.stripe_event where id = ${evt.id}`
    throw e
  }
  return { ok: true }
})
