import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Toggle the signed-in user's upvote on an approved resource. One vote per
// (resource, user) — a second call removes it. Returns the fresh count + state.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ resource_id?: unknown }>(event)
  const resourceId = typeof body?.resource_id === 'string' ? body.resource_id : ''
  if (!resourceId) throw createError({ statusCode: 400, statusMessage: 'resource_id is required' })

  const db = serverSupabaseServiceRole<Database>(event)

  // Only approved resources can be voted on.
  const { data: resource } = await db
    .from('resources')
    .select('id, status')
    .eq('id', resourceId)
    .single()
  if (!resource || resource.status !== 'approved') {
    throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
  }

  const { data: existing } = await db
    .from('resource_votes')
    .select('id')
    .eq('resource_id', resourceId)
    .eq('user_id', user.id)
    .maybeSingle()

  let voted: boolean
  if (existing) {
    const { error } = await db.from('resource_votes').delete().eq('id', existing.id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    voted = false
  } else {
    const { error } = await db.from('resource_votes').insert({ resource_id: resourceId, user_id: user.id })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    voted = true
  }

  const { count } = await db
    .from('resource_votes')
    .select('id', { count: 'exact', head: true })
    .eq('resource_id', resourceId)

  return { ok: true, voted, count: count ?? 0 }
})
