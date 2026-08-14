import { requireAdmin } from '~~/server/utils/auth'

/**
 * The whole curriculum tree for the admin content builder: every section with
 * its lessons nested and ordered, drafts included.
 *
 * Lesson bodies are omitted — the builder list only renders titles and badges,
 * and bodies can be large. The editor fetches a single lesson when opened.
 */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const [sections, lessons] = await Promise.all([
    admin.from('sections').select('*').order('position', { ascending: true }),
    admin
      .from('lessons')
      .select('id, section_id, slug, title, description, position, status, access, video_id, video_start, video_end, pass_score, updated_at')
      .order('position', { ascending: true })
  ])

  if (sections.error) {
    throw createError({ statusCode: 500, statusMessage: sections.error.message })
  }
  if (lessons.error) {
    throw createError({ statusCode: 500, statusMessage: lessons.error.message })
  }

  const bySection = new Map<string, typeof lessons.data>()
  for (const lesson of lessons.data ?? []) {
    const bucket = bySection.get(lesson.section_id) ?? []
    bucket.push(lesson)
    bySection.set(lesson.section_id, bucket)
  }

  return {
    sections: (sections.data ?? []).map(section => ({
      ...section,
      lessons: bySection.get(section.id) ?? []
    }))
  }
})
