import { requireAdmin } from '~~/server/utils/auth'
import { buildPostRow, assertAttribution, type PostInput } from '~~/server/utils/posts'

/** Create a post (original or curated-with-attribution). */
export default defineEventHandler(async (event) => {
  const { admin, userId } = await requireAdmin(event)
  const body = await readBody<PostInput>(event)

  const row = buildPostRow(body ?? {})
  assertAttribution(row)
  row.created_by = userId

  const { data, error } = await admin
    .from('posts')
    .insert(row)
    .select()
    .single()

  if (error) {
    // 23505 = unique_violation on slug.
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A post with that slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { post: data }
})
