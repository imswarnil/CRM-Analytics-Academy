#!/usr/bin/env node
/**
 * The notes as real PDF files: public/notes/<locale>/<section>.pdf, printed
 * from the rendered notes page (/[<locale>/]notes/<section>) by local headless
 * Chrome with the page's own A4 print stylesheet. The PDFs are committed, the
 * way translations are; `app/data/notes-pdfs.json` lists them (the page shows
 * a download and a preview only for files that exist) with a hash of what
 * each one was printed from, so only changed sheets are printed again.
 *
 *   node scripts/notes-pdf.mjs                 print what changed (starts a dev server if needed)
 *   node scripts/notes-pdf.mjs --all           print every sheet again
 *   node scripts/notes-pdf.mjs --base http://localhost:3000   use a server that is already running
 *   node scripts/notes-pdf.mjs --check         only report stale sheets (exit 0)
 *
 * Run by scripts/prebuild.mjs on your machine. Never in CI: there the
 * committed PDFs are the source, and a missing one only means that page
 * offers "print" instead of the file — the build never fails over it.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(ROOT, 'content')
const MANIFEST = path.join(ROOT, 'app/data/notes-pdfs.json')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const DEFAULT_LOCALE = 'en'
// What a sheet looks like on paper depends on these as well as its markdown.
const LOOK = ['app/components/NotesSheet.vue', 'app/components/content/HandChart.vue', 'app/pages/notes/[slug].vue']

const args = process.argv.slice(2)
const flag = name => args.includes(name)
const opt = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

const log = (...m) => console.log('[notes-pdf]', ...m)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function sheets() {
  const out = []
  for (const locale of readdirSync(CONTENT)) {
    const dir = path.join(CONTENT, locale, 'notes')
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue
    for (const f of readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const slug = f.replace(/\.md$/, '')
      out.push({ locale, slug, key: `${locale}/${slug}`, src: path.join(dir, f) })
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}

const look = createHash('sha256').update(LOOK.map(f => existsSync(path.join(ROOT, f)) ? readFileSync(path.join(ROOT, f)) : '').join('\n')).digest('hex')
const hashOf = s => createHash('sha256').update(readFileSync(s.src)).update(look).digest('hex').slice(0, 16)
const pdfPath = s => path.join(ROOT, 'public', 'notes', s.locale, `${s.slug}.pdf`)

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const all = sheets()
const stale = all.filter(s => flag('--all') || manifest[s.key]?.hash !== hashOf(s) || !existsSync(pdfPath(s)))

function writeManifest() {
  const next = {}
  for (const s of all) {
    if (manifest[s.key] && existsSync(pdfPath(s))) next[s.key] = manifest[s.key]
  }
  writeFileSync(MANIFEST, `${JSON.stringify(next, null, 2)}\n`)
}

if (!stale.length) {
  writeManifest()
  log(`${all.length} sheet(s), all PDFs up to date`)
  process.exit(0)
}
if (flag('--check')) {
  log(`stale: ${stale.map(s => s.key).join(', ')}`)
  process.exit(0)
}
if (!existsSync(CHROME)) {
  log(`Google Chrome not found at ${CHROME} — skipping (set CHROME_PATH). Stale: ${stale.map(s => s.key).join(', ')}`)
  process.exit(0)
}

async function reachable(base, s) {
  try {
    const res = await fetch(`${base}${s.locale === DEFAULT_LOCALE ? '' : `/${s.locale}`}/notes/${s.slug}`, { signal: AbortSignal.timeout(60_000) })
    return res.ok
  } catch {
    return false
  }
}

// A server to print from: --base, else start `nuxt dev` on a spare port.
let base = opt('--base')
let server
if (!base) {
  const port = Number(process.env.NOTES_PDF_PORT || 3199)
  base = `http://localhost:${port}`
  log(`starting a dev server on ${base} …`)
  server = spawn(path.join(ROOT, 'node_modules/.bin/nuxt'), ['dev', '--port', String(port), '--no-qr'], { cwd: ROOT, stdio: 'ignore', detached: true })
  const until = Date.now() + 240_000
  while (Date.now() < until && !(await reachable(base, stale[0]))) await sleep(3000)
}
/**
 * Headless Chrome driven over the DevTools protocol (Node's own WebSocket):
 * open the page, wait for it and its handwriting fonts, Page.printToPDF with
 * the page's @page size. A throwaway profile, so it never touches your Chrome.
 * (`--print-to-pdf` with a virtual-time budget hangs on the dev server's
 * live-reload socket.)
 */
async function openChrome() {
  const profile = mkdtempSync(path.join(os.tmpdir(), 'notes-pdf-'))
  const port = 9600 + Math.floor(Math.random() * 300)
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  let target
  for (let i = 0; i < 100 && !target; i++) {
    await sleep(200)
    target = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json()).then(l => l.find(t => t.type === 'page')).catch(() => undefined)
  }
  if (!target) throw new Error('Chrome did not start')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m)
      pending.delete(m.id)
    }
  })
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id
    pending.set(i, resolve)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
  await send('Page.enable')
  return {
    async print(url, out) {
      await send('Page.navigate', { url })
      // Rendered, hydrated and the fonts in: then a beat for the charts' SVG.
      for (let i = 0; i < 120; i++) {
        await sleep(500)
        const r = await send('Runtime.evaluate', { expression: `document.readyState === 'complete' && !!document.querySelector('.sheet .paper') && document.fonts.status === 'loaded'`, returnByValue: true })
        if (r.result?.result?.value === true) break
      }
      await sleep(1500)
      const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false })
      if (!pdf.result?.data) throw new Error(JSON.stringify(pdf.error ?? pdf).slice(0, 200))
      writeFileSync(out, Buffer.from(pdf.result.data, 'base64'))
    },
    async close() {
      ws.close()
      const gone = new Promise(resolve => proc.once('exit', resolve))
      proc.kill()
      await Promise.race([gone, sleep(5000)])
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
      } catch { /* a temp folder; the OS clears it */ }
    }
  }
}

function stop() {
  if (server) {
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch { /* already gone */ }
  }
}
process.on('exit', stop)

let printed = 0
let chrome
try {
  if (!(await reachable(base, stale[0]))) {
    log(`no notes page at ${base} — skipping. (Content DB stale? see the dev-reset skill.)`)
    process.exit(0)
  }
  chrome = await openChrome()
  for (const s of stale) {
    const url = `${base}${s.locale === DEFAULT_LOCALE ? '' : `/${s.locale}`}/notes/${s.slug}`
    // Warm the route (dev compiles on first hit), then print it.
    await reachable(base, s)
    const out = pdfPath(s)
    mkdirSync(path.dirname(out), { recursive: true })
    try {
      await chrome.print(url, out)
    } catch (e) {
      log(`could not print ${s.key}: ${e.message}`)
      continue
    }
    manifest[s.key] = { hash: hashOf(s), bytes: statSync(out).size }
    printed++
    log(`${s.key} -> public/notes/${s.key}.pdf (${Math.round(statSync(out).size / 1024)} KB)`)
  }
} finally {
  await chrome?.close()
  writeManifest()
  stop()
}
log(`${printed} of ${stale.length} stale sheet(s) printed`)
process.exit(0)
