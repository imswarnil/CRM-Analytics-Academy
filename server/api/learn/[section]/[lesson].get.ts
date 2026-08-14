import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'
import type { QuizQuestion } from '~~/server/utils/quiz'

/**
 * One published lesson, addressed by section + lesson slug.
 *
 * Quiz ANSWERS never leave the server — the payload carries only the questions
 * and their options, matching how markdown lessons are graded via /api/quiz.
 */
export default defineEventHandler(async (event) => {
  const sectionSlug = getRouterParam(event, 'section')
  const lessonSlug = getRouterParam(event, 'lesson')
  if (!sectionSlug || !lessonSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing section or lesson slug' })
  }

  const db = serverSupabaseServiceRole<Database>(event)

  const { data: section, error: sectionError } = await db
    .from('sections')
    .select('id, slug, title, icon')
    .eq('slug', sectionSlug)
    .eq('status', 'published')
    .maybeSingle()

  if (sectionError) {
    throw createError({ statusCode: 500, statusMessage: sectionError.message })
  }
  if (!section) {
    throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  }

  const { data: lesson, error: lessonError } = await db
    .from('lessons')
    .select('*')
    .eq('section_id', section.id)
    .eq('slug', lessonSlug)
    .eq('status', 'published')
    .maybeSingle()

  if (lessonError) {
    throw createError({ statusCode: 500, statusMessage: lessonError.message })
  }
  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  const quiz = Array.isArray(lesson.quiz) ? (lesson.quiz as QuizQuestion[]) : null
  const { quiz: _omitted, ...rest } = lesson

  // Neighbours for prev/next navigation within the section.
  const { data: siblings } = await db
    .from('lessons')
    .select('slug, title, position')
    .eq('section_id', section.id)
    .eq('status', 'published')
    .order('position', { ascending: true })

  const ordered = siblings ?? []
  const index = ordered.findIndex(s => s.slug === lesson.slug)

  return {
    section,
    lesson: {
      ...rest,
      quiz: quiz?.map(({ q, options, skill }) => ({ q, options, skill })) ?? null,
      quizCount: quiz?.length ?? 0
    },
    prev: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null
  }
})
