#!/usr/bin/env node
/**
 * Translate the English source of truth into every other locale.
 *
 *   pnpm translate                     # everything that changed
 *   pnpm translate --locales=es,fr     # only these locales
 *   pnpm translate --only=ui           # only i18n/locales/*.json
 *   pnpm translate --only=content      # only content/en/**
 *   pnpm translate --force             # ignore the manifest, redo everything
 *   pnpm translate --dry-run           # report what would change, write nothing
 *
 * English is the only language anyone edits. Everything under content/<locale>/
 * for locale != en, and every i18n/locales/*.json except en.json, is generated
 * output — edit the English file and re-run.
 *
 * See scripts/markdown-protect.mjs for why translation goes through HTML rather
 * than raw markdown, and scripts/i18n.config.mjs for the locale and glossary
 * configuration.
 */

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { fromTranslatedHtml, toTranslatableHtml } from './markdown-protect.mjs'
import {
  BATCH_SIZE,
  CHAR_LIMIT,
  CONCURRENCY,
  DEFAULT_ENDPOINT,
  NATIVE_NAMES,
  SOURCE_LOCALE,
  TARGET_LOCALES,
  TRANSLATABLE_KEYS
} from './i18n.config.mjs'

/**
 * Re-serialisation style for YAML we rewrite (frontmatter and MDC block data).
 * The source content quotes every string and leaves numbers bare; matching that
 * keeps translated files diff-clean against their English original instead of
 * showing a spurious change on every quoted line.
 */
