#!/usr/bin/env node
// YouTube thumbnails for CRM Analytics Academy, in the Blueprint language.
//
//   pnpm thumb <style> --title "..." [--eyebrow ...] [--section 07] [--lesson 3] [--image path]
//                      [--code file.saql] [--out dir] [--pxd]
//   pnpm thumb <style> <route>          e.g. pnpm thumb lesson introduction/set-up-your-org
//   pnpm thumb --all-sections           one section-overview per folder in content/en
//   pnpm thumb --templates [--pxd]      rebuild templates/*.svg, previews/*.png (+ .pxd)
//   pnpm thumb --list                   the styles and their options
//
// Every style is one function below that returns a layered SVG. Each editable element
// is its own <g id="..."> so it arrives in Pixelmator Pro as a named group layer, and
// all text stays real <text>. Plain Node 22; only `yaml` from the repo's devDependencies.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
const CONTENT = path.join(ROOT, 'content/en')
const W = 1280
const H = 720

// tokens/tokens.json (light) — the dark-mode values are used on navy grounds.
const C = {
  paper: '#F4F7FB', card: '#FBFCFE', ink: '#0C1B33', ink2: '#4A5B78', line: '#C3D2E6',
  navy: '#0F2A5C', signal: '#2F5BEA', tide: '#3D8BD9', frost: '#A8CCF2', ice: '#DDEBFA',
  glow: '#3FC6DC', white: '#FFFFFF',
  // dark mode
  dPaper: '#0A1428', dCard: '#0F1C36', dInk: '#E6EEFA', dInk2: '#9DB0CF', dLine: '#24385F',
  dNavy: '#07122A', dSignal: '#6E93FF'
}
const SANS = 'Schibsted Grotesk'
const MONO = 'IBM Plex Mono'

// ---------------------------------------------------------------- text measuring

const METRICS = JSON.parse(fs.readFileSync(path.join(HERE, 'lib/metrics.json'), 'utf8'))
const WORD = 0.08 // em, extra word spacing on headlines
const TIGHT = -0.03 // em, headline tracking: tokens say -0.045 for the web; a thumbnail's word gaps need a little more air

function textWidth(str, size, weight = 900, tracking = TIGHT) {
  const m = METRICS[String(weight)] || METRICS['900']
  let w = 0
  for (const ch of str) w += (m[ch] ?? 620) + (ch === ' ' && tracking === TIGHT ? WORD * 1000 : 0)
  return (w / 1000) * size + tracking * size * Math.max(0, [...str].length - 1)
}
const monoWidth = (str, size, trackingEm = 0) => [...str].length * size * (0.6 + trackingEm)

function wrapGreedy(text, size, maxW, weight, tracking) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word
    if (!cur || textWidth(next, size, weight, tracking) <= maxW) cur = next
    else {
      lines.push(cur)
      cur = word
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// Largest size at which `text` fits maxW in at most maxLines lines, then the most
// balanced break at that size (so a two-line title never leaves one word alone).
function fit(text, { maxW, maxLines = 2, maxSize = 140, minSize = 40, weight = 900, tracking = TIGHT }) {
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines = wrapGreedy(text, size, maxW, weight, tracking)
    if (lines.length > maxLines) continue
    if (lines.some(l => textWidth(l, size, weight, tracking) > maxW)) continue
    let best = lines
    for (let w = maxW - 8; w > maxW * 0.4; w -= 8) {
      const l2 = wrapGreedy(text, size, w, weight, tracking)
      if (l2.length !== lines.length || l2.some(l => textWidth(l, size, weight, tracking) > w)) break
      best = l2
    }
    return { size, lines: best }
  }
  return { size: minSize, lines: wrapGreedy(text, minSize, maxW, weight, tracking).slice(0, maxLines) }
}

// ---------------------------------------------------------------- svg helpers

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const n = v => Math.round(v * 100) / 100
const pad2 = v => String(v).padStart(2, '0')
const layer = (id, body, extra = '') => `<g id="${esc(id)}"${extra}>\n${body}\n</g>`

function mono(x, y, str, { size = 26, fill = C.signal, weight = 500, tracking = 0.14, anchor } = {}) {
  return `<text x="${n(x)}" y="${n(y)}" font-family="${MONO}" font-weight="${weight}" font-size="${size}" letter-spacing="${n(size * tracking)}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(str)}</text>`
}

// A multi-line headline as ONE <text> (one editable text layer in Pixelmator).
// `colors` optionally gives a fill per line.
function headline(x, yTop, { size, lines }, { fill = C.ink, weight = 900, lh = 0.98, colors = [] } = {}) {
  const asc = size * 0.8
  const spans = lines.map((l, i) => `<tspan x="${n(x)}" y="${n(yTop + asc + i * size * lh)}"${colors[i] ? ` fill="${colors[i]}"` : ''}>${esc(l)}</tspan>`).join('')
  return `<text font-family="${SANS}" font-weight="${weight}" font-size="${size}" letter-spacing="${n(size * TIGHT)}" word-spacing="${n(size * WORD)}" fill="${fill}">${spans}</text>`
}
const blockHeight = ({ size, lines }, lh = 0.98) => size * 0.8 + (lines.length - 1) * size * lh + size * 0.2

function grid(x, y, w, h, { minor = C.line, major = C.ink2, minorOp = 0.45, majorOp = 0.16, step = 24, every = 5 } = {}) {
  let a = ''
  let b = ''
  for (let i = 0, gx = x; gx <= x + w; gx += step, i++) (i % every ? (a += `M${gx} ${y}V${y + h}`) : (b += `M${gx} ${y}V${y + h}`))
  for (let i = 0, gy = y; gy <= y + h; gy += step, i++) (i % every ? (a += `M${x} ${gy}H${x + w}`) : (b += `M${x} ${gy}H${x + w}`))
  return `<path d="${a}" fill="none" stroke="${minor}" stroke-opacity="${minorOp}" stroke-width="1"/>\n<path d="${b}" fill="none" stroke="${major}" stroke-opacity="${majorOp}" stroke-width="1.5"/>`
}

