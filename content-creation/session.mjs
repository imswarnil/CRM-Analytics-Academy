#!/usr/bin/env node
// content-creation/session.mjs — turn a folder of recordings into an edited Final Cut Pro project.
//
//   pnpm session new <slug> [--title "Window functions in SAQL"]   make the folder and its session.yml
//   pnpm session import <slug>        move new OBS takes from sessions/inbox/ into the session, sorted
//                                     into camera/ or screen/ by face detection
//   pnpm session build <slug> [--open]  write the timeline into session.yml (first run) and build
//                                     sessions/<slug>/<slug>.fcpxml, chapters.txt and an edit report
//   pnpm session list
//
// A session folder:
//   sessions/<slug>/session.yml   title, intro/outro, music levels and the timeline (an ordered list you edit)
//   sessions/<slug>/camera/       talking-head takes (OBS scene "CRMA · Camera")
//   sessions/<slug>/screen/       screen takes (OBS "CRMA · Screen" or "CRMA · Screen + Camera")
//   sessions/<slug>/images/       illustrations (png, jpg, heic)
//   sessions/<slug>/voiceover/    narration; a file with the same name as a clip replaces that clip's sound
//
// The edit: Lesson Intro (with its music) → every timeline entry in order → outro (with the sting).
// Camera takes are trimmed to the speech and long pauses are cut out (jump cuts); screen takes are
// trimmed at both ends and keep their pauses. Screen takes get a step bar, images sit on graph paper
// with a FIG. caption, every entry is a chapter, and the music bed runs underneath, keyframed down
// whenever someone is talking. Everything stays editable in Final Cut Pro.
//
// Needs ffmpeg/ffprobe (brew install ffmpeg); `import` also needs Xcode's swiftc for face detection.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseDocument } from 'yaml'
import { HERE, REPO, MUSIC, INSTALLED, FPS, T, S, TITLE_START, esc, mmss, template, effectsWriter, fit, split2, up, pad2, human } from './fcp-shared.mjs'

const SESSIONS = join(HERE, 'sessions')
const INBOX = join(SESSIONS, 'inbox')
const SITE_MUSIC = join(REPO, 'public', 'music')
const VIDEO = new Set(['.mov', '.mp4', '.m4v', '.mkv'])
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.heic', '.tif', '.tiff'])
const AUDIO = new Set(['.m4a', '.wav', '.mp3', '.aif', '.aiff'])
const KINDS = ['camera', 'screen', 'image']
const FOLDER = { camera: 'camera', screen: 'screen', image: 'images' }

const argv = process.argv.slice(2)
const flag = (name) => {
  const i = argv.indexOf(name)
  if (i === -1) return undefined
  const v = argv[i + 1]
  argv.splice(i, 2)
  return v
}
const has = (name) => {
  const i = argv.indexOf(name)
  if (i !== -1) argv.splice(i, 1)
  return i !== -1
}

const DEFAULTS = {
  intro: 'light', outro: 'thanks', instructor: 'Swarnil Singhai', level: 'BEGINNER', eyebrow: 'CRM ANALYTICS ACADEMY',
  name_card: false, step_bars: false, music_level: -14, duck_level: -28, jump_cuts: true, max_pause: 0.8, trim: 0.6, screen_style: 'full', transitions: true, image_seconds: 6
}

const SESSION_YML = (slug, title) => `# CRMA session — edit this file, then run:  pnpm session build ${slug}
# Every field is optional. The first build fills in \`timeline\` at the end of this file from the
# recordings, in the order you recorded them; after that, reorder, retitle or delete entries freely and
# build again. Each timeline entry is one shot:
#   - camera: <file in camera/>     title: chapter name (and the topic lower third)
#   - screen: <file in screen/>     title: the step bar text
#   - image: <file in images/>      seconds: how long it stays (default 6)
#   optional on any clip:           voiceover: <file in voiceover/>  replaces the clip's sound
#                                   in: / out:  source seconds, instead of the automatic trim
#                                   jump_cuts: false  keeps every pause in this take

title: ${title}
eyebrow: MODULE 00 · LESSON 00      # the small line above the title in the intro
level: BEGINNER
instructor: Swarnil Singhai

intro: light            # light | navy | none
outro: thanks           # thanks | navy | next | minimal | none
# next: Bindings that drive each other   # with outro: next — the next lesson's title
# progress: 4 / 24                       # with outro: next

music: auto             # a file in content-creation/music/ or public/music/, auto = the first one, none = no bed
music_level: -14        # dB while nobody is talking
duck_level: -28         # dB under speech

jump_cuts: true         # camera takes: cut pauses longer than max_pause seconds
max_pause: 0.8
trim: 0.6               # seconds cut off both ends of a take with no speech (the record click)
screen_style: full      # full | window (the Blueprint Window effect around screen takes)
transitions: true       # CRMA transitions where the kind of shot changes

# The CRMA Recording scenes already show your name card and the lesson title in every take, so the
# edit does not add them again. Turn these on for takes recorded without those scenes.
name_card: false        # Instructor Card on the first camera take, Topic Tag on the later ones
step_bars: false        # STEP n OF N bar on each screen take
`