const YAML_OPTS = { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(ROOT, 'content')
const LOCALES_DIR = join(ROOT, 'i18n', 'locales')
const MANIFEST = join(ROOT, '.translation-manifest.json')

const ENDPOINT = (process.env.LIBRETRANSLATE_URL || DEFAULT_ENDPOINT).replace(/\/$/, '')
const API_KEY = process.env.LIBRETRANSLATE_API_KEY || ''

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const flag = name => argv.includes(`--${name}`)
const opt = (name, fallback) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const FORCE = flag('force')
const DRY_RUN = flag('dry-run')
const ONLY = opt('only', 'all')
// Translate at most N content files per locale. For trying a change out on a
// couple of pages before committing to a full multi-hour run.
const LIMIT = Number(opt('limit', Infinity))
const LOCALES = opt('locales', Object.keys(TARGET_LOCALES).join(','))
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

for (const l of LOCALES) {
  if (!TARGET_LOCALES[l]) {
    console.error(`Unknown locale "${l}". Known: ${Object.keys(TARGET_LOCALES).join(', ')}`)
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// LibreTranslate client
// ---------------------------------------------------------------------------

let apiCalls = 0
let apiChars = 0
let incompleteTotal = 0

/**
 * Translate a batch of HTML fragments. Returns an array the same length as the
 * input; an entry is `null` when the server could not be reached, which callers
 * treat as "keep the English text".
 */
async function translateBatch(fragments, target, attempt = 1) {
  if (!fragments.length) return []

  const body = {
    q: fragments,
    source: SOURCE_LOCALE,
    target,
    format: 'html',
    ...(API_KEY ? { api_key: API_KEY } : {})
  }

  try {
    const res = await fetch(`${ENDPOINT}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000)
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)

    const json = await res.json()
    const out = Array.isArray(json.translatedText) ? json.translatedText : [json.translatedText]
    if (out.length !== fragments.length) throw new Error(`expected ${fragments.length} results, got ${out.length}`)

    apiCalls++
    apiChars += fragments.reduce((n, f) => n + f.length, 0)
    return out
  } catch (err) {
    if (attempt >= 4) {
      console.warn(`    ! giving up on a batch of ${fragments.length} (${err.message})`)
      return fragments.map(() => null)
    }
    // Back off, then halve the batch: an oversized or malformed single fragment
    // shouldn't cost the whole batch.
    await new Promise(r => setTimeout(r, 500 * 2 ** attempt))
    if (fragments.length > 1) {
      const mid = Math.ceil(fragments.length / 2)
      const [a, b] = await Promise.all([
        translateBatch(fragments.slice(0, mid), target, attempt + 1),
        translateBatch(fragments.slice(mid), target, attempt + 1)
      ])
      return [...a, ...b]
    }
    return translateBatch(fragments, target, attempt + 1)
  }
}

/**
 * Translate many unique strings, packed into batches that respect the server's
 * per-request character limit. Returns a Map of source → translation.
 */
async function translateAll(strings, target) {
  const unique = [...new Set(strings)].filter(s => s.trim())
  const batches = []
  let batch = []
  let size = 0

  for (const s of unique) {
    // A single fragment over the limit goes out alone; the server truncates it
    // rather than erroring, and splitting mid-sentence would be worse.
    if (batch.length && (size + s.length > CHAR_LIMIT || batch.length >= BATCH_SIZE)) {
      batches.push(batch)
      batch = []
      size = 0
    }
    batch.push(s)
    size += s.length
  }
  if (batch.length) batches.push(batch)

  const results = new Map()
  let cursor = 0

  const worker = async () => {
    while (cursor < batches.length) {
      const b = batches[cursor++]
      const out = await translateBatch(b, target)
      b.forEach((src, i) => results.set(src, out[i]))
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length) }, worker))
  return results
}

/**
 * Whether a file translated cleanly enough to be recorded as done.
 *
 * This matters more than it looks. The manifest is what makes reruns cheap, but
 * a file that fell back to English — because the network dropped mid-run, or the
 * engine returned broken markup — must NOT be recorded, or the English text is
 * baked in permanently and every future run skips it. A dropped connection
 * should cost a retry, not a silently monolingual page.
 */
function translatedCleanly(kept) {
  return kept === 0
}

// ---------------------------------------------------------------------------
// Markdown block parsing
//
// The English content is not hard-wrapped — one paragraph is one line — so a
// line is the natural translation unit and also the unit that gives the engine
// the most context. Every line is classified as either verbatim (code, MDC
// markers, rules) or as a structural prefix plus translatable prose, so list
// markers, heading levels and indentation are reproduced exactly.
// ---------------------------------------------------------------------------

const FENCE_RE = /^\s*(```|~~~)/
const HEADING_RE = /^(\s{0,3}#{1,6}\s+)(.*)$/
const LIST_RE = /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/
const QUOTE_RE = /^(\s*>\s?)(.*)$/
const RULE_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/
const MDC_OPEN_RE = /^\s*::[a-z][a-z0-9-]*/
const MDC_CLOSE_RE = /^\s*::\s*$/
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/
const TABLE_SEP_RE = /^\s*\|[\s:|-]+\|\s*$/

/**
 * Split a markdown body into segments. Each segment is either
 * `{ verbatim: string }` or `{ prefix, text, suffix }` where `text` is prose to
 * translate.
 */
export function parseBody(body) {
  const lines = body.split('\n')
  const segments = []
  let inFence = false
  let inMdcYaml = false
  let mdcYamlBuffer = null
  let expectMdcYaml = false

  for (const line of lines) {
    // Fenced code: never touched, including the fence lines themselves.
    if (FENCE_RE.test(line)) {
      inFence = !inFence
      segments.push({ verbatim: line })
      continue
    }
    if (inFence) {
      segments.push({ verbatim: line })
      continue
    }

    // The YAML payload of an MDC block (`::lesson-cards` … `---` … `---` … `::`).
    if (inMdcYaml) {
      if (/^\s*---\s*$/.test(line)) {
        inMdcYaml = false
        segments.push({ yaml: mdcYamlBuffer.join('\n') })
        segments.push({ verbatim: line })
        mdcYamlBuffer = null
      } else {
        mdcYamlBuffer.push(line)
      }
      continue
    }
    if (expectMdcYaml) {
      expectMdcYaml = false
      if (/^\s*---\s*$/.test(line)) {
        inMdcYaml = true
        mdcYamlBuffer = []
        segments.push({ verbatim: line })
        continue
      }
    }

    // MDC markers: the component name and its props are code, not prose.
    if (MDC_OPEN_RE.test(line)) {
      segments.push({ verbatim: line })
      expectMdcYaml = true
      continue
    }
    if (MDC_CLOSE_RE.test(line) || RULE_RE.test(line) || !line.trim()) {
      segments.push({ verbatim: line })
      continue
    }

    // Tables: keep the pipes and the alignment row, translate the cells.
    if (TABLE_ROW_RE.test(line)) {
      if (TABLE_SEP_RE.test(line)) {
        segments.push({ verbatim: line })
      } else {
        segments.push({ tableCells: line })
      }
      continue
    }

    const structural = HEADING_RE.exec(line) || LIST_RE.exec(line) || QUOTE_RE.exec(line)
    if (structural) {
      if (structural[2].trim()) {
        segments.push({ prefix: structural[1], text: structural[2] })
      } else {
        segments.push({ verbatim: line })
      }
      continue
    }

    segments.push({ prefix: '', text: line })
  }

  return segments
}

/** Collect every prose string a set of segments needs translated. */
function collectStrings(segments, out = []) {
  for (const seg of segments) {
    if (seg.text) out.push(seg.text)
    else if (seg.tableCells) splitRow(seg.tableCells).cells.forEach(c => c.trim() && out.push(c.trim()))
    else if (seg.yaml) collectYamlStrings(safeYaml(seg.yaml), out)
  }
  return out
}

function splitRow(line) {
  const trimmed = line.trim()
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '')
  return { indent: line.slice(0, line.indexOf('|')), cells: inner.split('|') }
}

function safeYaml(src) {
  try {
    return parseYaml(src)
  } catch {
    return null
  }
}

function collectYamlStrings(node, out) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    node.forEach(n => collectYamlStrings(n, out))
    return out
  }
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string' && TRANSLATABLE_KEYS.includes(key)) out.push(value)
    else collectYamlStrings(value, out)
  }
  return out
}

function applyYamlStrings(node, lookup) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(n => applyYamlStrings(n, lookup))
  const out = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = typeof value === 'string' && TRANSLATABLE_KEYS.includes(key)
      ? (lookup(value) ?? value)
      : applyYamlStrings(value, lookup)
  }
  return out
}

