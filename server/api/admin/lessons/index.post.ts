import { requireAdmin } from '~~/server/utils/auth'
import { buildLessonRow, type LessonInput } from '~~/server/utils/content-builder'

export default defineEventHandler(async (event) => {
  const { admin, userId } = await requireAdmin(event)
  const body = await readBody<LessonInput>(event)

  const row = buildLessonRow(body ?? {})
  row.created_by = userId

  // Append to the end of its section unless positioned explicitly.
  if (row.position === undefined) {
    const { count } = await admin
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', row.section_id)
    row.position = count ?? 0
  }

  const { data, error } = await admin.from('lessons').insert(row).select().single()

  if (error) {
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'That section already has a lesson with this slug'
      })
    }
    if (error.code === '23503') {
      throw createError({ statusCode: 400, statusMessage: 'That section does not exist' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { lesson: data }
})