// Crosshair crop marks: a "+" at each corner of the box, sitting just outside it.
function cropMarks(x, y, w, h, { color = C.ink, len = 18, off = 14, sw = 2 } = {}) {
  let d = ''
  for (const [cx, cy, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) {
    const px = cx + sx * off
    const py = cy + sy * off
    d += `M${n(px - len)} ${n(py)}H${n(px + len)}M${n(px)} ${n(py - len)}V${n(py + len)}`
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
}

function ruler(x, y, len, { color = C.ink, op = 0.55, vertical = false, small = 12, big = 120, short = 8, long = 18 } = {}) {
  let d = ''
  for (let t = 0; t <= len; t += small) {
    const l = t % big === 0 ? long : (t % (big / 2) === 0 ? short * 1.6 : short)
    d += vertical ? `M${x} ${y + t}H${x + l}` : `M${x + t} ${y}V${y + l}`
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.5"/>`
}

// Diagonal hatch clipped by hand to a rectangle (no clipPath, so Pixelmator keeps it).
function hatch(x, y, w, h, { step = 28, color = C.frost, op = 0.7, sw = 2 } = {}) {
  let d = ''
  for (let c = -h; c < w; c += step) {
    const x1 = x + Math.max(c, 0)
    const y1 = y + Math.max(-c, 0)
    const t = Math.min(w - Math.max(c, 0), h - Math.max(-c, 0))
    d += `M${n(x1)} ${n(y1 + t)}L${n(x1 + t)} ${n(y1)}`
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${sw}"/>`
}

// A box with a hard, blur-less offset shadow (tokens: shadow.*).
function box(x, y, w, h, { fill = C.card, stroke = C.ink, sw = 4, shadow = 10, shadowColor = C.ink } = {}) {
  return (shadow ? `<rect x="${n(x + shadow)}" y="${n(y + shadow)}" width="${n(w)}" height="${n(h)}" fill="${shadowColor}"/>\n` : '')
    + `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
}

// public/icon.svg, redrawn at any size.
function logo(x, y, s, { bg = C.paper, stroke = C.ink } = {}) {
  const k = s / 512
  const r = (rx, ry, rw, rh, f) => `<rect x="${n(x + rx * k)}" y="${n(y + ry * k)}" width="${n(rw * k)}" height="${n(rh * k)}" fill="${f}"/>`
  return `<rect x="${n(x + 40 * k)}" y="${n(y + 40 * k)}" width="${n(432 * k)}" height="${n(432 * k)}" fill="${bg}" stroke="${stroke}" stroke-width="${n(28 * k)}"/>`
    + r(128, 292, 64, 100, C.frost) + r(224, 224, 64, 168, C.tide) + r(320, 140, 64, 252, C.signal)
}

function brand(x, y, { dark = false } = {}) {
  return layer('BRAND', logo(x, y - 34, 44, dark ? { bg: C.navy, stroke: C.dInk } : {})
    + '\n' + mono(x + 56, y - 4, 'CRM ANALYTICS ACADEMY', { size: 20, fill: dark ? C.dInk2 : C.ink2, tracking: 0.16 }))
}

function svgDoc(body, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- CRM Analytics Academy thumbnail · ${esc(title)} · 1280×720 · made by content-creation/thumbnails/make.mjs
     Fonts: Schibsted Grotesk (900/800) and IBM Plex Mono (500). Each <g id> is one layer. -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${body}
</svg>
`
}

function paperGround() {
  return layer('BACKGROUND', `<rect width="${W}" height="${H}" fill="${C.paper}"/>\n` + grid(0, 0, W, H))
}
function navyGround() {
  return layer('BACKGROUND', `<rect width="${W}" height="${H}" fill="${C.navy}"/>\n`
    + grid(0, 0, W, H, { minor: C.frost, major: C.frost, minorOp: 0.07, majorOp: 0.17 }))
}
function sheetMarks({ dark = false } = {}) {
  const color = dark ? C.frost : C.ink
  return layer('MARKS', ruler(0, 0, W, { color, op: dark ? 0.45 : 0.5 }) + '\n'
    + ruler(0, 0, H, { color, op: dark ? 0.45 : 0.5, vertical: true }) + '\n'
    + cropMarks(36, 36, W - 72, H - 72, { color, off: 0, len: 14, sw: 2 }))
}

// An image slot: the embedded picture when one is given, otherwise a hatched
// placeholder that says what goes there. Either way the layer is called IMAGE — replace.
function imageSlot(id, x, y, w, h, opts, { label = 'IMAGE — replace', fill = C.ice, hatchColor = C.frost, textColor = C.ink2, placeholder = '' } = {}) {
  if (opts.imageData) {
    return layer(id, `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" xlink:href="${opts.imageData(w, h)}" href="${opts.imageData(w, h)}"/>`)
  }
  return layer(id, `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>\n`
    + (placeholder || hatch(x, y, w, h, { color: hatchColor })) + '\n'
    + (label
      ? mono(x + w / 2, y + h / 2 - 4, label, { size: 26, fill: textColor, anchor: 'middle' }) + '\n'
      + mono(x + w / 2, y + h / 2 + 32, `${w} × ${h}`, { size: 20, fill: textColor, anchor: 'middle', weight: 400 })
      : ''))
}

// ---------------------------------------------------------------- SAQL highlighting

const SAQL_KW = new Set('load group by foreach generate filter order limit cogroup full left right union as asc desc and or not in is null case when then else end fill timeseries rollup having distinct'.split(' '))
const SAQL_FN = /^(sum|count|avg|min|max|unique|first|last|stddev|var|percentile_cont|percentile_disc|median|abs|ceil|floor|round|trunc|toDate|date|date_diff|now|toString|number_to_string|substr|upper|lower|coalesce|rank|row_number|dense_rank|cume_dist|over|ntile|lag|lead|daysBetween|sqrt|log|exp|power)$/
function highlightSaql(line) {
  const out = []
  const re = /(--.*$)|('(?:[^'\\]|\\.)*')|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w.]*)|(\s+)|(.)/g
  let m
  while ((m = re.exec(line))) {
    const [t] = m
    let color = C.dInk
    if (m[1]) color = C.dInk2
    else if (m[2]) color = C.glow // field names
    else if (m[3]) color = '#F2C46D' // string literals
    else if (m[4]) color = C.frost
    else if (m[5]) {
      if (SAQL_KW.has(t)) color = C.dSignal
      else if (SAQL_FN.test(t)) color = C.frost
      else if (t === 'q' || /^q\d*$/.test(t)) color = C.dInk
    } else if (m[7]) color = C.dInk2
    out.push([t, color])
  }
  return out
}

// ---------------------------------------------------------------- styles

const DEFAULT_CODE = `q = load "opportunities";
q = filter q by 'StageName' != "Closed Lost";
q = group q by 'Region';
q = foreach q generate 'Region',
      sum('Amount') as 'Pipeline';
q = order q by 'Pipeline' desc;`

const STYLES = {
  'section-overview': {
    about: 'Section number huge, section title, "SECTION 07 · 9 LESSONS", navy graph paper.',
    sample: { section: '07', title: 'SAQL', lessons: 9 },
    render(o) {
      const num = pad2(o.section ?? '07')
      const eyebrow = o.eyebrow || `SECTION ${num} · ${o.lessons ? `${o.lessons} LESSON${o.lessons === 1 ? '' : 'S'}` : 'COMING SOON'}`
      const numSize = 400
      const numW = textWidth(num, numSize)
      const tx = Math.max(560, 80 + numW + 60)
      const t = fit(o.title, { maxW: 1200 - tx, maxLines: 3, maxSize: 170, minSize: 56 })
      const th = blockHeight(t)
      const ty = 360 - th / 2 + 20
      return [
        navyGround(),
        sheetMarks({ dark: true }),
        layer('NUMBER', `<text x="94" y="566" font-family="${SANS}" font-weight="900" font-size="${numSize}" letter-spacing="${numSize * TIGHT}" fill="${C.signal}">${num}</text>\n`
        + `<text x="80" y="552" font-family="${SANS}" font-weight="900" font-size="${numSize}" letter-spacing="${numSize * TIGHT}" fill="${C.white}">${num}</text>`),
        layer('EYEBROW', mono(84, 132, eyebrow, { size: 30, fill: C.glow })),
        layer('RULE', `<rect x="${tx}" y="${n(ty - 34)}" width="96" height="10" fill="${C.glow}"/>`),
        layer('TITLE', headline(tx, ty, t, { fill: C.white })),
        layer('SHEET', mono(tx, n(ty + th + 52), o.sheet || `SHEET ${num} / ${o.totalSections || 19}`, { size: 22, fill: C.dInk2, weight: 400 })),
        brand(84, 662, { dark: true })
      ]
    }
  },

  'lesson': {
    about: 'Lesson title, section eyebrow, lesson-number badge, paper ground, signal accent bar.',
    sample: { section: '00', sectionTitle: 'Introduction', lesson: 5, title: 'Set up your org' },
    render(o) {
      const num = pad2(o.lesson ?? 1)
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      const t = fit(o.title, { maxW: 1100, maxLines: 3, maxSize: 170, minSize: 64 })
      const th = blockHeight(t)
      const ty = Math.max(256, 566 - th)
      return [
        paperGround(),
        sheetMarks(),
        layer('ACCENT', `<rect x="0" y="0" width="28" height="${H}" fill="${C.signal}"/>`),
        layer('EYEBROW', mono(84, 132, eyebrow, { size: 30 })),
        layer('BADGE', box(1000, 64, 196, 176) + '\n'
        + mono(1024, 108, o.badgeLabel || 'LESSON', { size: 22, fill: C.ink2 }) + '\n'
        + `<text x="1098" y="214" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="112" letter-spacing="${n(112 * TIGHT)}" fill="${C.ink}">${esc(num)}</text>`),
        layer('TITLE', headline(80, ty, t)),
        layer('UNDERLINE', `<rect x="84" y="${n(ty + th + 18)}" width="140" height="12" fill="${C.signal}"/>`),
        brand(84, 676)
      ]
    }
  },

  'image-heavy': {
    about: 'A large framed image slot with crop marks and a short title strip.',
    sample: { section: '05', sectionTitle: 'Data Visualization', title: 'Charts that sell' },
    render(o) {
      const x = 64
      const y = 56
      const w = 1152
      const h = 472
      const t = fit(o.title, { maxW: 820, maxLines: 1, maxSize: 96, minSize: 52 })
      const sw = Math.min(900, Math.max(520, textWidth(t.lines[0], t.size) + 72))
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      return [
        paperGround(),
        layer('FRAME', `<rect x="${x + 12}" y="${y + 12}" width="${w}" height="${h}" fill="${C.ink}"/>`),
        imageSlot('IMAGE — replace', x, y, w, h, o),
        layer('FRAME BORDER', `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${C.ink}" stroke-width="4"/>\n`
        + cropMarks(x, y, w, h, { color: C.ink, off: 18, len: 16 }) + '\n' + ruler(x, y + h + 26, 700, { op: 0.45 })),
        layer('LOGO', box(x - 16, y - 16, 84, 84, { shadow: 6, sw: 3 }) + logo(x - 10, y - 10, 72)),
        layer('TITLE STRIP', box(x, 512, sw, 150, { shadowColor: C.signal })),
        layer('EYEBROW', mono(x + 32, 556, eyebrow, { size: 22 })),
        layer('TITLE', headline(x + 30, 572, t))
      ]
    }
  },

  'text-heavy': {
    about: 'A two-line bold headline and three keyword bullets. No image.',
    sample: { section: '03', sectionTitle: 'Data Preparation', title: 'Recipes beat dataflows', bullets: ['Joins', 'Formulas', 'Schedules'] },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      const t = fit(o.title, { maxW: 1110, maxLines: 2, maxSize: 160, minSize: 64 })
      const th = blockHeight(t)
      const bullets = (o.bullets && o.bullets.length ? o.bullets : ['Keyword one', 'Keyword two', 'Keyword three']).slice(0, 3)
      let size = 46
      const chipW = s => bullets.map(b => textWidth(b, s, 800, -0.02) + 96)
      while (size > 26 && chipW(size).reduce((a, b) => a + b, 0) + 36 * (bullets.length - 1) > 1100) size -= 2
      const widths = chipW(size)
      let cx = 84
      const cy = Math.min(470, 170 + th + 64)
      const chips = bullets.map((b, i) => {
        const s = box(cx, cy, widths[i], 92, { shadow: 6, sw: 3 }) + '\n'
          + `<rect x="${cx + 26}" y="${cy + 34}" width="24" height="24" fill="${C.signal}"/>\n`
          + `<text x="${cx + 66}" y="${n(cy + 46 + size * 0.36)}" font-family="${SANS}" font-weight="800" font-size="${size}" letter-spacing="${n(size * -0.02)}" fill="${C.ink}">${esc(b)}</text>`
        cx += widths[i] + 36
        return layer(`BULLET ${i + 1}`, s)
      })
      return [
        paperGround(),
        sheetMarks(),
        layer('EYEBROW', mono(84, 132, eyebrow, { size: 30 })),
        layer('TITLE', headline(80, 166, t, { colors: [C.ink, C.signal] })),
        layer('BULLETS', chips.join('\n')),
        brand(84, 676)
      ]
    }
  },

  'saql-code': {
    about: 'A dark code-editor panel with syntax-coloured SAQL, title above.',
    sample: { section: '07', sectionTitle: 'SAQL', title: 'Group by in SAQL' },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '07')} — ${(o.sectionTitle || 'SAQL').toUpperCase()}`
      const t = fit(o.title, { maxW: 1110, maxLines: 1, maxSize: 100, minSize: 56 })
      const code = (o.code || DEFAULT_CODE).replace(/\t/g, '  ').split('\n').slice(0, 7)
      const px = 84
      const py = 250
      const pw = 1112
      const ph = 400
      const longest = Math.max(...code.map(l => l.length)) + 4
      let size = 34
      while (size > 18 && (longest * size * 0.6 > pw - 70 || code.length * size * 1.5 > ph - 90)) size -= 1
      const lh = size * 1.5
      const top = py + 64 + (ph - 64 - code.length * lh) / 2 + size * 0.8
      const lines = code.map((l, i) => {
        const spans = highlightSaql(l).map(([s, c]) => `<tspan fill="${c}">${esc(s)}</tspan>`).join('')
        return `<text x="${px + 34 + 3.6 * size * 0.6}" y="${n(top + i * lh)}" font-family="${MONO}" font-weight="500" font-size="${size}" xml:space="preserve">${spans}</text>`
      }).join('\n')
      const nums = code.map((_, i) => mono(px + 30, n(top + i * lh), pad2(i + 1), { size, fill: '#3B5687', tracking: 0, weight: 400 })).join('\n')
      return [
        navyGround(),
        sheetMarks({ dark: true }),
        layer('EYEBROW', mono(84, 112, eyebrow, { size: 28, fill: C.glow })),
        layer('TITLE', headline(80, 128, t, { fill: C.white })),
        layer('EDITOR', box(px, py, pw, ph, { fill: C.dNavy, stroke: C.frost, sw: 3, shadow: 12, shadowColor: C.signal }) + '\n'
        + `<rect x="${px + 1.5}" y="${py + 1.5}" width="${pw - 3}" height="48" fill="${C.dCard}"/>\n`
        + `<path d="M${px} ${py + 50}H${px + pw}" stroke="${C.dLine}" stroke-width="2"/>\n`
        + `<rect x="${px + 22}" y="${py + 18}" width="14" height="14" fill="${C.signal}"/><rect x="${px + 46}" y="${py + 18}" width="14" height="14" fill="${C.glow}"/><rect x="${px + 70}" y="${py + 18}" width="14" height="14" fill="${C.frost}"/>\n`
        + mono(px + 108, py + 32, o.filename || 'query.saql', { size: 18, fill: C.dInk2, tracking: 0.08 }) + '\n'
        + mono(px + pw - 24, py + 32, 'SAQL', { size: 18, fill: C.glow, anchor: 'end' })),
        layer('CODE', nums + '\n' + lines),
        brand(84, 700, { dark: true })
      ]
    }
  },

  'screen-ui': {
    about: 'A browser window holding a screenshot slot, with a callout arrow and label.',
    sample: { section: '00', sectionTitle: 'Introduction', title: 'Tour Analytics Studio', callout: 'Data Manager' },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      const t = fit(o.title, { maxW: 396, maxLines: 4, maxSize: 96, minSize: 48 })
      const wx = 500
      const wy = 84
      const ww = 724
      const wh = 520
      const sx = wx + 2
      const sy = wy + 54
      const sw = ww - 4
      const shh = wh - 56
      // A skeleton Analytics Studio so the empty template still reads as a screen.
      const sk = [
        `<rect x="${sx}" y="${sy}" width="${sw}" height="${shh}" fill="${C.card}"/>`,
        `<rect x="${sx}" y="${sy}" width="150" height="${shh}" fill="${C.ice}"/>`,
        ...[0, 1, 2, 3, 4, 5].map(i => `<rect x="${sx + 20}" y="${sy + 30 + i * 46}" width="${i === 1 ? 110 : 90}" height="14" fill="${i === 1 ? C.signal : C.frost}"/>`),
        `<rect x="${sx + 180}" y="${sy + 28}" width="260" height="22" fill="${C.ink}" fill-opacity=".85"/>`,
        ...[0, 1, 2].map(i => `<rect x="${sx + 180 + i * 172}" y="${sy + 76}" width="152" height="96" fill="${C.paper}" stroke="${C.line}" stroke-width="2"/><rect x="${sx + 196 + i * 172}" y="${sy + 96}" width="70" height="10" fill="${C.ink2}" fill-opacity=".5"/><rect x="${sx + 196 + i * 172}" y="${sy + 122}" width="96" height="28" fill="${[C.signal, C.tide, C.glow][i]}"/>`),
        `<rect x="${sx + 180}" y="${sy + 196}" width="496" height="236" fill="${C.paper}" stroke="${C.line}" stroke-width="2"/>`,
        ...[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const bh = [80, 120, 96, 150, 128, 176, 140][i]
          return `<rect x="${sx + 214 + i * 64}" y="${sy + 408 - bh}" width="40" height="${bh}" fill="${[C.frost, C.tide, C.frost, C.signal, C.tide, C.signal, C.tide][i]}"/>`
        })
      ].join('\n')
      const label = (o.callout || 'Look here').toUpperCase()
      const lw = monoWidth(label, 26, 0.12) + 44
      const tgt = o.target || [sx + 75, sy + 83] // the highlighted nav item
      const lx = 84
      const ly = 548
      const ax = lx + lw
      const ay = ly + 32
      const ang = Math.atan2(tgt[1] - ay, tgt[0] - ax)
      const hx = tgt[0] - Math.cos(ang) * 30
      const hy = tgt[1] - Math.sin(ang) * 30
      const head = (a, len) => [hx + Math.cos(ang) * 0 - Math.cos(ang + a) * len, hy - Math.sin(ang + a) * len]
      const [p1x, p1y] = head(0.45, 30)
      const [p2x, p2y] = head(-0.45, 30)
      const mx = ax + 60
      return [
        paperGround(),
        sheetMarks(),
        layer('EYEBROW', mono(84, 132, eyebrow, { size: Math.min(26, Math.floor(390 / ([...eyebrow].length * 0.74))) })),
        layer('TITLE', headline(80, 160, t)),
        layer('WINDOW', box(wx, wy, ww, wh, { shadow: 12 }) + '\n'
        + `<rect x="${wx + 2}" y="${wy + 2}" width="${ww - 4}" height="50" fill="${C.ice}"/>\n<path d="M${wx} ${wy + 52}H${wx + ww}" stroke="${C.ink}" stroke-width="3"/>\n`
        + `<rect x="${wx + 20}" y="${wy + 20}" width="14" height="14" fill="${C.ink}"/><rect x="${wx + 42}" y="${wy + 20}" width="14" height="14" fill="${C.ink}" fill-opacity=".5"/><rect x="${wx + 64}" y="${wy + 20}" width="14" height="14" fill="${C.ink}" fill-opacity=".25"/>\n`
        + `<rect x="${wx + 100}" y="${wy + 12}" width="${ww - 124}" height="30" fill="${C.card}" stroke="${C.ink}" stroke-width="2"/>\n`
        + mono(wx + 116, wy + 33, o.address || 'Analytics Studio', { size: 17, fill: C.ink2, tracking: 0.08, weight: 400 })),
        imageSlot('SCREENSHOT — replace', sx, sy, sw, shh, o, { placeholder: sk, label: '', textColor: C.ink2 }),
        layer('CALLOUT', `<rect x="${n(tgt[0] - 70)}" y="${n(tgt[1] - 22)}" width="140" height="44" fill="none" stroke="${C.signal}" stroke-width="5"/>\n`
        + `<path d="M${n(ax)} ${n(ay)}L${n(mx)} ${n(ay)}L${n(hx)} ${n(hy)}" fill="none" stroke="${C.signal}" stroke-width="6"/>\n`
        + `<path d="M${n(tgt[0] - Math.cos(ang) * 10)} ${n(tgt[1] - Math.sin(ang) * 10)}L${n(p1x)} ${n(p1y)}L${n(p2x)} ${n(p2y)}Z" fill="${C.signal}"/>\n`
        + box(lx, ly, lw, 64, { fill: C.signal, stroke: C.ink, sw: 3, shadow: 6 }) + '\n'
        + mono(lx + 22, ly + 41, label, { size: 26, fill: C.white, tracking: 0.12 })),
        brand(84, 690)
      ]
    }
  },

  'node-diagram': {
    about: 'A recipe node graph, one node highlighted, with a node-info card.',
    sample: { section: '03', sectionTitle: 'Data Preparation', title: 'The Join node', nodes: ['Opportunity', 'Join', 'Formula', 'Output'], input2: 'Account', highlight: 'Join', info: ['Join type: Lookup', 'Keys: AccountId'] },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '03')} — ${(o.sectionTitle || 'Data Preparation').toUpperCase()}`
      const t = fit(o.title, { maxW: 1110, maxLines: 1, maxSize: 104, minSize: 56 })
      const nodes = (o.nodes && o.nodes.length ? o.nodes : this.sample.nodes).slice(0, 5)
      const hi = Math.max(0, nodes.findIndex(x => x.toLowerCase() === String(o.highlight || '').toLowerCase()))
      const hiIdx = o.highlight ? hi : Math.min(1, nodes.length - 1)
      const nw = nodes.length >= 5 ? 190 : 226
      const nh = 120
      const gap = (1112 - nodes.length * nw) / (nodes.length - 1)
      const ny = 268
      const X = i => 84 + i * (nw + gap)
      const type = (name, i) => i === 0 ? 'INPUT' : i === nodes.length - 1 ? 'OUTPUT' : `NODE ${pad2(i + 1)}`
      const nodeSvg = (name, x, y, kind, on) => {
        const big = on ? 12 : 0
        const size = Math.min(40, Math.floor((nw - 36) / Math.max(1, textWidth(name, 1, 800, -0.02))))
        return box(x - big / 2, y - big / 2, nw + big, nh + big, { fill: on ? C.signal : C.card, sw: on ? 4 : 3, shadow: on ? 10 : 6 }) + '\n'
          + `<path d="M${x - big / 2} ${y + 36 - big / 2}H${x + nw + big / 2}" stroke="${on ? C.ink : C.line}" stroke-width="2"/>\n`
          + `<rect x="${x + 14}" y="${y + 12 - big / 2}" width="12" height="12" fill="${on ? C.white : C.signal}"/>\n`
          + mono(x + 36, y + 24 - big / 2, kind, { size: 16, fill: on ? C.ice : C.ink2, tracking: 0.12 }) + '\n'
          + `<text x="${x + 18}" y="${n(y + 94)}" font-family="${SANS}" font-weight="800" font-size="${size}" letter-spacing="${n(size * -0.02)}" fill="${on ? C.white : C.ink}">${esc(name)}</text>`
      }
      let wires = ''
      for (let i = 0; i < nodes.length - 1; i++) wires += `M${X(i) + nw} ${ny + nh / 2}H${X(i + 1)}`
      let extra = ''
      if (o.input2 !== '' && o.input2 !== false) {
        const in2 = o.input2 || this.sample.input2
        const ix = Math.max(84, X(hiIdx) - nw - gap)
        const iy = 462
        if (hiIdx > 0) {
          wires += `M${ix + nw} ${iy + nh / 2}H${X(hiIdx) - gap / 2}V${ny + nh / 2}`
          extra = layer('INPUT 2', nodeSvg(in2, ix, iy, 'INPUT', false))
        }
      }
      const info = (o.info && o.info.length ? o.info : this.sample.info).slice(0, 3)
      const iw = Math.max(420, ...info.map(s => monoWidth(s, 28, 0.02) + 60))
      const ix = Math.min(Math.max(84, X(hiIdx) + nw / 2 - iw / 2 + 140), 1196 - iw)
      const ih = 66 + info.length * 44
      // keep the card clear of the bottom-right timestamp
      const iy = Math.min(462, 626 - ih)
      const ports = nodes.map((_, i) => (i ? `<rect x="${X(i) - 7}" y="${ny + nh / 2 - 7}" width="14" height="14" fill="${C.ink}"/>` : '')).join('')
      return [
        paperGround(),
        sheetMarks(),
        layer('EYEBROW', mono(84, 112, eyebrow, { size: 28 })),
        layer('TITLE', headline(80, 128, t)),
        layer('WIRES', `<path d="${wires}" fill="none" stroke="${C.ink}" stroke-width="4"/>\n${ports}`),
        extra,
        ...nodes.map((name, i) => layer(i === hiIdx ? `NODE ${i + 1} — highlight` : `NODE ${i + 1}`, nodeSvg(name, X(i), ny, type(name, i), i === hiIdx))),
        layer('NODE INFO', `<path d="M${X(hiIdx) + nw / 2} ${ny + nh + 6}V${iy}" stroke="${C.signal}" stroke-width="3" stroke-dasharray="8 6"/>\n`
        + box(ix, iy, iw, ih, { shadow: 8, sw: 3, shadowColor: C.signal }) + '\n'
        + mono(ix + 26, iy + 38, `NODE INFO — ${nodes[hiIdx].toUpperCase()}`, { size: 18 }) + '\n'
        + info.map((s, i) => mono(ix + 26, iy + 86 + i * 44, s, { size: 28, fill: C.ink, tracking: 0.02 })).join('\n')),
        brand(84, 690)
      ]
    }
  },

  'person': {
    about: 'Talking head: a cut-out photo slot on one side, a 2–4 word hook on the other.',
    sample: { section: '00', sectionTitle: 'Introduction', title: 'Start here', name: 'Swarnil Singhai', role: 'CRM Analytics' },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      const t = fit(o.title, { maxW: 600, maxLines: 3, maxSize: 170, minSize: 64 })
      const th = blockHeight(t)
      const ty = 360 - th / 2 + 10
      const px = 740
      const pw = W - px
      const colors = t.lines.map((_, i) => (i === t.lines.length - 1 ? C.signal : C.ink))
      const silhouette = `<rect x="${px}" y="0" width="${pw}" height="${H}" fill="${C.ice}"/>\n` + grid(px, 0, pw, H, { minor: C.frost, major: C.tide, minorOp: 0.5, majorOp: 0.3 }) + '\n'
        + `<circle cx="${px + pw / 2}" cy="300" r="112" fill="${C.frost}"/>\n<path d="M${px + 70} ${H}C${px + 90} 470 ${px + pw - 90} 470 ${px + pw - 70} ${H}Z" fill="${C.frost}"/>\n`
        + mono(px + pw / 2, 120, 'PHOTO — replace', { size: 24, fill: C.ink2, anchor: 'middle' }) + '\n'
        + mono(px + pw / 2, 152, 'cut-out PNG, 540 × 720', { size: 18, fill: C.ink2, anchor: 'middle', weight: 400 })
      return [
        paperGround(),
        sheetMarks(),
        imageSlot('PHOTO — replace', px, 0, pw, H, o, { placeholder: silhouette, label: '' }),
        layer('PHOTO EDGE', `<rect x="${px - 2}" y="0" width="6" height="${H}" fill="${C.ink}"/>\n` + cropMarks(px + 30, 36, pw - 66, H - 72, { color: C.ink, off: 0, len: 14 })),
        layer('EYEBROW', mono(84, 132, eyebrow, { size: 28 })),
        layer('TITLE', headline(80, ty, t, { colors })),
        layer('UNDERLINE', `<rect x="84" y="${n(ty + th + 22)}" width="140" height="14" fill="${C.signal}"/>`),
        layer('NAME TAG', box(px - 210, 588, 400, 76, { shadow: 6, sw: 3 }) + '\n'
        + `<text x="${px - 188}" y="626" font-family="${SANS}" font-weight="800" font-size="28" letter-spacing="-0.6" fill="${C.ink}">${esc(o.name || 'Swarnil Singhai')}</text>\n`
        + mono(px - 188, 652, (o.role || 'CRM Analytics').toUpperCase(), { size: 16, fill: C.signal })),
        brand(84, 676)
      ]
    }
  },

  'versus': {
    about: 'Comparison: two cards, A vs B, with a title above.',
    sample: { section: '03', sectionTitle: 'Data Preparation', title: 'Which one to use?', left: 'Dataflow', right: 'Recipe', leftLabel: 'LEGACY', rightLabel: 'USE THIS' },
    render(o) {
      const eyebrow = o.eyebrow || `FIG. ${pad2(o.section ?? '00')} — ${(o.sectionTitle || 'CRM Analytics').toUpperCase()}`
      const t = fit(o.title, { maxW: 1110, maxLines: 1, maxSize: 100, minSize: 56 })
      const L = o.left || this.sample.left
      const R = o.right || this.sample.right
      const cw = 480
      const ch = 300
      const cy = 262
      const word = (s, x, fill) => {
        const f = fit(s, { maxW: cw - 60, maxLines: 2, maxSize: 96, minSize: 44 })
        return headline(x + 30, cy + ch / 2 - blockHeight(f) / 2 + 24, f, { fill })
      }
      return [
        paperGround(),
        sheetMarks(),
        layer('EYEBROW', mono(84, 112, eyebrow, { size: 28 })),
        layer('TITLE', headline(80, 128, t)),
        layer('LEFT', box(84, cy, cw, ch, { shadow: 10 }) + '\n' + mono(114, cy + 46, o.leftLabel || 'BEFORE', { size: 22, fill: C.ink2 }) + '\n' + word(L, 84, C.ink2)),
        layer('RIGHT', box(1196 - cw, cy, cw, ch, { fill: C.signal, shadow: 10 }) + '\n' + mono(1226 - cw, cy + 46, o.rightLabel || 'AFTER', { size: 22, fill: C.ice }) + '\n' + word(R, 1196 - cw, C.white)),
        layer('VS', box(640 - 62, cy + ch / 2 - 62, 124, 124, { fill: C.ink, stroke: C.ink, shadow: 0 })
        + `<text x="640" y="${cy + ch / 2 + 22}" text-anchor="middle" font-family="${SANS}" font-weight="900" font-size="64" letter-spacing="-2" fill="${C.white}">vs</text>`),
        brand(84, 676)
      ]
    }
  }
}

