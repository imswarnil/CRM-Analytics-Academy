import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

/**
 * Public blog index. Published posts only, newest first.
 *
 * Uses the service role deliberately: this is anonymous, cacheable, read-only
 * data and the `status = 'published'` filter below is the whole access rule.
 * The heavy `body` column is omitted — the list only needs cards.
 */
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole<Database>(event)
  const query = getQuery(event)

  const limit = Math.min(Number(query.limit) || 24, 50)
  const tag = typeof query.tag === 'string' ? query.tag : null

  let request = db
    .from('posts')
    .select('id, slug, title, description, cover_url, tags, published_at, is_external, source_name, author_name, author_url, source_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (tag) request = request.contains('tags', [tag])

  const { data, error } = await request
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { posts: data ?? [] }
})
