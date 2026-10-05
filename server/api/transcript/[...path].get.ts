/**
 * The transcript of a Pro lesson's video, in one language.
 *
 *   GET /api/transcript/<locale>/<route>     e.g. /api/transcript/es/saql/functions
 *
 * A free lesson's transcripts are static files (/transcripts/<locale>/<route>.vtt),
 * copied there by scripts/gate-content.mjs. A Pro lesson's are not: they were
 * copied into server/assets/gated-transcripts/ instead, because the words of a
 * paid video are as paid as the video, and this route hands them out after
 * the same hasPro() check as the lesson body.
 */
export default defineEventHandler(async (event) => {
  const path = '/' + (getRouterParam(event, 'path') || '')
  if (!/^\/[a-z]{2}(\/[a-z0-9-]+)*$/i.test(path) || path.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transcript path' })
  }

  // Authorize first: a 404 before the Pro check would tell anyone which Pro
  // lessons have a transcript.
  const user = await requireUser(event)
  if (!(await hasPro(user.id))) {
    throw createError({ statusCode: 403, statusMessage: 'This transcript requires Pro' })
  }

  const parts = path.replace(/^\//, '').split('/')
  if (parts.length === 1) parts.push('index')
  const storage = useStorage('assets:server')
  const raw = await storage.getItemRaw(`gated-transcripts:${parts.join(':')}.vtt`)
  if (!raw) {
    throw createError({ statusCode: 404, statusMessage: 'Transcript not found' })
  }

  setResponseHeader(event, 'content-type', 'text/vtt; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return typeof raw === 'string' ? raw : new TextDecoder().decode(raw as Uint8Array)
})
