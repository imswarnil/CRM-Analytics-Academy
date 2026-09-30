/**
 * Mux signed playback.
 *
 * A Mux playback id on a "signed" policy is useless without a token, and that
 * is the whole point: the id can appear in a page, but only the server holds
 * the key that makes it playable. Tokens are minted per request for the
 * entitled user and expire quickly, so a token copied out of devtools stops
 * working long before a shared link would be worth anything.
 *
 * Signing is done with WebCrypto rather than node:jsonwebtoken because this
 * runs on Cloudflare Workers, where the node crypto surface is partial and a
 * library that reaches for it fails at request time rather than at build.
 */
export interface SignedPlayback {
  playbackId: string
  token: string
  expiresAt: number
}

const TTL_SECONDS = 60 * 60 * 2

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** DER length octets: short form below 128, long form above. */
function derLength(n: number): number[] {
  if (n < 0x80) return [n]
  const bytes: number[] = []
  for (let v = n; v > 0; v >>= 8) bytes.unshift(v & 0xFF)
  return [0x80 | bytes.length, ...bytes]
}

/**
 * Wraps a PKCS#1 RSA key (what Mux issues: "BEGIN RSA PRIVATE KEY") in the
 * PKCS#8 envelope WebCrypto requires. Importing PKCS#1 bytes as 'pkcs8' fails
 * with an ASN.1 tag error — which is how every signed video would have failed.
 */
function pkcs1ToPkcs8(pkcs1: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  // AlgorithmIdentifier: rsaEncryption (1.2.840.113549.1.1.1), NULL params.
  const algorithm = [0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01, 0x05, 0x00]
  const version = [0x02, 0x01, 0x00]
  const octet = [0x04, ...derLength(pkcs1.length)]
  const bodyLength = version.length + algorithm.length + octet.length + pkcs1.length
  return new Uint8Array([0x30, ...derLength(bodyLength), ...version, ...algorithm, ...octet, ...pkcs1])
}

/** Turns the base64 PEM private key Mux issues into a CryptoKey. */
async function importKey(pem: string): Promise<CryptoKey> {
  const isPkcs1 = pem.includes('BEGIN RSA PRIVATE KEY')
  const body = pem
    .replace(/-----(BEGIN|END) [^-]+-----/g, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(body), c => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'pkcs8',
    isPkcs1 ? pkcs1ToPkcs8(der) : der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

export async function signMuxPlayback(playbackId: string): Promise<SignedPlayback | undefined> {
  const keyId = process.env.MUX_SIGNING_KEY_ID
  const keySecret = process.env.MUX_SIGNING_KEY_SECRET

  // Unconfigured is not an error: a site with no paid video should still
  // build and run. Returning undefined lets the caller decide.
  if (!keyId || !keySecret) return undefined

  const now = Math.floor(Date.now() / 1000)
  const exp = now + TTL_SECONDS

  const header = { alg: 'RS256', typ: 'JWT', kid: keyId }
  const payload = {
    sub: playbackId,
    aud: 'v', // "v" is Mux's audience for video playback
    exp,
    kid: keyId
  }

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`

  // The secret arrives base64-encoded from the Mux dashboard.
  const pem = atob(keySecret.replace(/\s+/g, ''))
  const key = await importKey(pem)
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))

  return {
    playbackId,
    token: `${signingInput}.${base64url(signature)}`,
    expiresAt: exp
  }
}
