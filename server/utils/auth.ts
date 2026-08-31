import type { H3Event } from 'h3'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

/**
 * Reads the caller's session by asking Neon Auth, forwarding their cookies.
 *
 * The session is never trusted from anything the browser sends us directly —
 * no user id in a header, no id in a body. The only thing the client controls
 * is the cookie, and the cookie is only meaningful to the auth service, which
 * is what actually resolves it to a user.
 *
 * Returns null rather than throwing so callers can decide whether a route is
 * optional-auth or required-auth; `requireUser` below is the strict form.
 */
export async function getSessionUser(event: H3Event): Promise<SessionUser | null> {
  const base = process.env.NEON_AUTH_BASE_URL
  if (!base) return null

  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null

  try {
    const res = await $fetch<{ user?: SessionUser }>(`${base}/get-session`, {
      headers: {
        cookie,
        // Neon Auth rejects requests without a trusted Origin.
        origin: getRequestOrigin(event)
      }
    })
    return res?.user ?? null
  } catch {
    return null
  }
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  return user
}

/** The site's own origin, which is what must be registered as trusted. */
export function getRequestOrigin(event: H3Event): string {
  const configured = process.env.NUXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/+$/, '')
  const host = getRequestHeader(event, 'host') ?? 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/** True when this user is the shared demo account. */
export async function isDemoUser(userId: string): Promise<boolean> {
  const sql = useDb()
  const rows = await sql`select 1 from app.demo_account where user_id = ${userId}`
  return rows.length > 0
}
