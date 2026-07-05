import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Update the signed-in user's profile (never their role). Service role with the
// identity verified from the session; the update is scoped to the user's row.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ full_name?: string, username?: string, bio?: string, linkedin_url?: string }>(event)

  const linkedinUrl = body?.linkedin_url?.trim() || ''
  if (linkedinUrl && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(linkedinUrl)) {
    throw createError({ statusCode: 400, statusMessage: 'That doesn\'t look like a LinkedIn profile URL.' })
  }

  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db
    .from('profiles')
    .update({
      full_name: body?.full_name?.trim() || null,
      username: body?.username?.trim() || null,
      bio: body?.bio?.trim() || null,
      linkedin_url: linkedinUrl || null
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
