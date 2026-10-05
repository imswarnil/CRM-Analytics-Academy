/**
 * /admin → Sponsors: the booking calendar, every creative with its numbers,
 * the sponsor accounts and the refunds to make.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sql = useDb()
  await releaseExpiredHolds(sql)

  const [bookings, creatives, sponsors] = await Promise.all([
    sql`
      select b.id::text, to_char(b.month, 'YYYY-MM') as month, b.status, b.source, b.hold_expires_at, b.paid_at,
             b.dodo_payment_id, b.amount_cents, b.needs_refund, b.note, b.created_at,
             s.id::text as sponsor_id, s.name as sponsor, s.contact_email
      from app.sponsor_booking b
      join app.sponsor s on s.id = b.sponsor_id
      where b.status in ('held', 'paid') or b.needs_refund
         or b.month >= (date_trunc('month', now() at time zone 'utc') - interval '12 months')::date
      order by b.month desc, b.created_at desc
      limit 500
    `,
    sql`
      select c.id::text, c.format, c.mode, c.image_url, c.image_mobile_url, c.logo_url, c.headline, c.body, c.cta, c.theme,
             c.click_url, c.alt, c.status, c.review_note, c.updated_at, c.published_at,
             s.name as sponsor, s.contact_email,
             coalesce(sum(st.impressions), 0)::int as impressions, coalesce(sum(st.clicks), 0)::int as clicks
      from app.sponsor_creative c
      join app.sponsor s on s.id = c.sponsor_id
      left join app.sponsor_stat st on st.creative_id = c.id
      group by c.id, s.name, s.contact_email
      order by c.updated_at desc
      limit 500
    `,
    sql`
      select s.id::text, s.name, s.website, s.contact_email, s.created_at,
             count(b.id) filter (where b.status = 'paid')::int as paid_months
      from app.sponsor s
      left join app.sponsor_booking b on b.sponsor_id = s.id
      group by s.id
      order by s.created_at desc
      limit 500
    `
  ])

  return {
    bookings: bookings.map(b => ({
      id: b.id as string,
      month: b.month as string,
      status: b.status as string,
      source: b.source as string,
      holdExpiresAt: b.hold_expires_at as string | null,
      paidAt: b.paid_at as string | null,
      paymentId: b.dodo_payment_id as string | null,
      amountCents: b.amount_cents === null ? null : Number(b.amount_cents),
      needsRefund: Boolean(b.needs_refund),
      note: b.note as string | null,
      createdAt: b.created_at as string,
      sponsorId: b.sponsor_id as string,
      sponsor: b.sponsor as string,
      email: b.contact_email as string
    })),
    creatives: creatives.map(c => ({
      id: c.id as string,
      format: c.format as PartnerFormat,
      mode: c.mode as PartnerMode,
      imageUrl: c.image_url as string | null,
      imageMobileUrl: c.image_mobile_url as string | null,
      logoUrl: c.logo_url as string | null,
      headline: c.headline as string | null,
      body: c.body as string | null,
      cta: c.cta as string | null,
      theme: c.theme as PartnerTheme,
      clickUrl: c.click_url as string,
      alt: c.alt as string | null,
      status: c.status as string,
      reviewNote: c.review_note as string | null,
      updatedAt: c.updated_at as string,
      publishedAt: c.published_at as string | null,
      sponsor: c.sponsor as string,
      email: c.contact_email as string,
      impressions: Number(c.impressions),
      clicks: Number(c.clicks)
    })),
    sponsors: sponsors.map(s => ({
      id: s.id as string,
      name: s.name as string,
      website: s.website as string | null,
      email: s.contact_email as string,
      createdAt: s.created_at as string,
      paidMonths: Number(s.paid_months)
    })),
    window: partnerMonthWindow(),
    priceUsd: PARTNER_PRICE_USD
  }
})
