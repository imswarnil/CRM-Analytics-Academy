import { requireAdmin } from '~~/server/utils/auth'

/**
 * Delete a section. Its lessons go with it (ON DELETE CASCADE), so the UI must
 * confirm first — the lesson count is returned to make that warning specific.
 */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing section id' })
  }

  const { count } = await admin
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('section_id', id)

  const { error } = await admin.from('sections').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true, deletedLessons: count ?? 0 }
})
