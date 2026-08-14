import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'
import { DEFAULT_PASS_SCORE, parseSetToken } from '../utils/quiz'
import { loadQuizPool } from '../utils/quiz-source'

// Grade a quiz attempt server-side and save it. The browser sends the question
// set token (which pool questions were shown) plus the learner's chosen option
// indices; scoring happens here so the answers are never exposed to the client.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ path?: string, quizId?: string, token?: string, answers?: number[] }>(event)

  const path = typeof body?.path === 'string' ? body.path.trim() : ''
  const quizId = typeof body?.quizId === 'string' ? body.quizId.trim() : ''
  const answers = Array.isArray(body?.answers) ? body!.answers.map(Number) : null

  if (!path || !quizId || !answers) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid quiz submission' })
  }

  // Resolves markdown lessons and admin-authored /learn lessons alike.
  const source = await loadQuizPool(event, path)
  const pool = source?.pool ?? []
  if (!pool.length) {
    throw createError({ statusCode: 404, statusMessage: 'No quiz for this lesson' })
  }

  const indices = parseSetToken(body?.token, pool.length)
  if (!indices || indices.length !== answers.length) {
    throw createError({ statusCode: 400, statusMessage: 'Question set mismatch' })
  }

  // Score against the real answer key.
  const correctAnswers = indices.map(i => pool[i]!.answer)
  const results = correctAnswers.map((correct, p) => answers[p] === correct)
  const score = results.filter(Boolean).length
  const total = indices.length
  const passScore = source?.passScore ?? DEFAULT_PASS_SCORE
  const passed = total > 0 && (score / total) * 100 >= passScore

  // Per-skill breakdown for the performance chart.
  const skillMap = new Map<string, { correct: number, total: number }>()
  indices.forEach((poolIdx, p) => {
    const skill = pool[poolIdx]!.skill || 'General'
    const bucket = skillMap.get(skill) ?? { correct: 0, total: 0 }
    bucket.total += 1
    if (results[p]) bucket.correct += 1
    skillMap.set(skill, bucket)
  })
  const skills = [...skillMap.entries()].map(([skill, v]) => ({ skill, correct: v.correct, total: v.total }))

  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    total,
    answers: answers as unknown as Database['public']['Tables']['quiz_attempts']['Insert']['answers'],
    passed,
    skills: skills as unknown as Database['public']['Tables']['quiz_attempts']['Insert']['skills']
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { score, total, passed, passScore, results, correctAnswers, skills }
})
