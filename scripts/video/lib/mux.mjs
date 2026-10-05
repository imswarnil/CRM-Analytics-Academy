/**
 * Mux, for the owner's machine and for CI.
 *
 * Two ways in, chosen automatically:
 *   - the Mux REST API, when MUX_TOKEN_ID + MUX_TOKEN_SECRET are set (CI, or
 *     a local .env);
 *   - otherwise the `mux` CLI's stored login (`mux login`), exactly as
 *     scripts/mux-lesson.mjs always worked — no keys in the repo.
 *
 * Reads: playback id → asset → its auto-generated English text track → VTT.
 * Writes (upload only, run by the owner): a direct upload whose new asset
 * requests generated English subtitles.
 */
import { createSign } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { fail, hasCommand } from './context.mjs'

const API = 'https://api.mux.com'

export function muxMode() {
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) return 'api'
  if (hasCommand('mux')) return 'cli'
  fail('No Mux access. Either set MUX_TOKEN_ID and MUX_TOKEN_SECRET (dashboard.mux.com → Settings → Access Tokens), or install the Mux CLI and run `mux login`.')
}

async function api(method, path, body) {
  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) fail(`Mux ${method} ${path} → ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 300)}`)
  return json.data
}

function cli(args) {
  try {
    return execFileSync('mux', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (e) {
    fail(`The Mux CLI failed (mux ${args.join(' ')}): ${String(e.stderr || e.message).slice(0, 300)}\nLogged in? Run \`mux login\`.`)
  }
}

/** The CLI can print several JSON documents in a row (progress, then result). */
export function jsonDocuments(text) {
  const docs = []
  let depth = 0
  let start = -1
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (c === '\\') i++
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === '{' || c === '[') {
      if (depth++ === 0) start = i
    } else if ((c === '}' || c === ']') && --depth === 0) {
      try {
        docs.push(JSON.parse(text.slice(start, i + 1)))
      } catch { /* not JSON after all */ }
    }
  }
  return docs.flat()
}
const unwrap = d => d?.data ?? d?.asset ?? d

/** Full asset for a playback id. */
export async function assetForPlayback(playbackId) {
  if (muxMode() === 'api') {
    const pid = await api('GET', `/video/v1/playback-ids/${playbackId}`)
    if (pid?.object?.type !== 'asset') fail(`Playback id ${playbackId} is not an asset (it is ${pid?.object?.type ?? 'unknown'}).`)
    return api('GET', `/video/v1/assets/${pid.object.id}`)
  }
  const docs = jsonDocuments(cli(['playback-ids', playbackId, '--json', '--expand']))
  const asset = docs.map(unwrap).reverse().find(d => d && (d.tracks || d.playback_ids))
  if (!asset) fail(`The Mux CLI returned no asset for playback id ${playbackId}.`)
  return asset
}

export async function getAsset(assetId) {
  if (muxMode() === 'api') return api('GET', `/video/v1/assets/${assetId}`)
  return unwrap(jsonDocuments(cli(['assets', 'get', assetId, '--json'])).at(-1))
}

/** The auto-generated English caption track (or any ready English text track). */
export function englishTextTrack(asset) {
  const text = (asset.tracks ?? []).filter(t => t.type === 'text' && t.status === 'ready')
  const en = text.filter(t => String(t.language_code ?? '').startsWith('en'))
  return en.find(t => String(t.text_source ?? '').startsWith('generated')) ?? en[0] ?? null
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** A short-lived playback token for a signed asset (to download its captions). */
export function playbackToken(playbackId) {
  const keyId = process.env.MUX_SIGNING_KEY_ID
  const secret = process.env.MUX_SIGNING_KEY_SECRET
  if (keyId && secret) {
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: keyId }))
    const payload = base64url(JSON.stringify({ sub: playbackId, aud: 'v', exp: Math.floor(Date.now() / 1000) + 600, kid: keyId }))
    const signer = createSign('RSA-SHA256')
    signer.update(`${header}.${payload}`)
    return `${header}.${payload}.${base64url(signer.sign(Buffer.from(secret, 'base64').toString('utf8')))}`
  }
  if (hasCommand('mux')) return cli(['sign', playbackId, '--token-only', '-e', '10m']).trim()
  fail(`Playback id ${playbackId} is signed. Set MUX_SIGNING_KEY_ID / MUX_SIGNING_KEY_SECRET (the same keys the Worker uses) or log in with the Mux CLI.`)
}

/** WebVTT of a text track. */
export async function downloadVtt(playbackId, trackId, policy) {
  const url = new URL(`https://stream.mux.com/${playbackId}/text/${trackId}.vtt`)
  if (policy === 'signed') url.searchParams.set('token', playbackToken(playbackId))
  const res = await fetch(url)
  if (!res.ok) fail(`Could not download captions for ${playbackId} (${res.status}).`)
  return res.text()
}

/**
 * Upload a file as a new asset with generated English subtitles requested.
 * Returns the ready asset.
 */
export async function uploadVideo(file, { policy, passthrough, quality = 'basic', test = false, captions = { languageCode: 'en', name: 'English (generated)' } }) {
  const generated = [{ language_code: captions.languageCode, name: captions.name }]
  if (muxMode() === 'api') {
    const upload = await api('POST', '/video/v1/uploads', {
      cors_origin: '*',
      test,
      new_asset_settings: {
        playback_policies: [policy],
        video_quality: quality,
        passthrough,
        inputs: [{ generated_subtitles: generated }]
      }
    })
    console.log('  uploading …')
    const size = statSync(file).size
    const put = await fetch(upload.url, { method: 'PUT', body: readFileSync(file), headers: { 'Content-Length': String(size) } })
    if (!put.ok) fail(`Upload to Mux failed (${put.status}).`)
    let assetId = null
    for (let i = 0; i < 120 && !assetId; i++) {
      const u = await api('GET', `/video/v1/uploads/${upload.id}`)
      if (u.status === 'errored') fail(`Mux upload errored: ${JSON.stringify(u.error)}`)
      assetId = u.asset_id
      if (!assetId) await new Promise(r => setTimeout(r, 5000))
    }
    if (!assetId) fail('Mux did not create the asset within 10 minutes; check dashboard.mux.com.')
    return waitReady(assetId)
  }

  // CLI: upload, then ask for generated subtitles on the audio track (the
  // CLI's create has no flag for them).
  const out = cli(['assets', 'create', '--upload', file, '-p', policy, '--passthrough', passthrough, '--video-quality', quality, '--wait', '--json', '-y', ...(test ? ['--test'] : [])])
  const asset = jsonDocuments(out).map(unwrap).reverse().find(d => d?.playback_ids?.length)
  if (!asset) fail(`Uploaded, but the CLI returned no asset: ${out.slice(0, 300)}`)
  const audio = (asset.tracks ?? []).find(t => t.type === 'audio')
  if (audio) {
    cli(['assets', 'tracks', 'generate-subtitles', asset.id, audio.id, '--language-code', captions.languageCode, '--name', captions.name, '--json'])
  } else {
    console.warn('  ! no audio track listed yet — run `mux assets tracks generate-subtitles <asset> <audio-track>` later')
  }
  return asset
}

async function waitReady(assetId) {
  for (let i = 0; i < 180; i++) {
    const a = await getAsset(assetId)
    if (a.status === 'ready') return a
    if (a.status === 'errored') fail(`Mux asset ${assetId} errored: ${JSON.stringify(a.errors ?? {})}`)
    await new Promise(r => setTimeout(r, 5000))
  }
  fail(`Mux asset ${assetId} is still processing after 15 minutes; it will finish on its own. Run captions later.`)
}
