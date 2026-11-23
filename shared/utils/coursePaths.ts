/**
 * Where the course lives, and where it used to live.
 *
 * Since 2026-11-23 every lesson is at /course/<section>/<lesson> (files under
 * content/<locale>/course/<NN.section>/), the course page is /course and the
 * navbar calls it "Start here". Before that, sections sat at the site root
 * under longer slugs (/salesforce-foundations/…) and the course page was
 * /start. Those URLs are indexed and shared, so they 301 (nuxt.config.ts reads
 * this map), and paths stored in the database before the move are rewritten
 * on read until server/db/migrate-2026-11-23-course-urls.sql has run.
 *
 * Lesson slugs did not change; only the section part of the path did.
 */
export const COURSE_BASE = '/course'

/** Old top-level section slug → new section slug under /course. */
export const LEGACY_SECTIONS: Record<string, string> = {
  'salesforce-foundations': 'foundations',
  'data-prep': 'data-prep',
  'visualization': 'visualization',
  'saql': 'saql',
  'interactions-and-bindings': 'bindings',
  'sharing-and-embedding': 'sharing',
  'einstein-discovery': 'einstein-discovery'
}

const LEGACY_RE = new RegExp(`^/(${Object.keys(LEGACY_SECTIONS).join('|')})(?=/|$)`)

/**
 * A locale-stripped lesson path written before the move (/saql/windowing),
 * pointed at its current URL (/course/saql/windowing). Anything else is
 * returned unchanged, so it is safe to run over every stored path.
 */
export function currentLessonPath(path: string): string {
  return path.replace(LEGACY_RE, (_, slug: string) => `${COURSE_BASE}/${LEGACY_SECTIONS[slug]}`)
}

/** The inverse: a /course/… lesson path as it was stored before the move. */
export function legacyLessonPath(path: string): string {
  for (const [from, to] of Object.entries(LEGACY_SECTIONS)) {
    const base = `${COURSE_BASE}/${to}`
    if (path === base || path.startsWith(`${base}/`)) return `/${from}${path.slice(base.length)}`
  }
  return path
}
