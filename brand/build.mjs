#!/usr/bin/env node
/**
 * Brand assets for CRM Analytics Academy, on the Namaste Salesforce system
 * (navy #001A3E / #032D60, signal #0176D3, bright #1B96FF, hairline grid,
 * Switzer for channel art, mono uppercase tracked labels).
 *
 *   node brand/build.mjs        writes SVGs, then PNGs with rsvg-convert
 *
 * Outputs (committed):
 *   brand/mark.svg                 the logo mark — three rising bars, transparent
 *   brand/mark-on-dark.svg         the same mark for navy/dark grounds
 *   brand/youtube/profile.svg|png  800×800 channel picture (reads at 32px)
 *   brand/youtube/cover.svg|png    2560×1440 banner; everything that matters
 *                                  sits inside YouTube's 1546×423 safe area
 *   public/icon.svg, favicon via icon-*.png, apple-touch-icon.png,
 *   icon-maskable-512.png (the only one with a background, as the spec needs)
 *
 * Needs Switzer installed for the PNGs (it is in ~/Library/Fonts).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const C = { navy900: '#001A3E', navy800: '#032D60', brand: '#0176D3', bright: '#1B96FF', light: '#7CBEFF', pale: '#B0D7FF', white: '#FFFFFF' }
const SANS = 'Switzer, Figtree, \'Helvetica Neue\', Helvetica, Arial, sans-serif'
const MONO = '\'SF Mono\', Menlo, Consolas, monospace'

/** Three rising bars in a square box of side s at (x, y). */
const bars = (x, y, s, [a, b, c] = [C.light, C.bright, C.brand]) => {
  const w = s * 0.26
  const gap = (s - w * 3) / 2
  const r = s * 0.05
  return `
  <rect x="${x}" y="${y + s * 0.58}" width="${w}" height="${s * 0.42}" rx="${r}" fill="${a}"/>
  <rect x="${x + w + gap}" y="${y + s * 0.3}" width="${w}" height="${s * 0.7}" rx="${r}" fill="${b}"/>
  <rect x="${x + 2 * (w + gap)}" y="${y}" width="${w}" height="${s}" rx="${r}" fill="${c}"/>`
}

const grid = (w, h, step, alpha) => `
  <defs><pattern id="g" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <path d="M ${step} 0 L 0 0 0 ${step}" fill="none" stroke="rgb(124,190,255)" stroke-opacity="${alpha}" stroke-width="1"/>
  </pattern></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>`

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bars(56, 56, 400)}
</svg>
`
const markDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bars(56, 56, 400, [C.pale, C.bright, C.white])}
</svg>
`

// Profile: YouTube crops to a circle and shows it at 24–88px, so the mark is
// big, high-contrast and alone. White tallest bar = the "reading" bar.
const profileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs><radialGradient id="r" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#0B3B78"/><stop offset="1" stop-color="${C.navy900}"/></radialGradient></defs>
  <rect width="800" height="800" fill="url(#r)"/>${bars(220, 220, 360, [C.light, C.bright, C.white])}
</svg>
`

const TOPICS = ['DATA MODEL', 'RECIPES', 'SAQL', 'DASHBOARDS', 'BINDINGS', 'EINSTEIN']
const coverSvg = (() => {
  const W = 2560
  const H = 1440
  const sy = (H - 423) / 2
  const cx = W / 2
  // Topic chips, centred as a row under the title.
  const chipW = TOPICS.map(t => t.length * 15 + 44)
  const total = chipW.reduce((a, b) => a + b, 0) + (TOPICS.length - 1) * 14
  let x = cx - total / 2
  const chips = TOPICS.map((t, i) => {
    const w = chipW[i]
    const out = `<rect x="${x}" y="${sy + 336}" width="${w}" height="48" rx="24" fill="none" stroke="${C.light}" stroke-opacity=".45"/>
    <text x="${x + w / 2}" y="${sy + 368}" text-anchor="middle" font-family="${MONO}" font-size="21" font-weight="700" letter-spacing="2.5" fill="${C.pale}">${t}</text>`
    x += w + 14
    return out
  }).join('\n    ')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="r" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#0B3B78"/><stop offset="1" stop-color="${C.navy900}"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#r)"/>${grid(W, H, 80, 0.06)}
  <rect width="${W}" height="12" fill="${C.brand}"/>
  <g opacity=".07">${bars(140, 860, 420)}${bars(2000, 120, 420)}</g>
  <g>${bars(cx - 55, sy - 6, 110, [C.light, C.bright, C.white])}</g>
  <text x="${cx}" y="${sy + 218}" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="116" letter-spacing="-3" fill="#FFFFFF" xml:space="preserve">CRM Analytics <tspan fill="${C.bright}">Academy</tspan></text>
  <text x="${cx}" y="${sy + 290}" text-anchor="middle" font-family="${SANS}" font-size="46" font-weight="500" fill="#FFFFFF" fill-opacity=".9">Learn Salesforce CRM Analytics on real GTM data.</text>
    ${chips}
</svg>
`
})()

const out = (rel, text) => {
  const p = path.join(ROOT, rel)
  mkdirSync(path.dirname(p), { recursive: true })
  writeFileSync(p, text)
}
const png = (svg, file, [w, h]) => execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h), '-o', path.join(ROOT, file), path.join(ROOT, svg)])

out('brand/mark.svg', markSvg)
out('brand/mark-on-dark.svg', markDarkSvg)
out('public/icon.svg', markSvg)
out('brand/youtube/profile.svg', profileSvg)
out('brand/youtube/cover.svg', coverSvg)
png('brand/youtube/profile.svg', 'brand/youtube/profile.png', [800, 800])
png('brand/youtube/cover.svg', 'brand/youtube/cover.png', [2560, 1440])
for (const s of [192, 512]) png('brand/mark.svg', `public/icon-${s}.png`, [s, s])
// Home-screen icons need a solid ground: the mark on navy.
out('brand/mark-maskable.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${C.navy800}"/>${bars(146, 146, 220, [C.light, C.bright, C.white])}</svg>\n`)
png('brand/mark-maskable.svg', 'public/icon-maskable-512.png', [512, 512])
png('brand/mark-maskable.svg', 'public/apple-touch-icon.png', [180, 180])
console.log('brand assets written')
