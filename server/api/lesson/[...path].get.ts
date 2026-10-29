/**
 * The full body of a Pro lesson, for members.
 *
 *   GET /api/lesson/<locale>/<route>     e.g. /api/lesson/en/introduction/set-up-your-org
 *
 * scripts/gate-content.mjs moves Pro bodies into server/assets/gated/ (bundled
 * into the Worker, never into .output/public); this is the only way to read
 * one, and it checks Pro first. Returns the markdown (rendered with <MDC>) and
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
  if (!(await hasPro(user.id))) {
    throw createError({ statusCode: 403, statusMessage: 'This lesson is for Pro members' })
  }
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { markdown: lesson.markdown, ...lesson.data }
})
