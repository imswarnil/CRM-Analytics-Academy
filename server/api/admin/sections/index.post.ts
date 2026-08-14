import { requireAdmin } from '~~/server/utils/auth'
import { buildSectionRow, type SectionInput } from '~~/server/utils/content-builder'

export default defineEventHandler(async (event) => {
  const { admin, userId } = await requireAdmin(event)
  const body = await readBody<SectionInput>(event)

  const row = buildSectionRow(body ?? {})
  row.created_by = userId

  // New sections land at the end of the list unless a position was given.
  if (row.position === undefined) {
    const { count } = await admin
      .from('sections')
      .select('id', { count: 'exact', head: true })
    row.position = count ?? 0
  }

  const { data, error } = await admin.from('sections').insert(row).select().single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A section with that slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { section: { ...data, lessons: [] } }
})
