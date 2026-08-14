import { requireAdmin } from '~~/server/utils/auth'

interface ReorderBody {
  type?: 'section' | 'lesson'
  /** Ids in their new display order. Index becomes `position`. */
  ids?: string[]
  /** Required when reordering lessons: the section they belong to. */
  sectionId?: string
}

/**
 * Rewrite an ordering in one shot.
 *
 * The client sends the full ordered id list rather than a "move item 3 to slot
 * 5" delta, which keeps positions dense and makes the operation idempotent —
 * replaying the same request is harmless.
 */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const body = await readBody<ReorderBody>(event)

  const type = body?.type
  if (type !== 'section' && type !== 'lesson') {
    throw createError({ statusCode: 400, statusMessage: 'type must be "section" or "lesson"' })
  }

  const ids = Array.isArray(body?.ids) ? body.ids.filter(id => typeof id === 'string') : []
  if (!ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'ids must be a non-empty list' })
  }
  if (new Set(ids).size !== ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'ids contains duplicates' })
  }

  if (type === 'section') {
    // Scoped to nothing else, so a plain per-row position write is enough.
    const results = await Promise.all(
      ids.map((id, position) => admin.from('sections').update({ position }).eq('id', id))
    )
    const failed = results.find(r => r.error)
    if (failed?.error) {
      throw createError({ statusCode: 500, statusMessage: failed.error.message })
    }
    return { ok: true, count: ids.length }
  }

  const sectionId = body?.sectionId
  if (!sectionId) {
    throw createError({ statusCode: 400, statusMessage: 'sectionId is required for lesson reordering' })
  }

  // Constrain the write to the named section so a malformed id list can never
  // renumber lessons belonging to a different section.
  const results = await Promise.all(
    ids.map((id, position) =>
      admin.from('lessons').update({ position }).eq('id', id).eq('section_id', sectionId)
    )
  )
  const failed = results.find(r => r.error)
  if (failed?.error) {
    throw createError({ statusCode: 500, statusMessage: failed.error.message })
  }

  return { ok: true, count: ids.length }
})