// ------------------------------------------------------------------ tools
function need(cmd) {
  if (spawnSync('which', [cmd]).status !== 0) {
    console.error(`! ${cmd} is not installed. ${cmd.startsWith('ff') ? 'brew install ffmpeg' : 'Install Xcode or the Command Line Tools'}`)
    process.exit(1)
  }
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate,channels,sample_rate', '-of', 'json', file], { encoding: 'utf8' })
  const j = JSON.parse(out)
  const v = j.streams.find(s => s.codec_type === 'video')
  const a = j.streams.find(s => s.codec_type === 'audio')
  const [num, den] = (v?.r_frame_rate ?? '30/1').split('/').map(Number)
  return { duration: +(j.format?.duration ?? 0), width: v?.width, height: v?.height, fps: [num || 30, den || 1], audio: a ? { channels: a.channels ?? 2, rate: +(a.sample_rate ?? 48000) } : null }
}

/** Sound spans [start, end] in seconds, from ffmpeg silencedetect. */
function sounds(file, duration) {
  const r = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-i', file, '-vn', '-af', 'silencedetect=noise=-38dB:d=0.3', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 << 20 })
  const sil = []
  let s = null
  for (const line of r.stderr.split('\n')) {
    const a = /silence_start: (-?[\d.]+)/.exec(line)
    const b = /silence_end: ([\d.]+)/.exec(line)
    if (a) s = Math.max(0, +a[1])
    if (b && s !== null) {
      sil.push([s, +b[1]])
      s = null
    }
  }
  if (s !== null) sil.push([s, duration])
  const out = []
  let at = 0
  for (const [a, b] of sil) {
    if (a > at) out.push([at, a])
    at = b
  }
  if (at < duration) out.push([at, duration])
  return out.filter(([a, b]) => b - a > 0.05)
}

/** Probe + silence analysis, cached per file (size + mtime) in the session's .cache.json. */
function analyser(dir) {
  const path = join(dir, '.cache.json')
  const cache = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {}
  let dirty = false
  return {
    get(file, withSound) {
      const st = statSync(file)
      const key = relative(dir, file)
      let c = cache[key]
      if (!c || c.size !== st.size || c.mtime !== st.mtimeMs) {
        c = cache[key] = { size: st.size, mtime: st.mtimeMs, probe: probe(file) }
        dirty = true
      }
      if (withSound && !c.sounds && c.probe.audio) {
        process.stdout.write(`  listening to ${key} …\n`)
        c.sounds = sounds(file, c.probe.duration)
        dirty = true
      }
      return c
    },
    save() {
      if (dirty) writeFileSync(path, JSON.stringify(cache, null, 1))
    }
  }
}

// ------------------------------------------------------------------ face detection (import)
function facesBin() {
  const src = join(HERE, 'tools', 'faces.swift')
  const bin = join(HERE, 'tools', '.bin', 'faces')
  if (!existsSync(bin) || statSync(bin).mtimeMs < statSync(src).mtimeMs) {
    need('swiftc')
    mkdirSync(join(HERE, 'tools', '.bin'), { recursive: true })
    console.log('  compiling the face detector (once) …')
    execFileSync('swiftc', ['-O', src, '-o', bin], { stdio: 'inherit' })
  }
  return bin
}

