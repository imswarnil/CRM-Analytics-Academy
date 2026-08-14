import { requireAdmin } from '~~/server/utils/auth'
import { buildSectionRow, type SectionInput } from '~~/server/utils/content-builder'

export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing section id' })
  }

  const body = await readBody<SectionInput>(event)
  const patch = buildSectionRow(body ?? {}, true)

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const { data, error } = await admin
    .from('sections')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A section with that slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Section not found' })
  }

  return { section: data }
})
