import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'
import type { QuizQuestion } from '~~/server/utils/quiz'

/**
 * Resolve a lesson's quiz pool from the `docs` Nuxt Content collection.
 *
 * Kept as its own helper (rather than inlining into the grading endpoints)
 * so /api/quiz stays the single place answers get stripped before reaching
 * the client.
 */

export interface QuizPool {
  pool: QuizQuestion[]
  passScore?: number
}

export async function loadQuizPool(event: H3Event, path: string): Promise<QuizPool | null> {
  const page = await queryCollection(event, 'docs' as const).path(path).first()
  if (!page) return null

  return {
    pool: (page.quiz ?? []) as QuizQuestion[],
    passScore: typeof page.passScore === 'number' ? page.passScore : undefined
  }
}
