import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Post a reply on a feedback thread. Allowed for the thread's owner or any admin.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ feedback_id?: string, body?: string }>(event)
  const db = serverSupabaseServiceRole<Database>(event)

  const feedbackId = typeof body.feedback_id === 'string' ? body.feedback_id : ''
  const text = typeof body.body === 'string' ? body.body.trim() : ''
  if (!feedbackId) throw createError({ statusCode: 400, statusMessage: 'Missing feedback id' })
  if (text.length < 1 || text.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Reply must be 1–5000 characters' })
  }

  const { data: fb } = await db.from('feedback').select('user_id').eq('id', feedbackId).single()
  if (!fb) throw createError({ statusCode: 404, statusMessage: 'Feedback not found' })

  const { data: prof } = await db.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = prof?.role === 'admin'
  if (fb.user_id !== user.id && !isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
  }

  const { error } = await db.from('feedback_replies').insert({
    feedback_id: feedbackId,
    user_id: user.id,
    body: text
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
