#!/usr/bin/env node
/**
 * Build a motion-graphics film from a spec in studio/films/<slug>.json.
 *
 *   node studio/build-film.mjs intro              audio + timeline + After Effects project + render
 *   node studio/build-film.mjs intro --audio      audio and timeline only (no After Effects)
 *   node studio/build-film.mjs intro --no-render  build the .aep but do not render the MP4
 *   node studio/build-film.mjs intro --screens    capture the site screenshots again
 *
 * Everything goes into studio/workspace/ (gitignored, one video at a time):
 *
 *   03-audio/<slug>/vo/NN-<scene>.wav  the voice-over, one file per scene (macOS voices)
 *   03-audio/<slug>/music.wav          the music (spec `music.file`, or an original bed)
 *   03-audio/sfx/*.wav                 pops, whooshes, dings…
 *   03-audio/<slug>/mix.wav            VO + ducked music + SFX at -14 LUFS (YouTube's level)
 *   04-clips/screens/*.png             site screenshots (studio/screens.mjs)
 *   06-graphics/<slug>.timeline.json   scene times, VO and SFX cues: what the AE builder reads
 *   07-edit/<slug>.xml                 a Premiere sequence: video, VO, music, SFX on their own tracks
 *   06-graphics/<slug>.aep       the After Effects project (scene precomps + a master comp)
 *   08-export/<slug>.mp4         the render
 *
 * Voice: the first voice in the spec's `voice.prefer` that is installed. For a
 * far better voice, install a Premium one once: System Settings → Accessibility
 * → Spoken Content → System voice → Manage Voices → English → "Ava (Premium)".
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STUDIO = path.dirname(fileURLToPath(import.meta.url))
const WS = path.join(STUDIO, 'workspace')
const args = process.argv.slice(2)
const slug = args.find(a => !a.startsWith('--')) ?? 'intro'
const audioOnly = args.includes('--audio')
const noRender = args.includes('--no-render')

const spec = JSON.parse(readFileSync(path.join(STUDIO, 'films', `${slug}.json`), 'utf8'))
const brand = JSON.parse(readFileSync(path.join(STUDIO, 'brand.json'), 'utf8'))
const dirs = { audio: path.join(WS, '03-audio', slug), vo: path.join(WS, '03-audio', slug, 'vo'), sfx: path.join(WS, '03-audio', 'sfx'), gfx: path.join(WS, '06-graphics'), out: path.join(WS, '08-export') }
for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true })

const run = (cmd, a, opts = {}) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'pipe'], ...opts }).toString()
const duration = f => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).trim())

// ---- 1. voice (optional) and timing ------------------------------------------------
// With `voice`, each scene lasts as long as its spoken line (+ hold). Without it the
// film is text and music only: a scene lasts `bars` bars of the music (`music.bar`
// seconds each, so every cut lands on the beat) or `seconds`.
const voice = spec.voice
  ? (() => {
      const installed = run('say', ['-v', '?']).split('\n').map(l => l.replace(/\s{2,}.*$/, '').trim()).filter(Boolean)
      const v = spec.voice.prefer.find(x => installed.includes(x)) ?? 'Samantha'
      console.log(`voice: ${v}${v.includes('Premium') ? '' : '  (install "Ava (Premium)" for a better one; see the header)'}`)
      return v
    })()
  : null
if (!voice) console.log('no voice-over: text and music only')

// Camera clips (scene `clip`: a file name without extension) live in
// workspace/01-camera/<slug>/. Missing → the scene shows a placeholder that
// says what to record; present → the clip plays and the scene grows to whole
// bars long enough for it, the music ducking under your voice.
const camDir = path.join(WS, '01-camera', slug)
mkdirSync(camDir, { recursive: true })
const findClip = base => ['mov', 'mp4', 'm4v', 'MOV', 'MP4', 'M4V'].map(e => path.join(camDir, `${base}.${e}`)).find(existsSync)
const hasAudio = f => run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', f]).trim() !== ''

let t = 0
const frame = x => Math.round(x * 30) / 30
const scenes = spec.scenes.map((s, i) => {
  if (!voice || !s.vo) {
    let bars = s.bars
    const props = { ...(s.props ?? {}) }
    let clip = null
    if (s.clip) {
      const file = findClip(s.clip)
      props.file = `${s.clip}.mov`
      if (file) {
        const d = duration(file)
        bars = Math.max(bars ?? 1, Math.ceil((d + 0.3) / spec.music.bar))
        props._clip = file
        clip = { file, duration: d, audio: hasAudio(file) }
        console.log(`clip: ${s.clip} (${d.toFixed(1)} s) → ${bars} bars`)
      } else console.log(`clip: ${s.clip} missing → placeholder (drop it in ${path.relative(process.cwd(), camDir)}/)`)
    }
    if (s.photo) {
      const img = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].map(e => path.join(camDir, `${s.photo}.${e}`)).find(existsSync)
      props.photo = s.photo
      if (img) props._photo = img
      console.log(img ? `photo: ${path.basename(img)}` : `photo: ${s.photo} missing → placeholder (drop ${s.photo}.jpg in ${path.relative(process.cwd(), camDir)}/)`)
    }
    const dur = frame(bars ? bars * spec.music.bar : (s.seconds ?? 5))
    const scene = { ...s, props, index: i, start: frame(t), duration: dur, voStart: 0, voDuration: 0, voFile: null, voEnv: [], clipFile: clip?.file ?? null, clipDuration: clip ? Math.min(clip.duration, dur) : 0, clipAudio: !!clip?.audio }
    t += dur
    return scene
  }
  const n = String(i + 1).padStart(2, '0')
  const aiff = path.join(dirs.vo, `${n}-${s.id}.aiff`)
  const wav = path.join(dirs.vo, `${n}-${s.id}.wav`)
  run('say', ['-v', voice, '-r', String(spec.voice.rate ?? 180), '-o', aiff, s.vo])
  // Mono 48 kHz, trimmed of the voice's leading silence, gently levelled.
  run('ffmpeg', ['-y', '-v', 'error', '-i', aiff, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-ac', '1', wav])
  const vo = duration(wav)
  // Lip sync: how open the mouth is, 15 times a second (0 closed … 1 wide), from the voice's loudness.
  const rms = run('ffmpeg', ['-v', 'error', '-i', wav, '-af', 'aresample=8000,asetnsamples=n=533:p=0,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-', '-f', 'null', '-'])
  const voEnv = [...rms.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map(m => (m[1] === '-inf' ? 0 : Math.max(0, Math.min(1, (Number(m[1]) + 42) / 24)))).map(v => Math.round(v * 100) / 100)
  const lead = i === 0 ? 0.6 : 0.25
  const dur = frame(lead + vo + (s.hold ?? spec.pad ?? 0.5))
  const scene = { ...s, index: i, start: frame(t), duration: dur, voStart: lead, voDuration: vo, voFile: wav, voEnv }
  t += dur
  return scene
})
const total = Math.round(t * 30) / 30
console.log(`scenes: ${scenes.length}, total ${total.toFixed(1)} s`)
for (const s of scenes) console.log(`  ${s.start.toFixed(2).padStart(6)}  ${s.duration.toFixed(2)}s  ${s.id}`)

// ---- 2. music, sfx and screens ------------------------------------------------------
// `music.file`: a track you have the rights to (trimmed, levelled, faded out at the end);
// otherwise an original bed from studio/audio/synth.py.
const music = path.join(dirs.audio, 'music.wav')
if (spec.music.file) {
  run('ffmpeg', ['-y', '-v', 'error', '-ss', String(spec.music.start ?? 0), '-i', spec.music.file, '-t', String(total + 0.5), '-af', `loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.3,afade=t=out:st=${Math.max(0, total - 2.5)}:d=2.8`, '-ar', '48000', '-ac', '2', music])
} else {
  run('python3', [path.join(STUDIO, 'audio', 'synth.py'), 'music', String(total + 0.5), music, String(spec.music.bpm ?? 104), String(spec.music.seed ?? 7)])
}
if (spec.sfx !== false) run('python3', [path.join(STUDIO, 'audio', 'synth.py'), 'sfx', dirs.sfx])
if (spec.screens) {
  const { captureScreens } = await import('./screens.mjs')
  captureScreens(spec.screens, { refresh: args.includes('--screens') })
}

// Music level: `gainDb` between lines, `duckDb` lower while anyone speaks, with
// short ramps. The same keyframes go to After Effects, so both mixes match.
const ramp = 0.25
const duck = []
for (const s of scenes.filter(x => x.voFile)) {
  const a = s.start + s.voStart
  const b = a + s.voDuration
  duck.push([a - ramp, spec.music.gainDb], [a, spec.music.duckDb], [b, spec.music.duckDb], [b + ramp * 2, spec.music.gainDb])
}
for (const s of scenes.filter(x => x.clipAudio)) {
  const a = s.start
  const b = a + s.clipDuration
  duck.push([a - ramp, spec.music.gainDb], [a, spec.music.duckDb], [b, spec.music.duckDb], [b + ramp * 2, spec.music.gainDb])
}
duck.sort((x, y) => x[0] - y[0])
const sfxCues = spec.sfx === false ? [] : scenes.flatMap(s => (s.sfx ?? []).map(c => ({ at: Math.max(0, Math.round((s.start + c.at) * 1000) / 1000), name: c.name, file: path.join(dirs.sfx, `${c.name}.wav`) })))

// ---- 3. the mix (for Premiere and the render) ----------------------------------------
// Voices: the voice-over lines and the audio of your camera clips.
const voices = [
  ...scenes.filter(s => s.voFile).map(s => ({ file: s.voFile, at: s.start + s.voStart, af: '' })),
  ...scenes.filter(s => s.clipAudio).map(s => ({ file: s.clipFile, at: s.start, af: `atrim=0:${s.clipDuration.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=7,` }))
]
const inputs = ['-i', music, ...voices.flatMap(v => ['-i', v.file]), ...sfxCues.flatMap(c => ['-i', c.file])]
const nVo = voices.length
const f = []
voices.forEach((v, i) => f.push(`[${i + 1}:a]${v.af}aformat=sample_rates=48000:channel_layouts=stereo,adelay=${Math.round(v.at * 1000)}:all=1[v${i}]`))
if (nVo) f.push(`${voices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${nVo}:normalize=0,asplit=2[vo][vosc]`)
// Volume envelope from the duck keyframes (linear between points, in dB).
const env = duck.map(([tt, db], i) => {
  const [t2, db2] = duck[i + 1] ?? [total + 10, db]
  return `between(t,${tt.toFixed(3)},${t2.toFixed(3)})*(${db}+(${db2 - db})*(t-${tt.toFixed(3)})/${Math.max(0.001, t2 - tt).toFixed(3)})`
})
const firstDb = spec.music.gainDb
f.push(duck.length ? `[0:a]volume='pow(10,(if(lt(t,${duck[0][0].toFixed(3)}),${firstDb},${env.join('+')}))/20)':eval=frame[mus]` : `[0:a]volume=${spec.music.gainDb ?? 0}dB[mus]`)
sfxCues.forEach((c, i) => f.push(`[${nVo + 1 + i}:a]adelay=${Math.round(c.at * 1000)}:all=1,volume=-8dB[s${i}]`))
f.push(`[mus]${nVo ? '[vo]' : ''}${sfxCues.map((_, i) => `[s${i}]`).join('')}amix=inputs=${1 + (nVo ? 1 : 0) + sfxCues.length}:normalize=0,alimiter=limit=0.95,atrim=0:${total},loudnorm=I=-14:TP=-1.5:LRA=11[out]`)
if (nVo) f.push('[vosc]anullsink')
const mix = path.join(dirs.audio, 'mix.wav')
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', f.join(';'), '-map', '[out]', '-ar', '48000', mix], { encoding: 'utf8' })
if (r.status !== 0) {
  console.error(r.stderr)
  process.exit(1)
}
console.log(`mix: ${path.relative(process.cwd(), mix)}`)

// ---- 4. timeline for After Effects -----------------------------------------------------
const timeline = { slug, title: spec.title, layout: spec.layout ?? 'cuts', canvas: spec.canvas ?? {}, credit: spec.music.credit ?? '', beat: spec.music.bar ? spec.music.bar / 4 : 0.585, screens: path.join(WS, '04-clips', 'screens'), fps: brand.frame.fps, width: brand.frame.width, height: brand.frame.height, total, brand, studio: STUDIO, workspace: WS, voice, music: { file: music, duck }, mix, sfx: sfxCues, scenes }
const tlPath = path.join(dirs.gfx, `${slug}.timeline.json`)
writeFileSync(tlPath, JSON.stringify(timeline, null, 2))
// A fixed path the After Effects scripts read (ExtendScript cannot take arguments).
writeFileSync(path.join(WS, '.job.json'), JSON.stringify({ action: 'film', timeline: tlPath }, null, 2))
console.log(`timeline: ${path.relative(process.cwd(), tlPath)}`)
if (audioOnly) process.exit(0)

// ---- 5. After Effects ---------------------------------------------------------------------
const ae = await import('./aftereffects/ae.mjs')
await ae.runJob()
const aep = path.join(dirs.gfx, `${slug}.aep`)
if (!existsSync(aep)) {
  console.error('After Effects did not save the project. Is a dialog open in After Effects?')
  process.exit(1)
}
console.log(`project: ${path.relative(process.cwd(), aep)}`)
if (noRender) process.exit(0)
const mp4 = await ae.render(aep, 'MASTER', path.join(dirs.out, `${slug}.mp4`), mix)
console.log(`render: ${path.relative(process.cwd(), mp4)}`)

// ---- 6. Premiere ---------------------------------------------------------------------------
const { premiereXml } = await import('./premiere/xml.mjs')
mkdirSync(path.join(WS, '07-edit'), { recursive: true })
const xml = premiereXml(timeline, mp4, path.join(WS, '07-edit', `${slug}.xml`))
console.log(`premiere: ${path.relative(process.cwd(), xml)}  (Premiere → File → Import)`)