// ---------------------------------------------------------------- content lookup

const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')
const titleCase = s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function sections() {
  return fs.readdirSync(CONTENT).filter(d => /^\d+\./.test(d) && fs.statSync(path.join(CONTENT, d)).isDirectory()).sort().map((dir) => {
    let nav = {}
    try {
      nav = parseYaml(fs.readFileSync(path.join(CONTENT, dir, '.navigation.yml'), 'utf8')) || {}
    } catch {
      // no .navigation.yml: fall back to the folder name
    }
    const files = fs.readdirSync(path.join(CONTENT, dir)).filter(f => f.endsWith('.md')).sort()
    const lessons = files.filter(f => strip(f) !== 'index').length
    return { dir, slug: strip(dir), number: dir.split('.')[0], title: nav.title || titleCase(strip(dir)), lessons, files }
  })
}

function frontmatter(file) {
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)
  return m ? parseYaml(m[1]) || {} : {}
}

// "introduction/set-up-your-org", "00.introduction/05.set-up-your-org", a path to the .md,
// or a bare section ("saql").
function resolveRoute(ref) {
  const clean = ref.replace(/^.*content\/en\//, '').replace(/\.md$/, '').replace(/^\/+|\/+$/g, '')
  const [secRef, lessonRef] = clean.split('/')
  const sec = sections().find(s => s.dir === secRef || s.slug === secRef || s.number === pad2(secRef))
  if (!sec) throw new Error(`No section matches "${secRef}" in content/en`)
  const out = { section: sec.number, sectionTitle: sec.title, lessons: sec.lessons, title: sec.title }
  if (!lessonRef) return out
  const file = sec.files.find(f => f === `${lessonRef}.md` || strip(f) === lessonRef)
  if (!file) throw new Error(`No lesson "${lessonRef}" in ${sec.dir}`)
  const fm = frontmatter(path.join(CONTENT, sec.dir, file))
  const long = fm.title || titleCase(strip(file))
  const short = fm.thumbnail?.title || fm.navigation?.title || long
  return {
    ...out,
    lesson: Number(file.split('.')[0]),
    title: long.split(/\s+/).length <= 6 ? long : short,
    slug: `${sec.number}-${file.split('.')[0]}-${strip(file)}`
  }
}

// ---------------------------------------------------------------- output

function imageDataFactory(file) {
  if (!file) return null
  const abs = path.resolve(process.cwd(), file)
  if (!fs.existsSync(abs)) throw new Error(`--image not found: ${abs}`)
  const png = /\.png$/i.test(abs)
  return (w, h) => {
    // Crop to the slot with sips (built into macOS) so the SVG carries only the pixels
    // it shows, at 2x for a sharp result in Pixelmator.
    const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || '/tmp'), 'thumb-'))
    const out = path.join(tmp, png ? 'i.png' : 'i.jpg')
    const dims = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', abs], { encoding: 'utf8' })
    const iw = Number(dims.match(/pixelWidth: (\d+)/)[1])
    const ih = Number(dims.match(/pixelHeight: (\d+)/)[1])
    const k = Math.max((w * 2) / iw, (h * 2) / ih)
    const rw = Math.ceil(iw * k)
    const rh = Math.ceil(ih * k)
    execFileSync('sips', ['-s', 'format', png ? 'png' : 'jpeg', ...(png ? [] : ['-s', 'formatOptions', '82']), '-z', String(rh), String(rw), abs, '--out', out], { stdio: 'ignore' })
    execFileSync('sips', ['-c', String(h * 2), String(w * 2), out], { stdio: 'ignore' })
    const data = `data:image/${png ? 'png' : 'jpeg'};base64,${fs.readFileSync(out).toString('base64')}`
    fs.rmSync(tmp, { recursive: true, force: true })
    return data
  }
}

