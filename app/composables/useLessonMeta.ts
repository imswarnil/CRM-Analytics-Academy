import meta from '~/data/lesson-meta.json'

export interface LessonMeta {
  minutes: number
  type: 'video' | 'article'
  quiz: boolean
}

const table = meta as Record<string, LessonMeta>
const FALLBACK: LessonMeta = { minutes: 8, type: 'article', quiz: false }

/**
 * Length and kind for any lesson route, in any locale. Generated from the
 * English lessons by scripts/lesson-meta.mjs; a translated route is looked up
 * by its locale-stripped path.
 */
export function useLessonMeta() {
  const { normalise } = useProgress()
  const of = (path: string): LessonMeta => table[normalise(path)] ?? FALLBACK
  return { of, all: table }
}
