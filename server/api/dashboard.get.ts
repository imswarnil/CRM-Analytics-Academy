import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// The user's dashboard data (progress, own submissions, quizzes). Service role
// with the identity verified from the session, scoped to the user's own rows.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return null

  const db = serverSupabaseServiceRole<Database>(event)
  const [progress, resources, projects, quizzes] = await Promise.all([
    db.from('lesson_progress').select('lesson_path, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }),
    db.from('resources').select('id, title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('projects').select('id, title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('quiz_attempts').select('quiz_id, score, total, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
  ])

  return {
    progress: progress.data ?? [],
    resources: resources.data ?? [],
    projects: projects.data ?? [],
    quizzes: quizzes.data ?? []
  }
})
