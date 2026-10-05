/**
 * Stage `voice` — the narration audio, in Swarnil's voice.
 *
 *   pnpm video voice /saql/functions --provider=heygen|local-clone|file [--file=narration.wav]
 *
 * There is deliberately NO default and NO system text-to-speech provider: the
 * lesson is narrated by the owner's own voice or not at all. Providers:
 *
 *   heygen       HeyGen API with your cloned voice (voice.heygen.voiceId,
 *                HEYGEN_API_KEY). A cloud service — runs only when selected.
 *   local-clone  your own local voice clone, as a command template
 *                (voice.localClone.command) run once per beat. Local.
 *   file         a narration you recorded yourself (--file= or voice.file.path).
 *
 * Output: voice/beat-NNN.wav (per beat, so the edit knows where each beat
 * starts), voice.wav (all of it) and voice.json (provider, per-beat timing).
 * With `file` there is one recording, so beat timing is spread over it in
 * proportion to each beat's words.
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { concatAudio, durationOf, fail, needFile, providerFor, requireCommand } from '../lib/context.mjs'
import * as heygen from '../lib/heygen.mjs'

const PROVIDERS = {
  'heygen': heygenVoice,
  'local-clone': localClone,
  'file': fileVoice
}

function spoken(script) {
  return script.beats.filter(b => b.say && b.say.trim())
}

async function heygenVoice(ctx, script) {
  const cfg = ctx.config.voice?.heygen ?? {}
  const dir = ctx.at('voice')
  mkdirSync(dir, { recursive: true })
  const beats = []
  for (const b of spoken(script)) {
    // The clone endpoint returns WAV; the voice catalogue returns MP3.
    const out = path.join(dir, `${b.id}.${cfg.mode === 'voice' ? 'mp3' : 'wav'}`)
    process.stdout.write(`  ${b.id} … `)
    const reported = await heygen.speak({ text: b.say, voiceId: cfg.voiceId, mode: cfg.mode, language: cfg.language, speed: cfg.speed }, out)
    const seconds = reported || durationOf(out)
    beats.push({ id: b.id, file: ctx.rel(out), seconds })
    console.log(`${seconds.toFixed(1)}s`)
  }
  return beats
}

async function localClone(ctx, script) {
  const template = ctx.config.voice?.localClone?.command
  if (!template) fail('voice.localClone.command is empty in video/video.config.json. Set it to the command that speaks a text file into a WAV, using {textFile} and {out}.')
  if (!template.includes('{out}')) fail('voice.localClone.command must contain {out} (the WAV it writes).')
  const dir = ctx.at('voice')
  mkdirSync(dir, { recursive: true })
  const beats = []
  for (const b of spoken(script)) {
    const textFile = path.join(dir, `${b.id}.txt`)
    const out = path.join(dir, `${b.id}.wav`)
    writeFileSync(textFile, b.say)
    const q = s => `'${s.replace(/'/g, '\'\\\'\'')}'`
    const cmd = template.replaceAll('{textFile}', q(textFile)).replaceAll('{out}', q(out)).replaceAll('{beat}', b.id)
    console.log(`  ${b.id}: ${cmd}`)
    execSync(cmd, { stdio: 'inherit', shell: '/bin/bash' })
    if (!existsSync(out)) fail(`The local clone command finished but did not write ${ctx.rel(out)}.`)
    beats.push({ id: b.id, file: ctx.rel(out), seconds: durationOf(out) })
  }
  return beats
}

async function fileVoice(ctx, script) {
  const src = ctx.flags.file || ctx.config.voice?.file?.path
  if (!src) fail('The file provider needs a recording: pnpm video voice <route> --provider=file --file=~/Narration/lesson.wav')
  const abs = path.resolve(String(src).replace(/^~/, process.env.HOME ?? '~'))
  if (!existsSync(abs)) fail(`No such recording: ${abs}`)
  requireCommand('ffmpeg', 'Install ffmpeg: brew install ffmpeg')
  const total = durationOf(abs)
  // One recording: beat boundaries are an estimate — the whole length shared
  // out over every beat (code beats included) in proportion to its estimate.
  const est = script.beats.reduce((n, b) => n + b.estSeconds, 0) || 1
  return { single: abs, beats: script.beats.map(b => ({ id: b.id, file: null, seconds: (b.estSeconds / est) * total, estimated: true })) }
}

export async function run(ctx) {
  const provider = providerFor(ctx, 'voice')
  if (!provider) {
    fail('No voice provider chosen — there is no default TTS on purpose. Pick one:\n'
      + '  --provider=heygen       your HeyGen voice clone (needs HEYGEN_API_KEY + voice.heygen.voiceId)\n'
      + '  --provider=local-clone  your local clone (voice.localClone.command)\n'
      + '  --provider=file --file=recording.wav   a narration you recorded\n'
      + 'or set voice.provider in video/video.config.json.')
  }
  const impl = PROVIDERS[provider]
  if (!impl) fail(`Unknown voice provider "${provider}". Known: ${Object.keys(PROVIDERS).join(', ')} (no system TTS by design).`)
  const script = JSON.parse((await import('node:fs')).readFileSync(needFile(ctx, 'script.json', 'script'), 'utf8'))

  console.log(`voice: ${provider}${provider === 'heygen' ? ' (cloud: HeyGen API)' : ' (local)'}`)
  const result = await impl(ctx, script)
  const beats = Array.isArray(result) ? result : result.beats
  const out = ctx.at('voice.wav')
  if (!Array.isArray(result)) {
    // The file provider: normalise to WAV so the editor gets one format.
    requireCommand('ffmpeg', 'Install ffmpeg: brew install ffmpeg')
    if (result.single.endsWith('.wav')) copyFileSync(result.single, out)
    else execSync(`ffmpeg -y -v error -i '${result.single.replace(/'/g, '\'\\\'\'')}' -ar 48000 -ac 1 '${out}'`)
  } else {
    // Beats with nothing to say (code on screen) get silence of their
    // estimated length, so voice.wav lines up with the beat timeline.
    const byId = new Map(beats.map(b => [b.id, b]))
    const all = []
    for (const b of script.beats) {
      if (byId.has(b.id)) {
        all.push(byId.get(b.id))
        continue
      }
      const gap = ctx.at('voice', `${b.id}-silence.wav`)
      execSync(`ffmpeg -y -v error -f lavfi -i anullsrc=r=48000:cl=mono -t ${b.estSeconds} '${gap}'`)
      all.push({ id: b.id, file: ctx.rel(gap), seconds: b.estSeconds, silent: true })
    }
    beats.splice(0, beats.length, ...all)
    concatAudio(beats.map(b => path.resolve(b.file)), out)
  }

  let t = 0
  const timed = beats.map((b) => {
    const row = { ...b, start: Number(t.toFixed(3)) }
    t += b.seconds
    return row
  })
  ctx.writeJson('voice.json', { provider, file: ctx.rel(out), seconds: Number(t.toFixed(3)), beats: timed })
  console.log(`✓ ${ctx.rel(out)} — ${Math.round(t)}s across ${timed.length} beats`)
}
