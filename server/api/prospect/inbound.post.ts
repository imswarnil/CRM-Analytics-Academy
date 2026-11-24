/**
 * n8n → site: a reply, bounce, unsubscribe or auto-reply seen in the outreach
 * mailbox (docs/n8n/prospect-inbound.json).
 *
 *   body       { ts, payload }   payload = the event as a JSON string
 *   x-signature  "sha256=" + hex(HMAC-SHA256(N8N_WEBHOOK_SECRET, `${ts}.${payload}`))
 *
 * Refused unless the signature matches, the timestamp is within 5 minutes,
 * and the same signed request has not been seen before (replay).
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  const secret = outreachConfigFromEnv().webhookSecret
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Inbound webhook not configured' })
  const raw = await readRawBody(event, 'utf8').catch(() => null)
  if (!raw || raw.length > 64_000) throw createError({ statusCode: 400, statusMessage: 'Bad body' })
  let body: { ts?: unknown, payload?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Bad JSON' })
  }
  const signature = getRequestHeader(event, 'x-signature') ?? ''
  const check = await verifyPayload(secret, body.ts, body.payload, signature)
  if (check !== 'ok') throw createError({ statusCode: 401, statusMessage: check === 'stale' ? 'Stale timestamp' : 'Bad signature' })
  let evt
  try {
    evt = parseInbound(JSON.parse(String(body.payload)))
  } catch {
    evt = null
  }
  if (!evt) throw createError({ statusCode: 400, statusMessage: 'Unknown event' })
  const r = await handleInbound(evt, signature.toLowerCase())
  if (r.status === 'duplicate') throw createError({ statusCode: 409, statusMessage: 'Replay refused' })
  return { ok: true, matched: Boolean(r.prospectId), matchedBy: r.matchedBy }
})
