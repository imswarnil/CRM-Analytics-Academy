/**
 * Post a comment or a reply. Signed in, not the shared demo account, rate
 * limited per user. Plain text only — the client renders it as text, so
 * markup in a comment is displayed, never executed.
 */
const RATE = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 8

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot comment.' })
  }

  const now = Date.now()
  const seen = RATE.get(user.id)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) throw createError({ statusCode: 429, statusMessage: 'Slow down — try again in a few minutes.' })
    seen.count += 1
  } else {
    RATE.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
  }

  const body = await readBody<{ path?: unknown, body?: unknown, parentId?: unknown }>(event)
  const path = String(body?.path ?? '')
  if (!/^\/[a-z0-9/-]*$/.test(path) || path.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }
  const text = String(body?.body ?? '').trim()
  if (text.length < 2 || text.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Comments are 2 to 2,000 characters.' })
  }

  const sql = useDb()
  let parentId: number | null = null
  if (body?.parentId != null) {
    parentId = Number(body.parentId)
    // Replies attach to a top-level comment on the same lesson — one level
    // deep, and never across lessons.
    const parent = await sql`select id from app.comment where id = ${parentId} and lesson_path = ${path} and parent_id is null and status = 'visible'`
    if (!parent.length) throw createError({ statusCode: 400, statusMessage: 'That comment cannot be replied to.' })
  }

  const rows = await sql`
    insert into app.comment (lesson_path, user_id, parent_id, body)
    values (${path}, ${user.id}, ${parentId}, ${text})
    returning id
  `
  forget(`comments:${path}`)
  return { ok: true, id: Number(rows[0]?.id) }
})
