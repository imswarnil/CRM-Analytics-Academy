/**
 * Builds the reusable creative kit: backgrounds, video overlays, brand marks
 * and project images, all in the Blueprint language of the site.
 *
 *   node content-assets/build.mjs
 *
 * SVG is the source of truth; PNGs are rendered with rsvg-convert and the
 * looping background video with ffmpeg (both from Homebrew). No npm
 * dependencies. Every file here is regenerated — edit this script, not the
 * outputs.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_EN = path.resolve(ROOT, '../content/en')

const RSVG = ['/opt/homebrew/bin/rsvg-convert', 'rsvg-convert'].find(p => p.includes('/') ? existsSync(p) : true)
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', 'ffmpeg'].find(p => p.includes('/') ? existsSync(p) : true)

const C = {
  paper: '#F4F7FB',
  card: '#FAFCFE',
  ink: '#0C1B33',
  ink2: '#4A5B78',
  navy: '#0F2A5C',
  signal: '#2F5BEA',
  tide: '#3D8BD9',
  frost: '#A8CCF2',
  ice: '#DDEBFA',
  glow: '#3FC6DC',
  white: '#FFFFFF'
}
const SANS = `'Schibsted Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif`
const MONO = `'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace`
const SITE = 'crmanalytics.imswarnil.com'

/* ------------------------------------------------------------ primitives */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Graph paper: a minor grid every `step`, a major line every 5 steps. */
function gridDefs(id, dark, step = 24) {
  const minor = dark ? 'rgba(168,204,242,0.07)' : 'rgba(47,91,234,0.06)'
  const major = dark ? 'rgba(168,204,242,0.14)' : 'rgba(47,91,234,0.13)'
  const big = step * 5
  return `
  <pattern id="${id}-minor" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    <path d="M ${step} 0 L 0 0 0 ${step}" fill="none" stroke="${minor}" stroke-width="1"/>
  </pattern>
  <pattern id="${id}" width="${big}" height="${big}" patternUnits="userSpaceOnUse">
    <rect width="${big}" height="${big}" fill="url(#${id}-minor)"/>
    <path d="M ${big} 0 L 0 0 0 ${big}" fill="none" stroke="${major}" stroke-width="1.25"/>
  </pattern>`
}

/** A ruler strip along one edge: short ticks every 8px, tall every 40px. */
function ruler(x, y, len, horizontal, color, flip = false) {
  let d = ''
  for (let i = 0; i <= len; i += 8) {
    const tall = i % 40 === 0
    const h = tall ? 14 : 7
    if (horizontal) d += `M ${x + i} ${y} v ${flip ? -h : h} `
    else d += `M ${x} ${y + i} h ${flip ? -h : h} `
  }
  return `<path d="${d}" stroke="${color}" stroke-width="1" opacity="0.7"/>`
}

/** Crop marks ("+") centred on the four corners of a rectangle. */
function cropMarks(x, y, w, h, color, arm = 14) {
  const plus = (cx, cy) => `M ${cx - arm} ${cy} h ${arm * 2} M ${cx} ${cy - arm} v ${arm * 2}`
  return `<path d="${plus(x, y)} ${plus(x + w, y)} ${plus(x, y + h)} ${plus(x + w, y + h)}" stroke="${color}" stroke-width="1.5"/>`
}

/** The logo mark: three rising bars in a box. `s` is the box size. */
function mark(x, y, s, { box = C.ink, bars = [C.frost, C.tide, C.signal], fill = 'none' } = {}) {
  const pad = s * 0.2
  const bw = (s - pad * 2) / 4.2
  const gap = bw * 0.6
  const heights = [0.35, 0.6, 0.9].map(k => (s - pad * 2) * k)
  const rects = heights.map((h, i) => `<rect x="${x + pad + i * (bw + gap)}" y="${y + s - pad - h}" width="${bw}" height="${h}" fill="${bars[i]}"/>`).join('')
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fill}" stroke="${box}" stroke-width="${Math.max(1.5, s / 28)}"/>${rects}`
}

