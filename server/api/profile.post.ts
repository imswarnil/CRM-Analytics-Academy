import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Update the signed-in user's profile (never their role). Service role with the
// identity verified from the session; the update is scoped to the user's row.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ full_name?: string, username?: string, bio?: string }>(event)

  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db
    .from('profiles')
    .update({
      full_name: body?.full_name?.trim() || null,
      username: body?.username?.trim() || null,
      bio: body?.bio?.trim() || null
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'That username is already taken.' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return { ok: true }
})
