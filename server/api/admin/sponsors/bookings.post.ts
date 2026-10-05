/**
 * Manual booking — a sponsor who pays by invoice, or a complimentary month.
 *
 * The sponsor must already have an account on the site (they need one to
 * build their creatives in the studio); they are found by email. Months go
 * straight to 'paid' with source 'invoice' or 'comp', subject to the same
 * one-sponsor-per-month index as a checkout.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ email?: string, name?: string, website?: string, months?: unknown, source?: string, note?: string, amountUsd?: number }>(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const source = body?.source === 'comp' ? 'comp' : 'invoice'
  const note = String(body?.note ?? '').trim().slice(0, 500) || null
  const months = Array.isArray(body?.months) ? [...new Set(body.months.map(String))].sort() : []
  if (!months.length) throw createError({ statusCode: 400, statusMessage: 'Pick at least one month.' })
  if (months.some(m => !PARTNER_MONTH_RE.test(m))) throw createError({ statusCode: 400, statusMessage: 'Months look like 2026-11.' })
  const amountCents = source === 'comp' ? 0 : Math.max(0, Math.round(Number(body?.amountUsd ?? PARTNER_PRICE_USD) * 100))

  const sql = useDb()
  const users = await sql`select id::text, email from neon_auth."user" where lower(email) = ${email} limit 1`
  const u = users[0]
  if (!u) throw createError({ statusCode: 404, statusMessage: 'No account with that email. Ask them to sign up first.' })

  let sponsor = await findSponsor(sql, u.id as string)
  if (!sponsor) {
    const name = String(body?.name ?? '').trim().slice(0, 80)
    if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Give the brand name for a new sponsor.' })
    const rows = await sql`
      insert into app.sponsor (user_id, name, website, contact_email)
      values (${u.id}, ${name}, ${cleanWebsite(body?.website)}, ${u.email})
      returning id::text, name, website, contact_email
    `
    sponsor = { id: rows[0]!.id as string, name: rows[0]!.name as string, website: rows[0]!.website as string | null, contactEmail: rows[0]!.contact_email as string }
  }

  await releaseExpiredHolds(sql)
  try {
    await sql`
      insert into app.sponsor_booking (sponsor_id, month, status, source, amount_cents, note, paid_at)
      select ${sponsor.id}::uuid, m::date, 'paid', ${source}, ${amountCents}, ${note}, now()
      from unnest(${months.map(monthDate)}::text[]) as m
    `
  } catch (e) {
    if ((e as { code?: string }).code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'One of those months is already held or booked.' })
    }
    throw e
  }
  await placementChanged()
  return { ok: true }
})
