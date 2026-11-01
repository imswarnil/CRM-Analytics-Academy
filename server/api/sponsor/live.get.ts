/**
 * The live sponsor banners, for every page (components/SponsorBanner.vue).
 * Memoised for a minute in the isolate: one cheap query per isolate, not per view.
 */
export default defineEventHandler(async (event) => {
  const live = await memo('sponsor-live', 60_000, async () => {
    await settleSponsors()
    const rows = await useDb()`
      select id, company, creative from app.sponsor
      where status = 'live' and creative_status = 'approved' and now() between starts_at and ends_at
      order by starts_at`
    return rows.map(r => ({ id: Number(r.id), company: String(r.company), creative: r.creative as SponsorCreative }))
  }, () => true)
  setResponseHeader(event, 'cache-control', 'public, max-age=60')
  return { sponsors: live }
})
