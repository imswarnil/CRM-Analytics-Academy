import type { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Course sections (used for per-section progress + certificate eligibility).
// `total` is the number of lesson pages under `/<slug>`. Single source of truth
// shared by the dashboard and the certificate issuer.
export const SECTIONS = [
  { slug: 'foundations', title: 'CRM Analytics Foundations', total: 10 },
  { slug: 'setup', title: 'Setup & User Provisioning', total: 8 }
]
export const CERT_MIN_SCORE = 75
export const CERT_COURSE = 'CRM Analytics Foundations'

type Db = ReturnType<typeof serverSupabaseServiceRole<Database>>

/**
 * Compute a learner's certificate eligibility (all sections complete AND an
 * average best-attempt score ≥ CERT_MIN_SCORE). Kept intentionally small so
 * both the dashboard route and the certificate issuer stay in agreement.
 */
export async function computeEligibility(db: Db, userId: string) {
  const [progress, quizzes] = await Promise.all([
    db.from('lesson_progress').select('lesson_path').eq('user_id', userId),
    db.from('quiz_attempts').select('quiz_id, score, total').eq('user_id', userId)
  ])

  const completedPaths = new Set((progress.data ?? []).map(p => p.lesson_path))
  const allSectionsComplete = SECTIONS.length > 0 && SECTIONS.every((s) => {
    const completed = [...completedPaths].filter(p => p === `/${s.slug}` || p.startsWith(`/${s.slug}/`)).length
    return completed >= s.total
  })

  const bestByQuiz = new Map<string, number>()
  for (const a of quizzes.data ?? []) {
    if (!a.total) continue
    const pct = (a.score / a.total) * 100
    const prev = bestByQuiz.get(a.quiz_id)
    if (prev == null || pct > prev) bestByQuiz.set(a.quiz_id, pct)
  }
  const pcts = [...bestByQuiz.values()]
  const avgScore = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : null

  const eligible = allSectionsComplete && avgScore != null && avgScore >= CERT_MIN_SCORE
  return { eligible, avgScore, certMinScore: CERT_MIN_SCORE, allSectionsComplete }
}
