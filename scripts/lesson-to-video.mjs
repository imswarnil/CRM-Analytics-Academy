#!/usr/bin/env node
/**
 * lesson-to-video — a narrated, illustrated video from a lesson's markdown.
 *
 *   node scripts/lesson-to-video.mjs content/en/1.foundations/1.index.md \
 *        [--paragraphs=1] [--lipsync] [--ai] [--voice=swarnil] [--lang=en] \
 *        [--face=~/voice-clone/video/input/Swarnil_Sample_Video.mp4] [--face-start=3] [--face-length=8] [--out=public/videos/x.mp4]
 *
 * What it does, in order (see md2video.md for the reasoning):
 *
 *   1. Storyboard. The first N prose paragraphs of the lesson become scenes.
 *      By default this is fully local: the paragraph itself is the narration,
 *      its bold terms are the bullets and a stock illustration is used.
 *      Only with --ai (and ANTHROPIC_API_KEY) does Claude Opus 5 write each
 *      scene instead: heading, bullets, narration and an SVG illustration.
 *   2. Voice. Each narration is spoken in the cloned voice by the local
 *      Coqui XTTS setup in ~/voice-clone (profile clips in audio/training/<voice>).
 *   3. Face (optional, --lipsync). Wav2Lip re-syncs the sample video's lips to
 *      the narration and the result sits picture-in-picture on the slide.
 *   4. Slide. Heading + bullets + illustration composed as one 1920x1080 SVG
 *      and rasterised with rsvg-convert.
 *   5. ffmpeg stitches slide + voice (+ face) per scene, concatenates scenes,
 *      and writes the MP4 plus a poster JPEG into public/videos/.
 *
 * Everything runs on this machine; nothing touches the network unless --ai
 * is passed explicitly. public/videos/ is gitignored — the output is local
 * until you decide to publish it. Work files land in .data/video/<slug>/.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2)
const file = argv.find(a => !a.startsWith('--'))
if (!file || !existsSync(file)) {
  console.error('usage: node scripts/lesson-to-video.mjs <lesson.md> [--paragraphs=N] [--lipsync] [--ai]')
  process.exit(1)
}
const flag = name => argv.includes(`--${name}`)
const value = (name, fallback) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const PARAGRAPHS = Number(value('paragraphs', 1))
const LIPSYNC = flag('lipsync')
const LANG = value('lang', 'en')
const VOICE_ROOT = path.join(homedir(), 'voice-clone')
const VOICE = value('voice', 'swarnil')
const FACE = value('face', path.join(VOICE_ROOT, 'video/input/Swarnil_Sample_Video.mp4')).replace(/^~/, homedir())
// Seconds of the face video to skip before the first frame Wav2Lip sees. The
// sample opens on a dark frame while the camera settles, and Wav2Lip aborts
// on any frame without a detectable face.
const FACE_START = Number(value('face-start', 3))
// Seconds of face video to use. Wav2Lip aborts if its detector misses the face
// in a single frame, and a long clip with fast head movement will always have
// one. A short, still window is played forward then reversed, and Wav2Lip
// loops that for the length of the narration.
const FACE_LENGTH = Number(value('face-length', 8))
// Generation is local by default. The Claude storyboard is opt-in only: a key
// in the environment must never switch it on by itself.
const USE_AI = flag('ai') && Boolean(process.env.ANTHROPIC_API_KEY)

// content/en/1.foundations/1.index.md -> foundations ; 3.load-data-from-csv.md -> creating-datasets-load-data-from-csv
const parts = file.split(path.sep)
const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')
const dir = strip(parts[parts.length - 2])
const name = strip(parts[parts.length - 1])
const slug = name === 'index' ? dir : `${dir}-${name}`
const OUT = value('out', path.join('public', 'videos', `${slug}.mp4`))
const POSTER = OUT.replace(/\.mp4$/, '.jpg')
const WORK = path.join('.data', 'video', slug)
mkdirSync(WORK, { recursive: true })
mkdirSync(path.dirname(OUT), { recursive: true })

// ---------------------------------------------------------------------------
// Palette — the design-system ramps from app/assets/css/main.css, as hex,
// because rsvg does not understand oklch().
// ---------------------------------------------------------------------------
const C = {
  canvas: '#FBFBFC', // ink-0
  sunken: '#F2F2F5', // ink-50
  line: '#DCDDE3', // ink-200
  inkFaint: '#7D8092', // ink-500
  inkMuted: '#4B4E5E', // ink-700
  ink: '#25273A', // ink-900
  azure: '#2E86D4', // azure-500
  azureDeep: '#1F5F9C', // azure-700
  azureSoft: '#DCEBF8', // azure-100
  iris: '#7C6BD9' // iris-500
}

// ---------------------------------------------------------------------------
// 1. Lesson -> scenes
// ---------------------------------------------------------------------------
const raw = readFileSync(file, 'utf8')
const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
const meta = fm ? parseYaml(fm[1]) : {}
const body = fm ? raw.slice(fm[0].length) : raw
const title = meta.title || slug

const blocks = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
const isProse = b => !/^(#|```|[-*] |\d+\. |>|\||::|!\[|<)/.test(b)
const chosen = blocks.filter(isProse).slice(0, PARAGRAPHS)
if (!chosen.length) {
  console.error('no prose paragraphs found in', file)
  process.exit(1)
}

const plain = s => s
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/\*(.+?)\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\s*—\s*/g, ', ')
  .replace(/\s+/g, ' ')
  .trim()

