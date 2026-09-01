/**
 * Moves gated lessons out of the public build.
 *
 * Runs before `nuxt build`. Any lesson whose frontmatter says `access: pro` is
 * copied into server/assets/gated/ — which Nitro bundles into the server, not
 * into .output/public — and its route is written to .gated-routes.json so the
 * prerenderer can skip it.
 *
 * This is the actual paywall. Everything in the client is presentation: if the
 * markdown reaches the static bundle, it is public no matter what the UI
 * draws over it, because "view source" is a button on every browser. So the
 * test this script has to pass is not "does the lesson look locked" but "is
 * the text absent from .output/public", which scripts/verify-gating.mjs
 * asserts after the build.
 */
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import path from 'node:path'

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
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'server/assets/gated')
const ROUTES = path.join(ROOT, '.gated-routes.json')

/** Minimal frontmatter read — enough to find `access` and `mux`. */
function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return out
}

/**
 * content/en/1.foundations/3.saql.md -> /foundations/saql
 * Numeric ordering prefixes and the locale segment are both stripped, matching
 * how [...slug].vue maps a route to a content path.
 */
function toRoute(file) {
  const rel = path.relative(CONTENT, file).replace(/\.md$/, '')
  const parts = rel.split(path.sep).map(p => p.replace(/^\d+\./, ''))
  const locale = parts.shift()
  const route = '/' + parts.join('/')
  return { locale, route: route.replace(/\/index$/, '') || '/' }
}

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const gated = new Set()
  let count = 0

  for (const file of await walk(CONTENT, f => f.endsWith('.md'))) {
    const raw = await readFile(file, 'utf8')
    const fm = frontmatter(raw)
    if (fm.access !== 'pro') continue

    const { locale, route } = toRoute(file)
    // One asset per locale+route, keyed the way the API looks it up.
    const key = `${locale}${route}`.replace(/^\//, '').replace(/\//g, ':')
    await writeFile(
      path.join(OUT, `${key}.json`),
      JSON.stringify({ access: 'pro', mux: fm.mux ?? null, markdown: raw }),
      'utf8'
    )

    // Both the unprefixed default-locale route and the prefixed one, since
    // the prerenderer would otherwise still emit /es/<route>.
    gated.add(locale === 'en' ? route : `/${locale}${route}`)
    if (locale === 'en') gated.add(`/en${route}`)
    count += 1
  }

  await writeFile(ROUTES, JSON.stringify([...gated].sort(), null, 2), 'utf8')
  console.log(`[gate-content] ${count} gated lesson(s) -> server/assets/gated/`)
  console.log(`[gate-content] ${gated.size} route(s) excluded from prerender`)
}

main().catch((e) => {
  console.error('[gate-content] failed:', e)
  process.exit(1)
})