/** 'camera' when a large face shows in at least two of five frames, otherwise 'screen'. */
function classify(file, bin) {
  const { duration } = probe(file)
  const tmp = mkdtempSync(join(tmpdir(), 'crma-faces-'))
  try {
    const shots = [0.15, 0.35, 0.5, 0.65, 0.85].map((p, i) => {
      const out = join(tmp, `f${i}.jpg`)
      spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-ss', String(duration * p), '-i', file, '-frames:v', '1', '-vf', 'scale=960:-2', out])
      return out
    }).filter(f => existsSync(f))
    const res = execFileSync(bin, shots, { encoding: 'utf8' }).trim().split('\n').map(l => +l.split(' ')[1])
    const big = res.filter(h => h >= 0.12).length
    return { kind: big >= 2 ? 'camera' : 'screen', faces: res }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

// ------------------------------------------------------------------ session files
function sessionDir(slug) {
  if (!slug) {
    console.error('usage: pnpm session <new|import|build> <slug>')
    process.exit(1)
  }
  return join(SESSIONS, slug)
}

function loadDoc(dir) {
  const p = join(dir, 'session.yml')
  if (!existsSync(p)) {
    console.error(`! no ${relative(REPO, p)} — run: pnpm session new ${basename(dir)}`)
    process.exit(1)
  }
  return parseDocument(readFileSync(p, 'utf8'))
}

const files = (dir, exts) => (existsSync(dir) ? readdirSync(dir).filter(f => !f.startsWith('.') && exts.has(extname(f).toLowerCase())).sort() : [])

/** "2026-10-27 10-15-03 Open Data Manager.mov" → "Open Data Manager"; an OBS timestamp alone → "". */
function titleFromName(f) {
  return basename(f, extname(f))
    .replace(/^\d{4}-\d{2}-\d{2}[ _T]\d{2}[-.:]\d{2}[-.:]\d{2}\s*/, '')
    .replace(/^\d+\s*[-_.)]\s*|^\d+\s+/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

/** When a take was recorded: the OBS timestamp in its name ("2026-10-27 10-15-03"), else the file's birth time. */
function recordedAt(file) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ _T](\d{2})[-.:](\d{2})[-.:](\d{2})/.exec(basename(file))
  return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : statSync(file).birthtimeMs
}

/** Add every file that is not in the timeline yet: recordings in recording order, images after them. */
function syncTimeline(doc, dir) {
  if (!doc.has('timeline') || !doc.get('timeline')) doc.set('timeline', doc.createNode([]))
  const tl = doc.get('timeline')
  const listed = new Set(tl.items.map(n => n.toJSON()).flatMap(e => KINDS.map(k => e?.[k] && `${k}:${e[k]}`)).filter(Boolean))
  const fresh = []
  for (const kind of ['camera', 'screen']) {
    for (const f of files(join(dir, FOLDER[kind]), VIDEO)) {
      if (!listed.has(`${kind}:${f}`)) fresh.push({ kind, f, t: recordedAt(join(dir, FOLDER[kind], f)) })
    }
  }
  fresh.sort((a, b) => a.t - b.t || a.f.localeCompare(b.f))
  for (const f of files(join(dir, 'images'), IMAGE)) {
    if (!listed.has(`image:${f}`)) fresh.push({ kind: 'image', f })
  }
  const counts = { camera: 0, screen: 0, image: 0 }
  for (const e of tl.items.map(n => n.toJSON())) for (const k of KINDS) if (e?.[k]) counts[k]++
  for (const { kind, f } of fresh) {
    const entry = { [kind]: f, title: titleFromName(f) || `${kind === 'image' ? 'Figure' : kind === 'camera' ? 'Talk' : 'Step'} ${++counts[kind]}` }
    tl.add(doc.createNode(entry))
  }
  return fresh.length
}

// ------------------------------------------------------------------ the edit
function build(slug, opts) {
  need('ffprobe')
  need('ffmpeg')
  const dir = sessionDir(slug)
  const doc = loadDoc(dir)
  const added = syncTimeline(doc, dir)
  if (added) {
    writeFileSync(join(dir, 'session.yml'), doc.toString())
    console.log(`  + ${added} new ${added === 1 ? 'file' : 'files'} added to the timeline in session.yml`)
  }
  const cfg = { ...DEFAULTS, ...doc.toJSON() }
  const timeline = (cfg.timeline ?? []).filter(Boolean)
  if (!timeline.length) {
    console.error(`! nothing to edit: put recordings in ${relative(REPO, dir)}/camera, screen or images first`)
    process.exit(1)
  }
  const an = analyser(dir)
  const warnings = []
  const voFiles = files(join(dir, 'voiceover'), AUDIO)

  const { effectId, titleXml, resources: effectResources } = effectsWriter()
  const formats = new Map()
  const formatId = (w, h, [num, den], still) => {
    const key = still ? `still:${w}x${h}` : `${w}x${h}@${num}/${den}`
    if (!formats.has(key)) {
      formats.set(key, { id: `r${formats.size + 2}`, xml: id => (still
        ? `<format id="${id}" name="FFVideoFormatRateUndefined" width="${w}" height="${h}"/>`
        : `<format id="${id}" frameDuration="${den}/${num}s" width="${w}" height="${h}" colorSpace="1-1-1 (Rec. 709)"/>`) })
    }
    return formats.get(key).id
  }
  const assets = new Map()
  const asset = (file, info, kind) => {
    if (!assets.has(file)) {
      const p = info.probe
      const id = `a${assets.size + 1}`
      const frames = Math.floor(p.duration * FPS)
      let attrs = `start="0s" duration="${kind === 'image' ? '0s' : T(frames)}"`
      if (kind !== 'audio') attrs += ` hasVideo="1" format="${formatId(p.width, p.height, p.fps, kind === 'image')}" videoSources="1"`
      if (p.audio && kind !== 'image') attrs += ` hasAudio="1" audioSources="1" audioChannels="${p.audio.channels}" audioRate="${p.audio.rate}"`
      assets.set(file, { id, frames, xml: `<asset id="${id}" name="${esc(basename(file, extname(file)))}" ${attrs}><media-rep kind="original-media" src="${esc(pathToFileURL(file).href)}"/></asset>` })
    }
    return assets.get(file)
  }
  const kitAudio = (name) => {
    const file = join(MUSIC, `${name}.m4a`)
    return asset(file, { probe: probe(file) }, 'audio')
  }

  const tpl = {
    intro: template('Titles', 'Intros', cfg.intro === 'navy' ? 'Lesson Intro Navy' : 'Lesson Intro'),
    outro: { thanks: 'Thanks for Watching', navy: 'Thanks for Watching Navy', next: 'Next Lesson', minimal: 'Outro Minimal' }[cfg.outro],
    bar: template('Titles', 'Lower Thirds', 'Lesson Number Bar'),
    instructor: template('Titles', 'Lower Thirds', 'Instructor Card'),
    topic: template('Titles', 'Lower Thirds', 'Topic Tag'),
    caption: template('Titles', 'Lower Thirds', 'Source Credit'),
    paper: template('Generators', 'Backgrounds', 'Graph Paper'),
    window: template('Effects', 'Screen Capture', 'Blueprint Window')
  }
  if (tpl.outro) tpl.outro = template('Titles', 'Outros', tpl.outro)
  const transitions = ['Sheet Wipe', 'Grid Reveal', 'Sheet Slide', 'Block Sweep'].map(n => template('Transitions', 'Transitions', n))

  // ---- blocks: each is one entry of the edit; clips are split into pieces (jump cuts)
  const blocks = []
  if (cfg.intro !== 'none') blocks.push({ kind: 'intro', frames: S(8), chapter: 'Intro' })
  const stepsTotal = timeline.filter(e => e.screen).length
  let step = 0, fig = 0, firstCamera = true
  for (const e of timeline) {
    const kind = KINDS.find(k => e[k])
    if (!kind) {
      warnings.push(`skipped a timeline entry with no camera/screen/image: ${JSON.stringify(e)}`)
      continue
    }
    const file = join(dir, FOLDER[kind], e[kind])
    if (!existsSync(file)) {
      warnings.push(`missing ${relative(dir, file)} — skipped`)
      continue
    }
    const title = String(e.title ?? '').trim()
    if (kind === 'image') {
      const info = an.get(file, false)
      blocks.push({ kind, file, info, title, fig: ++fig, frames: S(+(e.seconds ?? cfg.image_seconds)), chapter: title })
      continue
    }
    const info = an.get(file, true)
    const dur = info.probe.duration
    // voice-over: named in the entry, or a file with the clip's own name
    const voName = e.voiceover ?? voFiles.find(v => basename(v, extname(v)) === basename(e[kind], extname(e[kind])))
    const vo = voName ? join(dir, 'voiceover', voName) : null
    if (voName && !existsSync(vo)) warnings.push(`voice-over ${voName} not found in voiceover/`)
    const voInfo = vo && existsSync(vo) ? an.get(vo, false) : null
    const snd = voInfo ? [] : (info.sounds ?? [])
    const speech = snd.reduce((t, [a, b]) => t + b - a, 0) > 1
    let a = e.in ?? null, b = e.out ?? null
    if (speech) {
      a ??= Math.max(0, snd[0][0] - 0.25)
      b ??= Math.min(dur, snd.at(-1)[1] + 0.35)
    } else {
      a ??= Math.min(cfg.trim, dur * 0.1)
      b ??= Math.max(a + 0.5, dur - cfg.trim)
    }
    if (voInfo) b = Math.max(b, Math.min(dur, a + voInfo.probe.duration))
    let segs = [[a, b]]
    if (kind === 'camera' && speech && cfg.jump_cuts && e.jump_cuts !== false) {
      segs = []
      let at = a
      for (let i = 0; i + 1 < snd.length; i++) {
        const gs = snd[i][1], ge = snd[i + 1][0]
        if (gs < a || ge > b || ge - gs <= cfg.max_pause) continue
        segs.push([at, gs + 0.2])
        at = ge - 0.15
      }
      segs.push([at, b])
      segs = segs.filter(([x, y]) => y - x >= 0.3)
    }
    const pieces = segs.map(([x, y]) => ({ in: Math.round(x * FPS), out: Math.round(y * FPS) }))
    const frames = pieces.reduce((t, p) => t + p.out - p.in, 0)
    if (voInfo && voInfo.probe.duration > (dur - a) + 0.5) warnings.push(`${e.voiceover ?? voName} is ${(voInfo.probe.duration - (dur - a)).toFixed(1)}s longer than ${e[kind]} — extend the clip or slow it down in Final Cut Pro`)
    const block = { kind, file, info, title, pieces, frames, speech: speech || !!voInfo, vo, voInfo, chapter: title }
    if (kind === 'screen') block.step = ++step
    if (kind === 'camera') {
      block.first = firstCamera
      firstCamera = false
    }
    if (kind === 'screen' && !speech && !voInfo) block.todo = true
    blocks.push(block)
  }
  if (tpl.outro) blocks.push({ kind: 'outro', frames: S(8), chapter: 'Outro' })

  let at = 0
  for (const b of blocks) {
    b.offset = at
    at += b.frames
  }
  const total = at
  const outroAt = blocks.find(b => b.kind === 'outro')?.offset ?? total

  // ---- speech spans → music envelope (timeline frames)
  const spans = []
  for (const b of blocks) {
    if (!b.speech) continue
    if (b.voInfo) {
      spans.push([b.offset, b.offset + Math.min(b.frames, Math.round(b.voInfo.probe.duration * FPS))])
      continue
    }
    // map each sound span through the pieces onto the timeline
    let off = b.offset
    for (const p of b.pieces) {
      for (const [x, y] of b.info.sounds) {
        const s0 = Math.max(p.in, Math.round(x * FPS)), s1 = Math.min(p.out, Math.round(y * FPS))
        if (s1 > s0) spans.push([off + s0 - p.in, off + s1 - p.in])
      }
      off += p.out - p.in
    }
  }
  spans.sort((p, q) => p[0] - q[0])
  const merged = []
  for (const s of spans) {
    const last = merged.at(-1)
    if (last && s[0] - last[1] < S(1.2)) last[1] = Math.max(last[1], s[1])
    else merged.push([...s])
  }
  const bedFrom = blocks.find(b => b.kind === 'intro') ? S(8) - S(1) : 0
  const bedTo = Math.min(total, outroAt + S(1.5))
  // level(t) is the quieter of the fade (in after the intro, out into the outro) and the duck (down
  // under speech, ramping over R); the keyframes are level() at every point where either one bends.
  const R = S(0.4), F = S(1.5), lo = -40
  const lerp = (a, b, x) => a + (b - a) * Math.min(1, Math.max(0, x))
  const duck = t => Math.min(cfg.music_level, ...merged.map(([s0, s1]) => (t < s0 - R || t > s1 + R
    ? cfg.music_level
    : t < s0 ? lerp(cfg.music_level, cfg.duck_level, (t - s0 + R) / R) : t <= s1 ? cfg.duck_level : lerp(cfg.duck_level, cfg.music_level, (t - s1) / R))))
  const fade = t => Math.min(t < bedFrom + F ? lerp(lo, cfg.music_level, (t - bedFrom) / F) : Infinity, t > bedTo - F ? lerp(cfg.music_level, lo, (t - bedTo + F) / F) : Infinity)
  const level = t => Math.min(duck(t), fade(t))
  const bends = [bedFrom, bedFrom + F, bedTo - F, bedTo, ...merged.flatMap(([s0, s1]) => [s0 - R, s0, s1, s1 + R])]
  const env = [...new Set(bends.filter(t => t >= bedFrom && t <= bedTo))].sort((a, b) => a - b).map(t => [t, level(t)])
    .filter((k, i, a) => i === 0 || i === a.length - 1 || !(a[i - 1][1] === k[1] && a[i + 1][1] === k[1]))

  // ---- music bed file
  let bed = null
  if (cfg.music !== 'none' && cfg.music !== false) {
    const dirs = [join(HERE, 'music'), SITE_MUSIC]
    const pick = cfg.music && cfg.music !== 'auto'
      ? dirs.map(d => join(d, cfg.music)).find(existsSync)
      : dirs.flatMap(d => files(d, AUDIO).map(f => join(d, f)))[0]
    if (pick) bed = { file: pick, a: asset(pick, an.get(pick, false), 'audio') }
    else warnings.push(cfg.music && cfg.music !== 'auto' ? `music ${cfg.music} not found in content-creation/music/ or public/music/` : 'no music file found in content-creation/music/ or public/music/ — no bed')
  }

  // ---- xml
  const chapter = (name, start) => `<chapter-marker start="${T(start)}" duration="${T(1)}" value="${esc(fit(name, 60))}" posterOffset="${T(S(1))}"/>`
  const musicXml = (parentStart, elementOffset) => {
    let xml = ''
    if (blocks[0]?.kind === 'intro') {
      const intro = kitAudio('CRMA Academy Intro (8s)')
      xml += `<asset-clip ref="${intro.id}" lane="-1" offset="${T(parentStart)}" name="CRMA Academy Intro (8s)" start="0s" duration="${T(Math.min(intro.frames, S(8)))}" audioRole="music"/>`
    }
    if (tpl.outro) {
      const sting = kitAudio('CRMA Outro Sting (6s)')
      xml += `<asset-clip ref="${sting.id}" lane="-1" offset="${T(parentStart + outroAt - elementOffset)}" name="CRMA Outro Sting (6s)" start="0s" duration="${T(sting.frames)}" audioRole="music"/>`
    }
    if (bed && bedTo > bedFrom) {
      const len = bed.a.frames
      for (let t = bedFrom; t < bedTo; t += len) {
        const n = Math.min(len, bedTo - t)
        const keys = [[t, level(t)], ...env.filter(([k]) => k > t && k < t + n), [t + n, level(t + n)]]
        const kf = keys.map(([k, v]) => `<keyframe time="${T(k - t)}" value="${v.toFixed(1)}dB"/>`).join('')
        xml += `<asset-clip ref="${bed.a.id}" lane="-2" offset="${T(parentStart + t - elementOffset)}" name="${esc(basename(bed.file, extname(bed.file)))}" start="0s" duration="${T(n)}" audioRole="music">`
          + `<adjust-volume><param name="amount"><keyframeAnimation>${kf}</keyframeAnimation></param></adjust-volume></asset-clip>`
      }
    }
    return xml
  }

  let spine = ''
  let trN = 0
  blocks.forEach((b, i) => {
    const anchorMusic = i === 0
    if (b.kind === 'intro' || b.kind === 'outro') {
      let values
      if (b.kind === 'intro') {
        const [t1, t2] = split2(cfg.title ?? slug, 18)
        values = { 'Eyebrow': fit(up(cfg.eyebrow), 34), 'Title': t1, 'Title 2': t2, 'Length': human(Math.max(1, Math.round((total - S(16)) / FPS))), 'Level': fit(up(cfg.level), 18) }
      } else if (tpl.outro.name === 'Next Lesson') {
        const [n1, n2] = split2(cfg.next ?? 'The next lesson', 16)
        values = { 'Title': n1, 'Title 2': n2, ...(cfg.progress ? { 'Progress Count': String(cfg.progress) } : {}) }
      }
      const inner = (anchorMusic ? musicXml(TITLE_START, b.offset) : '') + chapter(b.chapter, TITLE_START)
      spine += titleXml(b.kind === 'intro' ? tpl.intro : tpl.outro, { offset: b.offset, frames: b.frames, name: b.kind === 'intro' ? 'Lesson Intro' : tpl.outro.name, values, markers: inner })
    } else if (b.kind === 'image') {
      const a = asset(b.file, b.info, 'image')
      let inner = `<video ref="${a.id}" lane="1" offset="${T(TITLE_START)}" name="${esc(basename(b.file))}" start="0s" duration="${T(b.frames)}"><adjust-transform scale="0.82 0.82"/></video>`
      if (b.title) inner += titleXml(tpl.caption, { lane: 2, offset: TITLE_START + S(0.6), frames: b.frames - S(1), name: `Fig ${b.fig}`, values: { Eyebrow: `FIG. ${pad2(b.fig)} —`, Source: fit(b.title, 40) } })
      if (anchorMusic) inner += musicXml(TITLE_START, b.offset)
      spine += `<video ref="${effectId(tpl.paper)}" offset="${T(b.offset)}" name="${esc(`Figure ${b.fig}${b.title ? ` — ${b.title}` : ''}`)}" start="${T(TITLE_START)}" duration="${T(b.frames)}">${inner}${b.chapter ? chapter(b.chapter, TITLE_START) : ''}</video>`
    } else {
      const a = asset(b.file, b.info, b.kind)
      let off = b.offset
      b.pieces.forEach((p, j) => {
        const len = p.out - p.in
        let adjust = '', inner = '', marks = '', filters = ''
        if (b.vo) adjust = '<adjust-volume amount="-96dB"/>'
        if (j === 0) {
          if (b.vo && b.voInfo) {
            const v = asset(b.vo, b.voInfo, 'audio')
            inner += `<asset-clip ref="${v.id}" lane="-1" offset="${T(p.in)}" name="${esc(basename(b.vo))}" start="0s" duration="${T(Math.min(v.frames, b.frames))}" audioRole="dialogue"/>`
          }
          if (b.kind === 'screen' && b.title && cfg.step_bars) {
            inner += titleXml(tpl.bar, { lane: 1, offset: p.in + S(0.7), frames: Math.min(S(5), Math.max(S(2), b.frames - S(1))), name: `Step ${b.step}`,
              values: { 'Lesson Number': pad2(b.step), 'Lesson Label': 'STEP', 'Title': fit(b.title, 30), 'Meta': fit(up(`STEP ${b.step} OF ${stepsTotal} · ${cfg.title ?? ''}`), 40) } })
          }
          if (b.kind === 'camera' && b.first && cfg.name_card) {
            inner += titleXml(tpl.instructor, { lane: 1, offset: p.in + S(1), frames: Math.min(S(5), Math.max(S(2), b.frames - S(1.5))), name: 'Instructor', values: { Name: fit(cfg.instructor, 24) } })
          } else if (b.kind === 'camera' && b.title && cfg.name_card) {
            inner += titleXml(tpl.topic, { lane: 1, offset: p.in + S(0.7), frames: Math.min(S(4), Math.max(S(2), b.frames - S(1))), name: `Topic — ${b.title}`, values: { Topic: fit(up(b.title), 28) } })
          }
          if (b.chapter) marks += chapter(b.chapter, p.in)
          if (b.todo) marks += `<marker start="${T(p.in)}" value="${esc(`Voice-over: ${b.title || basename(b.file)}`)}" completed="0" note="No speech in this take. Record a voice-over here (Window → Record Voiceover) or drop a file named ${esc(basename(b.file, extname(b.file)))}.m4a in voiceover/ and build again."/>`
        }
        if (anchorMusic && j === 0) inner += musicXml(p.in, b.offset)
        if (b.kind === 'screen' && cfg.screen_style === 'window') filters = `<filter-video ref="${effectId(tpl.window)}" name="Blueprint Window"/>`
        spine += `<asset-clip ref="${a.id}" offset="${T(off)}" name="${esc(`${b.title || basename(b.file)}${b.pieces.length > 1 ? ` (${j + 1}/${b.pieces.length})` : ''}`)}" start="${T(p.in)}" duration="${T(len)}" tcFormat="NDF" audioRole="dialogue">${adjust}${inner}${marks}${filters}</asset-clip>`
        off += len
      })
    }
    // A CRMA transition where the kind of shot changes, when both sides have the media to overlap.
    const nb = blocks[i + 1]
    if (cfg.transitions && nb && b.kind !== nb.kind) {
      const tail = b.pieces ? b.info.probe.duration * FPS - b.pieces.at(-1).out : Infinity
      const head = nb.pieces ? nb.pieces[0].in : Infinity
      if (tail >= 10 && head >= 10) {
        const tr = transitions[trN++ % transitions.length]
        spine += `<transition name="${esc(tr.name)}" offset="${T(nb.offset - 10)}" duration="${T(20)}"><filter-video ref="${effectId(tr)}" name="${esc(tr.name)}"/></transition>`
      }
    }
  })
  an.save()

  let resources = '<format id="r1" name="FFVideoFormat1080p30" frameDuration="100/3000s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>'
  for (const f of formats.values()) resources += f.xml(f.id)
  resources += effectResources()
  for (const a of assets.values()) resources += a.xml
  const projectName = cfg.title ?? slug
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<!-- Generated by content-creation/session.mjs from sessions/${slug}/session.yml — edit that file and run \`pnpm session build ${slug}\` again rather than editing this one. -->
<fcpxml version="1.11">
<resources>${resources}</resources>
<event name="CRMA Sessions"><project name="${esc(projectName)}"><sequence format="r1" duration="${T(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k"><spine>${spine}</spine></sequence></project></event>
</fcpxml>
`.replace(/<(format|effect|asset|title|gap|transition|asset-clip|video|event|project|sequence|spine|\/spine|\/resources|\/sequence)([ >])/g, '\n<$1$2').replace(/\n+/g, '\n')

  // ---- outputs
  const xmlPath = join(dir, `${slug}.fcpxml`)
  writeFileSync(xmlPath, xml)
  const chapters = blocks.filter(b => b.chapter).map(b => `${mmss(b.offset)} ${fit(b.chapter, 60)}`)
  writeFileSync(join(dir, 'chapters.txt'), `${chapters.join('\n')}\n`)
  const L = [`# ${projectName}`, '', `Built by \`pnpm session build ${slug}\` — ${mmss(total)} long. Import: Final Cut Pro → File → Import → XML… → \`${slug}.fcpxml\`.`, '',
    '| At | Shot | Length | Notes |', '| --- | --- | --- | --- |']
  for (const b of blocks) {
    const notes = []
    if (b.pieces?.length > 1) notes.push(`${b.pieces.length - 1} pauses cut`)
    if (b.pieces) notes.push(`uses ${((b.pieces[0].in) / FPS).toFixed(1)}–${(b.pieces.at(-1).out / FPS).toFixed(1)}s of ${b.info.probe.duration.toFixed(1)}s`)
    if (b.vo) notes.push(`voice-over ${basename(b.vo)}`)
    if (b.todo) notes.push('**no speech — needs a voice-over**')
    L.push(`| ${mmss(b.offset)} | ${b.kind}${b.title ? ` — ${b.title.replace(/\|/g, '/')}` : ''} | ${(b.frames / FPS).toFixed(1)}s | ${notes.join(' · ')} |`)
  }
  L.push('', '## YouTube chapters', '', '```', ...chapters, '```', '')
  if (warnings.length) L.push('## Check', '', ...warnings.map(w => `- ${w}`), '')
  writeFileSync(join(dir, 'edit.md'), L.join('\n'))

  console.log(`sessions/${slug}/session.yml
  → ${relative(process.cwd(), xmlPath)}  (${mmss(total)}, ${blocks.length} shots${bed ? `, music: ${basename(bed.file)}` : ''})
  → ${relative(process.cwd(), join(dir, 'chapters.txt'))}, ${relative(process.cwd(), join(dir, 'edit.md'))}`)
  for (const w of warnings) console.log(`  ! ${w}`)
  if (!existsSync(join(INSTALLED, 'Titles.localized', 'CRMA', 'Intros', 'Lesson Intro'))) console.log('  ! The CRMA templates are not installed: run content-creation/kit/Install.command before importing.')
  if (opts.open) spawnSync('open', [xmlPath])
}

// ------------------------------------------------------------------ commands
const cmd = argv.shift()
if (cmd === 'new') {
  const title = flag('--title')
  const slug = argv[0]
  const dir = sessionDir(slug)
  for (const sub of ['camera', 'screen', 'images', 'voiceover']) mkdirSync(join(dir, sub), { recursive: true })
  mkdirSync(INBOX, { recursive: true })
  const yml = join(dir, 'session.yml')
  if (!existsSync(yml)) writeFileSync(yml, SESSION_YML(slug, title ?? slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())))
  console.log(`${relative(process.cwd(), dir)}/  camera/ screen/ images/ voiceover/ session.yml
Record in OBS (profile and scene collection "CRMA Recording"); takes land in ${relative(process.cwd(), INBOX)}/.
Then: pnpm session import ${slug}  →  pnpm session build ${slug} --open`)
} else if (cmd === 'import') {
  need('ffprobe')
  need('ffmpeg')
  const dir = sessionDir(argv[0])
  if (!existsSync(join(dir, 'session.yml'))) {
    console.error(`! run first: pnpm session new ${argv[0]}`)
    process.exit(1)
  }
  const all = existsSync(INBOX) ? readdirSync(INBOX).filter(f => !f.startsWith('.')).sort() : []
  const recent = f => Date.now() - statSync(join(INBOX, f)).mtimeMs < 10_000
  let n = 0, bin = null
  for (const f of all) {
    const ext = extname(f).toLowerCase()
    if (recent(f)) {
      console.log(`  … ${f} is still being written — skipped`)
      continue
    }
    let sub
    if (VIDEO.has(ext)) {
      bin ??= facesBin()
      const { kind, faces } = classify(join(INBOX, f), bin)
      sub = kind
      console.log(`  ${kind.padEnd(6)} ${f}   (face height per frame: ${faces.map(h => h.toFixed(2)).join(' ')})`)
    } else if (IMAGE.has(ext)) {
      sub = 'images'
    } else if (AUDIO.has(ext)) {
      sub = 'voiceover'
    } else continue
    mkdirSync(join(dir, sub), { recursive: true })
    renameSync(join(INBOX, f), join(dir, sub, f))
    if (!VIDEO.has(ext)) console.log(`  ${sub.padEnd(6)} ${f}`)
    n++
  }
  console.log(n ? `${n} moved into sessions/${argv[0]}/ — a wrong guess? move the file between camera/ and screen/ yourself. Next: pnpm session build ${argv[0]}` : `nothing new in ${relative(process.cwd(), INBOX)}/`)
} else if (cmd === 'build') {
  const open = has('--open')
  build(argv[0], { open })
} else if (cmd === 'list') {
  for (const s of existsSync(SESSIONS) ? readdirSync(SESSIONS).filter(d => d !== 'inbox' && existsSync(join(SESSIONS, d, 'session.yml'))) : []) console.log(s)
} else {
  console.log(`Usage:
  pnpm session new <slug> [--title "Lesson title"]
  pnpm session import <slug>          move OBS takes from sessions/inbox/ into camera/ or screen/
  pnpm session build <slug> [--open]  build sessions/<slug>/<slug>.fcpxml (and open it in Final Cut Pro)
  pnpm session list`)
  process.exit(cmd ? 1 : 0)
}
