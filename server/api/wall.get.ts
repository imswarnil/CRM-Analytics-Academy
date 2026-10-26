/**
 * Approved Wall of Fame nominations, for /wall-of-fame and the home page.
 * They join the curated list in app/data/wall-of-fame.ts on the client.
 * Public: only what the nominator wrote for display and an admin approved.
 */
const ROLES = new Set(['blogger', 'youtuber', 'author', 'speaker', 'builder'])

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=300, s-maxage=300')
  return memo('wall', 300_000, async () => {
    const rows = await useDb()`
      select title, url, image_url, description, tags, details
      from app.submission
      where kind = 'nomination' and status = 'approved'
      order by reviewed_at desc nulls last
      limit 60
    `
    return rows.map((r) => {
      const d = (r.details ?? {}) as { role?: string, linkedin?: string, url?: string }
      const role = ROLES.has(String(d.role)) ? String(d.role) : String((r.tags as string[])?.[0] ?? 'builder')
      return {
        name: String(r.title),
        type: ROLES.has(role) ? role : 'builder',
        desc: String(r.description).slice(0, 220),
        linkedin: d.linkedin || String(r.url ?? ''),
        url: d.url || undefined,
        photo: (r.image_url as string | null) || undefined,
        community: true
      }
    })
  })
})
