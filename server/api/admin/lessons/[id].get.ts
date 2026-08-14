import { requireAdmin } from '~~/server/utils/auth'

/** One lesson in full, including body and quiz — what the editor loads. */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing lesson id' })
  }

  const { data, error } = await admin.from('lessons').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  return { lesson: data }
})
