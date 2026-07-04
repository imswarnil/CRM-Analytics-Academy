import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Database } from '~~/types/database.types'

// serverSupabaseUser returns JWT *claims* (the user id is `sub`, not `id`).
function claimSub(claims: unknown): string | null {
  const sub = (claims as { sub?: string } | null)?.sub
  return typeof sub === 'string' && sub ? sub : null
}

/** The signed-in user's id, or null. Never throws. */
export async function getUserId(event: H3Event): Promise<string | null> {
  const claims = await serverSupabaseUser(event).catch(() => null)
  return claimSub(claims)
}

/** Throw 401 unless the request carries a valid Supabase session. Returns the user id. */
export async function requireUser(event: H3Event): Promise<{ id: string }> {
  const id = await getUserId(event)
  if (!id) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  return { id }
}

/**
 * Throw 401/403 unless the caller is an admin. Returns the user id and a
 * service-role client for privileged operations that bypass RLS.
 */
export async function requireAdmin(event: H3Event) {
  const { id } = await requireUser(event)
  const admin = serverSupabaseServiceRole<Database>(event)
  const { data, error } = await admin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single()

  if (error || data?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }
  return { userId: id, admin }
}
