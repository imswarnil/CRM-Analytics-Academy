/**
 * Dodo Payments — the merchant of record (sells worldwide from India, handles
 * tax). Restored from the earlier integration and wired to today's tables.
 *
 * PAYMENT_PROVIDER=dodo makes /api/billing/* use Dodo instead of Stripe.
 * DODO_ENV picks the API: `test` (the default, so nothing charges a real card
 * by accident) or `live`. The key is MY_DODO_API_KEY (or DODO_API_KEY).
 * Plans map to Dodo product ids through env vars, so a price change is a
 * dashboard edit, never a deploy:
 *
 *   DODO_PRODUCT_PRO_MONTHLY · DODO_PRODUCT_PRO_ANNUAL · DODO_PRODUCT_PRO_LIFETIME
 */
export type DodoPlan = 'monthly' | 'yearly' | 'lifetime'

export const paymentProvider = (): 'dodo' | 'stripe' => (process.env.PAYMENT_PROVIDER === 'dodo' ? 'dodo' : 'stripe')

export function dodoConfigured(): boolean {
  return Boolean((process.env.MY_DODO_API_KEY || process.env.DODO_API_KEY) && process.env.DODO_PRODUCT_PRO_MONTHLY)
}

export function dodoBase(): string {
  return process.env.DODO_ENV === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com'
}

export function dodoProduct(plan: DodoPlan): string | undefined {
  return plan === 'monthly'
    ? process.env.DODO_PRODUCT_PRO_MONTHLY
    : plan === 'yearly' ? process.env.DODO_PRODUCT_PRO_ANNUAL : process.env.DODO_PRODUCT_PRO_LIFETIME
}

/** Which plan a Dodo product id is (for events that arrive without our metadata). */
export function planOfProduct(productId: string | undefined): DodoPlan | null {
  if (!productId) return null
  if (productId === process.env.DODO_PRODUCT_PRO_MONTHLY) return 'monthly'
  if (productId === process.env.DODO_PRODUCT_PRO_ANNUAL) return 'yearly'
  if (productId === process.env.DODO_PRODUCT_PRO_LIFETIME) return 'lifetime'
  return null
}

export function dodoFetch<T>(path: string, init: { method?: 'GET' | 'POST', body?: unknown } = {}): Promise<T> {
  const key = process.env.MY_DODO_API_KEY || process.env.DODO_API_KEY
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Payments are not configured' })
  return $fetch<T>(`${dodoBase()}${path}`, {
    method: init.method ?? 'GET',
    body: init.body as Record<string, unknown> | undefined,
    headers: { authorization: `Bearer ${key}` }
  })
}

/**
 * Standard Webhooks verification (what Dodo signs with): HMAC-SHA256 over
 * `${id}.${timestamp}.${rawBody}` with the base64 secret after `whsec_`,
 * matched against any `v1,<sig>` in the header, in constant time.
 * Deliveries older than five minutes are refused, so a captured request
 * cannot be replayed.
 */
export async function verifyDodoWebhook(
  headers: { id?: string, timestamp?: string, signature?: string },
  rawBody: string
): Promise<boolean> {
  const secret = process.env.DODO_WEBHOOK_SECRET
  if (!secret || !headers.id || !headers.timestamp || !headers.signature) return false
  const ts = Number(headers.timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  const keyBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), c => c.charCodeAt(0))
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${headers.id}.${headers.timestamp}.${rawBody}`))
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)))
  return headers.signature.split(' ').some((part) => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig || sig.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
    return diff === 0
  })
}
