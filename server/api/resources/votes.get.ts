import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Public vote tallies for approved resources, plus the caller's own votes so
// the UI can render the pressed state. Counts are aggregated server-side (the
// votes table is public-readable, but we never ship raw rows to the client).
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const db = serverSupabaseServiceRole<Database>(event)

  const { data, error } = await db.from('resource_votes').select('resource_id, user_id')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const counts: Record<string, number> = {}
  const mine: string[] = []
  for (const row of data ?? []) {
    counts[row.resource_id] = (counts[row.resource_id] ?? 0) + 1
    if (userId && row.user_id === userId) mine.push(row.resource_id)
  }

  return { counts, mine }
})
