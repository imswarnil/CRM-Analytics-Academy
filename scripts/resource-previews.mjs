/**
 * Preview images for /resources: fetches each link's page once, reads its
 * og:image (or twitter:image), and writes app/data/resource-previews.json —
 * committed, so the page shows thumbnails without a single Worker request.
 * Run by `pnpm build` locally (prebuild) and safe to re-run; a link that
 * fails keeps its previous image. CI skips it (no network guarantees).
 *
 *   node scripts/resource-previews.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const PAGE = 'app/pages/resources.vue'
const OUT = 'app/data/resource-previews.json'
const urls = [...readFileSync(PAGE, 'utf8').matchAll(/url: '(https:[^']+)'/g)].map(m => m[1])
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const out = { ...old }

const pick = (html, base) => {
  const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*>/i)
  const c = m?.[0].match(/content=["']([^"']+)["']/i)?.[1]
  if (!c) return null
  try {
    const u = new URL(c.replace(/&amp;/g, '&'), base)
    return u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

await Promise.all(urls.map(async (url) => {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (CRM Analytics Academy link preview)' }, signal: AbortSignal.timeout(10_000), redirect: 'follow' })
    const html = (await res.text()).slice(0, 300_000)
    const img = pick(html, res.url)
    if (img) out[url] = img
  } catch { /* keep what we had */ }
}))

writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`)
console.log(`[resource-previews] ${Object.keys(out).length} of ${urls.length} links have an image`)
