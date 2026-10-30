#!/usr/bin/env node
/**
 * Scaffolds a lesson in content/en/ with the right number and full frontmatter.
 *
 *   pnpm new-lesson                                   # asks for everything
 *   pnpm new-lesson --section 07 --title "Streams: load, filter, foreach" \
 *     --access pro --kind video --quiz 3 --publish
 *
 * --section  the two-digit section number (or its folder name)
 * --access   free (default) | pro
 * --kind     article (default) | video — video adds a walkthrough script to record
 * --quiz     how many quiz questions to stub (default 3)
 * --publish  drop `comingSoon` from the section index, publishing the section
 *
 * English only: the build translates the other 11 locales. Prints the route
 * and the file; `pnpm lesson:check` validates it once written.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const EN = path.join(ROOT, 'content/en')
const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i < 0 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true
}

const sections = (await readdir(EN, { withFileTypes: true }))
  .filter(d => d.isDirectory() && /^\d{2}\./.test(d.name))
  .map(d => d.name)
  .sort()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = async (q, fallback) => (await rl.question(`${q}${fallback ? ` (${fallback})` : ''}: `)).trim() || fallback

let section = flag('section')
if (!section) {
  console.log(sections.map(s => `  ${s}`).join('\n'))
  section = await ask('Section number', '07')
}
const folder = sections.find(s => s === section || s.startsWith(`${String(section).padStart(2, '0')}.`))
if (!folder) {
  console.error(`No section ${section}.`)
  process.exit(1)
}

const title = flag('title') ?? await ask('Lesson title')
if (!title || title === true) {
  console.error('A title is required.')
  process.exit(1)
}
const access = (flag('access') ?? await ask('Access: free or pro', 'free')) === 'pro' ? 'pro' : 'free'
const kind = (flag('kind') ?? await ask('Kind: article or video', 'article')) === 'video' ? 'video' : 'article'
const quizN = Number(flag('quiz') ?? await ask('Quiz questions', '3')) || 0
const description = flag('description') ?? await ask('One-sentence description (shown in search results)', `${title}.`)
rl.close()

const files = (await readdir(path.join(EN, folder))).filter(f => /^\d{2}\..+\.md$/.test(f)).sort()
const next = String(Math.max(0, ...files.map(f => Number(f.slice(0, 2)))) + 1).padStart(2, '0')
const slug = String(title).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/-$/, '')
const file = path.join(EN, folder, `${next}.${slug}.md`)
if (existsSync(file)) {
  console.error(`${file} already exists.`)
  process.exit(1)
}

const q = s => JSON.stringify(s)
const fm = [
  '---',
  `title: ${q(title)}`,
  'navigation:',
  `  title: ${q(title.length > 40 ? title.split(/[:—-]/)[0].trim() : title)}`,
  `description: ${q(description)}`,
  ...(access === 'pro' ? ['access: pro'] : []),
  ...(kind === 'video'
    ? ['walkthrough:', '  org: "The Academy org, Analytics Studio open"', '  shots:', '    - shot: "Intro"', '      say: "What this lesson builds, in one sentence."', '      seconds: 20', '    - shot: "Build"', '      screen: "Analytics Studio -> Create -> Recipe"', '      say: "The step, and why."', '      seconds: 90']
    : []),
  ...(quizN
    ? ['quiz:', ...Array.from({ length: quizN }, (_, i) => [`  - q: ${q(`Question ${i + 1}?`)}`, '    options:', '      - "Right answer"', '      - "Plausible wrong answer"', '      - "Another wrong answer"', '    answer: 0']).flat()]
    : []),
  'interview:',
  `  - q: ${q(`How would you explain ${title.toLowerCase()} in an interview?`)}`,
  '    a: "Two or three sentences a hiring manager would want to hear."',
  '---',
  '',
  `# ${title}`,
  '',
  'Open with the problem this lesson solves, in the reader\'s words.',
  '',
  '## The idea',
  '',
  '## Build it',
  '',
  '::note{icon="i-lucide-workflow"}',
  'Watch it run: link the visualiser preset that shows this — [/visualiser/saql](/visualiser/saql), [/visualiser/recipe](/visualiser/recipe) or [/visualiser/dataflow](/visualiser/dataflow).',
  '::',
  '',
  '## Check yourself',
  ''
].join('\n')
await writeFile(file, `${fm}\n`)

if (flag('publish')) {
  const index = path.join(EN, folder, '01.index.md')
  const src = await readFile(index, 'utf8')
  if (src.includes('comingSoon: true')) {
    await writeFile(index, src.replace(/\ncomingSoon: true/, ''))
    console.log(`Published ${folder}: removed comingSoon from its index (rewrite the index body too).`)
  }
}

const route = `/${folder.replace(/^\d{2}\./, '')}/${slug}`
console.log(`\nWrote ${path.relative(ROOT, file)}\nRoute: ${route}  ·  ${access.toUpperCase()}  ·  ${kind}\nNext: write it, then pnpm lesson:check`)
