import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

/** A single published post by slug. 404s on drafts. */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const db = serverSupabaseServiceRole<Database>(event)

  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return { post: data }
})
