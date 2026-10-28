/**
 * Upvote counts for every interview question, { slug: count }, plus the slugs
 * the signed-in reader upvoted. Counts are public and cached for five minutes.
 */
export default defineEventHandler(async (event) => {
  const counts = await memo('interview-votes', 300_000, async () => {
    const rows = await useDb()`select slug, count(*)::int as n from app.interview_upvote group by slug`
    return Object.fromEntries(rows.map(r => [String(r.slug), Number(r.n)])) as Record<string, number>
  })
  const user = await getSessionUser(event).catch(() => null)
  const mine = user
    ? (await useDb()`select slug from app.interview_upvote where user_id = ${user.id}`).map(r => String(r.slug))
    : []
  setResponseHeader(event, 'cache-control', user ? 'private, no-store' : 'public, max-age=60, s-maxage=300')
  return { counts, mine }
})
