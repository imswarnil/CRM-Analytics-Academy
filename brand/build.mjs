#!/usr/bin/env node
/**
 * Brand assets for CRM Analytics Academy, on the Namaste Salesforce system
 * (navy #001A3E / #032D60, signal #0176D3, bright #1B96FF, hairline grid,
 * Switzer for channel art, mono uppercase tracked labels).
 *
 *   node brand/build.mjs        writes SVGs, then PNGs with rsvg-convert
 *
 * Outputs (committed):
 *   brand/mark.svg                         the logo mark (three rising bars)
 *   brand/youtube/profile.svg|png          800×800 channel picture
 *   brand/youtube/cover.svg|png            2560×1440 channel banner
 *                                          (text inside the 1546×423 safe area)
 *   public/icon.svg, icon-192/512.png, icon-maskable-512.png, apple-touch-icon.png
 *
 * Needs Switzer installed for the PNGs (it is in ~/Library/Fonts); browsers
 * reading the SVGs fall back to the system sans.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const C = { navy900: '#001A3E', navy800: '#032D60', brand: '#0176D3', bright: '#1B96FF', light: '#7CBEFF', pale: '#B0D7FF', white: '#FFFFFF' }
const SANS = 'Switzer, Figtree, \'Helvetica Neue\', Helvetica, Arial, sans-serif'
const MONO = '\'SF Mono\', Menlo, Consolas, monospace'

/** The mark: three rising bars (a chart), the tallest in the signal colour. */
const bars = (x, y, s) => `
  <rect x="${x}" y="${y + s * 0.55}" width="${s * 0.22}" height="${s * 0.45}" rx="${s * 0.03}" fill="${C.pale}"/>
  <rect x="${x + s * 0.39}" y="${y + s * 0.28}" width="${s * 0.22}" height="${s * 0.72}" rx="${s * 0.03}" fill="${C.bright}"/>
  <rect x="${x + s * 0.78}" y="${y}" width="${s * 0.22}" height="${s}" rx="${s * 0.03}" fill="${C.brand}"/>`

const grid = (w, h, step, alpha) => `
  <defs><pattern id="g" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <path d="M ${step} 0 L 0 0 0 ${step}" fill="none" stroke="rgb(124,190,255)" stroke-opacity="${alpha}" stroke-width="1"/>
  </pattern></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>`

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="72" fill="${C.navy800}"/>${bars(116, 116, 280)}
</svg>
`

const profileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs><radialGradient id="r" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${C.navy800}"/><stop offset="1" stop-color="${C.navy900}"/></radialGradient></defs>
  <rect width="800" height="800" fill="url(#r)"/>${grid(800, 800, 64, 0.08)}
  <circle cx="400" cy="400" r="336" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2"/>${bars(270, 260, 260)}
</svg>
`

const TOPICS = ['RECIPES', 'SAQL', 'DASHBOARDS', 'SECURITY', 'EINSTEIN DISCOVERY']
const coverSvg = (() => {
  const W = 2560
  const H = 1440
  // YouTube's safe area for every device: 1546×423, centred.
  const sx = (W - 1546) / 2
  const sy = (H - 423) / 2
  let tx = sx + 40
  const strip = TOPICS.map((t, i) => {
    const x = tx
    tx += t.length * 17 + 74
    return `${i ? `<line x1="${x - 34}" y1="${sy + 352}" x2="${x - 34}" y2="${sy + 382}" stroke="#FFFFFF" stroke-opacity=".15"/>` : ''}
    <text x="${x}" y="${sy + 374}" font-family="${MONO}" font-size="22" font-weight="600" letter-spacing="3" fill="${C.light}">${t}</text>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.navy900}"/>${grid(W, H, 80, 0.07)}
  <rect width="${W}" height="10" fill="${C.brand}"/>
  <circle cx="2380" cy="760" r="430" fill="none" stroke="#FFFFFF" stroke-opacity=".12" stroke-width="2"/>
  <circle cx="120" cy="80" r="260" fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="2"/>
  <g opacity=".08">${bars(2050, 1080, 220)}</g>
  <text x="${sx + 1060}" y="${sy + 12}" font-family="${MONO}" font-size="20" fill="${C.light}" fill-opacity=".45">/* prep. query. show. */</text>
  <g>${bars(sx + 40, sy + 90, 150)}</g>
  <text font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-3" fill="#FFFFFF">
    <tspan x="${sx + 250}" y="${sy + 150}">CRM Analytics</tspan>
    <tspan x="${sx + 250}" y="${sy + 250}">Academy<tspan fill="${C.bright}">.</tspan></tspan>
  </text>
  <line x1="${sx + 1000}" y1="${sy + 90}" x2="${sx + 1000}" y2="${sy + 250}" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="2"/>
  <text font-family="${SANS}" font-size="38" fill="#FFFFFF" fill-opacity=".88">
    <tspan x="${sx + 1040}" y="${sy + 140}">Salesforce CRM Analytics,</tspan>
    <tspan x="${sx + 1040}" y="${sy + 188}">taught on real GTM data.</tspan>
  </text>
  <text x="${sx + 1040}" y="${sy + 240}" font-family="${MONO}" font-size="22" font-weight="700" letter-spacing="4" fill="${C.bright}">// NEW LESSON EVERY WEEK</text>
  <line x1="${sx}" y1="${sy + 328}" x2="${sx + 1546}" y2="${sy + 328}" stroke="#FFFFFF" stroke-opacity=".14"/>
  <line x1="${sx}" y1="${sy + 404}" x2="${sx + 1546}" y2="${sy + 404}" stroke="#FFFFFF" stroke-opacity=".14"/>${strip}
</svg>
`
})()

const out = (rel, text) => {
  const p = path.join(ROOT, rel)
  mkdirSync(path.dirname(p), { recursive: true })
  writeFileSync(p, text)
  return p
}
const png = (svg, file, size) => execFileSync('rsvg-convert', ['-w', String(size[0]), '-h', String(size[1]), '-o', path.join(ROOT, file), path.join(ROOT, svg)])

out('brand/mark.svg', markSvg)
out('public/icon.svg', markSvg)
out('brand/youtube/profile.svg', profileSvg)
out('brand/youtube/cover.svg', coverSvg)
png('brand/youtube/profile.svg', 'brand/youtube/profile.png', [800, 800])
png('brand/youtube/cover.svg', 'brand/youtube/cover.png', [2560, 1440])
for (const s of [192, 512]) png('brand/mark.svg', `public/icon-${s}.png`, [s, s])
png('brand/mark.svg', 'public/apple-touch-icon.png', [180, 180])
// Maskable: the mark inset in a full-bleed navy square.
out('brand/mark-maskable.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${C.navy800}"/>${bars(156, 156, 200)}</svg>\n`)
png('brand/mark-maskable.svg', 'public/icon-maskable-512.png', [512, 512])
console.log('brand assets written')
