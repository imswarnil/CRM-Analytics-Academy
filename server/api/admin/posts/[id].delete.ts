import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing post id' })
  }

  const { error } = await admin.from('posts').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
