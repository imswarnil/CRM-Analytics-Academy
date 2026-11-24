import type { SmtpConfig, SocketFactory } from './smtp'

/**
 * Outreach transport — how a prospecting email leaves, and how n8n talks
 * back. Pure (env, socket factory and fetch are passed in) so
 * scripts/check-prospect.mjs runs it against a fake SMTP server and a mocked n8n.
 *
 *   OUTREACH_TRANSPORT  smtp (default) | n8n
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS   the outreach mailbox (Hostinger: smtp.hostinger.com:465)
 *   OUTREACH_FROM       "Swarnil Singhai <swarnil@outreach.example.com>"
 *   N8N_WEBHOOK_SECRET  HMAC-SHA256 key shared with n8n, both directions
 *   N8N_SEND_WEBHOOK_URL  the n8n "prospect-send" webhook (n8n mode only)
 *
 * Never Resend: Resend sends the site's own email; its policy forbids cold
 * outreach and complaints would hurt the domain learners get mail from.
 *
 * Signing (both directions): body = { ts, payload } where payload is a JSON
 * string; header x-signature = "sha256=" + hex(HMAC(secret, `${ts}.${payload}`)).
 * The exact string is signed, so n8n's Crypto node can reproduce it.
 */

export interface OutreachConfig {
  transport: 'smtp' | 'n8n'
  smtp: SmtpConfig | null
  from: { name: string | null, address: string } | null
  n8nSendUrl: string | null
  webhookSecret: string | null
}

export function parseFrom(v: string | undefined | null): { name: string | null, address: string } | null {
  const s = String(v ?? '').trim()
  const m = /^(?:"?([^"<]*)"?\s*)?<([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)>$/.exec(s) ?? /^()([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)$/.exec(s)
  return m ? { name: m[1]?.trim() || null, address: m[2]!.toLowerCase() } : null
}

export function outreachConfigFromEnv(env: Record<string, string | undefined> = process.env): OutreachConfig {
  const port = Number(env.SMTP_PORT || 465)
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS
  const url = env.N8N_SEND_WEBHOOK_URL?.trim()
  return {
    transport: env.OUTREACH_TRANSPORT?.trim() === 'n8n' ? 'n8n' : 'smtp',
    smtp: user && pass ? { host: env.SMTP_HOST?.trim() || 'smtp.hostinger.com', port: Number.isInteger(port) && port > 0 ? port : 465, user, pass } : null,
    from: parseFrom(env.OUTREACH_FROM) ?? (user && /@/.test(user) ? { name: null, address: user.toLowerCase() } : null),
    n8nSendUrl: url && /^https:\/\//.test(url) ? url : null,
    webhookSecret: env.N8N_WEBHOOK_SECRET?.trim() || null
  }
}

/** Ready to send? Returns the reason when not. */
export function outreachReady(cfg: OutreachConfig): string | null {
  if (!cfg.from) return 'Set OUTREACH_FROM (name and address)'
  if (cfg.transport === 'smtp' && !cfg.smtp) return 'Set SMTP_USER and SMTP_PASS (Worker secrets)'
  if (cfg.transport === 'n8n' && (!cfg.n8nSendUrl || !cfg.webhookSecret)) return 'Set N8N_SEND_WEBHOOK_URL and N8N_WEBHOOK_SECRET'
  return null
}

// ---- signing --------------------------------------------------------------------------------

