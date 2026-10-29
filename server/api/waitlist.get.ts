/** How many learners wait for each coming-soon section: { section: count }. Cached 5 min. */
export default defineEventHandler(async (event) => {
  const counts = await memo('waitlist-counts', 300_000, async () => {
    const rows = await useDb()`select section, count(*)::int as n from app.waitlist group by section`
    return Object.fromEntries(rows.map(r => [String(r.section), Number(r.n)])) as Record<string, number>
  })
  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300')
  return counts
})
