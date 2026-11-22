#!/usr/bin/env node
/**
 * Make one After Effects comp from the kit, in the project that is open now.
 *
 *   node studio/comp.mjs --list                                  scene types and their props
 *   node studio/comp.mjs titleCard '{"title":"Joins","kicker":"LESSON 4"}' --seconds 5
 *   node studio/comp.mjs saqlTyping '{"lines":["q = load \"x\";"]}' --name "SAQL intro"
 *   node studio/comp.mjs --mogrt                                 Premiere templates → studio/premiere/mogrt/
 *   node studio/comp.mjs --from studio/out/data-prep/joins/comps.json   every comp a lesson needs (lesson-to-shots)
 *
 * The comp lands in a "CRMA Comps" folder and opens in the viewer. Builders
 * live in studio/aftereffects/kit/scenes.jsx; add one there to get a new type.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runJob } from './aftereffects/ae.mjs'

const STUDIO = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name, d) => (args.includes(name) ? args[args.indexOf(name) + 1] : d)

const src = ['scenes.jsx', 'story.jsx', 'concepts.jsx', 'platform.jsx'].map(f => readFileSync(path.join(STUDIO, 'aftereffects', 'kit', f), 'utf8')).join('\n')
const types = [...src.matchAll(/\{ type: '(\w+)', label: '([^']+)', props: (.*) \}(,|\))?$/gm)].map(m => ({ type: m[1], label: m[2], props: m[3] }))

if (args.includes('--list') || !args.length) {
  for (const t of types) console.log(`${t.type.padEnd(16)} ${t.label}\n${' '.repeat(17)}${t.props}`)
  process.exit(0)
}

if (args.includes('--mogrt')) {
  await runJob({
    action: 'mogrt',
    out: path.join(STUDIO, 'premiere', 'mogrt'),
    items: [
      { type: 'titleCard', label: 'Title', seconds: 5, props: { title: 'Lesson title', kicker: 'LESSON', sub: 'One line on what you will learn' } },
      { type: 'lowerThird', label: 'Lower third', seconds: 5, props: { name: 'Swarnil Singhai', role: 'CRM Analytics Academy' } },
      { type: 'quote', label: 'Statement', seconds: 4, props: { text: 'Joins decide your numbers.', kicker: 'REMEMBER' } },
      { type: 'endCard', label: 'End card', seconds: 6, props: { url: 'crmanalytics.imswarnil.com', cta: 'Start free' } }
    ]
  })
  process.exit(0)
}

if (args.includes('--from')) {
  const list = JSON.parse(readFileSync(flag('--from'), 'utf8')).comps.filter(c => types.some(t => t.type === c.type))
  for (const c of list) await runJob({ action: 'comp', type: c.type, props: c.props ?? {}, seconds: c.seconds ?? 6, name: c.name })
  process.exit(0)
}

const type = args[0]
if (!types.some(t => t.type === type)) {
  console.error(`Unknown type "${type}". Try --list.`)
  process.exit(1)
}
const json = args[1] && !args[1].startsWith('--') ? args[1] : '{}'
await runJob({ action: 'comp', type, props: JSON.parse(json), seconds: Number(flag('--seconds', 6)), name: flag('--name', undefined) })