/** Rebuild a markdown body from its segments, substituting translated prose. */
export function renderBody(segments, lookup) {
  return segments.map((seg) => {
    if (seg.verbatim !== undefined) return seg.verbatim
    if (seg.text !== undefined) return seg.prefix + (lookup(seg.text) ?? seg.text)
    if (seg.tableCells !== undefined) {
      const { indent, cells } = splitRow(seg.tableCells)
      const translated = cells.map((c) => {
        const t = c.trim()
        if (!t) return c
        const v = lookup(t)
        return v ? ` ${v} ` : c
      })
      return `${indent}|${translated.join('|')}|`
    }
    if (seg.yaml !== undefined) {
      const parsed = safeYaml(seg.yaml)
      if (!parsed) return seg.yaml
      return stringifyYaml(applyYamlStrings(parsed, lookup), YAML_OPTS).trimEnd()
    }
    return ''
  }).join('\n')
}

// ---------------------------------------------------------------------------
// Translation of one markdown document
// ---------------------------------------------------------------------------

export function splitFrontmatter(raw) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(raw)
  if (!m) return { frontmatter: null, body: raw }
  return { frontmatter: m[1], body: raw.slice(m[0].length) }
}

async function translateMarkdown(raw, target) {
  const { frontmatter, body } = splitFrontmatter(raw)
  const fm = frontmatter ? safeYaml(frontmatter) : null
  const segments = parseBody(body)

  const strings = collectStrings(segments)
  if (fm) collectYamlStrings(fm, strings)

  // Protect each string, translate the protected HTML, then restore.
  const atomsBySource = new Map()
  const htmlBySource = new Map()
  for (const s of strings) {
    if (htmlBySource.has(s)) continue
    const atoms = []
    htmlBySource.set(s, toTranslatableHtml(s, atoms))
    atomsBySource.set(s, atoms)
  }

  const translatedHtml = await translateAll([...htmlBySource.values()], target)

  let kept = 0
  const finalBySource = new Map()
  for (const [source, html] of htmlBySource) {
    const out = translatedHtml.get(html)
    const restored = out == null ? null : fromTranslatedHtml(out, atomsBySource.get(source))
    // A null restore means the engine broke the markup. Falling back to the
    // English line keeps the page valid; a corrupted line would not.
    if (restored == null) kept++
    finalBySource.set(source, restored ?? source)
  }

  const lookup = s => finalBySource.get(s)
  const outBody = renderBody(segments, lookup)
  const outFm = fm ? applyYamlStrings(fm, lookup) : null

  const head = outFm ? `---\n${stringifyYaml(outFm, YAML_OPTS).trimEnd()}\n---\n` : ''
  return { text: head + outBody, kept, total: htmlBySource.size }
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(full))
    else out.push(full)
  }
  return out
}

