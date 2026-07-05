import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Submit a community resource or project as the signed-in user (status pending).
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = serverSupabaseServiceRole<Database>(event)

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  if (body?.type === 'resource') {
    const title = str(body.title)
    const url = str(body.url)
    if (!title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    if (!/^https?:\/\//.test(url)) throw createError({ statusCode: 400, statusMessage: 'A valid URL is required' })
    const { error } = await db.from('resources').insert({
      user_id: user.id,
      title,
      url,
      description: str(body.description) || null,
      category: str(body.category) || null
    })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid submission type' })
})
