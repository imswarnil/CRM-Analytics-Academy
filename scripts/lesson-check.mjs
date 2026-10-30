#!/usr/bin/env node
/**
 * Checks every English lesson before a build:
 *
 *   - two-digit numeric prefixes, no duplicate numbers in a section
 *   - title and description present; description no longer than 200 characters
 *   - `access` is free or pro; Pro lessons are not section indexes
 *   - every quiz question has 2–6 options and an answer inside them
 *   - internal links (/section/lesson) point at a lesson that exists
 *
 *   pnpm lesson:check        # exits 1 on any error; warnings are printed only
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const EN = path.join(ROOT, 'content/en')
const SKIP = new Set(['interview-questions', 'exam'])
const errors = []
const warnings = []

const routeOf = rel => `/${rel.replace(/\.md$/, '').split('/').map(p => p.replace(/^\d{2}\./, '')).join('/')}`.replace(/\/index$/, '')
const lessons = []
for (const dir of (await readdir(EN, { withFileTypes: true })).filter(d => d.isDirectory() && !SKIP.has(d.name))) {
  if (!/^\d{2}\./.test(dir.name)) errors.push(`${dir.name}: section folders need a two-digit prefix`)
  const seen = new Map()
  for (const f of (await readdir(path.join(EN, dir.name))).filter(x => x.endsWith('.md'))) {
    if (!/^\d{2}\./.test(f)) errors.push(`${dir.name}/${f}: lesson files need a two-digit prefix`)
    const n = f.slice(0, 2)
    if (seen.has(n)) errors.push(`${dir.name}: ${f} and ${seen.get(n)} share the number ${n}`)
    seen.set(n, f)
    lessons.push(`${dir.name}/${f}`)
  }
}
const routes = new Set(lessons.map(routeOf))

for (const rel of lessons) {
  const src = await readFile(path.join(EN, rel), 'utf8')
  const m = src.match(/^---\n([\s\S]*?)\n---/)
  if (!m) {
    errors.push(`${rel}: no frontmatter`)
    continue
  }
  let fm
  try {
    fm = parse(m[1])
  } catch (e) {
    errors.push(`${rel}: frontmatter is not valid YAML (${e.message.split('\n')[0]})`)
    continue
  }
  if (!fm.title) errors.push(`${rel}: no title`)
  if (!fm.description) errors.push(`${rel}: no description`)
  else if (String(fm.description).length > 200) warnings.push(`${rel}: description is ${String(fm.description).length} characters (search results show about 160)`)
  if (fm.access && !['free', 'pro'].includes(fm.access)) errors.push(`${rel}: access must be free or pro`)
  if (fm.access === 'pro' && rel.endsWith('/01.index.md')) errors.push(`${rel}: a section index cannot be Pro`)
  for (const [i, q] of (fm.quiz ?? []).entries()) {
    const n = q.options?.length ?? 0
    if (n < 2 || n > 6) errors.push(`${rel}: quiz ${i + 1} needs 2–6 options`)
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= n) errors.push(`${rel}: quiz ${i + 1} answer ${q.answer} is not one of its options`)
    if (/^Question \d+\?$/.test(q.q)) warnings.push(`${rel}: quiz ${i + 1} is still the placeholder`)
  }
  const body = src.slice(m[0].length)
  for (const [, link] of body.matchAll(/\]\((\/[a-z0-9/-]+)(?:#[^)]*)?\)/g)) {
    const first = link.split('/')[1]
    // Only course links are checked; pages like /pro or /visualiser are app routes.
    if (![...routes].some(r => r.split('/')[1] === first)) continue
    if (!routes.has(link.replace(/\/$/, ''))) errors.push(`${rel}: link ${link} points at no lesson`)
  }
}

for (const w of warnings) console.log(`warn   ${w}`)
for (const e of errors) console.log(`error  ${e}`)
console.log(`\n${lessons.length} lessons checked · ${errors.length} errors · ${warnings.length} warnings`)
process.exit(errors.length ? 1 : 0)