const boldTerms = s => [...new Set([...s.matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]))]

async function storyboardWithClaude(paragraphs) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic()

  const schema = {
    type: 'object',
    properties: {
      scenes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            heading: { type: 'string', description: 'At most six words.' },
            bullets: { type: 'array', items: { type: 'string' }, description: 'Exactly three, at most five words each.' },
            narration: { type: 'string', description: 'The paragraph as spoken English: its own sentences, markdown removed, dashes turned into commas, brand names kept.' },
            svg: { type: 'string', description: 'A self-contained <svg viewBox="0 0 720 600"> illustration. Flat geometric shapes only, no text, no external references, no scripts.' }
          },
          required: ['heading', 'bullets', 'narration', 'svg'],
          additionalProperties: false
        }
      }
    },
    required: ['scenes'],
    additionalProperties: false
  }

  const system = `You storyboard paragraphs of a Salesforce CRM Analytics lesson into scenes of a narrated slide video.
One scene per paragraph, in order. The narration must stay faithful to the paragraph's own sentences: this is a
course, so do not add facts. The illustration is a flat, calm, geometric SVG in this palette only:
accent ${C.azure} (deep ${C.azureDeep}, soft ${C.azureSoft}), ink ${C.ink}, muted ${C.inkMuted}, line ${C.line},
surface ${C.sunken}, secondary ${C.iris}. Think dashboards, charts, datasets, data flowing between boxes.
The slide's heading and bullets are drawn separately, so the SVG contains no text at all.`

  const stream = client.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 64000,
    system,
    messages: [{
      role: 'user',
      content: `Lesson title: ${title}\n\nParagraphs:\n\n${paragraphs.map((p, i) => `[${i + 1}] ${p}`).join('\n\n')}`
    }],
    output_config: { format: { type: 'json_schema', schema } }
  })
  const message = await stream.finalMessage()
  if (message.stop_reason === 'refusal') {
    throw new Error(`Claude declined: ${message.stop_details?.explanation ?? 'no explanation'}`)
  }
  const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('')
  return JSON.parse(text).scenes
}

function storyboardOffline(paragraphs) {
  return paragraphs.map((p, i) => {
    const terms = boldTerms(p).slice(0, 3)
    const sentences = plain(p).split(/(?<=[.!?])\s+/)
    const bullets = terms.length >= 3
      ? terms
      : [...terms, ...sentences.map(s => s.split(' ').slice(0, 4).join(' '))].slice(0, 3)
    return {
      heading: i === 0 ? title : `${title} (${i + 1})`,
      bullets,
      narration: plain(p),
      svg: stockIllustration()
    }
  })
}

