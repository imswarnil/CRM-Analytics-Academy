import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

const MAX_DRAWING_CHARS = 400_000 // ~300 KB PNG data URL

// Sign the guestbook as the signed-in user. Auto-published unless the message
// trips the profanity filter; an admin can still hide/delete afterwards.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = serverSupabaseServiceRole<Database>(event)

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const name = str(body.name).slice(0, 60) || null
  const message = str(body.message).slice(0, 2000)
  const drawing = str(body.drawing)

  const hasDrawing = drawing.startsWith('data:image/png;base64,')
  if (!message && !hasDrawing) {
    throw createError({ statusCode: 400, statusMessage: 'Add a message or a drawing' })
  }
  if (drawing && !hasDrawing) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid drawing' })
  }
  if (drawing.length > MAX_DRAWING_CHARS) {
    throw createError({ statusCode: 413, statusMessage: 'Drawing is too large' })
  }
  if (isAbusive(message) || isAbusive(name || '')) {
    throw createError({ statusCode: 400, statusMessage: 'Please keep it friendly — that message was blocked.' })
  }

  const { error } = await db.from('guestbook').insert({
    user_id: user.id,
    name,
    message: message || null,
    drawing: hasDrawing ? drawing : null
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
