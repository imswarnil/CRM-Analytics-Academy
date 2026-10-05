/**
 * Stage `avatar` — an optional talking-head video of the owner's avatar.
 *
 *   pnpm video avatar /saql/functions --provider=heygen|none [--resume=<video_id>]
 *
 *   none    (default) no avatar; the edit uses the voice over screen
 *           recordings and the motion graphics.
 *   heygen  HeyGen renders the avatar (avatar.heygen.avatarId). With
 *           useVoiceStage it lip-syncs to voice.wav from the voice stage (your
 *           clone, uploaded as a HeyGen asset); otherwise HeyGen speaks the
 *           script itself with avatar.heygen.voiceId. Polls until done and
 *           downloads avatar.mp4. A cloud service — runs only when selected.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fail, needFile, providerFor } from '../lib/context.mjs'
import * as heygen from '../lib/heygen.mjs'

export async function run(ctx) {
  const provider = providerFor(ctx, 'avatar') || 'none'
  if (provider === 'none') {
    ctx.writeJson('avatar.json', { provider: 'none' })
    console.log('avatar: none — the edit will use voice + recordings + motion only.')
    return
  }
  if (provider !== 'heygen') fail(`Unknown avatar provider "${provider}". Known: heygen, none.`)

  const cfg = ctx.config.avatar?.heygen ?? {}
  if (!cfg.avatarId) fail('avatar.heygen.avatarId is empty in video/video.config.json. Copy your avatar id from HeyGen → Avatars.')
  const poll = { pollSeconds: cfg.pollSeconds ?? 20, timeoutMinutes: cfg.timeoutMinutes ?? 45 }

  let videoId = typeof ctx.flags.resume === 'string' ? ctx.flags.resume : null
  if (!videoId) {
    const base = { type: 'avatar', avatar_id: cfg.avatarId, aspect_ratio: cfg.aspectRatio ?? '16:9', resolution: cfg.resolution ?? '1080p', title: `CRM Analytics Academy ${ctx.route}` }
    let body
    if (cfg.useVoiceStage !== false) {
      const wav = needFile(ctx, 'voice.wav', 'voice')
      console.log('avatar: uploading voice.wav to HeyGen …')
      const asset = await heygen.uploadAsset(wav)
      body = { ...base, audio_asset_id: asset.asset_id }
    } else {
      if (!cfg.voiceId) fail('avatar.heygen.useVoiceStage is false, so avatar.heygen.voiceId must name the HeyGen voice to speak the script.')
      const script = JSON.parse(readFileSync(needFile(ctx, 'script.json', 'script'), 'utf8'))
      body = { ...base, script: script.beats.map(b => b.say).filter(Boolean).join('\n\n'), voice_id: cfg.voiceId }
    }
    videoId = await heygen.createAvatarVideo(body)
    ctx.writeJson('avatar.json', { provider: 'heygen', videoId, status: 'waiting' })
    console.log(`avatar: HeyGen video ${videoId} queued (if this is interrupted: --resume=${videoId})`)
  }

  const done = await heygen.waitForVideo(videoId, poll)
  const out = ctx.at('avatar.mp4')
  await heygen.download(done.video_url, out)
  if (!existsSync(out)) fail('The avatar video did not download.')
  ctx.writeJson('avatar.json', { provider: 'heygen', videoId, status: 'completed', file: ctx.rel(out), duration: done.duration ?? null })
  console.log(`✓ ${ctx.rel(out)}`)
}