function renderPng(svgFile, pngFile) {
  execFileSync(process.env.RSVG || (fs.existsSync('/opt/homebrew/bin/rsvg-convert') ? '/opt/homebrew/bin/rsvg-convert' : 'rsvg-convert'),
    ['-w', String(W), '-h', String(H), '-o', pngFile, svgFile])
  const size = fs.statSync(pngFile).size
  if (size > 2 * 1024 * 1024) {
    // YouTube's limit is 2 MB. A photo-heavy PNG can pass it; ship a JPEG beside it.
    const jpg = pngFile.replace(/\.png$/, '.jpg')
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', pngFile, '--out', jpg], { stdio: 'ignore' })
    console.log(`  ${path.relative(process.cwd(), jpg)} (PNG is ${(size / 1048576).toFixed(1)} MB, over YouTube's 2 MB)`)
  }
}

// Pixelmator Pro imports an SVG as layers: every <g id> becomes a named group, every
// <text> a live text layer. Export that as .pxd, then close without touching anything else.
function toPxd(svgFile, pxdFile) {
  const script = `
on run argv
  set src to POSIX file (item 1 of argv)
  set dst to POSIX file (item 2 of argv)
  tell application "Pixelmator Pro"
    set d to open src
    set docName to name of d
    export d to dst as Pixelmator Pro
    delay 0.3
    close d saving no
    -- An import can survive the first close while the export settles; close only the
    -- untitled import made here (same name, no file), never the user's own documents.
    repeat 10 times
      set found to false
      repeat with s in (documents whose name is docName)
        if (file of s) is missing value then
          close s saving no
          set found to true
        end if
      end repeat
      if not found then exit repeat
      delay 0.3
    end repeat
  end tell
end run`
  execFileSync('osascript', ['-e', script, path.resolve(svgFile), path.resolve(pxdFile)], { stdio: ['ignore', 'ignore', 'inherit'], timeout: 120000 })
}

