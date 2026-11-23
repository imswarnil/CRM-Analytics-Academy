#!/usr/bin/env node
/**
 * Start a new video in the one working folder: studio/workspace/
 *
 *   node studio/new-video.mjs data-prep/joins-in-depth          (a lesson)
 *   node studio/new-video.mjs studio/videos/channel-trailer.md   (any script file)
 *
 * There is only ever one video in progress. The workspace holds everything
 * for it — your recordings, clips, concept art, graphics and exports — and
 * is emptied by you when the video is published. This script refuses to
 * start while the workspace still has files, so nothing is ever overwritten.
 *
 *   studio/workspace/
 *     00-plan/        SHOTLIST.md (tick as you record), teleprompter.txt,
 *                     shots.csv, motion.md, and the AE / Premiere / Photoshop JSON
 *     01-camera/      talking-head takes          (name: 03-who-i-am-take2.mov)
 *     02-screen/      screen recordings           (name: 05-fan-out-live.mov)
 *     03-audio/       separate voice or room tone
 *     04-clips/       B-roll, stock, anything borrowed
 *     05-concepts/    sketches and references for the motion shots
 *     06-graphics/    the .aep (node studio/comp.mjs --from …/comps.json), PSD thumbnail
 *     07-edit/        the Premiere project
 *     08-export/      final MP4, thumbnail PNG, captions
 *
 * When it's out: put the YouTube id in the lesson's `video: { id }`, delete
 * `comingSoon: true`, then empty studio/workspace/ yourself.
 */
import { existsSync } from 'node:fs'
import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from './lesson-to-shots.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const WS = path.join(ROOT, 'studio', 'workspace')
const FOLDERS = ['00-plan', '01-camera', '02-screen', '03-audio', '04-clips', '05-concepts', '06-graphics', '07-edit', '08-export']

const arg = process.argv[2]
if (!arg) {
  console.log('usage: node studio/new-video.mjs <section/lesson> | <path/to/script.md>')
  process.exit(1)
}

async function filesIn(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === '.DS_Store') continue
    const p = path.join(dir, e.name)
    out.push(...(e.isDirectory() ? await filesIn(p) : [p]))
  }
  return out
}

const leftovers = await filesIn(WS)
if (leftovers.length) {
  console.error(`studio/workspace/ still has ${leftovers.length} file(s) from the last video. Publish it, then empty the folder yourself and run this again.`)
  process.exit(1)
}

for (const f of FOLDERS) await mkdir(path.join(WS, f), { recursive: true })
const plan = path.join(WS, '00-plan')

let res
if (arg.endsWith('.md')) {
  res = await build('videos/x.md', { file: path.resolve(arg), out: plan, section: 'CRM Analytics Academy' })
} else {
  // `data-prep/joins-in-depth`, or the URL path `/course/data-prep/joins-in-depth`.
  const [sec, lesson] = arg.replace(/^\/?(course\/)?/, '').split('/')
  const content = path.join(ROOT, 'content', 'en', 'course')
  const secDir = (await readdir(content)).find(d => d.replace(/^\d+\./, '') === sec)
  const file = secDir && (await readdir(path.join(content, secDir))).find(f => f.replace(/^\d+\./, '').replace(/\.md$/, '') === lesson)
  if (!file) {
    console.error(`No lesson ${arg}`)
    process.exit(1)
  }
  res = await build(path.join(secDir, file), { out: plan })
}

// The shot list you tick while recording, grouped by what to record.
const { readFile } = await import('node:fs/promises')
const csv = (await readFile(path.join(plan, 'shots.csv'), 'utf8')).trim().split('\n').slice(1)
  .map(l => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')))
const kind = (screen, edit) => /^CAMERA/i.test(screen) ? 'Camera' : /^MOTION/i.test(edit) ? 'Motion (After Effects)' : screen ? 'Screen' : 'Camera'
const groups = {}
for (const [n, start, end, shot, screen, onscreen, edit] of csv) {
  const k = kind(screen, edit)
  ;(groups[k] ??= []).push(`- [ ] **${n}. ${shot}** (${start}–${end})${screen ? `\n      ${screen}` : ''}${onscreen ? `\n      Text: ${onscreen}` : ''}`)
}
await writeFile(path.join(plan, 'SHOTLIST.md'), `# Shot list\n\nRecord by type, not in order: all camera shots in one sitting, then all screen shots.\nName files \`<shot number>-<short name>-take<N>\` in 01-camera/ and 02-screen/.\n\n`
+ Object.entries(groups).map(([k, v]) => `## ${k}\n\n${v.join('\n')}\n`).join('\n'))

console.log(`✓ studio/workspace/ ready: ${res?.shots ?? '?'} shots, ${res?.minutes ?? '?'} min. Start with 00-plan/SHOTLIST.md`)
