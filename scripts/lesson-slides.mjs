/**
 * Turn a lesson into a slide deck for video.
 *
 *   node scripts/lesson-slides.mjs <route | content/en file> [--out content-assets/slides] [--no-png]
 *
 *   node scripts/lesson-slides.mjs /saql/grouping-and-windowing
 *   node scripts/lesson-slides.mjs content/en/00.introduction/05.set-up-your-org.md
 *
 * Reads the ENGLISH lesson (frontmatter + markdown) and writes, into
 * <out>/<section>--<lesson>/:
 *
 *   NN-<type>.svg / .png   1920×1080 Blueprint slides: title, what you'll learn,
 *                          one concept per `##`, examples from code blocks, one
 *                          lab slide per walkthrough shot, quiz, recap, end
 *   slides.json            order, type, title, file, suggested duration, notes —
 *                          read by content-assets/after-effects/import-lesson-slides.jsx
 *   notes.md               speaker notes per slide (the lesson prose / walkthrough lines)
 *   premiere-timeline.xml  FCP7 XML: File → Import in Premiere Pro gives a timed
 *                          sequence of the PNGs with a marker per slide
 *
 * The SVGs are the source; PNGs are renders (rsvg-convert). Edit the SVG, or the
 * text in After Effects after importing — the deck is a starting cut, not a
 * final one. No npm dependencies beyond `yaml`, which the site already has.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const EN = path.join(ROOT, 'content/en')
const RSVG = ['/opt/homebrew/bin/rsvg-convert', '/usr/local/bin/rsvg-convert', 'rsvg-convert'].find(p => !p.includes('/') || existsSync(p))
const SITE = 'crmanalytics.imswarnil.com'
const W = 1920
const H = 1080
const FPS = 30

const C = {
  paper: '#F4F7FB', card: '#FAFCFE', ink: '#0C1B33', ink2: '#4A5B78', navy: '#0F2A5C', code: '#07122A',
  signal: '#2F5BEA', tide: '#3D8BD9', frost: '#A8CCF2', ice: '#DDEBFA', glow: '#3FC6DC'
}
const SANS = `'Schibsted Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif`
const MONO = `'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace`

/* ------------------------------------------------------------- arguments */

const args = process.argv.slice(2)
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')).map(([k, v]) => [k, v ?? true]))
const outIdx = args.indexOf('--out')
if (outIdx >= 0 && args[outIdx + 1]) flags.out = args[outIdx + 1]
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')
if (!target) {
  console.error('usage: node scripts/lesson-slides.mjs <route | content/en file> [--out content-assets/slides] [--no-png]')
  process.exit(1)
}
const OUT = path.resolve(ROOT, typeof flags.out === 'string' ? flags.out : 'content-assets/slides')

/* ----------------------------------------------------------- the lesson */

const strip = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')
const dirs = readdirSync(EN).filter(d => !d.startsWith('.') && statSync(path.join(EN, d)).isDirectory()).sort()

/** Every lesson in course order, so a lesson knows its number. */
const course = dirs.flatMap(d => readdirSync(path.join(EN, d)).filter(f => f.endsWith('.md')).sort().map(f => path.join(EN, d, f)))

function resolveLesson(arg) {
  if (arg.endsWith('.md')) {
    const p = path.resolve(ROOT, arg)
    if (existsSync(p)) return p
  }
  const [section, lesson = 'index'] = arg.replace(/^\/|\/$/g, '').split('/')
  const dir = dirs.find(d => strip(d) === section)
  const file = dir && readdirSync(path.join(EN, dir)).find(f => f.endsWith('.md') && strip(f) === lesson)
  if (!file) throw new Error(`No English lesson for ${arg}`)
  return path.join(EN, dir, file)
}

const file = resolveLesson(target)
const sectionDir = path.basename(path.dirname(file))
const navFile = path.join(path.dirname(file), '.navigation.yml')
const sectionTitle = existsSync(navFile) ? (parseYaml(readFileSync(navFile, 'utf8'))?.title ?? strip(sectionDir)) : strip(sectionDir)
const raw = readFileSync(file, 'utf8')
const fm = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
const data = fm ? (parseYaml(fm[1]) ?? {}) : {}
const body = fm ? fm[2] : raw
const route = `/${strip(sectionDir)}${strip(path.basename(file)) === 'index' ? '' : `/${strip(path.basename(file))}`}`
const lessonNo = course.indexOf(file) + 1
const lessonCode = `LESSON ${String(lessonNo).padStart(3, '0')} / ${course.length}`
const title = String(data.title ?? strip(path.basename(file)))

