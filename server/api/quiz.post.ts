/**
 * Record a quiz attempt.
 *
 * The score arrives from the client because grading happens client-side by
 * design: quiz content — correct answers included — is public, open-source
 * markdown, so the server cannot protect a secret the repo already publishes.
 * The integrity property lives elsewhere: app.user_points counts only the
 * BEST attempt per quiz, so replaying (or faking) an attempt is worth at most
 * one quiz's worth of points, bounded by the total validated here.
 *
 * `lesson_path` is stored locale-stripped, exactly like app.progress — the
 * client already normalises, but the strip is repeated here so a learner who
 * POSTs a prefixed path does not split one quiz into twelve.
 */
const LESSON_PATH = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/

// Must agree with the `locales` list in nuxt.config.ts.
const LOCALE_PREFIX = /^\/(en|es|fr|de|pt|ja|zh|hi|ar|ru|bn|ur)(?=\/|$)/

// Per-user, per-window. Retries are legitimate — the whole point is improving
// a best score — but nobody honest takes a quiz twenty times an hour.
const RATE = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 20

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  // The demo account is shared, so a score it saves belongs to "whoever
  // clicked demo last" and would sit on the public leaderboard as noise.
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot save quiz scores.' })
  }

  const now = Date.now()
  const seen = RATE.get(user.id)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
    }
    seen.count += 1
  } else {
    RATE.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
  }

  const body = await readBody<{ lessonPath?: string, score?: number, total?: number }>(event)

  const path = String(body?.lessonPath ?? '').replace(LOCALE_PREFIX, '') || '/'
  if (!LESSON_PATH.test(path) || path.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lesson path' })
  }

  const score = Number(body?.score)
  const total = Number(body?.total)
  if (!Number.isInteger(total) || total < 1 || total > 50) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid quiz total' })
  }
  if (!Number.isInteger(score) || score < 0 || score > total) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid quiz score' })
  }

  const sql = useDb()
  // Every attempt is kept — app.user_points takes the best per quiz, so no
  // aggregation or upsert is needed here.
  await sql`
    insert into app.quiz_attempt (user_id, lesson_path, score, total)
    values (${user.id}, ${path}, ${score}, ${total})
  `

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true }
})
