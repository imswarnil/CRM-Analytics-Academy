#!/usr/bin/env node
/**
 * The Academy's opener as a Final Cut Pro project: a motion-graphics SaaS
 * opener built only from the CRMA kit's animated titles — no screenshots —
 * with the kit's transitions, music and sound effects. Import it, then trim,
 * retime and export in Final Cut.
 *
 *   pnpm fcp:demo                      # → content-creation/projects/demo-film/
 *   pnpm fcp:demo --out ~/Desktop/demo
 *
 *   demo-film.fcpxml   File → Import → XML in Final Cut Pro (install the kit first:
 *                      content-creation/kit/Install.command)
 *   demo-film.md       the shot list
 *
 * The copy is in SHOTS below; change it there and re-run — never edit the XML
 * by hand.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { HERE, MUSIC, FPS, T, S, TITLE_START, esc, mmss, template, effectsWriter, pretty } from './fcp-shared.mjs'

const at = process.argv.indexOf('--out')
const out = at > 0 ? resolve(process.cwd(), process.argv[at + 1].replace(/^~/, process.env.HOME ?? '~')) : join(HERE, 'projects', 'demo-film')

const { effectId, titleXml, resources: effectResources } = effectsWriter()
const T_ = (folder, name) => template('Titles', folder, name)
const transitions = ['Sheet Wipe', 'Block Sweep', 'Push Blur', 'Grid Reveal', 'Blueprint Zoom', 'Iris', 'Card Stack', 'Signal Flash', 'Tile Grid', 'Sheet Slide'].map(n => template('Transitions', 'Transitions', n))

const audio = new Map()
function sound(name, seconds) {
  if (!audio.has(name)) audio.set(name, { id: `a${audio.size + 1}`, name, frames: Math.floor(seconds * FPS), file: join(MUSIC, `${name}.m4a`) })
  return audio.get(name)
}

// ---- the opener, shot by shot: every one an animated CRMA title
const shots = [
  { t: T_('Intros', 'Academy Intro Short'), sec: 4, name: 'Logo', values: { Tagline: 'LEARN · PRACTISE · BUILD', URL: 'CRMANALYTICS.IMSWARNIL.COM' } },
  { t: T_('Intros', 'Hook Question'), sec: 4, name: 'Hook', values: { 'Eyebrow': 'INTERVIEW QUESTION —', 'Question 1': 'How does SAQL', 'Question 2': 'differ from', 'Question 3': 'SQL?', 'Answer Eyebrow': 'DON’T READ IT →', 'Answer': 'Watch it run.' } },
  { t: T_('Text Animations', 'Strike and Replace'), sec: 3, name: 'Promise', values: { Eyebrow: 'STOP —', Old: 'Reading docs', New: 'Seeing data move' } },
  { t: T_('Data and Tables', 'Filter Rows'), sec: 4.5, name: 'Filter', values: { 'Eyebrow': 'STEP 1 — FILTER', 'Title': 'Watch every row', 'Slide Number': '' } },
  { t: T_('Data and Tables', 'Group By'), sec: 4.5, name: 'Group by', values: { 'Eyebrow': 'STEP 2 — GROUP BY', 'Title': 'One row per region', 'Slide Number': '' } },
  { t: T_('Diagrams', 'Join Venn'), sec: 4.5, name: 'Joins', values: { 'Eyebrow': 'STEP 3 — JOINS', 'Title': 'Which rows survive?', 'Slide Number': '' } },
  { t: T_('Diagrams', 'Recipe Graph'), sec: 4.5, name: 'Recipe', values: { 'Eyebrow': 'RECIPES —', 'Title': 'In the order they run', 'Meta': 'EVERY NODE · EVERY FUNCTION', 'Slide Number': '' } },
  { t: T_('Diagrams', 'Dataflow Pipeline'), sec: 4, name: 'Dataflow', values: { 'Eyebrow': 'DATAFLOWS —', 'Title': 'Wave by wave', 'Slide Number': '' } },
  { t: T_('Dashboards', 'Dashboard Mockup'), sec: 4, name: 'Dashboard', values: { 'Dashboard Title': 'What you will build · FY26' } },
  { t: T_('Text Animations', 'Word by Word'), sec: 3.5, name: 'Global', values: { 'Word 1': 'Free,', 'Word 2': 'in', 'Word 3': 'twelve', 'Word 4': 'languages,', 'Word 5': 'everywhere.', 'Word 6': '' } },
  { t: T_('Text Animations', 'Strike and Replace'), sec: 3, name: 'No payments', values: { Eyebrow: 'NO PAYMENTS —', Old: 'Subscriptions', New: 'Sessions & points' } },
  { t: T_('Text Animations', 'Keyword Stack'), sec: 3, name: 'Keywords', values: { 'Keyword 1': 'LEARN', 'Keyword 2': 'PRACTISE', 'Keyword 3': 'BUILD', 'Keyword 4': 'FREE' } },
  { t: T_('Text Animations', 'Big Statement'), sec: 3.5, name: 'Claim', values: { 'Eyebrow': 'CRM ANALYTICS ACADEMY —', 'Line 1': 'Learn it the way', 'Line 2': 'it’s used at work.' } },
  { t: T_('Outros', 'Outro Minimal'), sec: 4, name: 'Outro', values: { URL: 'CRMANALYTICS.IMSWARNIL.COM', Tagline: 'FREE · 12 LANGUAGES · NO PAYMENTS, EVER' }, outro: true }
]

let pos = 0
for (const s of shots) {
  s.frames = S(s.sec)
  s.offset = pos
  pos += s.frames
}
const total = pos
const outroAt = shots.find(s => s.outro).offset

// ---- spine: titles end to end, a CRMA transition at every join
let spine = ''
let trN = 0
shots.forEach((s, i) => {
  let inner = ''
  if (i === 0) {
    // Music under the first title: the short intro, the bed, the sting on the outro.
    const intro = sound('CRMA Academy Intro Short (4s)', 4.229)
    inner += `<asset-clip ref="${intro.id}" lane="-1" offset="${T(TITLE_START)}" name="${esc(intro.name)}" start="0s" duration="${T(Math.min(intro.frames, s.frames))}" audioRole="music"/>`
    const bed = sound('CRMA Lesson Bed (Loop 32s)', 32)
    for (let t = s.frames; t < outroAt; t += bed.frames) {
      const len = Math.min(bed.frames, outroAt - t)
      inner += `<asset-clip ref="${bed.id}" lane="-2" offset="${T(TITLE_START + t)}" name="${esc(bed.name)}" start="0s" duration="${T(len)}" audioRole="music"><adjust-volume amount="-12dB"/></asset-clip>`
    }
    const sting = sound('CRMA Outro Sting (6s)', 6.229)
    inner += `<asset-clip ref="${sting.id}" lane="-1" offset="${T(TITLE_START + outroAt)}" name="${esc(sting.name)}" start="0s" duration="${T(Math.min(sting.frames, total - outroAt))}" audioRole="music"/>`
    const whoosh = sound('CRMA SFX Whoosh', 1)
    const hit = sound('CRMA SFX Logo Hit', 1.5)
    shots.forEach((n, j) => {
      if (j > 0) inner += `<asset-clip ref="${whoosh.id}" lane="-3" offset="${T(TITLE_START + n.offset - 8)}" name="Whoosh" start="0s" duration="${T(whoosh.frames)}" audioRole="effects"><adjust-volume amount="-8dB"/></asset-clip>`
    })
    inner += `<asset-clip ref="${hit.id}" lane="-4" offset="${T(TITLE_START + outroAt)}" name="Logo hit" start="0s" duration="${T(hit.frames)}" audioRole="effects"/>`
    inner += `<chapter-marker start="${T(TITLE_START)}" duration="${T(1)}" value="Opener" posterOffset="${T(S(1))}"/>`
  }
  spine += titleXml(s.t, { offset: s.offset, frames: s.frames, name: s.name, values: s.values, markers: inner })
  const n = shots[i + 1]
  if (n) {
    const tr = transitions[trN++ % transitions.length]
    spine += `<transition name="${esc(tr.name)}" offset="${T(n.offset - 10)}" duration="${T(20)}"><filter-video ref="${effectId(tr)}" name="${esc(tr.name)}"/></transition>`
  }
})

// ---- resources
let resources = `<format id="r1" name="FFVideoFormat1080p30" frameDuration="100/3000s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>`
resources += effectResources()
for (const a of audio.values()) {
  resources += `<asset id="${a.id}" name="${esc(a.name)}" start="0s" duration="${T(a.frames)}" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"><media-rep kind="original-media" src="${esc(pathToFileURL(a.file).href)}"/></asset>`
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<!-- Generated by content-creation/demo.mjs — re-run \`pnpm fcp:demo\` rather than editing by hand. -->
<fcpxml version="1.11">
<resources>${resources}</resources>
<event name="CRMA Promo"><project name="CRMA Opener"><sequence format="r1" duration="${T(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k"><spine>${spine}</spine></sequence></project></event>
</fcpxml>
`

mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'demo-film.fcpxml'), pretty(xml))
const list = ['# CRMA Opener', '', `Generated by \`pnpm fcp:demo\`. ${mmss(total)} at 1080p30, motion graphics only. Import \`demo-film.fcpxml\` with File → Import → XML (install the CRMA kit first).`, '', '| At | Title | Template | Copy |', '| --- | --- | --- | --- |']
for (const s of shots) list.push(`| ${mmss(s.offset)} | ${s.name} | ${s.t.name} | ${Object.values(s.values).filter(Boolean).join(' / ')} |`)
writeFileSync(join(out, 'demo-film.md'), `${list.join('\n')}\n`)
console.log(`Wrote ${join(out, 'demo-film.fcpxml')} · ${mmss(total)} · ${shots.length} titles, ${trN} transitions, no screenshots`)
