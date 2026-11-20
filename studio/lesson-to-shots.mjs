#!/usr/bin/env node
/**
 * One lesson's recording script → everything the edit needs.
 *
 *   node studio/lesson-to-shots.mjs data-prep/joins-in-depth
 *   node studio/lesson-to-shots.mjs --all
 *
 * Reads content/en/<NN.section>/<NN.lesson>.md (its `walkthrough`) and writes
 * studio/out/<section>/<lesson>/:
 *
 *   teleprompter.txt   the spoken lines, one shot per paragraph, to read aloud
 *   shots.csv          shot list with start/end timecodes (open in any sheet)
 *   markers.json       Premiere markers (premiere/import-markers.jsx)
 *   ae.json            After Effects data: title, lower thirds, end screen,
 *                      and every MOTION concept to animate (aftereffects/build-lesson.jsx)
 *   thumbnail.json     Photoshop thumbnail text (photoshop/thumbnail.jsx)
 *   motion.md          the motion-graphics brief: each "MOTION:" edit note,
 *                      with the concept template that fits it
 *
 * No dependencies beyond `yaml`, which the site already has. Nothing here
 * talks to the network.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(ROOT, 'content', 'en')
const OUT = path.join(ROOT, 'studio', 'out')
const brand = JSON.parse(await readFile(path.join(ROOT, 'studio', 'brand.json'), 'utf8'))

// Concept templates in aftereffects/concepts.jsx, matched by keywords in a
// MOTION note. The first match wins; anything else gets the generic one.
const CONCEPTS = [
  { id: 'collapse', words: ['collapse', 'stack', 'aggregate', 'summary row'] },
  { id: 'fanout', words: ['splits into', 'duplicat', 'fan-out', 'repeat'] },
  { id: 'rotate', words: ['rotat', 'columns into rows', 'peel off', 'wide table'] },
  { id: 'window', words: ['frame slid', 'window', 'running', 'previous row'] },
  { id: 'chip', words: ['chip', 'flying', 'flies', 'selected'] },
  { id: 'join', words: ['join', 'tables slide', 'matching', 'side by side'] },
  { id: 'flow', words: ['flow', 'pipeline', 'pipe', 'travel', 'stream', 'conveyor'] },
  { id: 'filter', words: ['filter', 'drop', 'fade', 'null cell', 'fill'] }
]
const conceptFor = (note) => {
  const n = note.toLowerCase()
  return (CONCEPTS.find(c => c.words.some(w => n.includes(w))) ?? { id: 'generic' }).id
}

const tc = (s) => {
  const m = Math.floor(s / 60)
  const r = Math.round(s % 60)
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`
const slug = s => s.replace(/^\d+\./, '').replace(/\.md$/, '')

async function lessonFiles() {
  const out = []
  for (const sec of (await readdir(CONTENT)).filter(d => /^\d{2}\./.test(d)).sort()) {
    for (const f of (await readdir(path.join(CONTENT, sec))).filter(f => f.endsWith('.md') && !f.includes('index')).sort()) {
      out.push(path.join(sec, f))
    }
  }
  return out
}

export async function build(rel, opts = {}) {
  const raw = await readFile(opts.file ?? path.join(CONTENT, rel), 'utf8')
  const fm = parse(raw.match(/^---\n([\s\S]*?)\n---/)[1])
  const shots = fm.walkthrough?.shots ?? []
  if (!shots.length) return null
  const [sec, file] = rel.split(path.sep)
  const dir = opts.out ?? path.join(OUT, slug(sec), slug(file))
  await mkdir(dir, { recursive: true })

  let t = 0
  const timed = shots.map((s, i) => {
    const start = t
    t += s.seconds ?? 30
    return { n: i + 1, ...s, start, end: t, motion: /^MOTION:/i.test(s.edit ?? '') ? s.edit.replace(/^MOTION:\s*/i, '') : null }
  })

  const sectionTitle = opts.section ?? parse(await readFile(path.join(CONTENT, sec, '.navigation.yml'), 'utf8')).title
  await writeFile(path.join(dir, 'teleprompter.txt'),
    `${fm.title}\n${'='.repeat(fm.title.length)}\n\n` + timed.map(s => `[${s.n}] ${s.shot.toUpperCase()}\n\n${s.say}\n`).join('\n'))

  await writeFile(path.join(dir, 'shots.csv'), [
    ['#', 'Start', 'End', 'Shot', 'Screen', 'On screen', 'Edit', 'Concept'].map(csv).join(','),
    ...timed.map(s => [s.n, tc(s.start), tc(s.end), s.shot, s.screen, s.onscreen, s.edit, s.motion ? conceptFor(s.motion) : ''].map(csv).join(','))
  ].join('\n') + '\n')

  await writeFile(path.join(dir, 'markers.json'), JSON.stringify(timed.map(s => ({
    seconds: s.start,
    duration: s.end - s.start,
    name: `${s.n}. ${s.shot}`,
    comment: [s.screen && `SCREEN: ${s.screen}`, s.onscreen && `TEXT: ${s.onscreen}`, s.edit && `EDIT: ${s.edit}`].filter(Boolean).join('\n'),
    // Premiere marker colour index: 0 green (talking), 1 red (motion), 3 blue (screen)
    color: s.motion ? 1 : s.screen ? 3 : 0
  })), null, 2))

  await writeFile(path.join(dir, 'ae.json'), JSON.stringify({
    brand,
    lesson: { title: fm.title, section: sectionTitle, description: fm.description, runtime: t },
    titleCard: { title: fm.navigation?.title ?? fm.title, kicker: sectionTitle },
    lowerThirds: timed.filter(s => s.onscreen).map(s => ({ at: s.start + 1, text: s.onscreen, shot: s.n })),
    motion: timed.filter(s => s.motion).map(s => ({ shot: s.n, name: s.shot, at: s.start, seconds: s.end - s.start, concept: conceptFor(s.motion), brief: s.motion })),
    endScreen: { next: (timed.at(-1)?.onscreen ?? '').replace(/^Next:\s*/i, ''), seconds: brand.endScreenSeconds }
  }, null, 2))

  await writeFile(path.join(dir, 'thumbnail.json'), JSON.stringify({
    title: (fm.navigation?.title ?? fm.title).toUpperCase(),
    hook: timed[0]?.onscreen ?? '',
    section: sectionTitle,
    pro: fm.access === 'pro'
  }, null, 2))

  const motion = timed.filter(s => s.motion)
  await writeFile(path.join(dir, 'motion.md'), `# Motion brief: ${fm.title}\n\n` + (motion.length
    ? motion.map(s => `## Shot ${s.n} · ${s.shot} (${tc(s.start)}, ${s.end - s.start}s)\n\n- Concept template: \`${conceptFor(s.motion)}\`\n- Brief: ${s.motion}\n- Narration: ${s.say}\n`).join('\n')
    : 'No motion-graphics shots in this lesson.\n'))

  return { rel, dir: path.relative(ROOT, dir), shots: timed.length, minutes: Math.round(t / 6) / 10, motion: motion.length }
}

// Imported by new-video.mjs: stop here.
if (process.argv[1] && !process.argv[1].endsWith('lesson-to-shots.mjs')) {
  // no CLI
} else {
  const arg = process.argv[2]
  if (!arg) {
    console.log('usage: node studio/lesson-to-shots.mjs <section/lesson> | --all')
    process.exit(1)
  }
  const all = await lessonFiles()
  const picked = arg === '--all' ? all : all.filter(r => `${slug(r.split(path.sep)[0])}/${slug(r.split(path.sep)[1])}` === arg)
  if (!picked.length) {
    console.error(`No lesson matches "${arg}". Try one of:\n  ${all.map(r => r.split(path.sep).map(slug).join('/')).join('\n  ')}`)
    process.exit(1)
  }
  for (const r of picked) {
    const res = await build(r)
    if (res) console.log(`✓ ${res.dir}  ${res.shots} shots · ${res.minutes} min · ${res.motion} motion`)
  }
}
