#!/usr/bin/env node
// content-creation/lesson.mjs — turn an English lesson into a Final Cut Pro project.
//
//   pnpm fcp <route | path/to/lesson.md> [--out <dir>] [--seconds <n>]
//   pnpm fcp --catalog [filter]          list every CRMA title and its text fields
//
// Reads content/en/<NN.section>/<NN.lesson>.md (frontmatter: title, description,
// walkthrough.shots, quiz) plus the section's .navigation.yml, and writes
//   content-creation/projects/<slug>/<slug>.fcpxml   File → Import → XML in Final Cut Pro
//   content-creation/projects/<slug>/<slug>.md       the recording script / shot list
//
// The timeline uses the CRMA Motion templates by the same `~/Titles.localized/...`
// uids the hand-edited Lesson 01 project uses, so they resolve once
// content-creation/kit/Install.command has been run. Text is written into each title as one
// <text> per text layer, in the template's layer order, styled exactly as the
// template styles it (font, size, colour and alignment are read out of the .moti).
//
// Node 22+, no dependencies beyond `yaml` (already a devDependency of the repo).

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse as parseYaml } from 'yaml'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..')
const CONTENT = join(REPO, 'content', 'en')
const KIT = join(HERE, 'kit')
const TEMPLATES = join(KIT, 'Motion Templates')
const MUSIC = join(KIT, 'Music')
const INSTALLED = join(homedir(), 'Movies', 'Motion Templates.localized')

const FPS = 30
const DEFAULT_SHOT_SECONDS = 30

// ------------------------------------------------------------------ args
const argv = process.argv.slice(2)
const flag = (name) => {
  const i = argv.indexOf(name)
  if (i === -1) return undefined
  const v = argv[i + 1]
  argv.splice(i, 2)
  return v
}
if (argv.includes('-h') || argv.includes('--help') || argv.length === 0) {
  console.log(`Usage:
  pnpm fcp <route>                 e.g. introduction/set-up-your-org
  pnpm fcp content/en/00.introduction/05.set-up-your-org.md
  pnpm fcp <route> --out <dir>     write somewhere other than content-creation/projects/<slug>/
  pnpm fcp <route> --seconds 40    default length of a segment with no 'seconds'
  pnpm fcp --catalog [filter]      list CRMA titles and their text fields`)
  process.exit(argv.length === 0 ? 1 : 0)
}

// ------------------------------------------------------------------ template catalogue (.moti → text layers)
const templateCache = new Map()

/**
 * Text layers of one installed-style template, in layer order (top of the Layers list first).
 * Every template sits in one CRMA category per browser, grouped by theme (`folder`); a theme named
 * after its browser (Transitions) is dropped, so those templates sit straight in CRMA.
 */
function template(kind, folder, name) {
  const ext = { Titles: 'moti', Transitions: 'motr', Effects: 'moef', Generators: 'motn' }[kind]
  const theme = folder === kind ? '' : `${folder}/`
  const rel = `${kind}.localized/CRMA/${theme}${name}/${name}.${ext}`
  if (templateCache.has(rel)) return templateCache.get(rel)
  const file = join(TEMPLATES, rel)
  if (!existsSync(file)) throw new Error(`template not in the kit: ${rel}`)
  const t = { rel, uid: `~/${rel}`, name, kind, texts: kind === 'Titles' ? readTextLayers(readFileSync(file, 'utf8')) : [] }
  templateCache.set(rel, t)
  return t
}

function unescapeXml(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')
}

