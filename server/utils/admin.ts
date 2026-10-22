import type { H3Event } from 'h3'

/**
 * The one admin. There are no roles: this address can open /admin and every
 * /api/admin route, and nobody else can. It is compared with the session's
 * email — resolved by Neon Auth from the cookie — never with anything the
 * client sends.
 */
export const ADMIN_EMAIL = 'imswarnil@gmail.com'

export function isAdmin(user: SessionUser | null): boolean {
  return !!user && user.email.toLowerCase() === ADMIN_EMAIL
}

/**
 * Gate for every admin route.
 *
 * Returns 404, not 403, for a signed-in non-admin: a 403 confirms the path
 * exists. A signed-out caller gets 401, which reveals nothing — every route
 * on the site says that.
 */
export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  if (!isAdmin(user)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  return user
}
