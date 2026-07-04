import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Database } from '~~/types/database.types'

/** Throw 401 unless the request carries a valid Supabase session. */
export async function requireUser(event: H3Event) {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }
  return user
}

/**
 * Throw 401/403 unless the caller is the (single) admin. Returns the user and a
 * service-role client for privileged operations that bypass RLS.
 */
export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  const admin = serverSupabaseServiceRole<Database>(event)
  const { data, error } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || data?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }
  return { user, admin }
}