// Sources flowing into a dashboard: the one picture every CRM Analytics
// lesson is about. Used when no model is available.
function stockIllustration() {
  const cyl = (x, y, fill) => `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="14" width="96" height="74" rx="10" fill="${fill}"/>
      <ellipse cx="48" cy="14" rx="48" ry="14" fill="${C.azureSoft}" stroke="${C.azure}" stroke-width="3"/>
      <ellipse cx="48" cy="88" rx="48" ry="14" fill="${fill}"/>
      <path d="M0 14 v74" stroke="${C.azure}" stroke-width="3"/><path d="M96 14 v74" stroke="${C.azure}" stroke-width="3"/>
    </g>`
  const flow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} C ${x1 + 90} ${y1}, ${x2 - 90} ${y2}, ${x2} ${y2}" fill="none" stroke="${C.azure}" stroke-width="4" stroke-dasharray="10 12" stroke-linecap="round"/>`
  const bars = [140, 210, 170, 250, 300].map((h, i) => `<rect x="${372 + i * 52}" y="${470 - h}" width="34" height="${h}" rx="6" fill="${i === 4 ? C.iris : C.azure}" opacity="${0.55 + i * 0.1}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 600">
    <rect x="330" y="120" width="360" height="400" rx="26" fill="#FFFFFF" stroke="${C.line}" stroke-width="3"/>
    <rect x="330" y="120" width="360" height="54" rx="26" fill="${C.sunken}"/>
    <rect x="330" y="150" width="360" height="24" fill="${C.sunken}"/>
    <circle cx="362" cy="147" r="7" fill="${C.azure}"/><circle cx="386" cy="147" r="7" fill="${C.line}"/><circle cx="410" cy="147" r="7" fill="${C.line}"/>
    <rect x="360" y="200" width="140" height="56" rx="12" fill="${C.azureSoft}"/>
    <rect x="516" y="200" width="140" height="56" rx="12" fill="${C.azureSoft}"/>
    <rect x="376" y="216" width="70" height="10" rx="5" fill="${C.azure}"/><rect x="376" y="234" width="44" height="8" rx="4" fill="${C.inkFaint}"/>
    <rect x="532" y="216" width="70" height="10" rx="5" fill="${C.azure}"/><rect x="532" y="234" width="44" height="8" rx="4" fill="${C.inkFaint}"/>
    ${bars}
    <path d="M372 400 L424 360 L476 380 L528 310 L580 330 L632 270" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="632" cy="270" r="9" fill="${C.iris}"/>
    ${cyl(40, 120, C.azure)}${cyl(40, 250, C.azureDeep)}${cyl(40, 380, C.iris)}
    ${flow(140, 170, 330, 240)}${flow(140, 300, 330, 320)}${flow(140, 430, 330, 400)}
  </svg>`
}

// ---------------------------------------------------------------------------
// 4. Scene -> slide SVG -> PNG
// ---------------------------------------------------------------------------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function wrap(text, max) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines
}

