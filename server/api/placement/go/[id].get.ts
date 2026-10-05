/**
 * Click-through for a creative: count the click, then 302 to the sponsor's
 * link. The destination is read from the database, never from the URL, so
 * this cannot be used as an open redirect. Unknown ids go home.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  setResponseHeader(event, 'cache-control', 'no-store')
  setResponseHeader(event, 'x-robots-tag', 'noindex, nofollow')
  if (!UUID_RE.test(id) || !process.env.DATABASE_URL) return sendRedirect(event, '/', 302)

  const sql = useDb()
  const rows = await sql`select click_url, status from app.sponsor_creative where id = ${id}::uuid`
  const row = rows[0]
  if (!row) return sendRedirect(event, '/', 302)

  // Only live creatives count; a stale page can still follow the link.
  if (row.status === 'published') {
    const write = sql`
      insert into app.sponsor_stat (creative_id, day, clicks) values (${id}::uuid, (now() at time zone 'utc')::date, 1)
      on conflict (creative_id, day) do update set clicks = app.sponsor_stat.clicks + 1
    `.then(() => {}, e => console.error('placement: click write failed', e))
    const ctx = cloudflareOf(event).context
    if (ctx?.waitUntil) ctx.waitUntil(write)
    else await write
  }
  return sendRedirect(event, row.click_url as string, 302)
})
