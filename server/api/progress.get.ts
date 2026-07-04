import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// The current user's completed lesson paths (verified session + service role).
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return { paths: [] as string[] }

  const db = serverSupabaseServiceRole<Database>(event)
  const { data } = await db
    .from('lesson_progress')
    .select('lesson_path')
    .eq('user_id', userId)

  return { paths: (data ?? []).map(r => r.lesson_path) }
})