const enc = new TextEncoder()
export async function hmacSha256Hex(secret: string, text: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function signPayload(secret: string, payload: string, ts = Math.floor(Date.now() / 1000)) {
  return { ts, signature: `sha256=${await hmacSha256Hex(secret, `${ts}.${payload}`)}` }
}

/** Constant-time check of the signature and a ±5-minute timestamp window. */
export async function verifyPayload(secret: string, ts: unknown, payload: unknown, signature: unknown, nowSec = Math.floor(Date.now() / 1000), skewSec = 300): Promise<'ok' | 'stale' | 'bad'> {
  if (typeof payload !== 'string' || typeof signature !== 'string' || !/^\d{9,11}$/.test(String(ts))) return 'bad'
  if (Math.abs(nowSec - Number(ts)) > skewSec) return 'stale'
  const expected = `sha256=${await hmacSha256Hex(secret, `${ts}.${payload}`)}`
  const got = signature.trim().toLowerCase()
  if (got.length !== expected.length) return 'bad'
  let diff = 0
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0 ? 'ok' : 'bad'
}

// ---- delivery --------------------------------------------------------------------------------

export interface OutgoingEmail {
  to: string
  subject: string
  raw: string
  text: string
  html: string
  messageId: string
  inReplyTo: string | null
  references: string[]
  unsubscribeUrl: string
}

type FetchLike = (url: string, init: { method: string, headers: Record<string, string>, body: string }) => Promise<{ ok: boolean, status: number }>

/** Sends one email with the configured transport. Throws with a short reason. */
export async function deliver(cfg: OutreachConfig, mail: OutgoingEmail, deps: { connect: SocketFactory, fetch: FetchLike }): Promise<{ transport: 'smtp' | 'n8n', detail: string }> {
  const why = outreachReady(cfg)
  if (why) throw new Error(why)
  if (cfg.transport === 'smtp') {
    const r = await smtpSend(cfg.smtp!, { from: cfg.from!.address, to: mail.to, raw: mail.raw }, deps.connect, cfg.from!.address.split('@')[1])
    return { transport: 'smtp', detail: r.queued }
  }
  const payload = JSON.stringify({
    from: cfg.from!.address, fromName: cfg.from!.name, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html,
    messageId: mail.messageId, inReplyTo: mail.inReplyTo, references: mail.references, listUnsubscribe: mail.unsubscribeUrl
  })
  const { ts, signature } = await signPayload(cfg.webhookSecret!, payload)
  const res = await deps.fetch(cfg.n8nSendUrl!, { method: 'POST', headers: { 'content-type': 'application/json', 'x-signature': signature }, body: JSON.stringify({ ts, payload }) })
  if (!res.ok) throw new Error(`n8n send webhook → ${res.status}`)
  return { transport: 'n8n', detail: `n8n ${res.status}` }
}

// ---- inbound (n8n → site) --------------------------------------------------------------------

export type InboundType = 'reply' | 'bounce' | 'unsubscribe' | 'auto_reply'
export interface InboundEvent {
  type: InboundType
  from: string | null
  to: string | null
  subject: string | null
  inReplyTo: string | null
  messageId: string | null
  references: string[]
  /** For a bounce: the address that failed, when n8n could read it from the DSN. */
  recipient: string | null
  receivedAt: string | null
  snippet: string | null
}

const addr = (v: unknown) => {
  const m = /([^<>\s"]+@[^<>\s"]+\.[^<>\s"]+)/.exec(String(v ?? ''))
  return m ? m[1]!.toLowerCase().slice(0, 254) : null
}
const ids = (v: unknown): string[] => [...String(Array.isArray(v) ? v.join(' ') : v ?? '').matchAll(/<[^<>\s]{3,250}>/g)].map(m => m[0]).slice(0, 30)

/** Validates and normalises what n8n posted. Null when it is not an event we understand. */
export function parseInbound(json: unknown): InboundEvent | null {
  if (!json || typeof json !== 'object') return null
  const o = json as Record<string, unknown>
  const type = String(o.type ?? '')
  if (!['reply', 'bounce', 'unsubscribe', 'auto_reply'].includes(type)) return null
  const str = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null)
  return {
    type: type as InboundType,
    from: addr(o.from),
    to: addr(o.to),
    subject: str(o.subject, 300),
    inReplyTo: ids(o.inReplyTo)[0] ?? null,
    messageId: ids(o.messageId)[0] ?? null,
    references: ids(o.references),
    recipient: addr(o.recipient),
    receivedAt: str(o.receivedAt, 40),
    snippet: str(o.snippet, 500)
  }
}