function build(style, opts, outDir, base, { pxd = false, png = true } = {}) {
  const def = STYLES[style]
  if (!def) throw new Error(`Unknown style "${style}". Styles: ${Object.keys(STYLES).join(', ')}`)
  const o = { ...def.sample, ...opts }
  if (!opts.title && opts.sectionTitle && style === 'section-overview') o.title = opts.sectionTitle
  const words = String(o.title).split(/\s+/).length
  if (words > 6) console.warn(`  ! "${o.title}" is ${words} words; thumbnails read best at 6 or fewer (use --title).`)
  const svg = svgDoc(def.render.call(def, o).filter(Boolean).join('\n'), `${style}: ${o.title}`)
  fs.mkdirSync(outDir, { recursive: true })
  const svgFile = path.join(outDir, `${base}.svg`)
  fs.writeFileSync(svgFile, svg)
  const made = [svgFile]
  if (png) {
    const p = path.join(outDir, `${base}.png`)
    renderPng(svgFile, p)
    made.push(p)
  }
  if (pxd) {
    const p = path.join(outDir, `${base}.pxd`)
    toPxd(svgFile, p)
    made.push(p)
  }
  for (const f of made) console.log(`  ${path.relative(process.cwd(), f)}`)
  return made
}

function contactSheet(dir, styles, outFile) {
  const cw = 640
  const chh = 360
  const cols = 3
  const gap = 32
  const lab = 44
  const rows = Math.ceil(styles.length / cols)
  const sw = cols * cw + (cols + 1) * gap
  const sh = rows * (chh + lab) + (rows + 1) * gap + 70
  const cells = styles.map((s, i) => {
    const x = gap + (i % cols) * (cw + gap)
    const y = 90 + Math.floor(i / cols) * (chh + lab + gap)
    const tmp = path.join(dir, `.${s}.sheet.jpg`)
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80', '-Z', String(cw * 1.5), path.join(dir, `${s}.png`), '--out', tmp], { stdio: 'ignore' })
    const data = fs.readFileSync(tmp).toString('base64')
    fs.rmSync(tmp)
    return `<rect x="${x + 6}" y="${y + lab + 6}" width="${cw}" height="${chh}" fill="${C.ink}"/>`
      + `<image x="${x}" y="${y + lab}" width="${cw}" height="${chh}" href="data:image/jpeg;base64,${data}"/>`
      + `<rect x="${x}" y="${y + lab}" width="${cw}" height="${chh}" fill="none" stroke="${C.ink}" stroke-width="2"/>`
      + mono(x, y + 28, `${pad2(i + 1)} — ${s}`, { size: 18 })
  }).join('\n')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}"><rect width="${sw}" height="${sh}" fill="${C.paper}"/>${grid(0, 0, sw, sh)}${mono(gap, 54, 'SHEET 01 / YOUTUBE THUMBNAIL TEMPLATES — CRM ANALYTICS ACADEMY', { size: 22, fill: C.ink })}${cells}</svg>`
  const tmpSvg = path.join(dir, '.contact-sheet.svg')
  fs.writeFileSync(tmpSvg, svg)
  execFileSync(fs.existsSync('/opt/homebrew/bin/rsvg-convert') ? '/opt/homebrew/bin/rsvg-convert' : 'rsvg-convert', ['-o', outFile, tmpSvg])
  fs.rmSync(tmpSvg)
  execFileSync('sips', ['-s', 'format', 'png', outFile], { stdio: 'ignore' })
  console.log(`  ${path.relative(process.cwd(), outFile)}`)
}

