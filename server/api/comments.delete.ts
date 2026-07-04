import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Delete a comment — allowed for the comment's owner or an admin.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ id?: string }>(event)
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const db = serverSupabaseServiceRole<Database>(event)

  const { data: comment } = await db.from('comments').select('user_id').eq('id', id).single()
  if (!comment) throw createError({ statusCode: 404, statusMessage: 'Comment not found' })

  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (comment.user_id !== user.id && !isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
  }

  const { error } = await db.from('comments').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
