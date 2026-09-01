import type { H3Event } from 'h3'

export type Role = 'admin' | 'moderator' | 'learner'

/**
 * Who is allowed to administer the site.
 *
 * Two sources, and the order matters:
 *
 *   1. ADMIN_EMAILS — a comma-separated allowlist in the Worker's secrets.
 *   2. app.user_role — roles granted through the admin screen.
 *
 * The env var exists to solve the bootstrap problem: the first admin cannot
 * be granted a role through a screen that only admins can open. It is
 * deliberately not the only mechanism, because an allowlist that has to be
 * redeployed to add a moderator is one nobody maintains.
 *
 * It is checked against the session's email — resolved by the auth service
 * from the cookie — and never against anything the client sends.
 */
function bootstrapAdmins(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function getRole(event: H3Event): Promise<{ user: SessionUser, role: Role } | null> {
  const user = await getSessionUser(event)
  if (!user) return null

  if (bootstrapAdmins().includes(user.email.toLowerCase())) {
    return { user, role: 'admin' }
  }

  const sql = useDb()
  const rows = await sql`select role from app.user_role where user_id = ${user.id}`
  return { user, role: (rows[0]?.role as Role) ?? 'learner' }
}

/**
 * Gate for every admin route.
 *
 * Returns 404, not 403, for a signed-in non-admin. A 403 confirms that the
 * path exists and that they simply lack the role, which is free
 * reconnaissance; from outside, /api/admin/* should look like nothing.
 *
 * A signed-out caller still gets 401, because "sign in" is the useful answer
 * there and reveals nothing — every route on the site says that.
 */
export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const resolved = await getRole(event)
  if (!resolved) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  if (resolved.role !== 'admin') {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return resolved.user
}

/** Moderators can review submissions; only admins can change roles or users. */
export async function requireModerator(event: H3Event): Promise<SessionUser> {
  const resolved = await getRole(event)
  if (!resolved) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  if (resolved.role !== 'admin' && resolved.role !== 'moderator') {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return resolved.user
}
