/**
 * /admin → Experts: everything the network's admin works from, in one call.
 *
 *   - applications: `expert` leads, newest first, each with the profile it
 *     became (if any) so the console can show "approved" / "hidden".
 *   - projects: the latest `project` leads — requests to hire the network.
 *     They are worked in the Leads tab; this is a summary.
 *   - experts: every profile, public or not, in roster order.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()

  const [applications, projects, experts] = await Promise.all([
    sql`
      select l.id, l.name, l.email, l.company, l.role, l.country, l.message, l.details, l.status, l.created_at,
             e.id as expert_id, e.status as expert_status
      from app.lead l
      left join app.expert e on e.lead_id = l.id
      where l.type = 'expert'
      order by l.created_at desc
      limit 200
    `,
    sql`
      select id, name, email, company, company_name, logo_url, budget, message, details, status, created_at
      from app.lead
      where type = 'project'
      order by created_at desc
      limit 50
    `,
    sql`select * from app.expert order by sort_order asc, name asc limit 500`
  ])

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    applications: applications.map(r => ({
      id: Number(r.id),
      name: r.name as string,
      email: r.email as string,
      company: (r.company as string | null) ?? null,
      role: (r.role as string | null) ?? null,
      country: (r.country as string | null) ?? null,
      message: (r.message as string | null) ?? null,
      details: (r.details ?? {}) as Record<string, string>,
      status: r.status as string,
      createdAt: String(r.created_at),
      expertId: r.expert_id == null ? null : Number(r.expert_id),
      expertStatus: (r.expert_status as string | null) ?? null
    })),
    projects: projects.map(r => ({
      id: Number(r.id),
      name: r.name as string,
      email: r.email as string,
      company: (r.company_name as string | null) || (r.company as string | null) || null,
      logoUrl: (r.logo_url as string | null) ?? null,
      budget: (r.budget as string | null) ?? null,
      message: (r.message as string | null) ?? null,
      details: (r.details ?? {}) as Record<string, string>,
      status: r.status as string,
      createdAt: String(r.created_at)
    })),
    experts: experts.map(adminExpert)
  }
})
