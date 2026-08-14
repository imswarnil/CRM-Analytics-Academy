import { requireAdmin } from '~~/server/utils/auth'

/** Every post, drafts included — the admin blog list. */
export default defineEventHandler(async (event) => {
  const { admin } = await requireAdmin(event)

  const { data, error } = await admin
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { posts: data ?? [] }
})
