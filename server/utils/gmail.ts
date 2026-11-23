/**
 * Gmail API (Google Workspace) over OAuth — outreach goes from Swarnil's own
 * mailbox, never through Resend (Resend sends the site's own email; its
 * policy forbids cold outreach and complaints would hurt the learner domain).
 *
 * Pure: `fetch` is passed in, so scripts/check-prospect.mjs mocks Google.
 * Scopes: gmail.send (send) + gmail.readonly (read a thread to see replies
 * and bounces). The refresh token is sealed with AES-GCM under the site
 * secret (prospect-core.ts) before it touches the database.
 *
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — a Google Cloud OAuth client (Web).
 */
export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
const API = 'https://gmail.googleapis.com/gmail/v1/users/me'

export interface GoogleConfig {
  clientId: string
  clientSecret: string
}
export function googleConfigFromEnv(env: Record<string, string | undefined> = process.env): GoogleConfig | null {
  const clientId = env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim()
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

type F = (url: string, init?: { method?: string, headers?: Record<string, string>, body?: string | URLSearchParams }) => Promise<{ ok: boolean, status: number, json: () => Promise<unknown> }>

export function authorizeUrl(cfg: GoogleConfig, redirectUri: string, state: string): string {
  const q = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`
}

export async function exchangeCode(cfg: GoogleConfig, code: string, redirectUri: string, f: F) {
  const res = await f('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: cfg.clientId, client_secret: cfg.clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' })
  })
  const json = await res.json() as { access_token?: string, refresh_token?: string, scope?: string }
  if (!res.ok || !json.access_token) throw new Error(`Google refused the code (${res.status})`)
  if (!json.refresh_token) throw new Error('No refresh token: remove the app at myaccount.google.com/permissions and connect again')
  const missing = GMAIL_SCOPES.filter(sc => !String(json.scope ?? '').split(' ').includes(sc))
  if (missing.length) throw new Error(`Missing scope: ${missing.join(', ')} — tick both boxes on Google's consent screen`)
  return { accessToken: json.access_token, refreshToken: json.refresh_token }
}

export async function accessToken(cfg: GoogleConfig, refreshToken: string, f: F): Promise<string> {
  const res = await f('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
  })
  const json = await res.json() as { access_token?: string, error?: string }
  if (!res.ok || !json.access_token) throw new Error(json.error === 'invalid_grant' ? 'invalid_grant: the Gmail connection was revoked or expired — connect it again' : `token refresh failed (${res.status})`)
  return json.access_token
}

async function gget<T>(token: string, path: string, f: F): Promise<T> {
  const res = await f(`${API}${path}`, { headers: { authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Gmail ${path.split('?')[0]} → ${res.status}`)
  return await res.json() as T
}

export async function profileEmail(token: string, f: F): Promise<string> {
  const p = await gget<{ emailAddress?: string }>(token, '/profile', f)
  if (!p.emailAddress) throw new Error('Gmail profile has no address')
  return p.emailAddress.toLowerCase()
}

/** Sends a raw RFC 5322 message (base64url). Returns Gmail's ids and the RFC Message-ID. */
export async function sendRaw(token: string, raw: string, threadId: string | null, f: F) {
  const res = await f(`${API}/messages/send`, {
    method: 'POST',
    headers: { 'authorization': `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(threadId ? { raw, threadId } : { raw })
  })
  const json = await res.json() as { id?: string, threadId?: string }
  if (!res.ok || !json.id) throw new Error(`Gmail send → ${res.status}`)
  const meta = await gget<{ payload?: { headers?: { name: string, value: string }[] } }>(token, `/messages/${json.id}?format=metadata&metadataHeaders=Message-ID`, f).catch(() => null)
  const messageId = meta?.payload?.headers?.find(h => h.name.toLowerCase() === 'message-id')?.value ?? null
  return { id: json.id, threadId: json.threadId ?? threadId ?? json.id, messageId }
}

export type ThreadState = 'none' | 'replied' | 'bounced'

/** Reads a thread's senders: anyone but us = a reply; a mailer daemon = a bounce. */
export async function threadState(token: string, threadId: string, ourAddress: string, f: F): Promise<ThreadState> {
  const t = await gget<{ messages?: { labelIds?: string[], payload?: { headers?: { name: string, value: string }[] } }[] }>(token, `/threads/${encodeURIComponent(threadId)}?format=metadata&metadataHeaders=From&metadataHeaders=Auto-Submitted`, f)
  let state: ThreadState = 'none'
  for (const m of t.messages ?? []) {
    const from = (m.payload?.headers?.find(h => h.name.toLowerCase() === 'from')?.value ?? '').toLowerCase()
    if (!from || from.includes(ourAddress)) continue
    if (/mailer-daemon|postmaster|mail delivery (subsystem|system)/.test(from)) return 'bounced'
    const auto = (m.payload?.headers?.find(h => h.name.toLowerCase() === 'auto-submitted')?.value ?? '').toLowerCase()
    // An out-of-office auto-reply is not a reply: the sequence goes on.
    if (auto && auto !== 'no') continue
    state = 'replied'
  }
  return state
}