function svg(w, h, body, { defs = '', bg } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${defs}</defs>
${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}
${body}
</svg>
`
}

/** Paper or navy sheet with its grid. */
function sheet(w, h, dark, extra = '') {
  const id = dark ? 'gn' : 'gl'
  return svg(w, h, `<rect width="${w}" height="${h}" fill="url(#${id})"/>${extra}`, {
    defs: gridDefs(id, dark, Math.round(Math.max(w, h) / 80)),
    bg: dark ? C.navy : C.paper
  })
}

/* --------------------------------------------------------------- writing */

const written = []
function out(rel, svgText, pngScale) {
  const file = path.join(ROOT, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, svgText)
  written.push(rel)
  if (pngScale !== false) {
    const png = file.replace(/\.svg$/, '.png')
    const args = ['-f', 'png', '-o', png, file]
    if (typeof pngScale === 'number') args.unshift('-z', String(pngScale))
    execFileSync(RSVG, args)
    written.push(rel.replace(/\.svg$/, '.png'))
  }
}

for (const dir of ['backgrounds', 'video', 'brand', 'project']) {
  rmSync(path.join(ROOT, dir), { recursive: true, force: true })
}

/* ----------------------------------------------------------- backgrounds */

const SIZES = [
  ['1920x1080', 1920, 1080],
  ['3840x2160', 3840, 2160],
  ['1080x1920', 1080, 1920],
  ['1080x1080', 1080, 1080]
]
for (const [name, w, h] of SIZES) {
  for (const dark of [false, true]) {
    // 4K stays SVG-only: it scales losslessly and a PNG would be several MB.
    out(`backgrounds/graph-paper-${dark ? 'navy' : 'light'}-${name}.svg`, sheet(w, h, dark), name === '3840x2160' ? false : undefined)
  }
}

// The "desk": a sheet with rulers on two edges and crop marks around a safe area.
for (const dark of [false, true]) {
  const [w, h] = [1920, 1080]
  const line = dark ? C.frost : C.ink
  const m = 96
  const extra = `
    ${ruler(0, 0, w, true, line)}
    ${ruler(0, 0, h, false, line)}
    ${ruler(0, h, w, true, line, true)}
    ${cropMarks(m, m, w - m * 2, h - m * 2, dark ? C.glow : C.signal, 18)}
    <text x="${m}" y="${m - 28}" font-family="${MONO}" font-size="16" letter-spacing="3" fill="${dark ? C.frost : C.ink2}">SHEET 01 — ${SITE.toUpperCase()}</text>`
  out(`backgrounds/desk-${dark ? 'navy' : 'light'}-1920x1080.svg`, sheet(w, h, dark, extra))
}

/* ------------------------------------------------------------------ video */

// Lower third — transparent, bottom-left, for name + role.
out('video/lower-third.svg', svg(1920, 1080, `
  <g transform="translate(96 820)">
    <rect x="10" y="10" width="760" height="150" fill="${C.ink}"/>
    <rect width="760" height="150" fill="${C.card}" stroke="${C.ink}" stroke-width="3"/>
    <rect width="12" height="150" fill="${C.signal}"/>
    <text x="44" y="42" font-family="${MONO}" font-size="18" letter-spacing="4" fill="${C.signal}">FIG. 01 — SPEAKER</text>
    <text x="44" y="96" font-family="${SANS}" font-weight="800" font-size="46" letter-spacing="-1" fill="${C.ink}">Swarnil Singhai</text>
    <text x="44" y="130" font-family="${SANS}" font-size="24" fill="${C.ink2}">CRM Analytics Academy</text>
  </g>`))

// Title card.
out('video/title-card.svg', sheet(1920, 1080, false, `
  ${cropMarks(160, 200, 1600, 680, C.signal, 20)}
  <text x="200" y="320" font-family="${MONO}" font-size="26" letter-spacing="6" fill="${C.signal}">LESSON 001 / 161 — INTRODUCTION</text>
  <text x="196" y="520" font-family="${SANS}" font-weight="900" font-size="150" letter-spacing="-6" fill="${C.ink}">Lesson title</text>
  <text x="200" y="620" font-family="${SANS}" font-size="44" fill="${C.ink2}">One line on what this lesson teaches.</text>
  ${mark(200, 720, 96)}
  <text x="324" y="770" font-family="${SANS}" font-weight="800" font-size="40" fill="${C.ink}">CRM Analytics</text>
  <text x="324" y="806" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${C.ink2}">ACADEMY</text>`))

// Chapter / section card (navy).
out('video/chapter-card.svg', sheet(1920, 1080, true, `
  <text x="200" y="420" font-family="${SANS}" font-weight="900" font-size="300" letter-spacing="-12" fill="${C.glow}">07</text>
  <text x="200" y="560" font-family="${MONO}" font-size="28" letter-spacing="6" fill="${C.frost}">SECTION — CHAPTER</text>
  <text x="196" y="700" font-family="${SANS}" font-weight="900" font-size="130" letter-spacing="-5" fill="${C.white}">Section title</text>
  ${ruler(200, 800, 1520, true, C.frost)}`))

// End card with the CTA.
out('video/end-card.svg', sheet(1920, 1080, true, `
  ${cropMarks(160, 160, 1600, 760, C.glow, 20)}
  <text x="960" y="360" text-anchor="middle" font-family="${MONO}" font-size="28" letter-spacing="6" fill="${C.glow}">KEEP GOING</text>
  <text x="960" y="520" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="120" letter-spacing="-4" fill="${C.white}">Learn CRM Analytics, free</text>
  <g transform="translate(560 620)">
    <rect x="10" y="10" width="800" height="120" fill="${C.signal}"/>
    <rect width="800" height="120" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
    <text x="400" y="78" text-anchor="middle" font-family="${MONO}" font-weight="600" font-size="40" fill="${C.ink}">${SITE}</text>
  </g>`))

// Subscribe / next-lesson overlay — transparent, top-right.
out('video/next-lesson-overlay.svg', svg(1920, 1080, `
  <g transform="translate(1224 96)">
    <rect x="10" y="10" width="600" height="190" fill="${C.ink}"/>
    <rect width="600" height="190" fill="${C.card}" stroke="${C.ink}" stroke-width="3"/>
    <text x="32" y="48" font-family="${MONO}" font-size="18" letter-spacing="4" fill="${C.signal}">NEXT LESSON →</text>
    <text x="32" y="104" font-family="${SANS}" font-weight="800" font-size="38" fill="${C.ink}">Next lesson title</text>
    <rect x="32" y="130" width="220" height="40" fill="${C.signal}"/>
    <text x="142" y="157" text-anchor="middle" font-family="${MONO}" font-weight="600" font-size="18" letter-spacing="2" fill="${C.white}">SUBSCRIBE</text>
    <text x="272" y="157" font-family="${MONO}" font-size="16" fill="${C.ink2}">${SITE}</text>
  </g>`))

// YouTube thumbnail template.
out('video/thumbnail-1280x720.svg', sheet(1280, 720, false, `
  <rect x="640" y="0" width="640" height="720" fill="${C.navy}"/>
  <g transform="translate(700 160)">
    ${[0.35, 0.55, 0.45, 0.75, 0.62, 0.95].map((k, i) => `<rect x="${i * 88}" y="${400 - 400 * k}" width="64" height="${400 * k}" fill="${i === 5 ? C.glow : C.tide}" stroke="${C.ink}" stroke-width="2"/>`).join('')}
  </g>
  <text x="56" y="120" font-family="${MONO}" font-size="24" letter-spacing="4" fill="${C.signal}">CRM ANALYTICS</text>
  <text x="52" y="300" font-family="${SANS}" font-weight="900" font-size="104" letter-spacing="-4" fill="${C.ink}">Big</text>
  <text x="52" y="410" font-family="${SANS}" font-weight="900" font-size="104" letter-spacing="-4" fill="${C.ink}">title</text>
  <rect x="56" y="520" width="420" height="72" fill="${C.signal}"/>
  <text x="80" y="568" font-family="${MONO}" font-weight="600" font-size="30" fill="${C.white}">FREE LESSON</text>`))

// Looping animated background: a graph-paper sheet that scrolls one major
// cell (120px) diagonally in 4 seconds — the loop point is invisible.
{
  const tile = path.join(ROOT, 'video', '.loop-tile.png')
  const tileSvg = tile.replace(/\.png$/, '.svg')
  const extra = ruler(0, 0, 2040, true, C.frost)
  writeFileSync(tileSvg, svg(2040, 1200, `<rect width="2040" height="1200" fill="url(#gn)"/>${extra}`, { defs: gridDefs('gn', true, 24), bg: C.navy }))
  execFileSync(RSVG, ['-f', 'png', '-o', tile, tileSvg])
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-loop', '1', '-i', tile,
    '-vf', 'crop=1920:1080:x=\'mod(t*30,120)\':y=\'mod(t*30,120)\',format=yuv420p',
    '-t', '4', '-r', '30',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-movflags', '+faststart',
    path.join(ROOT, 'video', 'loop-graph-paper-navy-1920x1080.mp4')
  ])
  rmSync(tile)
  rmSync(tileSvg)
  written.push('video/loop-graph-paper-navy-1920x1080.mp4')
}

