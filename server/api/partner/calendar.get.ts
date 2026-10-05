/**
 * The next twelve months of sponsorship, for the /sponsor timeline.
 *
 *   available  nobody holds or owns it — can be booked
 *   held       a checkout is in flight (frees itself when the hold expires)
 *   booked     paid; the sponsor's name is shown
 *   closed     the current month once fewer than ten days remain
 *
 * Public. `mine` is set on months the signed-in caller holds or owns, so the
 * page can say "yours" without a second request. Short shared cache: the
 * calendar changes only when someone books.
 */
export default defineEventHandler(async (event) => {
  const now = new Date()
  const keys = partnerMonthWindow(now)
  const user = await getSessionUser(event)

  let rows: Record<string, unknown>[] = []
  if (process.env.DATABASE_URL) {
    try {
      const sql = useDb()
      await releaseExpiredHolds(sql)
      rows = await sql`
        select to_char(b.month, 'YYYY-MM') as month, b.status, b.hold_expires_at, s.name, s.user_id
        from app.sponsor_booking b
        join app.sponsor s on s.id = b.sponsor_id
        where b.status in ('held', 'paid')
          and b.month >= ${monthDate(keys[0]!)}::date
          and b.month <= ${monthDate(keys.at(-1)!)}::date
      `
    } catch (e) {
      console.error('partner calendar: database unavailable', e)
    }
  }
  const byMonth = new Map(rows.map(r => [r.month as string, r]))

  const months = keys.map((key) => {
    const r = byMonth.get(key)
    const mine = Boolean(user && r && r.user_id === user.id)
    if (r?.status === 'paid') return { month: key, status: 'booked' as const, sponsor: r.name as string, mine }
    if (r?.status === 'held') return { month: key, status: 'held' as const, sponsor: null, mine, until: r.hold_expires_at as string }
    if (!partnerMonthOpen(key, now)) return { month: key, status: 'closed' as const, sponsor: null, mine: false }
    return { month: key, status: 'available' as const, sponsor: null, mine: false }
  })

  // Personalised when signed in, so only the anonymous answer is shareable.
  setResponseHeader(event, 'cache-control', user ? 'private, no-store' : 'public, max-age=30, s-maxage=60')
  return {
    priceUsd: PARTNER_PRICE_USD,
    holdMinutes: PARTNER_HOLD_MINUTES,
    available: Boolean(partnerProduct()),
    months
  }
})
