/**
 * English lessons on disk: route ⇄ file, frontmatter read/write, the lesson's
 * single Mux playback id. Shared by the video pipeline, the captions sync and
 * gate-content so "which file is /saql/functions" has one answer.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml, parseDocument } from 'yaml'

export const ROOT = process.cwd()
export const CONTENT = path.join(ROOT, 'content')
export const EN = path.join(CONTENT, 'en')
/** Tracked transcripts: content-transcripts/<locale>/<route>.vtt. Outside content/ on purpose. */
export const TRANSCRIPTS = path.join(ROOT, 'content-transcripts')

const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')

/** content/<locale>/07.saql/03.functions.md → { locale: 'en', route: '/saql/functions' } */
export function fileToRoute(file) {
  const parts = path.relative(CONTENT, file).split(path.sep).map(strip)
  const locale = parts.shift()
  return { locale, route: ('/' + parts.join('/')).replace(/\/index$/, '') || '/' }
}

/** /saql/functions → content/en/07.saql/03.functions.md ; /saql → …/01.index.md ; a path to an .md passes through. */
export function resolveLesson(arg) {
  if (arg.endsWith('.md') && existsSync(arg)) return path.resolve(arg)
  const [section, lesson = 'index'] = arg.replace(/^\/|\/$/g, '').split('/')
  const dir = readdirSync(EN).find(d => statSync(path.join(EN, d)).isDirectory() && strip(d) === section)
  const file = dir && readdirSync(path.join(EN, dir)).find(f => f.endsWith('.md') && strip(f) === lesson)
  if (!file) throw new Error(`No English lesson for "${arg}". Use a route like /saql/functions or a content/en/… file.`)
  return path.join(EN, dir, file)
}

/** Every English lesson file, sorted in curriculum order. */
export function englishLessons() {
  const out = []
  for (const d of readdirSync(EN).sort()) {
    const dir = path.join(EN, d)
    if (!statSync(dir).isDirectory()) continue
    for (const f of readdirSync(dir).sort()) if (f.endsWith('.md')) out.push(path.join(dir, f))
  }
  return out
}

export function splitFile(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { yaml: '', data: {}, body: raw }
  return { yaml: m[1], data: parseYaml(m[1]) ?? {}, body: m[2] }
}

export function readLesson(file) {
  const raw = readFileSync(file, 'utf8')
  return { file, raw, ...splitFile(raw), ...fileToRoute(file) }
}

/**
 * The lesson's ONE playback id. `mux` is a single string now; the old
 * per-language map is still read, but only its `en` entry is used — one
 * video per lesson, captions carry the languages.
 */
export function muxIdOf(mux, onLegacy) {
  if (!mux) return undefined
  if (typeof mux === 'string') return mux
  if (typeof mux === 'object') {
    onLegacy?.(mux)
    return mux.en ?? Object.values(mux)[0]
  }
  return undefined
}

/** Set one top-level frontmatter key in the English file, keeping the rest of the YAML as written. */
export function setFrontmatter(file, key, value) {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error(`${file} has no frontmatter`)
  const doc = parseDocument(m[1])
  doc.set(key, value)
  writeFileSync(file, `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${m[2]}`)
}

export function transcriptPath(locale, route) {
  return path.join(TRANSCRIPTS, locale, `${route === '/' ? 'index' : route.replace(/^\//, '')}.vtt`)
}

/** CLI flags: --a=b / --flag → { a: 'b', flag: true }; positionals separately. */
export function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, ...v] = a.slice(2).split('=')
      flags[k] = v.length ? v.join('=') : true
    } else positional.push(a)
  }
  return { flags, positional }
}
