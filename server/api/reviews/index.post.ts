/**
 * Add or update your review of a product. Signed in, not the demo account,
 * rate limited. One review per person per product (a second post edits it).
 * Plain text only: rendered as text, never as markup.
 */
const PRODUCTS = new Set(['notes'])

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await rateLimit(event, 'review', 10, 60)
  if (await isDemoUser(user.id)) throw createError({ statusCode: 403, statusMessage: 'The demo account cannot leave reviews.' })

  const body = await readBody<{ product?: unknown, rating?: unknown, body?: unknown }>(event)
  const product = String(body?.product ?? '')
  if (!PRODUCTS.has(product)) throw createError({ statusCode: 400, statusMessage: 'Unknown product' })
  const rating = Number(body?.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw createError({ statusCode: 400, statusMessage: 'Pick 1 to 5 stars.' })
  const text = String(body?.body ?? '').trim()
  if (text.length < 10 || text.length > 1000) throw createError({ statusCode: 400, statusMessage: 'Reviews are 10 to 1,000 characters.' })

  const sql = useDb()
  await sql`
    insert into app.review (product, user_id, rating, body)
    values (${product}, ${user.id}, ${rating}, ${text})
    on conflict (product, user_id) do update set rating = excluded.rating, body = excluded.body, updated_at = now()
  `
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, review: { rating, body: text, createdAt: new Date().toISOString(), name: user.name?.trim() || 'Learner', image: user.image ?? null } }
})
