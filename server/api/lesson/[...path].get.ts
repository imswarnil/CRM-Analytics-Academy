/**
 * The full body of a member lesson (`access: pro`) — for any signed-in learner
 * with a session to spend (or unlimited access). Opening it is one session,
 * the same as any metered page; re-reading it today is free.
 *
 *   GET /api/lesson/<locale>/<route>     e.g. /api/lesson/en/introduction/set-up-your-org
 *
 * scripts/gate-content.mjs moves Pro bodies into server/assets/gated/ (bundled
 * into the Worker, never into .output/public); this is the only way to read
 * one, and it charges the session first. Returns the markdown (rendered with <MDC>) and
 * the quiz, interview, walkthrough and video the public stub leaves out.
 */
interface GatedLesson {
  markdown: string
  data: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const path = String(getRouterParam(event, 'path') || '')
  // The path indexes a bundled asset: validated so `..` cannot walk out.
  if (!/^[a-z]{2}(\/[a-z0-9-]+)+$/.test(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }
  const lesson = await useStorage('assets:server').getItem<GatedLesson>(`gated:${path.replace(/\//g, ':')}.json`)
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })

  const user = await requireUser(event)
  const route = `/${path.split('/').slice(1).join('/')}`
  const charge = await chargeSession(event, user, route)
  if (!charge.ok) {
    throw createError({ statusCode: 402, statusMessage: 'No sessions left — buy a pack with points to keep reading.' })
  }
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { markdown: lesson.markdown, ...lesson.data }
})
