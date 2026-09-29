/**
 * Dodo Payments.
 *
 * DODO_ENV picks the API: `test` (the default, so nothing charges a card by
 * accident) or `live`. The key is read from MY_DODO_API_KEY, the name it was
 * provisioned under, with DODO_API_KEY accepted too.
 *
 * Plans map to Dodo product ids through env vars rather than constants, so a
 * price change is a dashboard edit and a secret update — never a deploy.
 */
export type Plan = 'monthly' | 'lifetime'

export function dodoBase(): string {
  return process.env.DODO_ENV === 'live'
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com'
}

export function dodoProduct(plan: Plan): string | undefined {
  return plan === 'monthly'
    ? process.env.DODO_PRODUCT_PRO_MONTHLY
    : process.env.DODO_PRODUCT_PRO_LIFETIME
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
 * Verifies a webhook against the Standard Webhooks scheme Dodo uses:
 * HMAC-SHA256 over `${id}.${timestamp}.${rawBody}` with the base64-decoded
 * secret (after its `whsec_` prefix), compared against each `v1,<sig>` in the
 * signature header. Deliveries older than five minutes are rejected, so a
 * captured request cannot be replayed later.
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
    // Constant-time comparison.
    let diff = 0
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
    return diff === 0
  })
}
