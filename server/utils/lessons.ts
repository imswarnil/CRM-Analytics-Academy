import meta from '~~/app/data/lesson-meta.json'

/**
 * The published lessons, as the build knows them (app/data/lesson-meta.json,
 * written by scripts/lesson-meta.mjs from content/en). Write endpoints that
 * award points or store a lesson path check it here, so a made-up path can
 * neither earn points on the leaderboard nor fill a table with junk.
 */
const LESSONS = meta as Record<string, { quiz?: boolean }>
const LOCALE_PREFIX = /^\/(en|es|de|pt|fr|ja|hi)(?=\/|$)/

/**
 * Locale-stripped, trailing-slash-free path; '' when it is not a lesson. A
 * pre-2026-11-23 path (/saql/…) is accepted and returned as its /course/… form.
 */
export function lessonPath(raw: unknown): string {
  const p = currentLessonPath(String(raw ?? '').replace(LOCALE_PREFIX, '').replace(/\/+$/, ''))
  return p.length <= 200 && Object.hasOwn(LESSONS, p) ? p : ''
}

/** True when that lesson has a quiz. */
export function lessonHasQuiz(path: string): boolean {
  return Boolean(LESSONS[path]?.quiz)
}
