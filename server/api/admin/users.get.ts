/**
 * Every user, with everything app.* knows about them.
 *
 * One query against app.admin_user rather than four joined in JavaScript, so
 * the numbers on a row cannot come from different moments.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sql = useDb()

  // The bootstrap allowlist is not in the database, so app.admin_user reports
  // an ADMIN_EMAILS admin as a plain learner — they would open this screen,
  // having passed requireAdmin, and find themselves listed as a learner with
  // a dropdown offering to "promote" them. Overlaid here so the role shown is
  // the role enforced.
  const bootstrap = new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
  )

  const rows = await sql`
    select user_id, email, name, image, created_at, email_verified,
           role, points, lessons_done, pending_submissions, is_demo, pro
    from app.admin_user
    order by created_at desc
    limit 500
  `

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    users: rows.map(r => ({
      id: r.user_id as string,
      email: r.email as string,
      name: r.name as string | null,
      image: r.image as string | null,
      createdAt: r.created_at,
      emailVerified: Boolean(r.email_verified),
      role: bootstrap.has(String(r.email).toLowerCase()) ? 'admin' : (r.role as string),
      // True when the role comes from ADMIN_EMAILS rather than app.user_role.
      // The UI disables the dropdown for these: changing it would write a row
      // the allowlist then overrides, so the control would appear to do
      // nothing.
      roleLocked: bootstrap.has(String(r.email).toLowerCase()),
      points: Number(r.points),
      lessonsDone: Number(r.lessons_done),
      pendingSubmissions: Number(r.pending_submissions),
      isDemo: Boolean(r.is_demo),
      pro: Boolean(r.pro)
    }))
  }
})
