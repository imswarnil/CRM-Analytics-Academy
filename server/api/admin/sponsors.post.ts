/**
 * Owner actions on a sponsorship: { id, action, note? }
 *
 *   invoice   create and email a Stripe invoice for the package (7 days to pay);
 *             the webhook marks it paid
 *   approve   approve the sponsor's banner (goes live if paid)
 *   changes   send the banner back with a note
 *   paid      mark paid by hand (paid outside Stripe)
 *   end       take it down now
 *   cancel    cancel a request
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: number, action?: string, note?: string }>(event).catch(() => null)
  const id = Number(body?.id)
  const sql = useDb()
  const [s] = await sql`select * from app.sponsor where id = ${id}`
  if (!s) throw createError({ statusCode: 404, statusMessage: 'No such sponsorship' })
  const note = String(body?.note ?? '').slice(0, 300) || null

  switch (body?.action) {
    case 'invoice': {
      const pkg = s.package as SponsorPackage
      const found = await stripe<{ data: { id: string }[] }>('GET', 'customers', { email: s.email, limit: 1 })
      const customer = found.data[0]?.id ?? (await stripe<{ id: string }>('POST', 'customers', { email: s.email, name: s.company, metadata: { sponsor_id: String(id) } })).id
      await stripe('POST', 'invoiceitems', { customer, price: await priceId(pkg), metadata: { sponsor_id: String(id) } })
      const inv = await stripe<{ id: string }>('POST', 'invoices', {
        customer, collection_method: 'send_invoice', days_until_due: 7, pending_invoice_items_behavior: 'include',
        description: `CRM Analytics Academy — sitewide sponsorship, ${s.days} days`, metadata: { sponsor_id: String(id) }
      })
      const final = await stripe<{ id: string, hosted_invoice_url: string }>('POST', `invoices/${inv.id}/finalize`)
      await stripe('POST', `invoices/${inv.id}/send`)
      await sql`update app.sponsor set status = 'invoiced', stripe_customer = ${customer}, stripe_invoice = ${final.id}, invoice_url = ${final.hosted_invoice_url} where id = ${id}`
      break
    }
    case 'approve':
      await sql`update app.sponsor set creative_status = 'approved', review_note = null where id = ${id}`
      break
    case 'changes':
      await sql`update app.sponsor set creative_status = 'changes', review_note = ${note} where id = ${id}`
      break
    case 'paid':
      await sql`update app.sponsor set status = 'paid' where id = ${id} and status in ('requested', 'invoiced')`
      break
    case 'end':
      await sql`update app.sponsor set status = 'ended', ends_at = now() where id = ${id}`
      break
    case 'cancel':
      await sql`update app.sponsor set status = 'cancelled' where id = ${id} and status in ('requested', 'invoiced')`
      break
    default:
      throw createError({ statusCode: 400, statusMessage: 'Unknown action' })
  }
  await settleSponsors()
  const [after] = await sql`select * from app.sponsor where id = ${id}`
  return { ok: true, sponsorship: sponsorView(after!) }
})
