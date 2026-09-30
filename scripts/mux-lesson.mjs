/**
 * Upload a lesson video to Mux and wire it into the lesson.
 *
 *   pnpm mux:lesson <lesson> <video.mp4> [--lang=en] [--test]
 *
 *   <lesson>   a route (/saql/functions) or a file under content/en
 *   --lang     which language this recording is in (default en). One lesson
 *              can carry a recording per language; the player picks the
 *              reader's and falls back to English.
 *   --test     a Mux test asset: watermarked, 10s, deleted after 24h
 *
 * Uses the Mux CLI's stored login (`mux login`), so no keys live in this
 * repo. The playback policy follows the lesson: a Pro lesson's video is
 * uploaded `signed` (useless without the short-lived token /api/lesson mints
 * after checking entitlement), a free lesson's is `public`.
 *
 * The playback id is written into the ENGLISH lesson's frontmatter as
 * `mux: { <lang>: <id> }` — the only file edited by hand; every translation
 * reads its videos from there.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseDocument } from 'yaml'

const args = process.argv.slice(2)
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')).map(([k, v]) => [k, v ?? true]))
const [lessonArg, video] = args.filter(a => !a.startsWith('--'))
const lang = String(flags.lang || 'en')

if (!lessonArg || !video) {
  console.error('usage: pnpm mux:lesson <lesson route or file> <video file> [--lang=en] [--test]')
  process.exit(1)
}
if (!existsSync(video)) {
  console.error(`No such video: ${video}`)
  process.exit(1)
}

const EN = path.resolve('content/en')
const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')

/** /saql/functions → content/en/07.saql/03.functions.md ; /saql → …/01.index.md */
function resolveLesson(arg) {
  if (arg.endsWith('.md') && existsSync(arg)) return path.resolve(arg)
  const [section, lesson = 'index'] = arg.replace(/^\/|\/$/g, '').split('/')
  const dir = readdirSync(EN).find(d => statSync(path.join(EN, d)).isDirectory() && strip(d) === section)
  const file = dir && readdirSync(path.join(EN, dir)).find(f => f.endsWith('.md') && strip(f) === lesson)
  if (!file) throw new Error(`No English lesson for ${arg}`)
  return path.join(EN, dir, file)
}

const file = resolveLesson(lessonArg)
const raw = readFileSync(file, 'utf8')
const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
if (!m) throw new Error(`${file} has no frontmatter`)
const doc = parseDocument(m[1])
const access = doc.get('access') === 'pro' ? 'pro' : 'free'
const policy = access === 'pro' ? 'signed' : 'public'
const route = path.relative(EN, file).split(path.sep).map(strip).join('/').replace(/\/index$/, '')

console.log(`Uploading ${video} → /${route} (${lang}, ${access} lesson, ${policy} playback)…`)
const cli = [
  'assets', 'create', '--upload', video,
  '-p', policy,
  '--passthrough', `lesson:/${route}:${lang}`,
  '--video-quality', 'basic',
  '--wait', '--json', '-y',
  ...(flags.test ? ['--test'] : [])
]
let out
try {
  out = execFileSync('mux', cli, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] })
} catch {
  console.error('\nThe Mux CLI failed. Logged in? Run `mux login` (token from dashboard.mux.com → Settings → Access Tokens).')
  process.exit(1)
}

// The CLI prints one JSON document (or one per uploaded file).
const start = out.search(/[[{]/)
const json = JSON.parse(out.slice(start))
const asset = Array.isArray(json) ? json[0] : json
const playbackId = (asset.playback_ids ?? asset.asset?.playback_ids ?? []).find(p => p.policy === policy)?.id
  ?? (asset.playback_ids ?? asset.asset?.playback_ids ?? [])[0]?.id
if (!playbackId) {
  console.error('Uploaded, but no playback id came back:', JSON.stringify(asset).slice(0, 400))
  process.exit(1)
}

// Frontmatter: `mux` becomes a per-language map (an old single-string value is
// English). Edited through the YAML document so the rest keeps its formatting.
const current = doc.get('mux')
const existing = typeof current === 'string' ? { en: current } : (current?.toJSON?.() ?? {})
doc.set('mux', { ...existing, [lang]: playbackId })
const yaml = doc.toString({ lineWidth: 0 }).trimEnd()
writeFileSync(file, `---\n${yaml}\n---\n${m[2]}`)

console.log(`\n✓ asset ${asset.id ?? asset.asset?.id}  playback ${playbackId} (${policy})`)
console.log(`✓ ${path.relative(process.cwd(), file)} → mux.${lang}`)
if (policy === 'signed') console.log('  Pro video: the Worker needs MUX_SIGNING_KEY_ID / MUX_SIGNING_KEY_SECRET (mux signing-keys create).')
