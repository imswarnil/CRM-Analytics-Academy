/**
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep) which URLs
 * changed, so a new or edited lesson is recrawled in hours, not weeks.
 * Google does not take IndexNow; it reads the sitemap (robots.txt points at it)
 * and Search Console.
 *
 *   node scripts/indexnow.mjs --since=<git sha>   URLs of files changed since that commit
 *   node scripts/indexnow.mjs --all               every URL in the live sitemap
 *   add --dry-run to print instead of submitting
 *
 * The key is public by design: IndexNow proves ownership by fetching
 * https://<host>/<key>.txt and comparing. It lives in public/.
 */
import { execFileSync } from 'node:child_process'

const HOST = 'crmanalytics.imswarnil.com'
const KEY = 'b73ffeca950f34668bf7a7b2225b56e3'

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]))
const url = path => `https://${HOST}${path === '/' ? '' : path}`
const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')

/** content/es/07.saql/03.functions.md → /es/saql/functions */
function routeOf(file) {
  const parts = file.split('/')
  if (parts[0] !== 'content') return null
  if (parts[1] === 'showcase') return `/showcase/${strip(parts[2])}`
  if (parts[1] === 'resources') return '/resources'
  if (parts.length !== 4 || !file.endsWith('.md')) return null
  const [, locale, section, lesson] = parts
  const prefix = locale === 'en' ? '' : `/${locale}`
  const slug = strip(lesson)
  return `${prefix}/${strip(section)}${slug === 'index' ? '' : `/${slug}`}`
}

async function fromSitemap() {
  const index = await (await fetch(url('/sitemap_index.xml'))).text()
  const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const urls = new Set()
  for (const child of children) {
    const xml = await (await fetch(child)).text()
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1])
  }
  return [...urls]
}

let urls
if (args.all) {
  urls = await fromSitemap()
} else if (args.since && !/^0+$/.test(String(args.since))) {
  const changed = execFileSync('git', ['diff', '--name-only', String(args.since), 'HEAD'], { encoding: 'utf8' }).split('\n').filter(Boolean)
  const routes = new Set(changed.map(routeOf).filter(Boolean))
  // A deleted file is not a page to recrawl.
  urls = [...routes].map(url).filter(Boolean)
  if (urls.length) urls.push(url('/'), url('/curriculum'))
} else {
  console.log('[indexnow] nothing to do: pass --since=<sha> or --all')
  process.exit(0)
}

urls = [...new Set(urls)]
console.log(`[indexnow] ${urls.length} URL(s)`)
if (!urls.length) process.exit(0)
if (args['dry-run']) {
  console.log(urls.slice(0, 50).join('\n') + (urls.length > 50 ? `\n… and ${urls.length - 50} more` : ''))
  process.exit(0)
}

// The protocol takes up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: url(`/${KEY}.txt`), urlList: urls.slice(i, i + 10000) })
  })
  console.log(`[indexnow] batch ${i / 10000 + 1}: HTTP ${res.status}`)
  if (res.status >= 400) process.exitCode = 1
}
