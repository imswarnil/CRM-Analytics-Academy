import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

/**
 * Public curriculum tree for admin-authored content: published sections, each
 * with its published lessons, in display order.
 *
 * Service role + an explicit status filter, same rationale as the blog index:
 * anonymous read-only data where the published flag is the entire access rule.
 */
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole<Database>(event)

  const { data: sections, error: sectionsError } = await db
    .from('sections')
    .select('id, slug, title, description, icon, position')
    .eq('status', 'published')
    .order('position', { ascending: true })

  if (sectionsError) {
    throw createError({ statusCode: 500, statusMessage: sectionsError.message })
  }
  if (!sections?.length) {
    return { sections: [] }
  }

  const { data: lessons, error: lessonsError } = await db
    .from('lessons')
    .select('id, section_id, slug, title, description, position, access, video_id')
    .eq('status', 'published')
    .in('section_id', sections.map(s => s.id))
    .order('position', { ascending: true })

  if (lessonsError) {
    throw createError({ statusCode: 500, statusMessage: lessonsError.message })
  }

  const bySection = new Map<string, typeof lessons>()
  for (const lesson of lessons ?? []) {
    const bucket = bySection.get(lesson.section_id) ?? []
    bucket.push(lesson)
    bySection.set(lesson.section_id, bucket)
  }

  return {
    sections: sections.map(section => ({
      ...section,
      lessons: bySection.get(section.id) ?? []
    }))
  }
})
