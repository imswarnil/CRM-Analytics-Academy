import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Delete a guestbook entry. Allowed for its author or any admin.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ id?: string }>(event)
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const db = serverSupabaseServiceRole<Database>(event)
  const { data: row } = await db.from('guestbook').select('user_id').eq('id', id).single()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const { data: prof } = await db.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = prof?.role === 'admin'
  if (row.user_id !== user.id && !isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
  }

  const { error } = await db.from('guestbook').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
