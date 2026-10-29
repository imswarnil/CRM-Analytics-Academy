#!/usr/bin/env node
/**
 * Fails the build if any members-only lesson text is public.
 *
 * For every gated lesson (server/assets/gated/**), takes a few sentences from
 * past the teaser and searches .output/public for them — every text file, and
 * the content dumps (dump.*.sql, sql_dump.txt: base64 of gzip) decoded.
 * Run at the end of `pnpm build`.
 */
import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import path from 'node:path'

const ROOT = process.cwd()
const ASSETS = path.join(ROOT, 'server', 'assets', 'gated')
const PUBLIC = path.join(ROOT, '.output', 'public')
if (!existsSync(ASSETS)) {
  console.log('[verify-gating] nothing gated')
  process.exit(0)
}

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, out)
    else out.push(p)
  }
  return out
}

// Text that is legitimately public: every lesson file that is NOT gated. A
// sentence a Pro lesson shares with a free one is not a leak.
const GATED = new Set(JSON.parse(await readFile(path.join(ROOT, '.gated-files.json'), 'utf8').catch(() => '[]')))
const norm = s => s.replace(/[*_`[\]()]/g, '').replace(/\s+/g, ' ')
let freeText = ''
for (const f of await walk(path.join(ROOT, 'content'))) {
  if (f.endsWith('.md') && !GATED.has(path.relative(path.join(ROOT, 'content'), f))) freeText += norm(await readFile(f, 'utf8'))
}

// Probes: plain-prose sentences from the third paragraph on (the stub keeps
// the first two), long enough to be unique.
const probes = []
for (const f of await walk(ASSETS)) {
  const { markdown } = JSON.parse(await readFile(f, 'utf8'))
  const paras = markdown.split(/\n{2,}/).map(s => s.trim())
    .filter(s => s && !/^(#|::|:::|```|\||!\[|<|-\s|\d+\.\s|>)/.test(s))
  for (const p of paras.slice(2, 5)) {
    const plain = p.replace(/[*_`[\]()]/g, '').replace(/\s+/g, ' ')
    if (plain.length >= 50 && !freeText.includes(plain.slice(0, 50))) probes.push({ file: path.relative(ASSETS, f), text: plain.slice(0, 50) })
  }
}

const decode = (raw) => {
  try {
    return gunzipSync(Buffer.from(raw.trim(), 'base64')).toString('utf8')
  } catch {
    return raw
  }
}
const haystacks = []
for (const f of await walk(PUBLIC)) {
  if (!/\.(html|json|js|txt|md|sql|xml)$/.test(f)) continue
  const raw = await readFile(f, 'utf8')
  const text = /dump\.[a-z]+\.sql$|sql_dump\.txt$/.test(f) ? decode(raw) : raw
  haystacks.push({ f, text: text.replace(/[*_`[\]()]/g, '').replace(/\s+/g, ' ') })
}

const leaks = []
for (const p of probes) {
  const hit = haystacks.find(h => h.text.includes(p.text))
  if (hit) leaks.push(`${p.file} → ${path.relative(ROOT, hit.f)}: "${p.text}"`)
}
if (leaks.length) {
  console.error(`[verify-gating] ${leaks.length} members-only passage(s) are public:\n  ${leaks.slice(0, 10).join('\n  ')}`)
  process.exit(1)
}
console.log(`[verify-gating] ${probes.length} probe(s) from ${new Set(probes.map(p => p.file)).size} gated file(s): nothing public`)