function readTextLayers(xml) {
  const out = []
  // Text objects are the scenenodes that open with paragraphMarginsCached (Apple text object layout).
  const re = /<scenenode name="([^"]*)" id="(\d+)" factoryID="\d+" version="\d+"><paragraphMarginsCached/g
  let m
  while ((m = re.exec(xml))) {
    const seg = xml.slice(m.index, xml.indexOf('</scenenode>', m.index))
    const font = /<font>([^<]+)<\/font>/.exec(seg)?.[1] ?? 'Helvetica'
    const size = +(/<parameter name="Size" id="3" [^>]*value="([\d.]+)"/.exec(seg)?.[1] ?? 48)
    const chan = c => +(new RegExp(`<parameter name="${c}" id="\\d" [^>]*?(?:value="([\\d.]+)")?/>`).exec(seg)?.[1] ?? 1)
    const align = ['left', 'center', 'right'][+(/<parameter name="Alignment" id="401" [^>]*value="(\d)"/.exec(seg)?.[1] ?? 0)] ?? 'left'
    const text = unescapeXml(/<text>([\s\S]*?)<\/text>/.exec(seg)?.[1] ?? '')
    out.push({ layer: unescapeXml(m[1]), text, font, size, color: [chan('Red'), chan('Green'), chan('Blue')], align })
  }
  return out
}

/** PostScript name → FCPXML font family + face ("SchibstedGrotesk-ExtraBold" → "Schibsted Grotesk", "ExtraBold"). */
function fontOf(ps) {
  const [fam, face = 'Regular'] = ps.split('-')
  const family = { SchibstedGrotesk: 'Schibsted Grotesk', IBMPlexMono: 'IBM Plex Mono' }[fam] ?? fam.replace(/([a-z])([A-Z])/g, '$1 $2')
  return { family, face }
}

if (argv[0] === '--catalog') {
  const filter = (argv[1] ?? '').toLowerCase()
  const dir = join(TEMPLATES, 'Titles.localized', 'CRMA')
  for (const folder of readdirSync(dir).filter(f => !f.startsWith('.')).sort()) {
    for (const name of readdirSync(join(dir, folder)).filter(n => !n.startsWith('.')).sort()) {
      if (filter && !`${folder}/${name}`.toLowerCase().includes(filter)) continue
      const t = template('Titles', folder, name)
      console.log(`CRMA/${folder}/${name}`)
      t.texts.forEach((x, i) => console.log(`  ${String(i + 1).padStart(2)}. ${x.layer.padEnd(18)} ${fontOf(x.font).family} ${fontOf(x.font).face} ${x.size}  "${x.text}"`))
    }
  }
  process.exit(0)
}

// ------------------------------------------------------------------ find the lesson
function stripPrefix(s) {
  return s.replace(/^\d+\./, '').replace(/\.md$/, '')
}

function resolveLesson(arg) {
  const asPath = resolve(process.cwd(), arg)
  if (arg.endsWith('.md') && existsSync(asPath)) return asPath
  const segs = arg.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (segs.length && /^[a-z]{2}$/.test(segs[0]) && segs[0] !== 'en' && segs.length > 1) segs.shift() // a locale prefix
  if (segs[0] === 'en') segs.shift()
  const [sec, lesson = 'index'] = segs
  const section = readdirSync(CONTENT).find(d => stripPrefix(d) === sec)
  if (!section) throw new Error(`no section "${sec}" under content/en`)
  const file = readdirSync(join(CONTENT, section)).find(f => f.endsWith('.md') && stripPrefix(f) === lesson)
  if (!file) throw new Error(`no lesson "${lesson}" in content/en/${section}`)
  return join(CONTENT, section, file)
}

function frontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src)
  return m ? { data: parseYaml(m[1]) ?? {}, body: m[2] } : { data: {}, body: src }
}

function sectionInfo(sectionDir) {
  const nav = join(sectionDir, '.navigation.yml')
  const title = existsSync(nav) ? parseYaml(readFileSync(nav, 'utf8'))?.title : undefined
  const dir = basename(sectionDir)
  return { dir, number: /^(\d+)\./.exec(dir)?.[1] ?? '00', slug: stripPrefix(dir), title: title ?? stripPrefix(dir).replace(/-/g, ' ') }
}

