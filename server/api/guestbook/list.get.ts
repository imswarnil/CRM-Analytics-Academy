import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Public guestbook feed: everyone sees visible entries. Signed-in admins also
// see hidden ones (flagged with their status) so they can moderate in place.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const db = serverSupabaseServiceRole<Database>(event)

  let isAdmin = false
  if (userId) {
    const { data: prof } = await db.from('profiles').select('role').eq('id', userId).single()
    isAdmin = prof?.role === 'admin'
  }

  let query = db.from('guestbook')
    .select('id, name, message, drawing, status, created_at, user_id, author:profiles(username, full_name, avatar_url, linkedin_url)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (!isAdmin) query = query.eq('status', 'visible')

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { entries: data ?? [], isAdmin, userId }
})
