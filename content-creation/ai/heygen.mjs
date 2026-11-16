/**
 * HeyGen: your avatar (digital twin) speaking your cloned voice.
 *
 *   import { avatarClip } from './heygen.mjs'
 *   await avatarClip(text, 'out/scene-1.mp4')      // → { file, seconds }
 *
 * Env (in .env, never committed):
 *   HEYGEN_API_KEY     HeyGen → Settings → API
 *   HEYGEN_AVATAR_ID   your Instant Avatar / digital twin id
 *   HEYGEN_VOICE_ID    your cloned voice id
 *   HEYGEN_BG          optional background colour (default: green, for keying)
 *
 * Each call renders one clip on HeyGen (it spends your HeyGen credits),
 * waits for it and downloads the MP4. Nothing is uploaded except the text.
 */
import { writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const API = 'https://api.heygen.com'

function env(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Set ${name} in .env (see content-creation/ai/README.md).`)
  return v
}

async function call(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'x-api-key': env('HEYGEN_API_KEY'), 'content-type': 'application/json', ...init.headers }
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.error) throw new Error(`HeyGen ${path}: ${JSON.stringify(json.error ?? json).slice(0, 300)}`)
  return json.data ?? json
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function avatarClip(text, file, { width = 1080, height = 1080 } = {}) {
  const { video_id: id } = await call('/v2/video/generate', {
    method: 'POST',
    body: JSON.stringify({
      video_inputs: [{
        character: { type: 'avatar', avatar_id: env('HEYGEN_AVATAR_ID'), avatar_style: 'normal' },
        voice: { type: 'text', input_text: text, voice_id: env('HEYGEN_VOICE_ID') },
        background: { type: 'color', value: process.env.HEYGEN_BG || '#00FF00' }
      }],
      dimension: { width, height }
    })
  })
  for (let i = 0; i < 180; i++) {
    await sleep(10_000)
    const s = await call(`/v1/video_status.get?video_id=${id}`)
    if (s.status === 'completed') {
      const mp4 = await fetch(s.video_url)
      await writeFile(file, Buffer.from(await mp4.arrayBuffer()))
      return { file, seconds: duration(file) ?? Number(s.duration) }
    }
    if (s.status === 'failed') throw new Error(`HeyGen render failed: ${JSON.stringify(s.error)}`)
  }
  throw new Error(`HeyGen video ${id} did not finish in 30 minutes`)
}

/** Seconds, from ffprobe when it is installed. */
export function duration(file) {
  try {
    return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim())
  } catch {
    return null
  }
}
