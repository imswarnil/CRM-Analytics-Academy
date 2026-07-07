import { serverSupabaseServiceRole } from '#supabase/server'
import { queryCollection } from '@nuxt/content/server'
import type { Collections } from '@nuxt/content'
import type { Database } from '~~/types/database.types'
import type { QuizQuestion } from '../utils/quiz'
import { pickQuizSet } from '../utils/quiz'

// Serve a quiz question set WITHOUT answers. Picks a rotating subset of the
// lesson's question pool based on how many times this user has already attempted
// it, so a failed retry gets a different set of questions.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = typeof query.path === 'string' ? query.path : ''
  const quizId = typeof query.quizId === 'string' ? query.quizId : ''
  if (!path || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing quiz path' })
  }

  const page = await queryCollection(event, 'docs' as keyof Collections).path(path).first()
  const pool = (page?.quiz ?? []) as QuizQuestion[]
  if (!pool.length) {
    throw createError({ statusCode: 404, statusMessage: 'No quiz for this lesson' })
  }

  // Count prior attempts (signed-in only) to rotate the question window, and
  // check whether the learner has already passed (so we don't re-gate them).
  const userId = await getUserId(event)
  let attemptIndex = 0
  let alreadyPassed = false
  if (userId) {
    const db = serverSupabaseServiceRole<Database>(event)
    const [{ count }, { data: pass }] = await Promise.all([
      db.from('quiz_attempts').select('id', { count: 'exact', head: true })
        .eq('user_id', userId).eq('quiz_id', quizId),
      db.from('quiz_attempts').select('id')
        .eq('user_id', userId).eq('quiz_id', quizId).eq('passed', true).limit(1)
    ])
    attemptIndex = count ?? 0
    alreadyPassed = !!pass?.length
  }

  const indices = pickQuizSet(pool.length, attemptIndex)
  const passScore = typeof page?.passScore === 'number' ? page.passScore : undefined

  return {
    token: indices.join(','),
    total: indices.length,
    poolSize: pool.length,
    passScore,
    alreadyPassed,
    // Strip `answer` — the client only ever sees questions + options.
    questions: indices.map(i => ({ q: pool[i]!.q, options: pool[i]!.options }))
  }
})
