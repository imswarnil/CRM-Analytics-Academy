import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// The user's dashboard data (progress, own submissions, quizzes). Service role
// with the identity verified from the session, scoped to the user's own rows.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return null

  const db = serverSupabaseServiceRole<Database>(event)
  const [progress, resources, quizzes] = await Promise.all([
    db.from('lesson_progress').select('lesson_path, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }),
    db.from('resources').select('id, title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('quiz_attempts').select('quiz_id, score, total, passed, created_at').eq('user_id', userId).order('created_at', { ascending: false })
  ])

  // Average score out of 100 = mean of each quiz's BEST attempt percentage.
  const best = new Map<string, number>()
  for (const a of quizzes.data ?? []) {
    if (!a.total) continue
    const pct = (a.score / a.total) * 100
    best.set(a.quiz_id, Math.max(best.get(a.quiz_id) ?? 0, pct))
  }
  const pcts = [...best.values()]
  const avgScore = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : null
  const quizzesPassed = (quizzes.data ?? []).filter(a => a.passed).map(a => a.quiz_id)
    .filter((id, i, arr) => arr.indexOf(id) === i).length

  return {
    progress: progress.data ?? [],
    resources: resources.data ?? [],
    quizzes: (quizzes.data ?? []).slice(0, 5),
    avgScore,
    quizzesTaken: best.size,
    quizzesPassed
  }
})