// ---------------------------------------------------------------- cli

function parseArgs(argv) {
  const pos = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      if (v !== undefined) flags[k] = v
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) flags[k] = argv[++i]
      else flags[k] = true
    } else pos.push(a)
  }
  return { pos, flags }
}

const list = v => (v === undefined || v === true ? undefined : String(v).split(/\s*[|,]\s*/).filter(Boolean))
const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 60)

function optsFromFlags(f) {
  const o = {}
  for (const k of ['title', 'eyebrow', 'callout', 'address', 'filename', 'name', 'role', 'left', 'right', 'sheet', 'highlight']) if (typeof f[k] === 'string') o[k] = f[k]
  if (f['section-title']) o.sectionTitle = f['section-title']
  if (f['left-label']) o.leftLabel = f['left-label']
  if (f['right-label']) o.rightLabel = f['right-label']
  if (f['badge-label']) o.badgeLabel = f['badge-label']
  if (f.section !== undefined) o.section = pad2(f.section)
  if (f.lesson !== undefined) o.lesson = Number(f.lesson)
  if (f.lessons !== undefined) o.lessons = Number(f.lessons)
  if (f.bullets) o.bullets = list(f.bullets)
  if (f.nodes) o.nodes = list(f.nodes)
  if (f.info) o.info = String(f.info).split(/\s*\|\s*/)
  if (f.input2 !== undefined) o.input2 = f.input2 === true || f.input2 === 'none' ? '' : f.input2
  if (f.target) o.target = String(f.target).split(',').map(Number)
  if (f.code) o.code = fs.readFileSync(path.resolve(process.cwd(), f.code), 'utf8').trimEnd()
  if (f.image) o.imageData = imageDataFactory(f.image)
  return o
}

