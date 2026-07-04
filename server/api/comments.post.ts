import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Create a comment as the signed-in user; returns the new row with author info.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ pagePath?: string, body?: string }>(event)
  const pagePath = typeof body?.pagePath === 'string' ? body.pagePath.trim() : ''
  const text = typeof body?.body === 'string' ? body.body.trim() : ''

  if (!pagePath) throw createError({ statusCode: 400, statusMessage: 'pagePath is required' })
  if (!text) throw createError({ statusCode: 400, statusMessage: 'Comment cannot be empty' })
  if (text.length > 4000) throw createError({ statusCode: 400, statusMessage: 'Comment is too long (max 4000)' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { data, error } = await db
    .from('comments')
    .insert({ user_id: user.id, page_path: pagePath, body: text })
    .select('id, body, created_at, user_id, profiles(username, full_name, avatar_url)')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
