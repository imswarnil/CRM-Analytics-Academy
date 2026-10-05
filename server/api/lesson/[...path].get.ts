/**
 * The full body of a Pro lesson.
 *
 * A Pro lesson's real markdown never enters the content collection or the
 * static bundle: scripts/gate-content.mjs moves it into a server asset (which
 * Nitro bundles into the Worker, not into .output/public) and leaves a public
 * stub in its place. This route is the only way to reach the body, and it
 * checks entitlement before returning a byte.
 *
 *   GET /api/lesson/<locale>/<route>     e.g. /api/lesson/en/saql/functions
 *
 * Returns the markdown (rendered client-side with <MDC>), the frontmatter
 * the stub deliberately left out (quiz, interview, walkthrough), and — when
 * the lesson has a video — a signed Mux playback token for its one video
 * (captions carry the languages), minted per request with a short life so it cannot outlive the
 * entitlement that earned it.
 */
import type { MuxField } from '#shared/utils/lessonVideo'

interface GatedLesson {
  access: 'pro'
  markdown: string
  data: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const path = '/' + (getRouterParam(event, 'path') || '')

  // The path indexes a bundled asset, so it is validated before use: without
  // this, `..` in the URL walks out of the content tree.
  if (!/^\/[a-z]{2}(\/[a-z0-9-]+)+$/i.test(path) || path.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }

  // server/assets/ is bundled into the Worker and mounted by Nitro as
  // `assets:server`; the gated lessons sit under its gated/ folder.
  const storage = useStorage('assets:server')
  const key = `gated:${path.replace(/^\//, '').replace(/\//g, ':')}.json`
  const lesson = await storage.getItem<GatedLesson>(key)
  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }

  const user = await requireUser(event)
  if (!(await hasPro(user.id))) {
    // 403 rather than 404: the lesson exists and the learner knows it does,
    // because the curriculum lists it. Pretending otherwise only confuses.
    throw createError({ statusCode: 403, statusMessage: 'This lesson requires Pro' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  // One video per lesson, every locale: `mux` is a single playback id (an old
  // per-language map is read for its English entry only). Videos inside the
  // lesson body (`:::lesson-video{mux=…}`) are signed too.
  const playbackId = muxPlaybackId(lesson.data.mux as MuxField)
  const inline = await signMuxPlaybacks(muxIdsIn(lesson.markdown).filter(id => id !== playbackId))

  const { quiz, interview, walkthrough } = lesson.data
  return {
    access: 'pro' as const,
    markdown: lesson.markdown,
    quiz: quiz ?? null,
    interview: interview ?? null,
    walkthrough: walkthrough ?? null,
    playback: playbackId ? await signMuxPlayback(playbackId) : undefined,
    inlinePlayback: inline
  }
})
