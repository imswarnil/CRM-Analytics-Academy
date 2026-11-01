#!/usr/bin/env node
/**
 * The Academy's demo film as a Final Cut Pro project (replaces the HyperFrames
 * render, which was not liked): real screenshots of the site with a slow
 * push-in each, the CRMA titles and transitions from the kit, the kit's music
 * and sound effects. Import it, then trim, retime and export in Final Cut.
 *
 *   pnpm fcp:demo                      # → content-creation/projects/demo-film/
 *   pnpm fcp:demo --out ~/Desktop/demo
 *
 *   demo-film.fcpxml   File → Import → XML in Final Cut Pro (install the kit first:
 *                      content-creation/kit/Install.command)
 *   demo-film.md       the shot list
 *
 * Screens come from demo-video/assets/screens (1920 × 1080 captures of the live
 * site; vis-*.png and pro-points.png are the visualisers and the points-only
 * plans). Re-run after replacing a screen; never edit the XML by hand.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { HERE, REPO, MUSIC, FPS, T, S, TITLE_START, esc, mmss, pad2, template, effectsWriter, pretty } from './fcp-shared.mjs'

const SCREENS = join(REPO, 'demo-video/assets/screens')
const at = process.argv.indexOf('--out')
const out = at > 0 ? resolve(process.cwd(), process.argv[at + 1].replace(/^~/, process.env.HOME ?? '~')) : join(HERE, 'projects', 'demo-film')

const { effectId, titleXml, resources: effectResources } = effectsWriter()
const tpl = {
  intro: template('Titles', 'Intros', 'Academy Intro Short'),
  hook: template('Titles', 'Intros', 'Hook Question'),
  bar: template('Titles', 'Lower Thirds', 'Lesson Number Bar'),
  stack: template('Titles', 'Text Animations', 'Keyword Stack'),
  statement: template('Titles', 'Text Animations', 'Big Statement'),
  outro: template('Titles', 'Outros', 'Outro Minimal')
}
const transitions = ['Sheet Wipe', 'Block Sweep', 'Push Blur', 'Grid Reveal', 'Blueprint Zoom', 'Iris', 'Card Stack', 'Signal Flash'].map(n => template('Transitions', 'Transitions', n))

// ---- media
const images = new Map()
function image(name) {
  if (images.has(name)) return images.get(name)
  const file = ['png', 'jpg'].map(e => join(SCREENS, `${name}.${e}`)).find(existsSync)
  if (!file) throw new Error(`no screen ${name} in ${SCREENS}`)
  const dims = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' })
  const [w, h] = ['pixelWidth', 'pixelHeight'].map(k => Number(dims.match(new RegExp(`${k}: (\\d+)`))[1]))
  const img = { id: `i${images.size + 1}`, fmt: `f${images.size + 2}`, name, file, w, h }
  images.set(name, img)
  return img
}
const audio = new Map()
function sound(name, seconds) {
  if (!audio.has(name)) audio.set(name, { id: `a${audio.size + 1}`, name, frames: Math.floor(seconds * FPS), file: join(MUSIC, `${name}.m4a`) })
  return audio.get(name)
}

// ---- the film: what is on screen, in order
const shots = [
  { kind: 'title', t: tpl.intro, sec: 4, name: 'Academy Intro', values: { Tagline: 'LEARN · PRACTISE · EARN', URL: 'CRMANALYTICS.IMSWARNIL.COM' } },
  { kind: 'title', t: tpl.hook, sec: 3.5, name: 'Hook — the question', values: { 'Eyebrow': 'INTERVIEW QUESTION —', 'Question 1': 'How does SAQL', 'Question 2': 'differ from', 'Question 3': 'SQL?', 'Answer Eyebrow': 'ANSWERED, FREE →', 'Answer': '150 questions' } },
  { kind: 'screen', img: 'iq', sec: 3, label: 'Interview questions', meta: '150 MODEL ANSWERS · BY TOPIC · LEVEL · COMPANY' },
  { kind: 'screen', img: 'curriculum', sec: 3.5, label: 'Learn it, in order', meta: '19 SECTIONS · DATA PREP TO REVOPS' },
  { kind: 'screen', img: 'lesson-en', sec: 0.8, label: 'In 12 languages', meta: 'ENGLISH · FRANÇAIS · 日本語 · العربية', group: 'lang' },
  { kind: 'screen', img: 'lesson-fr', sec: 0.8, group: 'lang' },
  { kind: 'screen', img: 'lesson-ja', sec: 0.8, group: 'lang' },
  { kind: 'screen', img: 'lesson-ar', sec: 1, group: 'lang' },
  { kind: 'screen', img: 'vis-saql', sec: 3.5, label: 'Watch SAQL run', meta: 'LOAD · FILTER · GROUP · COGROUP · FOREACH' },
  { kind: 'screen', img: 'vis-recipe', sec: 3.5, label: 'Every join, every function', meta: 'LOOKUP · LEFT · RIGHT · INNER · OUTER' },
  { kind: 'screen', img: 'vis-dataflow', sec: 3, label: 'Dataflows, wave by wave', meta: 'DIGEST · AUGMENT · COMPUTE · REGISTER' },
  { kind: 'screen', img: 'exam', sec: 3, label: 'Practise the exam', meta: '60 QUESTIONS · 105 MINUTES · 68% TO PASS' },
  { kind: 'screen', img: 'dash', sec: 3, label: 'Track every step', meta: 'PROGRESS · STREAKS · LEADERBOARD' },
  { kind: 'screen', img: 'pro-points', sec: 3, label: 'Points, not payments', meta: '1,000 POINTS TO START · LEARNING EARNS MORE' },
  { kind: 'title', t: tpl.stack, sec: 3, name: 'Keyword stack', values: { 'Keyword 1': 'LEARN', 'Keyword 2': 'BUILD', 'Keyword 3': 'PRACTISE', 'Keyword 4': 'FREE' } },
  { kind: 'title', t: tpl.statement, sec: 3.5, name: 'Claim', values: { 'Eyebrow': 'CRM ANALYTICS ACADEMY —', 'Line 1': 'Learn it the way', 'Line 2': 'it’s used at work.' } },
  { kind: 'title', t: tpl.outro, sec: 4, name: 'Outro', values: { URL: 'CRMANALYTICS.IMSWARNIL.COM', Tagline: 'FREE · 12 LANGUAGES · POINTS, NOT PAYMENTS' }, outro: true }
]

let pos = 0
for (const s of shots) {
  s.frames = S(s.sec)
  s.offset = pos
  pos += s.frames
}
const total = pos
const outroAt = shots.find(s => s.outro).offset

// ---- spine
let spine = ''
let barN = 0
let trN = 0
shots.forEach((s, i) => {
  let inner = ''
  if (i === 0) {
    // Music connected under the first clip: the short intro, the bed under the screens, the sting on the outro.
    const intro = sound('CRMA Academy Intro Short (4s)', 4.229)
    inner += `<asset-clip ref="${intro.id}" lane="-1" offset="${T(TITLE_START)}" name="${esc(intro.name)}" start="0s" duration="${T(Math.min(intro.frames, s.frames))}" audioRole="music"/>`
    const bed = sound('CRMA Lesson Bed (Loop 32s)', 32)
    for (let t = s.frames; t < outroAt; t += bed.frames) {
      const len = Math.min(bed.frames, outroAt - t)
      inner += `<asset-clip ref="${bed.id}" lane="-2" offset="${T(TITLE_START + t)}" name="${esc(bed.name)}" start="0s" duration="${T(len)}" audioRole="music"><adjust-volume amount="-14dB"/></asset-clip>`
    }
    const sting = sound('CRMA Outro Sting (6s)', 6.229)
    inner += `<asset-clip ref="${sting.id}" lane="-1" offset="${T(TITLE_START + outroAt)}" name="${esc(sting.name)}" start="0s" duration="${T(Math.min(sting.frames, total - outroAt))}" audioRole="music"/>`
    // A whoosh on every transition, a pop on every label.
    const whoosh = sound('CRMA SFX Whoosh', 1)
    const pop = sound('CRMA SFX Pop', 0.5)
    shots.forEach((n, j) => {
      if (j === 0) return
      if (n.group !== 'lang' || n.label) inner += `<asset-clip ref="${whoosh.id}" lane="-3" offset="${T(TITLE_START + n.offset - 8)}" name="Whoosh" start="0s" duration="${T(whoosh.frames)}" audioRole="effects"><adjust-volume amount="-8dB"/></asset-clip>`
      if (n.label) inner += `<asset-clip ref="${pop.id}" lane="-4" offset="${T(TITLE_START + n.offset + S(0.4))}" name="Pop" start="0s" duration="${T(pop.frames)}" audioRole="effects"><adjust-volume amount="-10dB"/></asset-clip>`
    })
    inner += `<chapter-marker start="${T(TITLE_START)}" duration="${T(1)}" value="Intro" posterOffset="${T(S(1))}"/>`
  }
  if (s.kind === 'title') {
    spine += titleXml(s.t, { offset: s.offset, frames: s.frames, name: s.name, values: s.values, markers: inner })
  } else {
    const img = image(s.img)
    // Clip-local time starts at 0: the push-in runs from 100% to 108% over the shot.
    const pushTo = s.group === 'lang' ? 1.03 : 1.08
    let over = ''
    if (s.label) {
      barN++
      const span = s.group === 'lang' ? shots.filter(x => x.group === 'lang').reduce((n, x) => n + x.frames, 0) : s.frames
      over += titleXml(tpl.bar, {
        lane: 1,
        offset: S(0.3),
        frames: span - S(0.5),
        name: `Label ${pad2(barN)} — ${s.label}`,
        values: { 'Lesson Number': pad2(barN), 'Lesson Label': 'FEATURE', 'Title': s.label, 'Meta': s.meta }
      })
    }
    spine += `<video ref="${img.id}" offset="${T(s.offset)}" name="${esc(s.img)}" start="0s" duration="${T(s.frames)}">`
      + `<adjust-transform><param name="scale"><keyframeAnimation><keyframe time="0s" value="1 1"/><keyframe time="${T(s.frames)}" value="${pushTo} ${pushTo}"/></keyframeAnimation></param></adjust-transform>`
      + inner + over + '</video>'
  }
  // A CRMA transition between shots — not inside the fast language cuts.
  const n = shots[i + 1]
  if (n && !(s.group === 'lang' && n.group === 'lang')) {
    const tr = transitions[trN++ % transitions.length]
    spine += `<transition name="${esc(tr.name)}" offset="${T(n.offset - 8)}" duration="${T(16)}"><filter-video ref="${effectId(tr)}" name="${esc(tr.name)}"/></transition>`
  }
})

// ---- resources
let resources = `<format id="r1" name="FFVideoFormat1080p30" frameDuration="100/3000s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>`
for (const img of images.values()) resources += `<format id="${img.fmt}" name="FFVideoFormatRateUndefined" width="${img.w}" height="${img.h}" colorSpace="1-13-1"/>`
resources += effectResources()
for (const img of images.values()) {
  resources += `<asset id="${img.id}" name="${esc(img.name)}" start="0s" duration="0s" hasVideo="1" format="${img.fmt}" videoSources="1"><media-rep kind="original-media" src="${esc(pathToFileURL(img.file).href)}"/></asset>`
}
for (const a of audio.values()) {
  resources += `<asset id="${a.id}" name="${esc(a.name)}" start="0s" duration="${T(a.frames)}" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"><media-rep kind="original-media" src="${esc(pathToFileURL(a.file).href)}"/></asset>`
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<!-- Generated by content-creation/demo.mjs — re-run \`pnpm fcp:demo\` rather than editing by hand. -->
<fcpxml version="1.11">
<resources>${resources}</resources>
<event name="CRMA Promo"><project name="CRMA Demo Film"><sequence format="r1" duration="${T(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k"><spine>${spine}</spine></sequence></project></event>
</fcpxml>
`

mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'demo-film.fcpxml'), pretty(xml))
const list = ['# CRMA Demo Film', '', `Generated by \`pnpm fcp:demo\`. ${mmss(total)} at 1080p30. Import \`demo-film.fcpxml\` with File → Import → XML (install the CRMA kit first).`, '', '| At | Shot | On screen |', '| --- | --- | --- |']
for (const s of shots) list.push(`| ${mmss(s.offset)} | ${s.kind === 'title' ? s.name : s.img} | ${s.kind === 'title' ? Object.values(s.values).filter(Boolean).join(' / ') : s.label ? `${s.label} — ${s.meta}` : '(fast cut)'} |`)
writeFileSync(join(out, 'demo-film.md'), `${list.join('\n')}\n`)
console.log(`Wrote ${join(out, 'demo-film.fcpxml')} · ${mmss(total)} · ${shots.length} shots, ${images.size} screens, ${trN} transitions`)