function slideSvg(scene, index, total, pip) {
  // Single quotes inside: the value lands in a double-quoted XML attribute.
  const FONT = 'Inter, \'Helvetica Neue\', Helvetica, Arial, sans-serif'
  const headingLines = wrap(scene.heading, 24)
  const headingSize = headingLines.length > 2 ? 56 : 68
  const heading = headingLines.map((l, i) =>
    `<text x="140" y="${330 + i * (headingSize + 10)}" font-family="${FONT}" font-size="${headingSize}" font-weight="700" fill="${C.ink}" letter-spacing="-1">${esc(l)}</text>`).join('')
  const bulletTop = 330 + headingLines.length * (headingSize + 10) + 40
  const bullets = scene.bullets.slice(0, 3).map((b, i) => `
    <circle cx="152" cy="${bulletTop + i * 64 - 10}" r="9" fill="${C.azure}"/>
    <text x="184" y="${bulletTop + i * 64}" font-family="${FONT}" font-size="34" font-weight="500" fill="${C.inkMuted}">${esc(b)}</text>`).join('')
  // The illustration sits right; with a talking head in the corner it moves up
  // so the two never overlap.
  const artY = pip ? 120 : 240
  const inner = scene.svg.trim().startsWith('<svg') ? scene.svg : stockIllustration()
  const art = inner.replace(/<svg\b/, `<svg x="1080" y="${artY}" width="720" height="600"`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <rect width="1920" height="1080" fill="${C.canvas}"/>
    <rect x="0" y="0" width="14" height="1080" fill="${C.azure}"/>
    <g opacity="0.5">${Array.from({ length: 18 }, (_, i) => `<line x1="${1080 + i * 48}" y1="0" x2="${1080 + i * 48}" y2="1080" stroke="${C.line}" stroke-width="1"/>`).join('')}</g>
    <text x="140" y="150" font-family="${FONT}" font-size="22" font-weight="600" fill="${C.azure}" letter-spacing="4">CRM ANALYTICS ACADEMY</text>
    <text x="140" y="190" font-family="${FONT}" font-size="24" fill="${C.inkFaint}">${esc(title)}</text>
    ${heading}${bullets}
    ${art}
    <text x="140" y="1000" font-family="${FONT}" font-size="22" fill="${C.inkFaint}">Scene ${index + 1} of ${total}</text>
    <text x="1780" y="1000" text-anchor="end" font-family="${FONT}" font-size="22" fill="${C.inkFaint}">crmanalytics.imswarnil.com</text>
  </svg>`
}

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${path.basename(cmd)} ${args.map(a => (/\s/.test(a) ? JSON.stringify(a.slice(0, 60) + (a.length > 60 ? '…' : '')) : a)).join(' ')}`)
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${path.basename(cmd)} exited ${code}`))))
    child.on('error', reject)
  })
}

function capture(cmd, args) {
  return new Promise((resolve, reject) => {
    let out = ''
    const child = spawn(cmd, args)
    child.stdout.on('data', d => (out += d))
    child.on('exit', code => (code === 0 ? resolve(out.trim()) : reject(new Error(`${cmd} exited ${code}`))))
    child.on('error', reject)
  })
}

const duration = async f => Number(await capture('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log(`lesson: ${file}\nscenes: ${chosen.length} paragraph(s)\nvoice:  ${VOICE} (XTTS v2, local)\nface:   ${LIPSYNC ? FACE : 'off'}\nmodel:  ${USE_AI ? 'claude-opus-5' : 'none (offline storyboard)'}\nout:    ${OUT}\n`)

const scenes = USE_AI ? await storyboardWithClaude(chosen) : storyboardOffline(chosen)
writeFileSync(path.join(WORK, 'storyboard.json'), JSON.stringify(scenes, null, 2))

const profileDir = path.join(VOICE_ROOT, 'audio', 'training', VOICE)
const speakerClips = existsSync(profileDir)
  ? readdirSync(profileDir).filter(f => /\.(wav|mp3)$/.test(f)).sort().slice(0, 6).map(f => path.join(profileDir, f))
  : [path.join(VOICE_ROOT, 'audio', 'samples', 'sample_clean.wav')]

const tts = path.join(VOICE_ROOT, 'tts-env', 'bin', 'python3')
const w2lEnv = path.join(VOICE_ROOT, 'wav2lip-env', 'bin', 'python3')
const w2lDir = path.join(VOICE_ROOT, 'video', 'Wav2Lip')

const segments = []
for (const [i, scene] of scenes.entries()) {
  const base = path.join(WORK, `scene-${String(i + 1).padStart(2, '0')}`)
  const wav = `${base}.wav`
  const svg = `${base}.svg`
  const png = `${base}.png`
  const mp4 = `${base}.mp4`

  // 2. voice
  if (!existsSync(wav)) {
    await run(tts, [path.join(VOICE_ROOT, 'scripts', 'clone_voice.py'),
      '--text', scene.narration, '--lang', LANG, '--speaker', speakerClips.join(','), '--out', wav])
  }
  console.log(`narration: ${(await duration(wav)).toFixed(1)}s`)

  // 3. face
  let head = null
  if (LIPSYNC) {
    head = `${base}-head.mp4`
    if (!existsSync(head)) {
      const faceTrim = `${base}-face.mp4`
      // A short window, ping-ponged so the loop has no cut. Face detection is
      // the slow part of Wav2Lip, so fewer frames also means minutes saved.
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(FACE_START), '-t', String(FACE_LENGTH), '-i', FACE, '-an',
        '-filter_complex', '[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]', '-map', '[v]',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', faceTrim])
      mkdirSync(path.join(w2lDir, 'temp'), { recursive: true })
      await run(w2lEnv, ['inference.py', '--checkpoint_path', 'checkpoints/wav2lip_gan.pth',
        '--face', path.resolve(faceTrim), '--audio', path.resolve(wav), '--outfile', path.resolve(head), '--resize_factor', '2'], { cwd: w2lDir })
    }
  }

  // 4. slide
  writeFileSync(svg, slideSvg(scene, i, scenes.length, Boolean(head)))
  await run('rsvg-convert', ['-w', '1920', '-h', '1080', '-b', C.canvas, svg, '-o', png])

  // 5. scene video
  if (head) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '25', '-i', png, '-i', head, '-i', wav,
      '-filter_complex', '[1:v]scale=440:-2[pip];[0:v][pip]overlay=W-w-72:H-h-72:shortest=1[v]',
      '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '160k', '-shortest', mp4])
  } else {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '25', '-i', png, '-i', wav,
      '-c:v', 'libx264', '-tune', 'stillimage', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '160k', '-shortest', mp4])
  }
  segments.push(mp4)
}

const list = path.join(WORK, 'segments.txt')
writeFileSync(list, segments.map(s => `file '${path.resolve(s)}'`).join('\n'))
await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', OUT])
await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', OUT, '-frames:v', '1', '-q:v', '3', POSTER])

const total = await duration(OUT)
console.log(`\ndone: ${OUT} (${total.toFixed(1)}s), poster ${POSTER}`)
console.log(`\nAdd to the lesson frontmatter:\n\nclip:\n  src: /${OUT.replace(/^public\//, '')}\n  poster: /${POSTER.replace(/^public\//, '')}\n`)
