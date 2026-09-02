/**
 * Newsletter signup, proxied to the Ghost site's members API.
 *
 * Ghost's magic-link endpoint is same-origin by design (Portal calls it),
 * so the browser can't POST to it from this domain — the Worker forwards
 * instead. Ghost then emails a confirmation link; nothing is subscribed
 * until the reader clicks it, which is also what makes this safe to expose:
 * the endpoint can only cause an opt-in email to the address given.
 */
const GHOST_URL = process.env.NEWSLETTER_GHOST_URL || 'https://imswarnil.com'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event).catch(() => null)
  const email = String(body?.email ?? '').trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw createError({ statusCode: 400, statusMessage: 'A valid email is required.' })
  }

  try {
    const res = await fetch(`${GHOST_URL}/members/api/send-magic-link/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, emailType: 'subscribe' })
    })
    if (!res.ok) {
      throw new Error(`ghost answered ${res.status}`)
    }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Subscription failed.' })
  }

  return { ok: true }
})
