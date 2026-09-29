/**
 * Enquiries to the Academy: a classroom enrollment, a team quotation, or an
 * implementation request.
 *
 * Public — prospects do not have accounts — so the guards are the ones a
 * public form needs: a per-IP rate limit, a honeypot field real people never
 * see, and server-side validation of everything. Rows are only ever read in
 * the admin console; nothing here is rendered on a public page.
 */
const KINDS = ['enrollment', 'quotation', 'implementation'] as const
type Kind = typeof KINDS[number]

// The fields each kind may carry in `details`, and nothing else. Anything the
// client sends outside this list is dropped rather than stored.
const DETAIL_FIELDS: Record<Kind, string[]> = {
  enrollment: ['center', 'cohort', 'track', 'experience'],
  quotation: ['teamSize', 'plan', 'delivery', 'timeline', 'country'],
  implementation: ['scope', 'orgEdition', 'dataSources', 'budget', 'timeline']
}

const RATE = new Map<string, { count: number, resetAt: number }>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5

function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

function optional(v: unknown, max: number) {
  const s = String(v ?? '').trim()
  if (!s) return null
  if (s.length > max) fail(`A field is longer than ${max} characters.`)
  return s
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  // Honeypot: a field hidden from people. A bot that fills every input fills
  // this one; answer as if it worked so it learns nothing.
  if (String(body?.website ?? '').trim()) return { ok: true }

  const ip = getRequestHeader(event, 'cf-connecting-ip')
    || getRequestIP(event, { xForwardedFor: true })
    || 'unknown'
  const now = Date.now()
  const seen = RATE.get(ip)
  if (seen && seen.resetAt > now) {
    if (seen.count >= MAX_PER_WINDOW) {
      throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
    }
    seen.count += 1
  } else {
    RATE.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  const kind = String(body?.kind ?? '') as Kind
  if (!KINDS.includes(kind)) fail('Unknown enquiry type.')

  const name = String(body?.name ?? '').trim()
  if (name.length < 2 || name.length > 120) fail('Please enter your name.')

  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) fail('Please enter a valid email address.')

  const company = optional(body?.company, 160)
  if (kind !== 'enrollment' && !company) fail('Please enter your company.')
  const phone = optional(body?.phone, 40)
  const message = optional(body?.message, 4000)

  const raw = (body?.details ?? {}) as Record<string, unknown>
  const details: Record<string, string> = {}
  for (const key of DETAIL_FIELDS[kind]) {
    const v = optional(raw[key], 200)
    if (v) details[key] = v
  }

  const sql = useDb()
  const rows = await sql`
    insert into app.inquiry (kind, name, email, company, phone, message, details)
    values (${kind}, ${name}, ${email}, ${company}, ${phone}, ${message}, ${JSON.stringify(details)}::jsonb)
    returning id
  `

  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, id: Number(rows[0]?.id) }
})
