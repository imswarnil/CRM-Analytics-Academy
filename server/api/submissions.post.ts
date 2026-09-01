/**
 * Submit a resource, a showcase dashboard, or a lesson idea.
 *
 * Everything lands as `pending`. Nothing a learner types reaches a public page
 * until a human approves it — this is a public form on a site with a database
 * behind it, which is a spam target whether or not it is worth spamming yet.
 *
 * Every field is validated here rather than trusted from the client, and the
 * table repeats the same constraints. Two layers on purpose: the API's job is
 * to give a person a useful error, the database's is to be right even if a
 * future route forgets to ask.
 */
const KINDS = ['resource', 'showcase', 'lesson-idea'] as const
type Kind = typeof KINDS[number]

// Per-user, per-window. An authenticated endpoint that writes rows is the
// shape of thing that gets hammered by one compromised account.
const RATE = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 10

function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  // The demo account is shared, so anything it submits is written by "whoever
  // clicked demo last" and cannot be moderated back to a person.
  if (await isDemoUser(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'The demo account cannot submit.' })
  }

  const now = Date.now()
  const seen = RATE.get(user.id)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' })
    }
    seen.count += 1
  } else {
    RATE.set(user.id, { count: 1, resetAt: now + WINDOW_MS })
  }

  const body = await readBody<Record<string, unknown>>(event)

  const kind = String(body?.kind ?? '') as Kind
  if (!KINDS.includes(kind)) fail('Pick what you are submitting.')

  const title = String(body?.title ?? '').trim()
  if (title.length < 3 || title.length > 160) fail('Title must be between 3 and 160 characters.')

  const description = String(body?.description ?? '').trim()
  if (description.length < 20 || description.length > 2000) {
    fail('Description must be between 20 and 2000 characters.')
  }

  // http(s) only. Without the scheme check a `javascript:` URL would be stored
  // and later rendered into an href on a public page.
  const rawUrl = String(body?.url ?? '').trim()
  let url: string | null = null
  if (rawUrl) {
    let parsed: URL
    try {
      parsed = new URL(rawUrl)
    } catch {
      fail('That link is not a valid URL.')
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) fail('Links must start with http:// or https://')
    url = parsed.toString()
  }
  if (kind === 'resource' && !url) fail('A resource needs a link.')

  const rawImage = String(body?.imageUrl ?? '').trim()
  let imageUrl: string | null = null
  if (rawImage) {
    let parsed: URL
    try {
      parsed = new URL(rawImage)
    } catch {
      fail('That screenshot link is not a valid URL.')
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) fail('Screenshot links must start with http:// or https://')
    imageUrl = parsed.toString()
  }

  // Normalised here so "SAQL", "saql" and " SAQL " are one tag rather than
  // three, and capped so a tag list cannot become the description.
  const tags = Array.isArray(body?.tags)
    ? [...new Set(
        (body.tags as unknown[])
          .map(t => String(t).trim().toLowerCase())
          .filter(t => t.length > 0 && t.length <= 32)
      )].slice(0, 8)
    : []

  const sql = useDb()
  try {
    const rows = await sql`
      insert into app.submission (user_id, kind, title, url, description, tags, image_url)
      values (${user.id}, ${kind}, ${title}, ${url}, ${description}, ${tags}, ${imageUrl})
      returning id, status, created_at
    `
    const row = rows[0]
    if (!row) throw createError({ statusCode: 500, statusMessage: 'Could not save that submission.' })

    setResponseHeader(event, 'cache-control', 'no-store')
    return { ok: true, id: Number(row.id), status: row.status as string }
  } catch (e) {
    // The partial unique index on (user_id, url).
    if (String((e as Error).message).includes('submission_user_url_uniq')) {
      throw createError({ statusCode: 409, statusMessage: 'You have already submitted that link.' })
    }
    throw e
  }
})