/* -------------------------------------------------- markdown → sections */

/** Plain text from inline markdown: links, emphasis, code ticks, MDC attrs. */
const plain = s => String(s)
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\{[^}]*\}/g, '')
  .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()

/** Most lesson fences are unlabelled; name the common ones for the slide tag. */
function guessLang(code) {
  if (/\b(load|foreach|generate|group)\b[\s\S]*;/.test(code) || /^\s*q\s*=/m.test(code)) return 'saql'
  if (/^\s*[{[]/.test(code)) return 'json'
  if (/\bSELECT\b[\s\S]*\bFROM\b/i.test(code)) return 'soql'
  return 'text'
}

/**
 * Walks the body once: `##` sections with their prose, and fenced code blocks.
 * MDC blocks (`::name` … `::`) contribute their prose lines (callouts are the
 * lesson's key sentences) but not their YAML props.
 */
function parseBody(md) {
  const sections = []
  const codes = []
  let cur = { heading: null, prose: [] }
  let inCode = false
  let codeLang = ''
  let codeLines = []
  let inProps = false
  const lines = md.split('\n')
  for (const line of lines) {
    if (inCode) {
      if (/^```/.test(line)) {
        codes.push({ lang: codeLang || guessLang(codeLines.join('\n')), code: codeLines.join('\n'), heading: cur.heading })
        inCode = false
      } else {
        codeLines.push(line)
      }
      continue
    }
    const fence = line.match(/^```\s*([\w-]*)/)
    if (fence) {
      inCode = true
      codeLang = fence[1]
      codeLines = []
      continue
    }
    if (/^---\s*$/.test(line)) {
      inProps = !inProps
      continue
    }
    if (inProps) continue
    if (/^::/.test(line) || /^:[a-z-]+/.test(line)) continue
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      if (cur.heading || cur.prose.length) sections.push(cur)
      cur = { heading: plain(h2[1]), prose: [] }
      continue
    }
    if (/^#\s/.test(line)) continue
    if (/^#{3,}\s/.test(line)) {
      cur.prose.push(plain(line.replace(/^#+\s*/, '')) + '.')
      continue
    }
    const text = plain(line.replace(/^\s*[-*]\s+/, '').replace(/^\s*\d+\.\s+/, '').replace(/^>\s?/, '').replace(/^\|.*\|$/, ''))
    if (text) cur.prose.push(text)
  }
  if (cur.heading || cur.prose.length) sections.push(cur)
  return { sections, codes }
}

const { sections, codes } = parseBody(body)
const intro = sections.find(s => !s.heading)
// "Next" / "Summary" sections point at other lessons; they are not concepts.
const concepts = sections.filter(s => s.heading && !/^(next( steps)?|what'?s next|summary|recap|further reading)$/i.test(s.heading)).slice(0, 8)

const sentences = text => (text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? []).map(s => s.trim()).filter(s => s.length > 12)
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1) > 40 ? s.lastIndexOf(' ', n - 1) : n - 1).replace(/[,;:—–-]+$/, '')}…`)
const words = s => s.split(/\s+/).filter(Boolean).length

/* ------------------------------------------------------------ drawing */

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Greedy wrap by an average glyph width; good enough for slides. */
function wrap(text, fontSize, maxWidth, ratio = 0.52) {
  const perLine = Math.max(8, Math.floor(maxWidth / (fontSize * ratio)))
  const out = []
  let line = ''
  for (const w of String(text).split(/\s+/)) {
    if ((line + ' ' + w).trim().length > perLine) {
      if (line) out.push(line)
      line = w
    } else {
      line = (line + ' ' + w).trim()
    }
  }
  if (line) out.push(line)
  return out
}

function textBlock(x, y, lines, { size, weight = 400, color = C.ink, family = SANS, lh = 1.2, spacing = 0 }) {
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" letter-spacing="${spacing}">${
    lines.map((l, i) => `<tspan x="${x}" dy="${i ? size * lh : 0}">${esc(l)}</tspan>`).join('')
  }</text>`
}

function grid(dark) {
  const minor = dark ? 'rgba(168,204,242,0.07)' : 'rgba(47,91,234,0.055)'
  const major = dark ? 'rgba(168,204,242,0.14)' : 'rgba(47,91,234,0.11)'
  return `<pattern id="m" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${minor}"/></pattern>
<pattern id="g" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="url(#m)"/><path d="M120 0H0V120" fill="none" stroke="${major}" stroke-width="1.25"/></pattern>`
}

function ruler(x, y, len, color) {
  let d = ''
  for (let i = 0; i <= len; i += 8) d += `M${x + i} ${y}v${i % 40 === 0 ? 14 : 7}`
  return `<path d="${d}" stroke="${color}" stroke-width="1" opacity=".6"/>`
}

function crop(x, y, w, h, color, a = 14) {
  const p = (cx, cy) => `M${cx - a} ${cy}h${a * 2}M${cx} ${cy - a}v${a * 2}`
  return `<path d="${p(x, y)}${p(x + w, y)}${p(x, y + h)}${p(x + w, y + h)}" stroke="${color}" stroke-width="1.5"/>`
}

function logo(x, y, s, dark) {
  const pad = s * 0.2
  const bw = (s - pad * 2) / 4.2
  const gap = bw * 0.6
  const bars = [0.35, 0.6, 0.9].map((k, i) => {
    const h = (s - pad * 2) * k
    return `<rect x="${x + pad + i * (bw + gap)}" y="${y + s - pad - h}" width="${bw}" height="${h}" fill="${[C.frost, C.tide, C.signal][i]}"/>`
  }).join('')
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="none" stroke="${dark ? '#FFFFFF' : C.ink}" stroke-width="2"/>${bars}`
}

/** The common sheet: grid, frame, header strip, footer with counter. */
function frame({ n, total, kind, dark = false, content }) {
  const fg = dark ? '#FFFFFF' : C.ink
  const muted = dark ? 'rgba(255,255,255,.62)' : C.ink2
  const accent = dark ? C.glow : C.signal
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${grid(dark)}</defs>
<rect width="${W}" height="${H}" fill="${dark ? C.navy : C.paper}"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
${crop(96, 96, W - 192, H - 192, dark ? C.frost : C.ink)}
${logo(96, 40, 36, dark)}
${textBlock(148, 66, [`CRM ANALYTICS ACADEMY  ·  ${sectionTitle.toUpperCase()}`], { size: 17, family: MONO, color: muted, spacing: 2.5 })}
${textBlock(W - 96 - (lessonCode.length * 10.6), 66, [lessonCode], { size: 17, family: MONO, color: muted, spacing: 2.5 })}
${textBlock(160, 176, [`FIG. ${String(n).padStart(2, '0')} — ${kind.toUpperCase()}`], { size: 20, family: MONO, color: accent, spacing: 3 })}
${content}
${ruler(96, H - 84, W - 192, fg)}
${textBlock(96, H - 34, [`${SITE}${route}`], { size: 17, family: MONO, color: muted, spacing: 1.5 })}
${textBlock(W - 96 - 90, H - 34, [`${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`], { size: 17, family: MONO, color: muted, spacing: 2 })}
</svg>
`
}

function bullets(items, x, y, { size = 38, width = 1400, gap = 34 } = {}) {
  let cy = y
  let svg = ''
  items.forEach((item, i) => {
    const lines = wrap(item, size, width)
    svg += `<rect x="${x}" y="${cy - size * 0.72}" width="${size * 0.9}" height="${size * 0.9}" fill="${i === 0 ? C.signal : C.card}" stroke="${C.ink}" stroke-width="2"/>`
    svg += textBlock(x + size * 0.45, cy + size * 0.02 - 4, [String(i + 1)], { size: size * 0.55, weight: 700, family: MONO, color: i === 0 ? '#FFFFFF' : C.ink })
      .replace('<text ', '<text text-anchor="middle" ')
    svg += textBlock(x + size * 1.6, cy, lines, { size, color: C.ink, lh: 1.28 })
    cy += lines.length * size * 1.28 + gap
  })
  return svg
}

/* ------------------------------------------------------------- slides */

const slides = []
const add = (type, slideTitle, notes, duration, render) => slides.push({ type, title: slideTitle, notes, duration, render })

// 1. Title
add('title', title, [data.description, intro ? intro.prose.join(' ') : ''].filter(Boolean).join('\n\n'), 6, (n, total) => frame({
  n, total, kind: 'Lesson', dark: true,
  content: `${textBlock(160, 330, wrap(title, 104, 1500, 0.5), { size: 104, weight: 900, color: '#FFFFFF', lh: 1.02, spacing: -3 })}
${textBlock(164, 330 + wrap(title, 104, 1500, 0.5).length * 106 + 40, wrap(plain(data.description ?? ''), 36, 1300).slice(0, 3), { size: 36, color: 'rgba(255,255,255,.78)', lh: 1.35 })}
<rect x="160" y="${H - 250}" width="16" height="16" fill="${C.glow}"/>
${textBlock(192, H - 236, [`${sectionTitle.toUpperCase()}  ·  ${lessonCode}`], { size: 22, family: MONO, color: C.glow, spacing: 3 })}`
}))

// 2. What you'll learn
if (concepts.length) {
  add('learn', 'What you will learn', concepts.map(c => `- ${c.heading}`).join('\n'), 6 + concepts.length, (n, total) => frame({
    n, total, kind: 'What you will learn',
    content: `${textBlock(160, 290, ['What you will learn'], { size: 76, weight: 900, spacing: -2 })}
${bullets(concepts.slice(0, 6).map(c => c.heading), 164, 420, { size: 40, width: 1450, gap: 26 })}`
  }))
}

// 3. One concept per section
for (const c of concepts) {
  const prose = c.prose.join(' ')
  const points = sentences(prose).slice(0, 3).map(s => clip(s, 150))
  if (!points.length) continue
  add('concept', c.heading, prose, Math.min(24, Math.max(7, Math.round(words(prose.slice(0, 900)) / 2.6))), (n, total) => frame({
    n, total, kind: 'Concept',
    content: `${textBlock(160, 290, wrap(c.heading, 72, 1550, 0.5).slice(0, 2), { size: 72, weight: 900, lh: 1.05, spacing: -2 })}
${bullets(points, 164, 290 + Math.min(2, wrap(c.heading, 72, 1550, 0.5).length) * 76 + 110, { size: 36, width: 1450, gap: 30 })}`
  }))
}

// 4. Examples from code blocks
for (const code of codes.slice(0, 4)) {
  const lines = code.code.split('\n').slice(0, 16).map(l => (l.length > 88 ? `${l.slice(0, 87)}…` : l))
  add('example', `Example${code.heading ? ` — ${code.heading}` : ''}`, `${code.lang.toUpperCase()} example${code.heading ? ` from "${code.heading}"` : ''}:\n\n\`\`\`${code.lang}\n${code.code}\n\`\`\``, Math.min(20, 8 + lines.length * 0.6), (n, total) => frame({
    n, total, kind: `Example · ${code.lang}`,
    content: `${textBlock(160, 280, [clip(code.heading ?? 'Example', 60)], { size: 60, weight: 900, spacing: -1.5 })}
<rect x="160" y="340" width="${W - 320}" height="${Math.max(220, lines.length * 38 + 90)}" fill="${C.code}" stroke="${C.ink}" stroke-width="2"/>
<rect x="160" y="340" width="${W - 320}" height="44" fill="#0B1B3D"/>
${textBlock(184, 370, [code.lang.toUpperCase()], { size: 18, family: MONO, color: C.glow, spacing: 3 })}
${textBlock(184, 430, lines.length ? lines : [' '], { size: 25, family: MONO, color: '#DDEBFA', lh: 1.5 })}`
  }))
}

// 5. Lab: one slide per walkthrough shot
const shots = data.walkthrough?.shots ?? []
shots.forEach((s, i) => {
  add('lab', `Lab ${i + 1} — ${s.shot}`, [s.screen ? `Screen: ${s.screen}` : '', s.say].filter(Boolean).join('\n\n'), Number(s.seconds) || 12, (n, total) => frame({
    n, total, kind: `Lab · step ${i + 1} of ${shots.length}`,
    content: `<rect x="160" y="236" width="120" height="120" fill="${C.signal}" stroke="${C.ink}" stroke-width="2"/>
${textBlock(220, 322, [String(i + 1).padStart(2, '0')], { size: 60, weight: 900, color: '#FFFFFF', family: MONO }).replace('<text ', '<text text-anchor="middle" ')}
${textBlock(320, 290, wrap(s.shot, 60, 1400, 0.5).slice(0, 2), { size: 60, weight: 900, lh: 1.08, spacing: -1.5 })}
${s.screen
  ? `<rect x="160" y="430" width="${W - 320}" height="78" fill="${C.ice}" stroke="${C.ink}" stroke-width="2"/>
${textBlock(190, 480, [clip(s.screen, 100)], { size: 27, family: MONO, color: C.ink })}`
  : ''}
${textBlock(164, s.screen ? 600 : 470, wrap(clip(plain(s.say), 330), 32, 1560).slice(0, 5), { size: 32, color: C.ink2, lh: 1.42 })}
${s.onscreen
  ? `<rect x="160" y="${H - 240}" width="${Math.min(W - 320, 64 + s.onscreen.length * 16.5)}" height="62" fill="${C.card}" stroke="${C.signal}" stroke-width="2" stroke-dasharray="8 6"/>
${textBlock(190, H - 200, [s.onscreen], { size: 26, family: MONO, color: C.signal })}`
  : ''}`
  }))
})

// 6. Quiz
for (const q of (data.quiz ?? []).slice(0, 3)) {
  add('quiz', 'Check yourself', `${q.q}\n\nAnswer: ${q.options?.[q.answer] ?? ''}`, 14, (n, total) => {
    let y = 460
    const opts = (q.options ?? []).slice(0, 4).map((o, i) => {
      const lines = wrap(o, 30, 1380).slice(0, 2)
      const box = `<rect x="160" y="${y - 44}" width="${W - 320}" height="${lines.length * 38 + 34}" fill="${C.card}" stroke="${C.ink}" stroke-width="2"/>
${textBlock(190, y, [String.fromCharCode(65 + i)], { size: 30, weight: 700, family: MONO, color: C.signal })}
${textBlock(250, y, lines, { size: 30, lh: 1.25 })}`
      y += lines.length * 38 + 56
      return box
    }).join('')
    return frame({ n, total, kind: 'Quiz', content: `${textBlock(160, 290, wrap(q.q, 48, 1560).slice(0, 3), { size: 48, weight: 800, lh: 1.15, spacing: -1 })}${opts}` })
  })
}

// 7. Recap
if (concepts.length) {
  add('recap', 'Recap', concepts.map(c => `- ${c.heading}: ${sentences(c.prose.join(' '))[0] ?? ''}`).join('\n'), 8, (n, total) => frame({
    n, total, kind: 'Recap', dark: true,
    content: `${textBlock(160, 290, ['You can now'], { size: 76, weight: 900, color: '#FFFFFF', spacing: -2 })}
${concepts.slice(0, 6).map((c, i) => `<path d="M164 ${396 + i * 84}l14 14 26-30" fill="none" stroke="${C.glow}" stroke-width="5"/>
${textBlock(230, 410 + i * 84, [clip(c.heading, 70)], { size: 40, color: '#FFFFFF' })}`).join('')}`
  }))
}

// 8. End
const next = course[course.indexOf(file) + 1]
const nextTitle = next ? String(parseYaml(readFileSync(next, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')?.title ?? '') : ''
add('end', 'Keep going', nextTitle ? `Next lesson: ${nextTitle}. Everything is free at ${SITE}.` : `Everything is free at ${SITE}.`, 6, (n, total) => frame({
  n, total, kind: 'Next', dark: true,
  content: `${textBlock(160, 330, ['Keep going.'], { size: 120, weight: 900, color: '#FFFFFF', spacing: -4 })}
${nextTitle ? textBlock(164, 440, [`NEXT  ·  ${clip(nextTitle, 60)}`], { size: 30, family: MONO, color: C.glow, spacing: 2 }) : ''}
<rect x="160" y="560" width="760" height="110" fill="${C.signal}" stroke="#FFFFFF" stroke-width="2"/>
<rect x="172" y="680" width="760" height="10" fill="${C.glow}"/>
${textBlock(200, 630, [SITE], { size: 42, weight: 800, color: '#FFFFFF' })}`
}))

/* -------------------------------------------------------------- output */

const slug = `${strip(sectionDir)}--${strip(path.basename(file))}`
const dir = path.join(OUT, slug)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })

const total = slides.length
const manifest = []
let t = 0
slides.forEach((s, i) => {
  const n = i + 1
  const base = `${String(n).padStart(2, '0')}-${s.type}`
  const svgText = s.render(n, total)
  writeFileSync(path.join(dir, `${base}.svg`), svgText)
  if (!flags['no-png']) execFileSync(RSVG, ['-f', 'png', '-o', path.join(dir, `${base}.png`), path.join(dir, `${base}.svg`)])
  const duration = Math.round(s.duration * 2) / 2
  manifest.push({ order: n, type: s.type, title: s.title, file: `${base}.png`, svg: `${base}.svg`, start: t, duration, notes: s.notes })
  t += duration
})

writeFileSync(path.join(dir, 'slides.json'), JSON.stringify({
  lesson: title, route, section: sectionTitle, lessonCode, width: W, height: H, fps: FPS,
  crossfade: 0.5, totalDuration: t, slides: manifest
}, null, 2) + '\n')

writeFileSync(path.join(dir, 'notes.md'), `# ${title} — speaker notes\n\n${SITE}${route} · ${manifest.length} slides · ~${Math.round(t / 60)} min\n\n${
  manifest.map(s => `## ${String(s.order).padStart(2, '0')} · ${s.title} (${s.duration}s)\n\n${s.notes || '_No notes._'}\n`).join('\n')
}`)

// FCP7 XML: Premiere Pro → File → Import. Paths are absolute file URLs; move the
// folder and Premiere asks to relink — point it at the same folder.
const fr = s => Math.round(s * FPS)
const x = s => esc(s)
const clips = manifest.map((s, i) => {
  const start = fr(s.start)
  const end = fr(s.start + s.duration)
  const url = `file://localhost${encodeURI(path.join(dir, s.file))}`
  return `        <clipitem id="clip-${i + 1}">
          <name>${x(s.file)}</name>
          <duration>${end - start}</duration>
          <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
          <start>${start}</start>
          <end>${end}</end>
          <in>0</in>
          <out>${end - start}</out>
          <file id="file-${i + 1}">
            <name>${x(s.file)}</name>
            <pathurl>${x(url)}</pathurl>
            <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
            <duration>${end - start}</duration>
            <media><video><samplecharacteristics><width>${W}</width><height>${H}</height></samplecharacteristics></video></media>
          </file>
        </clipitem>`
}).join('\n')
const markers = manifest.map(s => `    <marker><name>${x(`${String(s.order).padStart(2, '0')} ${s.title}`)}</name><comment>${x(clip(s.notes.replace(/\s+/g, ' '), 240))}</comment><in>${fr(s.start)}</in><out>-1</out></marker>`).join('\n')
writeFileSync(path.join(dir, 'premiere-timeline.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-1">
    <name>${x(`${title} — slides`)}</name>
    <duration>${fr(t)}</duration>
    <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
${markers}
    <media>
      <video>
        <format>
          <samplecharacteristics>
            <rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>
            <width>${W}</width>
            <height>${H}</height>
            <pixelaspectratio>square</pixelaspectratio>
          </samplecharacteristics>
        </format>
        <track>
${clips}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>
`)

console.log(`✓ ${manifest.length} slides, ~${Math.round(t)}s → ${path.relative(ROOT, dir)}/`)
for (const s of manifest) console.log(`  ${String(s.order).padStart(2, '0')} ${s.type.padEnd(8)} ${String(s.duration).padStart(4)}s  ${s.title}`)
