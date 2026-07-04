import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Save a quiz attempt for the signed-in user.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ quizId?: string, score?: number, total?: number }>(event)
  const quizId = typeof body?.quizId === 'string' ? body.quizId.trim() : ''
  const score = Number(body?.score)
  const total = Number(body?.total)

  if (!quizId || !Number.isFinite(score) || !Number.isFinite(total)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid quiz result' })
  }

  const db = serverSupabaseServiceRole<Database>(event)
  const { error } = await db.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    total
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
