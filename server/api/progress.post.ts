import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

// Toggle a lesson's completion for the signed-in user. Uses the service-role
// client with the identity verified from the session (requireUser), so it is
// not affected by client token-attachment quirks. user_id is always the
// authenticated user, so users can only change their own progress.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{ lessonPath?: string, done?: boolean }>(event)
  const lessonPath = typeof body?.lessonPath === 'string' ? body.lessonPath.trim() : ''
  if (!lessonPath) {
    throw createError({ statusCode: 400, statusMessage: 'lessonPath is required' })
  }

  const db = serverSupabaseServiceRole<Database>(event)

  const { error } = body?.done === false
    ? await db.from('lesson_progress').delete().eq('user_id', user.id).eq('lesson_path', lessonPath)
    : await db.from('lesson_progress').upsert(
        { user_id: user.id, lesson_path: lessonPath },
        { onConflict: 'user_id,lesson_path' }
      )

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return { ok: true, done: body?.done !== false }
})
