/**
 * HeyGen API client — used ONLY when the owner selects the `heygen` provider
 * (video.config.json or --provider=heygen). Never a default.
 *
 * Endpoints (HeyGen API v3, developers.heygen.com, checked 2026-10):
 *   POST /v3/models/audio/tts     professional voice clone → { data: { audio_url, duration } }
 *   POST /v3/voices/speech        any HeyGen voice         → { data: { audio_url, duration } }
 *   POST /v3/assets               upload a file (multipart) → { data: { asset_id, url } }
 *   POST /v3/videos               avatar video              → { data: { video_id, status } }
 *   GET  /v3/videos/{id}          status: waiting | processing | completed | failed, video_url
 * Auth: X-Api-Key header with HEYGEN_API_KEY.
 *
 * If HeyGen changes a path, it is one line here.
 */
import { createWriteStream, readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { env, fail } from './context.mjs'

const BASE = process.env.HEYGEN_API_BASE || 'https://api.heygen.com'

function key() {
  return env('HEYGEN_API_KEY', 'Create one at app.heygen.com → Settings → API.')
}

async function call(method, path, body, { multipart = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'X-Api-Key': key(),
      ...(multipart || !body ? {} : { 'Content-Type': 'application/json' })
    },
    body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(10 * 60_000)
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  if (!res.ok || json.error) {
    const msg = json.error?.message ?? json.message ?? json.raw ?? res.statusText
    if (res.status === 401 || res.status === 403) fail(`HeyGen refused the API key (${res.status}): ${msg}. Check HEYGEN_API_KEY.`)
    fail(`HeyGen ${method} ${path} failed (${res.status}): ${String(msg).slice(0, 400)}`)
  }
  return json.data ?? json
}

export async function download(url, out) {
  const res = await fetch(url)
  if (!res.ok || !res.body) fail(`Download failed (${res.status}) for ${url}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(out))
  return out
}

/** Speech for one piece of text, written to `out`. Returns seconds. */
export async function speak({ text, voiceId, mode = 'clone', language = 'en', speed = 1 }, out) {
  if (!voiceId) fail('voice.heygen.voiceId is empty in video/video.config.json. Find your cloned voice id in HeyGen → Voices.')
  if (text.length > 5000) fail('A beat is over 5,000 characters, HeyGen\'s limit per request. Lower script.maxBeatWords.')
  const data = mode === 'clone'
    ? await call('POST', '/v3/models/audio/tts', { voice_id: voiceId, text, language, speed: Math.min(1.25, Math.max(0.75, speed)) })
    : await call('POST', '/v3/voices/speech', { voice_id: voiceId, text, speed, language })
  if (!data.audio_url) fail(`HeyGen returned no audio_url: ${JSON.stringify(data).slice(0, 300)}`)
  await download(data.audio_url, out)
  return Number(data.duration) || 0
}

export async function uploadAsset(file, mime = 'audio/wav') {
  const form = new FormData()
  form.append('file', new Blob([readFileSync(file)], { type: mime }), basename(file))
  const data = await call('POST', '/v3/assets', form, { multipart: true })
  if (!data.asset_id) fail(`HeyGen asset upload returned no asset_id: ${JSON.stringify(data).slice(0, 300)}`)
  return data
}

export async function createAvatarVideo(body) {
  const data = await call('POST', '/v3/videos', body)
  if (!data.video_id) fail(`HeyGen returned no video_id: ${JSON.stringify(data).slice(0, 300)}`)
  return data.video_id
}

export async function waitForVideo(id, { pollSeconds = 20, timeoutMinutes = 45 } = {}) {
  const until = Date.now() + timeoutMinutes * 60_000
  for (;;) {
    const data = await call('GET', `/v3/videos/${id}`)
    if (data.status === 'completed' && data.video_url) return data
    if (data.status === 'failed') fail(`HeyGen render ${id} failed: ${JSON.stringify(data.error ?? data).slice(0, 400)}`)
    if (Date.now() > until) fail(`HeyGen render ${id} still "${data.status}" after ${timeoutMinutes} min. Re-run later: pnpm video avatar <route> --resume=${id}`)
    process.stdout.write(`  … ${data.status ?? 'waiting'}\r`)
    await new Promise(r => setTimeout(r, pollSeconds * 1000))
  }
}
