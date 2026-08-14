import { serverSupabaseServiceRole } from '#supabase/server'
import { queryCollection } from '@nuxt/content/server'
import type { Collections } from '@nuxt/content'
import type { H3Event } from 'h3'
import type { Database } from '~~/types/database.types'
import type { QuizQuestion } from '~~/server/utils/quiz'

/**
 * Resolve a lesson's quiz pool from EITHER content source.
 *
 * The site has two kinds of lesson and both grade through /api/quiz:
 *   - markdown lessons compiled by Nuxt Content, addressed by content path
 *   - admin-authored lessons in the `lessons` table, addressed by /learn/<s>/<l>
 *
 * Keeping the lookup here means the grading endpoints stay identical for both,
 * so answers are never shipped to the client in either case.
 */

const LEARN_PATH = /^\/learn\/([^/]+)\/([^/]+)\/?$/

export interface QuizPool {
  pool: QuizQuestion[]
  passScore?: number
}

export async function loadQuizPool(event: H3Event, path: string): Promise<QuizPool | null> {
  const learn = LEARN_PATH.exec(path)

  if (learn) {
    const [, sectionSlug, lessonSlug] = learn
    const db = serverSupabaseServiceRole<Database>(event)

    // Both the section and the lesson must be published — an unpublished
    // lesson must not be gradeable just because someone knows its slug.
    const { data: section } = await db
      .from('sections')
      .select('id')
      .eq('slug', sectionSlug!)
      .eq('status', 'published')
      .maybeSingle()

    if (!section) return null

    const { data: lesson } = await db
      .from('lessons')
      .select('quiz, pass_score')
      .eq('section_id', section.id)
      .eq('slug', lessonSlug!)
      .eq('status', 'published')
      .maybeSingle()

    if (!lesson) return null

    return {
      pool: Array.isArray(lesson.quiz) ? (lesson.quiz as QuizQuestion[]) : [],
      passScore: typeof lesson.pass_score === 'number' ? lesson.pass_score : undefined
    }
  }

  const page = await queryCollection(event, 'docs' as keyof Collections).path(path).first()
  if (!page) return null

  return {
    pool: (page.quiz ?? []) as QuizQuestion[],
    passScore: typeof page.passScore === 'number' ? page.passScore : undefined
  }
}
