/**
 * The public roster of the experts network: approved profiles only, in the
 * order an admin set. Nothing private (email, bio drafts, status) leaves here.
 *
 * Cached briefly at the edge and in the isolate — a roster changes a few
 * times a month, and /experts asks for it on every visit. An approval shows
 * up within five minutes.
 */
export default defineEventHandler(async (event) => {
  const experts = await memo('experts:public', 60_000, async (): Promise<PublicExpert[]> => {
    const sql = useDb()
    const rows = await sql`
      select id, name, headline, photo_url, linkedin_url, portfolio_url, skills, years, country
      from app.expert
      where status = 'approved'
      order by sort_order asc, name asc
      limit 200
    `
    return rows.map(r => ({
      id: Number(r.id),
      name: r.name as string,
      headline: (r.headline as string | null) ?? null,
      photoUrl: (r.photo_url as string | null) ?? null,
      linkedinUrl: (r.linkedin_url as string | null) ?? null,
      portfolioUrl: (r.portfolio_url as string | null) ?? null,
      skills: (r.skills as string[] | null) ?? [],
      years: r.years == null ? null : Number(r.years),
      country: (r.country as string | null) ?? null
    }))
  })

  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  return { experts }
})
