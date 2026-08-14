import { requireAdmin } from '~~/server/utils/auth'
import { buildLessonRow, type LessonInput } from '~~/server/utils/content-builder'

export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lesson id' })
  }

  const body = await readBody<LessonInput>(event)
  const patch = buildLessonRow(body ?? {}, true)

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const { data, error } = await admin
    .from('lessons')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'That section already has a lesson with this slug'
      })
    }
    // The lessons_video_range CHECK fires when a partial update leaves
    // end <= start after merging with the stored values.
    if (error.code === '23514') {
      throw createError({ statusCode: 400, statusMessage: 'Video end must come after video start' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  return { lesson: data }
})
