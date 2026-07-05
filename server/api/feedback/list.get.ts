import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Feedback threads for the current context: an admin sees every thread; a
// regular user sees only their own. Each thread embeds its author and replies
// (with each reply's author + role, so the UI can badge admin responses).
// Backs both the /feedback page and the admin panel.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return { feedback: [], isAdmin: false }

  const db = serverSupabaseServiceRole<Database>(event)
  const { data: prof } = await db.from('profiles').select('role').eq('id', userId).single()
  const isAdmin = prof?.role === 'admin'

  let query = db.from('feedback')
    .select('id, subject, message, category, status, page_path, created_at, user_id, author:profiles(username, full_name), feedback_replies(id, body, created_at, user_id, author:profiles(username, full_name, role))')
    .order('created_at', { ascending: false })
    .order('created_at', { ascending: true, referencedTable: 'feedback_replies' })

  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { feedback: data ?? [], isAdmin }
})