const sha = s => createHash('sha256').update(s).digest('hex').slice(0, 16)

/** Recorded in place of a hash when a key failed, so the next run retries it. */
const FAILED_MARK = 'failed'

/**
 * Persist the manifest as work completes, not only at the end.
 *
 * A full run takes hours, and writing the manifest once at the end meant that
 * interrupting it — or the translation server falling over mid-run — threw away
 * the record of every file already done, so the next run redid all of them.
 * Saving after each file makes the run resumable at the cost of one small write.
 */
let manifestSaving = null
async function saveManifest(manifest) {
  if (DRY_RUN) return
  // Serialise writes so two saves can never interleave into a corrupt file.
  manifestSaving = (manifestSaving ?? Promise.resolve())
    .then(() => writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`))
    .catch(err => console.warn(`    ! could not write manifest: ${err.message}`))
  return manifestSaving
}

async function loadManifest() {
  if (FORCE || !existsSync(MANIFEST)) return {}
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'))
  } catch {
    return {}
  }
}

async function write(path, text) {
  if (DRY_RUN) return
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text.endsWith('\n') ? text : `${text}\n`)
}

// ---------------------------------------------------------------------------
// UI strings (i18n/locales/*.json)
// ---------------------------------------------------------------------------

/**
 * Walk a message tree, applying `fn` to every leaf string, and return a value of
 * exactly the same shape.
 *
 * Shape preservation is the whole point. An earlier version flattened the tree
 * to dotted paths and rebuilt it from scratch, which silently turned every array
 * into an object with numeric keys — `home.outcomes` became `{"0": …, "1": …}`
 * and the home page died with "tm(...).map is not a function" in every
 * regenerated locale. Mirroring the English structure makes that class of bug
 * impossible.
 */
function mapMessages(node, fn, trail = []) {
  if (typeof node === 'string') return fn(node, trail.join('.'))
  if (Array.isArray(node)) return node.map((v, i) => mapMessages(v, fn, [...trail, String(i)]))
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = mapMessages(v, fn, [...trail, k])
    return out
  }
  return node
}

async function translateUi(manifest) {
  const enPath = join(LOCALES_DIR, `${SOURCE_LOCALE}.json`)
  const en = JSON.parse(await readFile(enPath, 'utf8'))

  for (const locale of LOCALES) {
    const target = TARGET_LOCALES[locale]
    const outPath = join(LOCALES_DIR, `${locale}.json`)
    const key = `ui:${locale}`

    // Existing translations are kept. Most of these locales were translated
    // before this pipeline existed and a machine pass would be a downgrade, so
    // only keys that are missing, or whose English text has since changed, are
    // sent to the engine. `--force` re-translates everything.
    const existing = existsSync(outPath) ? JSON.parse(await readFile(outPath, 'utf8')) : {}
    const hashes = (!FORCE && manifest[key]) || {}

    const current = new Map()
    mapMessages(existing, (value, path) => {
      current.set(path, value)
      return value
    })

    const isStale = (source, path) => {
      if (FORCE) return true
      const have = current.get(path)
      if (typeof have !== 'string' || !have) return true
      // No recorded hash means the value predates the pipeline: trust it.
      if (!hashes[path]) return false
      // FAILED_MARK never equals a real hash, so a key that fell back to English
      // is always stale and gets retried. Deleting the hash instead would hand
      // the key back to the "no hash = trust it" rule above, which cannot tell a
      // human translation from an English fallback written seconds ago — that is
      // how a network blip left Chinese permanently showing English strings.
      return hashes[path] !== sha(source)
    }

    const stale = new Set()
    mapMessages(en, (source, path) => {
      if (isStale(source, path)) stale.add(path)
      return source
    })

    if (!stale.size) {
      console.log(`  ui ${locale}: up to date`)
      continue
    }

    const atomsBySource = new Map()
    const htmlBySource = new Map()
    mapMessages(en, (source, path) => {
      if (stale.has(path) && !htmlBySource.has(source)) {
        const atoms = []
        htmlBySource.set(source, toTranslatableHtml(source, atoms))
        atomsBySource.set(source, atoms)
      }
      return source
    })

    const translated = await translateAll([...htmlBySource.values()], target)

    const nextHashes = { ...hashes }
    let kept = 0
    let done = 0

    const out = mapMessages(en, (source, path) => {
      if (!stale.has(path)) return current.get(path) ?? source

      const raw = translated.get(htmlBySource.get(source))
      const restored = raw == null ? null : fromTranslatedHtml(raw, atomsBySource.get(source))

      if (restored == null) {
        kept++
        nextHashes[path] = FAILED_MARK
        // Fall back to an existing translation before falling back to English.
        return current.get(path) ?? source
      }

      done++
      nextHashes[path] = sha(source)
      return restored
    })

    // The locale's own name is authored, not translated — see NATIVE_NAMES.
    if (NATIVE_NAMES[locale] && typeof out.language === 'string') out.language = NATIVE_NAMES[locale]

    await write(outPath, JSON.stringify(out, null, 2))
    if (!DRY_RUN) {
      manifest[key] = nextHashes
      await saveManifest(manifest)
    }
    if (kept) incompleteTotal++
    console.log(`  ui ${locale}: ${done} translated, ${current.size - stale.size >= 0 ? current.size : 0} kept${kept ? `, ${kept} failed` : ''}`)
  }
}

// ---------------------------------------------------------------------------
// Content (content/en/** → content/<locale>/**)
// ---------------------------------------------------------------------------

async function translateContent(manifest) {
  const sourceDir = join(CONTENT_DIR, SOURCE_LOCALE)
  const files = (await walk(sourceDir)).filter(f => /\.(md|ya?ml)$/.test(f))

  for (const locale of LOCALES) {
    const target = TARGET_LOCALES[locale]
    let done = 0
    let skipped = 0
    let keptTotal = 0
    let incomplete = 0

    for (const file of files) {
      const rel = relative(sourceDir, file)
      const outPath = join(CONTENT_DIR, locale, rel)
      const raw = await readFile(file, 'utf8')
      const hash = sha(raw)
      const key = `${locale}:${rel}`

      if (!FORCE && manifest[key] === hash && existsSync(outPath)) {
        skipped++
        continue
      }
      if (done >= LIMIT) break

      let clean = true

      if (rel.endsWith('.yml') || rel.endsWith('.yaml')) {
        // .navigation.yml — translate `title`, leave `icon` alone.
        const parsed = safeYaml(raw)
        if (!parsed) continue
        const strings = collectYamlStrings(parsed, [])
        const atomsBySource = new Map()
        const htmlBySource = new Map()
        for (const s of strings) {
          const atoms = []
          htmlBySource.set(s, toTranslatableHtml(s, atoms))
          atomsBySource.set(s, atoms)
        }
        const translated = await translateAll([...htmlBySource.values()], target)
        const lookup = (s) => {
          const raw2 = translated.get(htmlBySource.get(s))
          const restored = raw2 == null ? null : fromTranslatedHtml(raw2, atomsBySource.get(s))
          if (restored == null) clean = false
          return restored
        }
        await write(outPath, stringifyYaml(applyYamlStrings(parsed, lookup), YAML_OPTS))
      } else {
        const { text, kept } = await translateMarkdown(raw, target)
        keptTotal += kept
        clean = translatedCleanly(kept)
        await write(outPath, text)
      }

      // Only a fully translated file earns a manifest entry; anything that fell
      // back to English is left unrecorded so the next run retries it.
      if (clean) {
        manifest[key] = hash
        await saveManifest(manifest)
      } else {
        incomplete++
      }
      done++
      process.stdout.write(`\r  ${locale}: ${done} translated, ${skipped} unchanged   `)
    }

    process.stdout.write(`\r  ${locale}: ${done} translated, ${skipped} unchanged${keptTotal ? `, ${keptTotal} lines kept in English across ${incomplete} file(s) — rerun to retry` : ''}          \n`)
    if (incomplete) incompleteTotal += incomplete
  }
}

// ---------------------------------------------------------------------------

async function main() {
  // The endpoint is not in the repository (it is a keyless instance and the
  // repo is public), so an unset variable is the most likely first-run problem.
  // Say so plainly instead of retrying five times against an empty URL.
  if (!ENDPOINT) {
    console.error('LIBRETRANSLATE_URL is not set.')
    console.error('  local: add it to .env  (see .env.example)')
    console.error('  CI:    repository variable LIBRETRANSLATE_URL')
    process.exit(1)
  }

  console.log(`LibreTranslate: ${ENDPOINT}`)

  // The endpoint is reachable but not always instantly, so probe with retries
  // rather than aborting the whole run on one dropped connection.
  let settings = null
  for (let attempt = 1; attempt <= 5 && !settings; attempt++) {
    settings = await fetch(`${ENDPOINT}/frontend/settings`, { signal: AbortSignal.timeout(20_000) })
      .then(r => r.json())
      .catch(() => null)
    if (!settings) {
      if (attempt === 5) break
      console.warn(`  unreachable, retrying (${attempt}/5)…`)
      await new Promise(r => setTimeout(r, 3000 * attempt))
    }
  }
  if (!settings) {
    console.error(`Cannot reach ${ENDPOINT}. Set $LIBRETRANSLATE_URL or start the server.`)
    process.exit(1)
  }
  if (settings.keyRequired && !API_KEY) {
    console.error('This server requires an API key. Set $LIBRETRANSLATE_API_KEY.')
    process.exit(1)
  }

  console.log(`Locales: ${LOCALES.join(', ')}${DRY_RUN ? '  (dry run)' : ''}\n`)

  const manifest = await loadManifest()

  if (ONLY === 'all' || ONLY === 'ui') {
    console.log('UI strings')
    await translateUi(manifest)
  }
  if (ONLY === 'all' || ONLY === 'content') {
    console.log('\nContent')
    await translateContent(manifest)
  }

  await saveManifest(manifest)
  await manifestSaving

  console.log(`\nDone. ${apiCalls} API calls, ${(apiChars / 1000).toFixed(1)}k characters.`)

  if (incompleteTotal) {
    console.warn(`\n${incompleteTotal} file(s) fell back to English and were left out of the manifest. Re-run to retry them.`)
    process.exitCode = 2
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
