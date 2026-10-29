/**
 * The site's own captcha: a proof-of-work challenge, no third party.
 *
 * The server picks a secret number n ≤ MAX and sends sha256(salt + n), signed
 * with HMAC so it cannot be forged, valid for five minutes. The browser finds
 * n by trying every number — about a second of work for a person filling in a
 * form, and a real cost per attempt for a bot. Each solution is accepted once
 * (app.used_challenge).
 *
 * The HMAC key is CAPTCHA_SECRET, or else derived from DATABASE_URL.
 */
const MAX = 60_000
const TTL_MS = 5 * 60_000

const enc = new TextEncoder()
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)))

// CAPTCHA_SECRET when set; otherwise a key derived from DATABASE_URL, which is
// already a Worker secret and never public — so the check works with no setup.
let derived: string | undefined
async function secretKey() {
  if (process.env.CAPTCHA_SECRET) return process.env.CAPTCHA_SECRET
  if (!process.env.DATABASE_URL) throw createError({ statusCode: 500, statusMessage: 'No key for the human check' })
  derived ??= await sha256(`crma-captcha:${process.env.DATABASE_URL}`)
  return derived
}

async function sign(text: string) {
  const secret = await secretKey()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(text)))
}

export interface PowChallenge {
  algorithm: 'SHA-256'
  salt: string
  challenge: string
  max: number
  expires: number
  signature: string
}

export async function createChallenge(): Promise<PowChallenge> {
  const salt = hex(crypto.getRandomValues(new Uint8Array(12)).buffer as ArrayBuffer)
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % MAX
  const challenge = await sha256(salt + n)
  const expires = Date.now() + TTL_MS
  return { algorithm: 'SHA-256', salt, challenge, max: MAX, expires, signature: await sign(`${challenge}.${expires}`) }
}

/** Throws 403 unless `token` (base64 JSON from <HumanCheck>) is a fresh, valid, unused solution. */
export async function verifyPow(token?: string | null) {
  const fail = () => createError({ statusCode: 403, statusMessage: 'The human check did not pass. Please try again.' })
  if (!token) throw fail()
  let p: { salt?: string, number?: number, challenge?: string, expires?: number, signature?: string }
  try {
    p = JSON.parse(atob(token))
  } catch {
    throw fail()
  }
  if (!p.salt || !p.challenge || typeof p.number !== 'number' || !p.expires || !p.signature) throw fail()
  if (p.expires < Date.now()) throw fail()
  if (await sign(`${p.challenge}.${p.expires}`) !== p.signature) throw fail()
  if (await sha256(p.salt + p.number) !== p.challenge) throw fail()
  const fresh = await useDb()`insert into app.used_challenge (challenge) values (${p.challenge}) on conflict do nothing returning 1`
  if (!fresh.length) throw fail()
  if (Math.random() < 0.02) await useDb()`delete from app.used_challenge where at < now() - interval '1 hour'`
}
