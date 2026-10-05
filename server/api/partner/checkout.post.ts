/**
 * Book one or more consecutive months and start a Dodo checkout.
 *
 *   1. Signed in (not the demo account); brand name required the first time.
 *   2. Every requested month must be open and free. Each is HELD by inserting
 *      a booking row with status 'held' — the partial unique index on
 *      (month) where status in ('held','paid') is the lock, so of two buyers
 *      racing for one month exactly one insert succeeds. All months are held
 *      in a single statement, so a conflict on any one holds none.
 *   3. A Dodo checkout for DODO_PRODUCT_SPONSOR_MONTH × number of months, with
 *      the checkout_ref in metadata. Only the webhook turns held into paid;
 *      the return redirect grants nothing. A hold expires after
 *      PARTNER_HOLD_MINUTES, freeing an abandoned month.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot book a sponsorship.' })
  }

  const body = await readBody<{ months?: unknown, brand?: { name?: unknown, website?: unknown } }>(event)
  const months = Array.isArray(body?.months) ? [...new Set(body.months.map(String))].sort() : []
  if (!months.length || months.length > PARTNER_MONTHS_AHEAD) {
    throw createError({ statusCode: 400, statusMessage: 'Pick at least one month.' })
  }
  const bookable = partnerMonthWindow()
  for (const m of months) {
    if (!PARTNER_MONTH_RE.test(m) || !bookable.includes(m) || !partnerMonthOpen(m)) {
      throw createError({ statusCode: 400, statusMessage: `${m} cannot be booked.` })
    }
  }
  for (let i = 1; i < months.length; i++) {
    if (partnerNextMonth(months[i - 1]!) !== months[i]) {
      throw createError({ statusCode: 400, statusMessage: 'Months in one booking must be consecutive.' })
    }
  }

  const productId = partnerProduct()
  if (!productId) throw createError({ statusCode: 503, statusMessage: 'Sponsorship checkout is not available yet.' })

  const sql = useDb()

  // The sponsor account: created on first booking, brand details refreshed
  // when given.
  let sponsor = await findSponsor(sql, user.id)
  const name = String(body?.brand?.name ?? '').trim().slice(0, 80)
  const website = cleanWebsite(body?.brand?.website)
  if (!sponsor) {
    if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Tell us the brand name to show.' })
    const rows = await sql`
      insert into app.sponsor (user_id, name, website, contact_email)
      values (${user.id}, ${name}, ${website}, ${user.email})
      on conflict (user_id) do update set updated_at = now()
      returning id::text, name, website, contact_email
    `
    sponsor = { id: rows[0]!.id as string, name: rows[0]!.name as string, website: rows[0]!.website as string | null, contactEmail: rows[0]!.contact_email as string }
  } else if (name.length >= 2 || website) {
    await sql`
      update app.sponsor set name = ${name.length >= 2 ? name : sponsor.name}, website = coalesce(${website}, website), updated_at = now()
      where id = ${sponsor.id}::uuid
    `
  }

  await releaseExpiredHolds(sql)

  // A caller re-trying their own checkout should not be blocked by their own
  // fresh hold: release it first, then claim again.
  await sql`
    update app.sponsor_booking set status = 'cancelled', note = 'superseded by a new checkout', updated_at = now()
    where sponsor_id = ${sponsor.id}::uuid and status = 'held'
  `

  const ref = crypto.randomUUID()
  const dates = months.map(monthDate)
  try {
    await sql`
      insert into app.sponsor_booking (sponsor_id, month, status, source, checkout_ref, hold_expires_at, amount_cents)
      select ${sponsor.id}::uuid, m::date, 'held', 'dodo', ${ref}::uuid,
             now() + make_interval(mins => ${PARTNER_HOLD_MINUTES}), ${PARTNER_PRICE_USD * 100}
      from unnest(${dates}::text[]) as m
    `
  } catch (e) {
    // 23505: another live booking owns one of these months.
    if ((e as { code?: string }).code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'One of those months was just taken. Refresh the calendar and pick again.' })
    }
    throw e
  }

  const origin = getRequestOrigin(event)
  let session: { session_id: string, checkout_url: string }
  try {
    session = await dodoFetch<{ session_id: string, checkout_url: string }>('/checkouts', {
      method: 'POST',
      body: {
        product_cart: [{ product_id: productId, quantity: months.length }],
        customer: { email: user.email, name: user.name || user.email },
        return_url: `${origin}/sponsor/studio?checkout=done`,
        metadata: {
          kind: 'sponsor',
          plan: 'sponsor',
          user_id: user.id,
          sponsor_id: sponsor.id,
          checkout_ref: ref,
          months: months.join(',')
        }
      }
    })
  } catch (e) {
    // No checkout, no hold.
    await sql`update app.sponsor_booking set status = 'cancelled', note = 'checkout failed to start', updated_at = now() where checkout_ref = ${ref}::uuid and status = 'held'`
    throw e
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { url: session.checkout_url, holdMinutes: PARTNER_HOLD_MINUTES }
})
