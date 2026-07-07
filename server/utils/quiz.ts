// Shared quiz-grading helpers. Answers live only on the server (in the content
// frontmatter) and are never shipped to the browser — LessonQuiz fetches a
// question set here and posts the learner's choices back for scoring.

export const QUIZ_SHOWN_MAX = 7
export const DEFAULT_PASS_SCORE = 85

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

/**
 * Pick which pool questions to show for a given attempt. Returns pool indices.
 * The window rotates with the attempt number, so a learner who fails and
 * retries gets a different set instead of the same questions again.
 */
export function pickQuizSet(poolSize: number, attemptIndex: number): number[] {
  const shown = Math.min(QUIZ_SHOWN_MAX, poolSize)
  if (poolSize <= shown) return Array.from({ length: poolSize }, (_, i) => i)
  const offset = (Math.max(0, attemptIndex) * shown) % poolSize
  return Array.from({ length: shown }, (_, i) => (offset + i) % poolSize)
}

/** Parse a "0,3,5" token into validated pool indices, or null if malformed. */
export function parseSetToken(token: unknown, poolSize: number): number[] | null {
  if (typeof token !== 'string' || !token.length) return null
  const idx = token.split(',').map(s => Number(s.trim()))
  if (!idx.length || idx.some(n => !Number.isInteger(n) || n < 0 || n >= poolSize)) return null
  return idx
}
