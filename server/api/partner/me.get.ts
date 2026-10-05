/**
 * Everything the sponsor studio shows: the caller's sponsor account, their
 * bookings, their creatives and per-creative impressions and clicks.
 * `sponsor` is null for a signed-in user who has never booked.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const sql = useDb()
  await releaseExpiredHolds(sql)

  const sponsor = await findSponsor(sql, user.id)
  if (!sponsor) return { sponsor: null, bookings: [], creatives: [], email: user.email }

  const [bookings, creatives, daily] = await Promise.all([
    sql`
      select id::text, to_char(month, 'YYYY-MM') as month, status, source, hold_expires_at, paid_at, needs_refund
      from app.sponsor_booking
      where sponsor_id = ${sponsor.id}::uuid and status in ('held', 'paid')
      order by month
    `,
    sql`
      select c.id::text, c.format, c.mode, c.image_url, c.image_mobile_url, c.logo_url, c.headline, c.body, c.cta,
             c.theme, c.click_url, c.alt, c.status, c.review_note, c.updated_at, c.published_at,
             coalesce(sum(st.impressions), 0)::int as impressions, coalesce(sum(st.clicks), 0)::int as clicks
      from app.sponsor_creative c
      left join app.sponsor_stat st on st.creative_id = c.id
      where c.sponsor_id = ${sponsor.id}::uuid
      group by c.id
      order by c.updated_at desc
    `,
    sql`
      select to_char(st.day, 'YYYY-MM-DD') as day, sum(st.impressions)::int as impressions, sum(st.clicks)::int as clicks
      from app.sponsor_stat st
      join app.sponsor_creative c on c.id = st.creative_id
      where c.sponsor_id = ${sponsor.id}::uuid and st.day > current_date - 30
      group by st.day
      order by st.day
    `
  ])

  return {
    email: user.email,
    sponsor,
    bookings: bookings.map(b => ({
      id: b.id as string,
      month: b.month as string,
      status: b.status as string,
      source: b.source as string,
      holdExpiresAt: b.hold_expires_at as string | null,
      paidAt: b.paid_at as string | null,
      needsRefund: Boolean(b.needs_refund)
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
      impressions: Number(c.impressions),
      clicks: Number(c.clicks)
    })),
    daily: daily.map(d => ({ day: d.day as string, impressions: Number(d.impressions), clicks: Number(d.clicks) }))
  }
})