function nextLesson(file) {
  const sec = dirname(file)
  const lessons = readdirSync(sec).filter(f => f.endsWith('.md')).sort()
  const i = lessons.indexOf(basename(file))
  if (i + 1 < lessons.length) return join(sec, lessons[i + 1])
  const sections = readdirSync(CONTENT).filter(d => /^\d+\./.test(d)).sort()
  const s = sections.indexOf(basename(sec))
  for (const next of sections.slice(s + 1)) {
    const first = readdirSync(join(CONTENT, next)).filter(f => f.endsWith('.md')).sort()[0]
    if (first) return join(CONTENT, next, first)
  }
  return null
}

// ------------------------------------------------------------------ text helpers
const plain = s => String(s ?? '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '$1$2')
  .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, '$1$2')
  .replace(/:[a-z-]+\{[^}]*\}/g, '')
  .replace(/\s*->\s*/g, ' → ')
  .replace(/\s+/g, ' ')
  .trim()

/** Cut at a word boundary to at most n characters. */
function fit(s, n) {
  s = plain(s)
  if (s.length <= n) return s
  const cut = s.slice(0, n - 1)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > n * 0.5 ? cut.slice(0, sp) : cut).replace(/[\s,;:—–-]+$/, '')}…`
}

/** Split into two balanced lines, each at most n characters. */
function split2(s, n) {
  s = plain(s)
  if (s.length <= n) return [s, '']
  const words = s.split(' ')
  let best = [s, ''], score = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ')
    const sc = Math.max(a.length, b.length)
    if (sc < score) {
      score = sc
      best = [a, b]
    }
  }
  return [fit(best[0], n), fit(best[1], n)]
}

const pad2 = n => String(n).padStart(2, '0')
const up = s => plain(s).toUpperCase()
const mmss = f => `${Math.floor(f / FPS / 60)}:${pad2(Math.floor(f / FPS) % 60)}`
const human = sec => (sec >= 60 ? `${Math.round(sec / 60)} MIN` : `${sec} SEC`)

// ------------------------------------------------------------------ build the edit
const T = f => (f % FPS === 0 ? `${f / FPS}s` : `${f * 100}/3000s`) // frames → FCPXML time (30 fps), whole seconds as FCP writes them
const S = sec => Math.round(sec * FPS)
const TITLE_START = S(3600) // titles and gaps start at 1:00:00:00 internally, like FCP's own exports
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;')

function build(file, opts) {
  const { data: fm, body } = frontmatter(readFileSync(file, 'utf8'))
  const section = sectionInfo(dirname(file))
  const lessonNo = /^(\d+)\./.exec(basename(file))?.[1] ?? '01'
  const lessonSlug = stripPrefix(basename(file))
  const route = `/${section.slug}${lessonSlug === 'index' ? '' : `/${lessonSlug}`}`
  const slug = `${section.number}-${lessonNo}-${lessonSlug}`
  const title = plain(fm.title ?? lessonSlug)
  const shortTitle = plain(fm.navigation?.title ?? title)

  // Segments: the walkthrough shots, or the lesson's H2 headings when there is no walkthrough.
  let segments
  const shots = fm.walkthrough?.shots ?? []
  if (shots.length) {
    segments = shots.map(s => ({ shot: plain(s.shot), screen: plain(s.screen ?? ''), say: plain(s.say ?? ''), onscreen: plain(s.onscreen ?? ''), seconds: +s.seconds || opts.seconds, source: 'walkthrough' }))
  } else {
    const heads = []
    let fence = false
    for (const line of body.split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) fence = !fence
      const h = !fence && /^## (.+)/.exec(line)
      if (h && !/^(next|up next|what'?s next)\b/i.test(plain(h[1]))) heads.push(plain(h[1]))
    }
    segments = heads.map(h => ({ shot: h, screen: '', say: '', onscreen: '', seconds: opts.seconds, source: 'heading' }))
  }
  const quiz = (Array.isArray(fm.quiz) ? fm.quiz : []).filter(q => q?.q && Array.isArray(q.options))
  const nextFile = nextLesson(file)
  const nextFm = nextFile ? frontmatter(readFileSync(nextFile, 'utf8')).data : null
  const next = nextFm ? plain(nextFm.navigation?.title ?? nextFm.title ?? '') : null

  // ---- resources
  const effects = new Map()
  const effectId = (t) => {
    if (!effects.has(t.uid)) effects.set(t.uid, { id: `e${effects.size + 1}`, t })
    return effects.get(t.uid).id
  }
  const assets = new Map()
  const audioAsset = (name, seconds) => {
    if (!assets.has(name)) assets.set(name, { id: `a${assets.size + 1}`, name, frames: Math.floor(seconds * FPS), file: join(MUSIC, `${name}.m4a`) })
    return assets.get(name)
  }
  let tsN = 0

  /** <title> element; values maps a text layer name → new text. Every layer is written, so order is kept. */
  function titleXml(t, { offset, start = TITLE_START, frames, lane, name, values = {}, markers = '' }) {
    const unknown = Object.keys(values).filter(k => !t.texts.some(x => x.layer === k))
    if (unknown.length) throw new Error(`${t.name}: no text layer ${unknown.join(', ')}`)
    let texts = '', defs = ''
    for (const x of t.texts) {
      const id = `ts${++tsN}`
      const v = values[x.layer] ?? x.text
      const { family, face } = fontOf(x.font)
      texts += `<text><text-style ref="${id}">${esc(v)}</text-style></text>`
      defs += `<text-style-def id="${id}"><text-style font="${esc(family)}" fontSize="${x.size}" fontFace="${esc(face)}" fontColor="${x.color.map(c => c.toFixed(4)).join(' ')} 1" alignment="${x.align}"/></text-style-def>`
    }
    return `<title ref="${effectId(t)}"${lane ? ` lane="${lane}"` : ''} offset="${T(offset)}" name="${esc(name ?? t.name)}" start="${T(start)}" duration="${T(frames)}">${texts}${defs}${markers}</title>`
  }

  const tpl = {
    intro: template('Titles', 'Intros', 'Academy Intro'),
    titleSlide: template('Titles', 'Slides', 'Title Slide'),
    agenda: template('Titles', 'Slides', 'Agenda'),
    bar: template('Titles', 'Lower Thirds', 'Lesson Number Bar'),
    note: template('Titles', 'Lessons', 'Note'),
    quiz: template('Titles', 'Slides', 'Quiz'),
    summary: template('Titles', 'Slides', 'Summary'),
    upNext: template('Titles', 'Lessons', 'Up Next'),
    member: template('Titles', 'End Screens', 'Become a Member')
  }
  const transitions = ['Block Sweep', 'Sheet Wipe', 'Sheet Slide', 'Grid Reveal', 'Card Stack', 'Tile Grid', 'Iris'].map(n => template('Transitions', 'Transitions', n))

  // ---- the spine, as a list of blocks
  const blocks = []
  let slideNo = 0
  const slide = () => `${pad2(++slideNo)} —`

  blocks.push({ kind: 'title', t: tpl.intro, frames: S(8), name: 'Academy Intro', chapter: 'Intro' })
  const [t1, t2] = split2(title, 22)
  blocks.push({
    kind: 'title', t: tpl.titleSlide, frames: S(6), name: `Title — ${shortTitle}`,
    values: { 'Eyebrow': fit(`MODULE ${section.number} — ${up(section.title)}`, 40), 'Title': t1, 'Title 2': t2,
      'Subtitle': fit(`Lesson ${lessonNo} · ${segments.length ? `${segments.length} steps` : 'CRM Analytics Academy'}`, 48), 'Slide Number': slide() }
  })
  if (segments.length >= 2) {
    const items = segments.slice(0, 5)
    const values = { 'Eyebrow': 'AGENDA —', 'Slide Number': slide() }
    for (let i = 0; i < 5; i++) {
      const s = items[i]
      values[`Num ${i + 1}`] = s ? pad2(i + 1) : ''
      values[`Item ${i + 1}`] = s ? fit(s.shot, 34) : ''
      values[`Time ${i + 1}`] = s ? human(s.seconds) : ''
    }
    blocks.push({ kind: 'title', t: tpl.agenda, frames: S(7), name: 'Agenda', values, chapter: 'Agenda' })
  }
  segments.forEach((s, i) => {
    blocks.push({ kind: 'gap', frames: S(s.seconds), name: `REC ${pad2(i + 1)} — ${fit(s.shot, 48)}`, seg: s, index: i, chapter: fit(s.shot, 60) })
  })
  const quizBlocks = quiz.slice(0, 3)
  quizBlocks.forEach((q, i) => {
    // The Quiz slide has three options: keep the right answer and fill with the others in order.
    const opts3 = q.options.map((o, j) => ({ o, j }))
    const keep = opts3.filter(x => x.j === q.answer).concat(opts3.filter(x => x.j !== q.answer)).slice(0, 3).sort((a, b) => a.j - b.j)
    const letter = 'ABC'[keep.findIndex(x => x.j === q.answer)] ?? 'A'
    blocks.push({
      kind: 'title', t: tpl.quiz, frames: S(10), name: `Quiz ${i + 1}`, chapter: i === 0 ? 'Quick check' : undefined, answer: letter, q,
      values: { 'Title': fit(q.q, 46), 'Option A': fit(keep[0]?.o, 40), 'Option B': fit(keep[1]?.o, 40), 'Option C': fit(keep[2]?.o, 40), 'Slide Number': slide() }
    })
  })
  if (segments.length >= 3) {
    const pick = [0, Math.floor((segments.length - 1) / 2), segments.length - 1].map(j => segments[j])
    const values = { 'Title': 'What you learned', 'Slide Number': slide() }
    pick.forEach((s, i) => {
      const [a, b] = s.onscreen ? [fit(s.shot, 24), fit(s.onscreen, 30)] : split2(s.shot, 24)
      values[`Summary ${i + 1}`] = a
      values[`Summary ${i + 1}b`] = b
    })
    blocks.push({ kind: 'title', t: tpl.summary, frames: S(7), name: 'Summary', values, chapter: 'Summary' })
  }
  if (next) blocks.push({ kind: 'title', t: tpl.upNext, frames: S(5), name: 'Up Next', values: { Title: fit(next, 32) } })
  blocks.push({ kind: 'title', t: tpl.member, frames: S(8), name: 'Become a Member', chapter: 'Membership', outro: true })

  // ---- offsets
  let at = 0
  for (const b of blocks) {
    b.offset = at
    at += b.frames
  }
  const total = at

  // ---- spine xml
  let spine = ''
  let trN = 0
  const outroAt = blocks.find(b => b.outro).offset
  blocks.forEach((b, i) => {
    let inner = ''
    const markers = []
    if (b.chapter) markers.push(`<chapter-marker start="${T(TITLE_START)}" duration="${T(1)}" value="${esc(b.chapter)}" posterOffset="${T(S(1))}"/>`)
    if (b.kind === 'title') {
      if (i === 0) {
        // Music, all connected to the intro (as in the Lesson 01 edit): intro, the bed loop under the lesson, the outro sting.
        const intro = audioAsset('CRMA Academy Intro (8s)', 8.229)
        inner += `<asset-clip ref="${intro.id}" lane="-1" offset="${T(TITLE_START)}" name="${esc(intro.name)}" start="0s" duration="${T(Math.min(intro.frames, b.frames))}" audioRole="music"/>`
        const bed = audioAsset('CRMA Lesson Bed (Loop 32s)', 32)
        for (let t = b.frames; t < outroAt; t += bed.frames) {
          const len = Math.min(bed.frames, outroAt - t)
          inner += `<asset-clip ref="${bed.id}" lane="-2" offset="${T(TITLE_START + t)}" name="${esc(bed.name)}" start="0s" duration="${T(len)}" audioRole="music"><adjust-volume amount="-20dB"/></asset-clip>`
        }
        const sting = audioAsset('CRMA Outro Sting (6s)', 6.229)
        inner += `<asset-clip ref="${sting.id}" lane="-1" offset="${T(TITLE_START + outroAt)}" name="${esc(sting.name)}" start="0s" duration="${T(sting.frames)}" audioRole="music"/>`
      }
      if (b.answer) markers.push(`<marker start="${T(TITLE_START + S(5))}" value="${esc(`Answer: ${b.answer}`)}" note="${esc(`Set Show Answer to ${b.answer} in the Inspector (or keyframe it at the reveal). Q: ${plain(b.q.q)}`)}"/>`)
      spine += titleXml(b.t, { offset: b.offset, frames: b.frames, name: b.name, values: b.values, markers: inner + markers.join('') })
    } else {
      const s = b.seg
      const n = b.index + 1
      const barValues = { 'Lesson Number': pad2(n), 'Lesson Label': 'STEP', 'Title': fit(s.shot, 34), 'Meta': fit(up(`STEP ${n} OF ${segments.length} · ${section.title}`), 40) }
      inner += titleXml(tpl.bar, { lane: 1, offset: TITLE_START + S(0.7), frames: Math.max(S(2), b.frames - S(1)), name: `Step ${n} Bar`, values: barValues })
      if (s.onscreen) {
        const len = Math.min(S(6), Math.max(S(2), b.frames - S(4)))
        const off = Math.max(S(1.5), Math.min(Math.round(b.frames * 0.4), b.frames - len - S(0.5)))
        inner += titleXml(tpl.note, { lane: 2, offset: TITLE_START + off, frames: len, name: `Step ${n} On Screen`, values: { Eyebrow: 'ON SCREEN —', Text: fit(s.onscreen, 46) } })
      }
      markers.push(`<marker start="${T(TITLE_START)}" value="${esc(fit(`Record ${pad2(n)}: ${s.screen || s.shot}`, 120))}" completed="0" note="${esc(s.say || s.shot)}"/>`)
      spine += `<gap name="${esc(b.name)}" offset="${T(b.offset)}" start="${T(TITLE_START)}" duration="${T(b.frames)}">${inner}${markers.join('')}</gap>`
    }
    // A CRMA transition where two titles meet (titles have unlimited handles; gaps are left for you).
    const nb = blocks[i + 1]
    if (nb && b.kind === 'title' && nb.kind === 'title' && i > 0) {
      const tr = transitions[trN++ % transitions.length]
      spine += `<transition name="${esc(tr.name)}" offset="${T(nb.offset - 12)}" duration="${T(24)}"><filter-video ref="${effectId(tr)}" name="${esc(tr.name)}"/></transition>`
    }
  })

  // ---- resources xml
  let resources = `<format id="r1" name="FFVideoFormat1080p30" frameDuration="100/3000s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>`
  for (const { id, t } of effects.values()) resources += `<effect id="${id}" name="${esc(t.name)}" uid="${esc(t.uid)}"/>`
  for (const a of assets.values()) {
    resources += `<asset id="${a.id}" name="${esc(a.name)}" start="0s" duration="${T(a.frames)}" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000">`
      + `<media-rep kind="original-media" src="${esc(pathToFileURL(a.file).href)}"/></asset>`
  }

  const projectName = `${section.number}.${lessonNo} — ${shortTitle}`
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<!-- Generated by content-creation/lesson.mjs from ${relative(REPO, file)} — re-run \`pnpm fcp ${route.slice(1)}\` rather than editing by hand. -->
<fcpxml version="1.11">
<resources>${resources}</resources>
<event name="CRMA Lessons"><project name="${esc(projectName)}"><sequence format="r1" duration="${T(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k"><spine>${spine}</spine></sequence></project></event>
</fcpxml>
`
  return { xml: pretty(xml), slug, route, title, shortTitle, section, lessonNo, fm, segments, quiz: quizBlocks, blocks, total, next, file, projectName }
}

