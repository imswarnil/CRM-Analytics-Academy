/**
 * The body of a gated lesson.
 *
 * Pro lessons are excluded from the prerender, so their markdown is not in the
 * public bundle — this route is the only way to reach it, and it checks
 * entitlement before returning a byte. The content is read from a server
 * asset, which Nitro bundles into the Worker rather than into
 * .output/public, so it cannot be fetched directly however well the URL is
 * guessed.
 *
 * Free lessons are served from here too, unauthenticated, so the client has
 * one code path rather than two that can drift apart.
 */
export default defineEventHandler(async (event) => {
  const path = '/' + (getRouterParam(event, 'path') || '')

  // The path indexes a bundled asset, so it is validated before use: without
  // this, `..` in the URL walks out of the content tree.
  if (!/^\/[a-z0-9/-]+$/i.test(path) || path.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }

  const storage = useStorage('assets:gated')
  const key = `${path.replace(/^\//, '').replace(/\//g, ':')}.json`
  const lesson = await storage.getItem<{ access: string, body: unknown, mux?: string }>(key)

  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  if (lesson.access !== 'pro') {
    return { access: 'free', body: lesson.body }
  }

  const user = await requireUser(event)
  const sql = useDb()
  const rows = await sql`select pro from app.entitlement where user_id = ${user.id}`

  if (!rows[0]?.pro) {
    // 403 rather than 404: the lesson exists and the learner knows it exists,
    // because the curriculum lists it. Pretending otherwise only confuses.
    throw createError({ statusCode: 403, statusMessage: 'This lesson requires Pro' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    access: 'pro',
    body: lesson.body,
    // Signed per request, for this entitled user, with a short life — never
    // baked into a page where it would outlive the entitlement.
    playback: lesson.mux ? await signMuxPlayback(lesson.mux) : undefined
  }
})
