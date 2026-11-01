/**
 * Stripe over its REST API with fetch — no SDK, which keeps the Worker small
 * and avoids Node built-ins. Keys come from Worker secrets and are never in
 * the repository:
 *
 *   STRIPE_SECRET_KEY       sk_test_… (test mode first) or sk_live_…
 *   STRIPE_WEBHOOK_SECRET   whsec_… for /api/stripe/webhook
 *
 * Prices are found by lookup_key (PRICES in shared/utils/products.ts, created
 * by `pnpm stripe:setup`), so no price id is hard-coded anywhere.
 */
type Params = Record<string, unknown>

/** Stripe's form encoding: nested objects and arrays as a[b][0][c]=v. */
function encode(params: Params, prefix = '', out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' && item !== null ? encode(item as Params, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))))
    else if (typeof v === 'object') encode(v as Params, key, out)
    else out.append(key, String(v))
  }
  return out
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export async function stripe<T = Record<string, unknown>>(method: 'GET' | 'POST' | 'DELETE', path: string, params: Params = {}): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Payments are not set up yet.' })
  const body = encode(params)
  const url = `https://api.stripe.com/v1/${path}${method === 'GET' && [...body].length ? `?${body}` : ''}`
  const res = await fetch(url, {
    method,
    headers: { 'authorization': `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded', 'stripe-version': '2024-06-20' },
    body: method === 'GET' ? undefined : body
  })
  const json = await res.json() as T & { error?: { message?: string } }
  if (!res.ok) throw createError({ statusCode: res.status === 402 ? 402 : 502, statusMessage: json.error?.message ?? 'Stripe refused the request.' })
  return json
}

/** The active price for a PRICES key (memoised for ten minutes in the isolate). */
export async function priceId(key: keyof typeof PRICES): Promise<string> {
  const lookup = PRICES[key].key
  return memo(`stripe-price:${lookup}`, 600_000, async () => {
    const list = await stripe<{ data: { id: string }[] }>('GET', 'prices', { lookup_keys: [lookup], active: true, limit: 1 })
    const id = list.data[0]?.id
    if (!id) throw createError({ statusCode: 503, statusMessage: `Price ${lookup} is missing in Stripe — run pnpm stripe:setup.` })
    return id
  }, v => Boolean(v))
}

/** Verifies a webhook's Stripe-Signature header (HMAC-SHA256, 5-minute tolerance). */
export async function verifyStripeSignature(payload: string, header: string | undefined): Promise<boolean> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !header) return false
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=') as [string, string]))
  const t = Number(parts.t)
  const signatures = header.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3))
  if (!t || !signatures.length || Math.abs(Date.now() / 1000 - t) > 300) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`))
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')
  // Constant-time compare against each v1 signature.
  return signatures.some((sig) => {
    if (sig.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
    return diff === 0
  })
}

/** The Stripe customer for an Academy user, created once and remembered on their subscription row. */
export async function customerFor(user: SessionUser): Promise<string> {
  const [row] = await useDb()`select stripe_customer from app.subscription where user_id = ${user.id}`
  if (row?.stripe_customer) return String(row.stripe_customer)
  const found = await stripe<{ data: { id: string }[] }>('GET', 'customers', { email: user.email, limit: 1 })
  if (found.data[0]) return found.data[0].id
  const c = await stripe<{ id: string }>('POST', 'customers', { email: user.email, name: user.name ?? undefined, metadata: { academy_user_id: user.id } })
  return c.id
}