function usage() {
  console.log(`pnpm thumb <style> [route] [options]\n\nStyles:\n${Object.entries(STYLES).map(([k, v]) => `  ${k.padEnd(17)} ${v.about}`).join('\n')}
\nOptions:
  --title "..."         headline (6 words or fewer reads best)
  --eyebrow "..."       mono label above the title (default FIG. NN — SECTION)
  --section 07          section number      --section-title "SAQL"
  --lesson 3            lesson number       --lessons 9 (section-overview count)
  --image file          photo/screenshot for image-heavy, screen-ui, person
  --code file.saql      code for saql-code  --filename query.saql
  --bullets "A,B,C"     text-heavy keywords
  --callout "Label"     screen-ui label     --target 600,220 (arrow tip)
  --nodes "A,B,C,D"     node-diagram chain  --highlight B  --input2 Account|none
  --info "k: v|k: v"    node-diagram info card lines
  --left/--right "..."  versus words        --left-label/--right-label
  --out dir             default content-creation/thumbnails/out
  --pxd                 also save a Pixelmator Pro document
\nOther:
  --all-sections        one section-overview per section folder in content/en
  --templates           rebuild templates/ and previews/ (add --pxd for the .pxd files)`)
}

function main() {
  const { pos, flags } = parseArgs(process.argv.slice(2))
  const outDir = path.resolve(process.cwd(), typeof flags.out === 'string' ? flags.out : path.join(HERE, 'out'))
  const pxd = Boolean(flags.pxd)

  if (flags.help || flags.list || (!pos.length && !flags['all-sections'] && !flags.templates)) return usage()

  if (flags.templates) {
    const styles = Object.keys(STYLES)
    console.log('templates/')
    for (const s of styles) build(s, {}, path.join(HERE, 'templates'), s, { pxd, png: false })
    console.log('previews/')
    for (const s of styles) renderPng(path.join(HERE, 'templates', `${s}.svg`), path.join(HERE, 'previews', `${s}.png`))
    contactSheet(path.join(HERE, 'previews'), styles, path.join(HERE, 'previews', 'contact-sheet.png'))
    return
  }

  if (flags['all-sections']) {
    const all = sections()
    for (const s of all) {
      build('section-overview', { section: s.number, title: s.title, lessons: s.lessons, totalSections: all.length, ...optsFromFlags({ ...flags, title: undefined }) },
        outDir, `section-${s.number}-${s.slug}`, { pxd })
    }
    return
  }

  const [style, route] = pos
  let opts = {}
  let base = style
  if (route) {
    const r = resolveRoute(route)
    opts = { ...r }
    base = r.slug ? `${r.slug}-${style}` : `section-${r.section}-${style}`
  }
  if (!opts.totalSections) opts.totalSections = sections().length
  opts = { ...opts, ...optsFromFlags(flags) }
  if (!route && !flags.title) throw new Error('Give a route (e.g. introduction/set-up-your-org) or --title "..."')
  if (!route) base = `${style}-${slugify(opts.title)}`
  build(style, opts, outDir, base, { pxd })
}

try {
  main()
} catch (e) {
  console.error(`thumb: ${e.message}`)
  process.exit(1)
}
