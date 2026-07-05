import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

const CATEGORIES = ['general', 'bug', 'idea', 'content', 'other'] as const
type Category = typeof CATEGORIES[number]

// Submit feedback as the signed-in user.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = serverSupabaseServiceRole<Database>(event)

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const message = str(body.message)
  if (message.length < 1 || message.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Message must be 1–5000 characters' })
  }
  const category = (CATEGORIES as readonly string[]).includes(str(body.category))
    ? (str(body.category) as Category)
    : 'general'

  const { error } = await db.from('feedback').insert({
    user_id: user.id,
    subject: str(body.subject) || null,
    message,
    category,
    page_path: str(body.page_path) || null
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
