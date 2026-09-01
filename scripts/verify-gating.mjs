/**
 * Asserts that no gated lesson leaked into the public build.
 *
 * This runs after the build and fails it if it finds anything. A paywall that
 * is only enforced in the UI is not a paywall — the markdown either is or is
 * not in .output/public, and that is a fact a script can check, unlike "does
 * the page look locked", which is a fact only a human notices being wrong.
 *
 * It checks three ways, because there are three ways the content can escape:
 * the prerendered HTML, the payload JSON Nuxt emits beside it, and the content
 * SQL dumps @nuxt/content writes for client-side queries.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Recursive file walk.
 *
 * Hand-rolled rather than fs.promises.glob: that is still flagged experimental
 * on Node 22, which is what CI runs, and this script gates a live deploy. A
 * dozen lines of readdir is a better trade than an experimental API in the
 * path of the paywall check.
 */
async function walk(dir, match, out = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, match, out)
    else if (match(full)) out.push(full)
  }
  return out
}

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, '.output/public')
const GATED = path.join(ROOT, 'server/assets/gated')

/**
 * Distinctive verbatim slices of the body.
 *
 * Taken raw — no punctuation stripping. An earlier version normalised the
 * probe but not the file it searched, so "PINEAPPLE-QUARTZ-MERIDIAN" became
 * "PINEAPPLE QUARTZ MERIDIAN" and never matched the leaked copy that still
 * had its hyphens. That produced a green check over a real leak, which is
 * worse than having no check at all.
 *
 * Several probes per lesson, from different offsets, because one slice can
 * legitimately fall inside a shared boilerplate line.
 */
function probes(markdown) {
  const body = markdown.replace(/^---[\s\S]*?---/, '').trim()
  const flat = body.replace(/\s+/g, ' ')
  const out = []
  for (const frac of [0.25, 0.5, 0.75]) {
    const start = Math.floor(flat.length * frac)
    const slice = flat.slice(start, start + 60).trim()
    if (slice.length >= 30) out.push(slice)
  }
  return out
}

async function main() {
  if (!existsSync(GATED)) {
    console.log('[verify-gating] no gated content — nothing to check')
    return
  }
  if (!existsSync(PUBLIC)) {
    console.error('[verify-gating] .output/public missing — run the build first')
    process.exit(1)
  }

  const assets = (await readdir(GATED)).filter(f => f.endsWith('.json'))
  if (!assets.length) {
    console.log('[verify-gating] no gated content — nothing to check')
    return
  }

  const needles = []
  for (const file of assets) {
    const { markdown } = JSON.parse(await readFile(path.join(GATED, file), 'utf8'))
    for (const p of probes(markdown)) needles.push({ file, probe: p })
  }

  const leaks = []
  // Every text-ish file, not a chosen few: the two leaks this check was
  // written to catch were in /raw/*.md and llms-full.txt, neither of which an
  // html+json allowlist would have opened.
  const TEXTUAL = /\.(html|json|txt|sql|md|xml|js)$/i
  for (const file of await walk(PUBLIC, f => TEXTUAL.test(f))) {
    const size = (await stat(file)).size
    // The content dumps are large; read them anyway — they are the most
    // likely place for a body to be hiding.
    if (size > 60_000_000) continue
    const text = (await readFile(file, 'utf8')).replace(/\s+/g, ' ')
    for (const { file: src, probe: p } of needles) {
      if (text.includes(p)) leaks.push({ lesson: src, found_in: path.relative(PUBLIC, file) })
    }
  }

  if (leaks.length) {
    console.error(`[verify-gating] FAIL — gated content found in the public bundle:`)
    for (const l of leaks.slice(0, 20)) console.error(`  ${l.lesson}  ->  ${l.found_in}`)
    process.exit(1)
  }

  console.log(`[verify-gating] OK — ${assets.length} gated lesson(s), ${needles.length} probes, none present in .output/public`)
}

main().catch((e) => {
  console.error('[verify-gating] failed:', e)
  process.exit(1)
})