/** One element per line for the resources and spine, so diffs and eyeballing work. */
function pretty(xml) {
  return xml
    .replace(/<(format|effect|asset|title|gap|transition|event|project|sequence|spine|\/spine|\/resources|\/sequence)([ >])/g, '\n<$1$2')
    .replace(/\n<(title|gap|transition)/g, '\n  <$1')
    .replace(/\n+/g, '\n')
}

// ------------------------------------------------------------------ shot list
function shotList(r) {
  const L = []
  L.push(`# ${r.title}`, '')
  L.push(`Recording script for **${r.projectName}** — generated by \`pnpm fcp ${r.route.slice(1)}\` from \`${relative(REPO, r.file)}\`.`)
  L.push(`Section: ${r.section.title} · Route: \`${r.route}\` · Timeline: ${mmss(r.total)} with placeholder lengths.`, '')
  if (r.fm.walkthrough?.org) L.push(`**Before you record:** ${plain(r.fm.walkthrough.org)}`, '')
  L.push('## Timeline', '', '| At | Element | Notes |', '| --- | --- | --- |')
  for (const b of r.blocks) {
    const note = b.kind === 'gap' ? `drop recording ${pad2(b.index + 1)} here (placeholder ${b.seg.seconds}s)` : b.answer ? `answer ${b.answer}` : b.t.name
    L.push(`| ${mmss(b.offset)} | ${b.name.replace(/\|/g, '/')} | ${note} |`)
  }
  L.push('')
  if (r.segments.length) {
    L.push('## Shots', '')
    r.segments.forEach((s, i) => {
      L.push(`### ${pad2(i + 1)} — ${s.shot}`, '')
      L.push(`- File: \`Step ${pad2(i + 1)} - ${s.shot.replace(/[/:\\]/g, '-')}.mov\``)
      if (s.screen) L.push(`- Screen: ${s.screen}`)
      L.push(`- Length: ~${s.seconds}s${s.source === 'heading' ? ' (no walkthrough in the lesson; this segment is the H2 heading of the same name)' : ''}`)
      if (s.onscreen) L.push(`- On screen: "${s.onscreen}"`)
      if (s.say) L.push('', `> ${s.say}`)
      L.push('')
    })
  }
  if (r.quiz.length) {
    L.push('## Quiz slides', '')
    r.quiz.forEach((q, i) => {
      L.push(`${i + 1}. ${plain(q.q)}`)
      q.options.forEach((o, j) => L.push(`   - ${j === q.answer ? '**' : ''}${plain(o)}${j === q.answer ? '** ✓' : ''}`))
    })
    L.push('', 'The Quiz slide shows three options: the right answer is always kept. Set **Show Answer** in the Inspector to reveal it.', '')
  }
  L.push('## After export', '',
    '1. Share → Master File (H.264, 1080p) and upload to YouTube.',
    `2. Add to the frontmatter of \`${relative(REPO, r.file)}\`:`, '',
    '   ```yaml', '   video:', '     id: <youtubeId>', '   ```', '',
    '3. Commit and push. Translations inherit the video.', '')
  return L.join('\n')
}

// ------------------------------------------------------------------ main
const out = flag('--out')
const seconds = +(flag('--seconds') ?? DEFAULT_SHOT_SECONDS)
const file = resolveLesson(argv[0])
const r = build(file, { seconds })
const dir = out ? resolve(process.cwd(), out) : join(HERE, 'projects', r.slug)
mkdirSync(dir, { recursive: true })
const xmlPath = join(dir, `${r.slug}.fcpxml`)
writeFileSync(xmlPath, r.xml)
writeFileSync(join(dir, `${r.slug}.md`), shotList(r))
console.log(`${relative(REPO, file)}
  → ${relative(process.cwd(), xmlPath)}  (${mmss(r.total)}, ${r.segments.length} segments, ${r.quiz.length} quiz slides)
  → ${relative(process.cwd(), join(dir, `${r.slug}.md`))}`)
if (!existsSync(join(INSTALLED, 'Titles.localized', 'CRMA', 'Slides'))) {
  console.log('\n  ! The CRMA templates are not installed. Run content-creation/kit/Install.command before importing, or the titles show as missing.')
}