/* ------------------------------------------------------------------ brand */

out('brand/logo-mark.svg', svg(512, 512, mark(56, 56, 400)), false)
execFileSync(RSVG, ['-w', '512', '-h', '512', '-o', path.join(ROOT, 'brand/logo-mark-512.png'), path.join(ROOT, 'brand/logo-mark.svg')])
execFileSync(RSVG, ['-w', '1024', '-h', '1024', '-o', path.join(ROOT, 'brand/logo-mark-1024.png'), path.join(ROOT, 'brand/logo-mark.svg')])
written.push('brand/logo-mark-512.png', 'brand/logo-mark-1024.png')
out('brand/logo-mark-on-paper.svg', svg(512, 512, mark(56, 56, 400), { bg: C.paper }))
out('brand/logo-mark-on-navy.svg', svg(512, 512, mark(56, 56, 400, { box: C.frost, bars: [C.frost, C.tide, C.glow] }), { bg: C.navy }))

const wordmark = dark => svg(960, 240, `
  ${mark(32, 40, 160, dark ? { box: C.frost, bars: [C.frost, C.tide, C.glow] } : {})}
  <text x="232" y="132" font-family="${SANS}" font-weight="800" font-size="76" letter-spacing="-2" fill="${dark ? C.white : C.ink}">CRM Analytics</text>
  <text x="236" y="184" font-family="${MONO}" font-size="26" letter-spacing="4" fill="${dark ? C.frost : C.ink2}">ACADEMY</text>`, { bg: dark ? C.navy : undefined })
