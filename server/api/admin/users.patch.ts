/**
 * Change a user's role, or their Pro entitlement.
 *
 * Roles are written to app.user_role, never to neon_auth."user" — that schema
 * belongs to Better Auth and a column added to it is the thing a managed
 * migration silently drops.
 *
 * An admin cannot demote themselves. It is not a permissions question, it is
 * a lockout question: with one admin and no way back in, a mis-click ends
 * with the site's only administrator locked out of the screen that grants
 * roles. The ADMIN_EMAILS allowlist is the escape hatch, but it needs a
 * redeploy, so the cheap guard is worth having.
 */
const ROLES = ['admin', 'moderator', 'learner'] as const

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{ userId?: string, role?: string, pro?: boolean }>(event)

  const userId = String(body?.userId ?? '').trim()
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'Which user?' })
  }

  const sql = useDb()

  if (body?.role !== undefined) {
    const role = String(body.role)
    if (!(ROLES as readonly string[]).includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown role.' })
    }
    if (userId === admin.id && role !== 'admin') {
      throw createError({ statusCode: 400, statusMessage: 'You cannot remove your own admin role.' })
    }

    await sql`
      insert into app.user_role (user_id, role, granted_by)
      values (${userId}, ${role}, ${admin.id})
      on conflict (user_id) do update
        set role = excluded.role,
            granted_by = excluded.granted_by,
            granted_at = now()
    `
  }

  if (body?.pro !== undefined) {
    const pro = Boolean(body.pro)
    await sql`
      insert into app.entitlement (user_id, pro, source, granted_at)
      values (${userId}, ${pro}, 'admin', case when ${pro} then now() else null end)
      on conflict (user_id) do update
        set pro = excluded.pro,
            source = 'admin',
            granted_at = excluded.granted_at,
            updated_at = now()
    `
  }

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
