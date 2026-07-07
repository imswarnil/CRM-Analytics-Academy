import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Course sections (used for per-section progress + certificate eligibility).
// `total` is the number of lesson pages under `/<slug>`.
const SECTIONS = [
  { slug: 'foundations', title: 'CRM Analytics Foundations', total: 10 },
  { slug: 'setup', title: 'Setup & User Provisioning', total: 8 }
]
const CERT_MIN_SCORE = 75

interface SkillScore { skill: string, correct: number, total: number }

// The user's dashboard data (progress, own submissions, quizzes). Service role
// with the identity verified from the session, scoped to the user's own rows.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return null

  const db = serverSupabaseServiceRole<Database>(event)
  const [progress, resources, quizzes] = await Promise.all([
    db.from('lesson_progress').select('lesson_path, completed_at').eq('user_id', userId).order('completed_at', { ascending: false }),
    db.from('resources').select('id, title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('quiz_attempts').select('quiz_id, score, total, passed, skills, created_at').eq('user_id', userId).order('created_at', { ascending: false })
  ])

  const progressRows = progress.data ?? []
  const attempts = quizzes.data ?? []

  // Per-section completion.
  const completedPaths = new Set(progressRows.map(p => p.lesson_path))
  const sections = SECTIONS.map((s) => {
    const completed = [...completedPaths].filter(p => p === `/${s.slug}` || p.startsWith(`/${s.slug}/`)).length
    return { ...s, completed: Math.min(completed, s.total), pct: Math.round((Math.min(completed, s.total) / s.total) * 100) }
  })

  // Best attempt per quiz (by percentage) → average score /100 + skill merge.
  const bestByQuiz = new Map<string, typeof attempts[number]>()
  for (const a of attempts) {
    if (!a.total) continue
    const prev = bestByQuiz.get(a.quiz_id)
    if (!prev || a.score / a.total > prev.score / prev.total) bestByQuiz.set(a.quiz_id, a)
  }
  const bestPcts = [...bestByQuiz.values()].map(a => (a.score / a.total) * 100)
  const avgScore = bestPcts.length ? Math.round(bestPcts.reduce((s, p) => s + p, 0) / bestPcts.length) : null

  // Aggregate per-skill performance across each quiz's best attempt.
  const skillMap = new Map<string, { correct: number, total: number }>()
  for (const a of bestByQuiz.values()) {
    for (const s of (a.skills as SkillScore[] | null) ?? []) {
      const b = skillMap.get(s.skill) ?? { correct: 0, total: 0 }
      b.correct += s.correct
      b.total += s.total
      skillMap.set(s.skill, b)
    }
  }
  const skills = [...skillMap.entries()]
    .map(([skill, v]) => ({ skill, correct: v.correct, total: v.total, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct)

  const allSectionsComplete = sections.length > 0 && sections.every(s => s.completed >= s.total)
  const certificateEligible = allSectionsComplete && avgScore != null && avgScore >= CERT_MIN_SCORE

  return {
    progress: progressRows,
    resources: resources.data ?? [],
    quizzes: attempts.slice(0, 5),
    avgScore,
    quizzesTaken: bestByQuiz.size,
    quizzesPassed: [...bestByQuiz.values()].filter(a => a.passed).length,
    sections,
    skills,
    certificateEligible,
    certMinScore: CERT_MIN_SCORE
  }
})