out('brand/wordmark.svg', wordmark(false))
out('brand/wordmark-on-navy.svg', wordmark(true))

/* ---------------------------------------------------------------- project */

const og = (eyebrow, title, lead, bars) => sheet(1200, 630, false, `
  ${cropMarks(48, 48, 1104, 534, C.signal, 14)}
  ${mark(84, 84, 64)}
  <text x="168" y="118" font-family="${SANS}" font-weight="800" font-size="30" fill="${C.ink}">CRM Analytics</text>
  <text x="168" y="144" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${C.ink2}">ACADEMY</text>
  <text x="84" y="268" font-family="${MONO}" font-size="20" letter-spacing="4" fill="${C.signal}">${esc(eyebrow)}</text>
  <text x="80" y="352" font-family="${SANS}" font-weight="900" font-size="72" letter-spacing="-3" fill="${C.ink}">${esc(title)}</text>
  <text x="84" y="412" font-family="${SANS}" font-size="28" fill="${C.ink2}">${esc(lead)}</text>
  <g transform="translate(820 420)">
    ${bars.map((k, i) => `<rect x="${i * 50}" y="${120 - 120 * k}" width="36" height="${120 * k}" fill="${i === bars.length - 1 ? C.signal : C.tide}" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}
  </g>
  <text x="84" y="548" font-family="${MONO}" font-size="18" fill="${C.ink2}">${SITE}</text>`)

out('project/og-home.svg', og('FIG. 01 — FREE COURSE', 'Learn CRM Analytics', 'Data prep to SAQL to dashboards, in 12 languages.', [0.3, 0.45, 0.4, 0.65, 0.8, 1]))
out('project/og-curriculum.svg', og('SHEET 01 — CURRICULUM', '19 sections, 161 lessons', 'Every lesson, in order, with its length.', [0.5, 0.7, 0.4, 0.9, 0.6, 0.8]))
out('project/og-pricing.svg', og('SHEET 04 — PRICING', 'Learn free. Go Pro.', 'The core course is free. Pro funds the rest.', [0.2, 0.2, 0.55, 0.55, 1, 1]))
out('project/og-showcase.svg', og('SHOWCASE', 'Dashboards, explained', 'The KPIs, the formulas and how each was built.', [0.6, 0.35, 0.75, 0.5, 0.9, 0.7]))

// One cover per course section, titled from its .navigation.yml.
const sections = readdirSync(CONTENT_EN)
  .filter(d => statSync(path.join(CONTENT_EN, d)).isDirectory())
  .sort()
for (const dir of sections) {
  const nav = readFileSync(path.join(CONTENT_EN, dir, '.navigation.yml'), 'utf8')
  const title = (nav.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? dir).trim()
  const n = dir.split('.')[0]
  const lessons = readdirSync(path.join(CONTENT_EN, dir)).filter(f => f.endsWith('.md')).length
  const heights = Array.from({ length: lessons }, (_, i) => 0.25 + ((Number(n) * 7 + i * 13) % 10) / 13)
  out(`project/sections/${dir}.svg`, sheet(1600, 900, true, `
    ${cropMarks(80, 80, 1440, 740, C.glow, 16)}
    <text x="120" y="380" font-family="${SANS}" font-weight="900" font-size="260" letter-spacing="-10" fill="${C.glow}">${n}</text>
    <text x="126" y="470" font-family="${MONO}" font-size="24" letter-spacing="5" fill="${C.frost}">SECTION ${n} — ${lessons} LESSONS</text>
    <text x="120" y="590" font-family="${SANS}" font-weight="900" font-size="${title.length > 22 ? 84 : 104}" letter-spacing="-4" fill="${C.white}">${esc(title)}</text>
    <g transform="translate(120 660)">
      ${heights.map((k, i) => `<rect x="${i * 60}" y="${100 - 100 * Math.min(1, k)}" width="44" height="${100 * Math.min(1, k)}" fill="${C.tide}" stroke="${C.ink}" stroke-width="1.5"/>`).join('')}
    </g>
    <text x="1480" y="790" text-anchor="end" font-family="${MONO}" font-size="20" fill="${C.frost}">${SITE}</text>`))
}

/* ----------------------------------------------------------------- report */

let bytes = 0
for (const rel of written) bytes += statSync(path.join(ROOT, rel)).size
console.log(`content-assets: ${written.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`)
