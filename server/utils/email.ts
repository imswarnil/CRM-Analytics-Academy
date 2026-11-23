/**
 * Sending email: Resend over fetch (https://resend.com, 3,000 a month free).
 *
 *   RESEND_API_KEY   Worker secret. Without it nothing is sent and the
 *                    journeys only report what they would send.
 *   EMAIL_FROM       e.g. "Swarnil from CRM Analytics Academy <hello@imswarnil.com>"
 *                    — the domain must be verified in Resend (SPF + DKIM).
 *   EMAIL_REPLY_TO   where replies go (default contact@imswarnil.com).
 *
 * Every marketing email carries a one-click unsubscribe link (the
 * List-Unsubscribe headers Gmail and Yahoo require) signed with the site's
 * HMAC key, so a link can only ever unsubscribe the person it was sent to.
 */
const SITE = 'https://crmanalytics.imswarnil.com'
const enc = new TextEncoder()

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY)
export const emailFrom = () => process.env.EMAIL_FROM || 'Swarnil from CRM Analytics Academy <hello@imswarnil.com>'

async function hmac(text: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(`email:${await secretKey()}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(text)))
  return [...mac.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function unsubscribeUrl(userId: string) {
  return `${SITE}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&s=${await hmac(userId)}`
}

export async function verifyUnsubscribe(userId: string, sig: string) {
  const expected = await hmac(userId)
  if (sig.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

/**
 * Outreach (prospecting) unsubscribe: the same HMAC key, a different message
 * prefix, so a learner link can never unsubscribe a prospect or the other way.
 */
export async function prospectUnsubscribeUrl(prospectId: number | string) {
  return `${SITE}/api/prospect/unsubscribe?p=${encodeURIComponent(String(prospectId))}&s=${await hmac(`prospect:${prospectId}`)}`
}
export async function verifyProspectUnsubscribe(prospectId: string, sig: string) {
  return verifyUnsubscribe(`prospect:${prospectId}`, sig)
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export interface Mail {
  to: string
  subject: string
  /** Paragraphs of plain text. Kept short: one email, one job. */
  lines: string[]
  /** The one link the email exists for. */
  cta: { label: string, url: string }
  /** Marketing emails get an unsubscribe link; receipts and certificates do not need one. */
  unsubscribe?: string
  /** Same key = Resend sends it once, even if a run is retried. */
  idempotencyKey: string
}

/** Plain, personal HTML: no images, no tracking pixels, readable as text. */
export function render(m: Mail) {
  const link = `${m.cta.url}${m.cta.url.includes('?') ? '&' : '?'}utm_source=email&utm_medium=journey`
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f8;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181818">
<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dddbda;border-radius:6px;padding:28px">
<p style="margin:0 0 18px;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#0176d3">CRM Analytics Academy</p>
${m.lines.map(l => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${esc(l)}</p>`).join('\n')}
<p style="margin:22px 0 6px"><a href="${esc(link)}" style="display:inline-block;background:#0176d3;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:4px">${esc(m.cta.label)}</a></p>
<p style="margin:22px 0 0;font-size:15px">Swarnil</p>
</div>
${m.unsubscribe ? `<p style="max-width:560px;margin:14px auto 0;font-size:12px;color:#706e6b;text-align:center">You get these because you have an account at crmanalytics.imswarnil.com. <a href="${esc(m.unsubscribe)}" style="color:#706e6b">Unsubscribe</a></p>` : ''}
</body></html>`
  const text = `${m.lines.join('\n\n')}\n\n${m.cta.label}: ${link}\n\nSwarnil${m.unsubscribe ? `\n\n—\nUnsubscribe: ${m.unsubscribe}` : ''}`
  return { html, text }
}

export async function sendEmail(m: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  const { html, text } = render(m)
  const headers: Record<string, string> = {}
  if (m.unsubscribe) {
    headers['List-Unsubscribe'] = `<${m.unsubscribe}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${key}`, 'Idempotency-Key': m.idempotencyKey.slice(0, 256) },
    body: { from: emailFrom(), reply_to: process.env.EMAIL_REPLY_TO || 'contact@imswarnil.com', to: [m.to], subject: m.subject, html, text, headers },
    signal: AbortSignal.timeout(10000)
  })
}
