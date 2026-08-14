import { requireAdmin } from '~~/server/utils/auth'
import { buildPostRow, assertAttribution, type PostInput } from '~~/server/utils/posts'

/** Update a post. Attribution is re-checked against the merged row. */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing post id' })
  }

  const body = await readBody<PostInput>(event)
  const patch = buildPostRow(body ?? {}, true)

  if (!Object.keys(patch).length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const { data: existing, error: readError } = await admin
    .from('posts')
    .select('is_external, source_url, author_name')
    .eq('id', id)
    .single()

  if (readError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  assertAttribution({ ...existing, ...patch })

  const { data, error } = await admin
    .from('posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'A post with that slug already exists' })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { post: data }
})
