import type { H3Event } from 'h3'

/**
 * "Subscribed on YouTube" — checked with Google, once, then remembered.
 *
 *   GET /api/youtube/connect[?subscribe=1]   → Google's consent screen (a popup)
 *   GET /api/youtube/callback                → checks, records, closes the popup
 *
 * Scopes: openid + email (who this Google account is) and youtube.readonly
 * (does it subscribe to the channel?). With ?subscribe=1 the scope is
 * youtube.force-ssl instead, so the learner can subscribe from our page and
 * we insert the subscription for them. YouTube's API cannot switch the bell
 * (notifications) on; the page links to the channel for that.
 *
 * Nothing is kept from Google but the account id, its email and the answer:
 * the access token is used for three calls and revoked. Both scopes are
 * "sensitive" — until the OAuth app passes Google's verification, only test
 * users added in the Google Cloud console can complete the flow.
 *
 * Env (Worker secrets): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, YOUTUBE_CHANNEL_ID
 * (the UC… id of @crmanalyticsacademy). Redirect URI to register in Google:
 *   https://crmanalytics.imswarnil.com/api/youtube/callback
 */
export const YT_STATE_COOKIE = 'crma_yt_state'

export function youtubeConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.YOUTUBE_CHANNEL_ID)
}

export function youtubeRedirectUri(event: H3Event): string {
  return `${getRequestOrigin(event)}/api/youtube/callback`
}

/** A signed state: random nonce + user id + subscribe flag, HMAC'd so it cannot be forged. */
export async function signState(payload: string): Promise<string> {
  return `${payload}.${await hmac(payload)}`
}

export async function readState(value: string | undefined): Promise<string | null> {
  if (!value) return null
  const i = value.lastIndexOf('.')
  if (i < 0) return null
  const payload = value.slice(0, i)
  const mac = value.slice(i + 1)
  const expected = await hmac(payload)
  if (mac.length !== expected.length) return null
  let diff = 0
  for (let j = 0; j < mac.length; j++) diff |= mac.charCodeAt(j) ^ expected.charCodeAt(j)
  return diff === 0 ? payload : null
}

async function hmac(text: string): Promise<string> {
  const secret = process.env.GOOGLE_CLIENT_SECRET || ''
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`yt:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
  return [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** The page the popup ends on: tells the opener the result and closes. */
export function popupResult(event: H3Event, result: { ok: boolean, subscribed?: boolean, error?: string }): string {
  const origin = getRequestOrigin(event)
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'no-store')
  const data = JSON.stringify({ type: 'crma-youtube', ...result }).replace(/</g, '\\u003c')
  const fallback = `/dashboard?youtube=${result.ok ? (result.subscribed ? 'verified' : 'not-subscribed') : 'error'}`
  return `<!doctype html><meta charset="utf-8"><title>YouTube</title><p style="font:14px system-ui;padding:24px">Done — you can close this window.</p>
<script>(function(){var d=${data};try{if(window.opener){window.opener.postMessage(d,${JSON.stringify(origin)});window.close();return}}catch(e){}location.replace(${JSON.stringify(fallback)})})()</script>`
}
