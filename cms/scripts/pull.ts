/**
 * Writes Payload back out as markdown under ../content — the only way content
 * reaches the site, which never reads Payload at runtime.
 *
 *   pnpm content:pull        write changed files
 *   pnpm content:pull:dry    list what would change, write nothing
 *
 * A file is rewritten only when what the site would parse from it changes
 * (frontmatter values or body), never for YAML formatting alone. That matters
 * beyond tidiness: the translation manifest hashes each English file, so a
 * cosmetic rewrite would re-translate it into eleven languages for nothing.
 *
 * New records get a path from their section, order and slug. Records deleted
 * in Payload are reported, not deleted from disk — removing a lesson is a
 * decision to make in a commit, where the translated copies go with it.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import config from '@payload-config'
import { getPayload } from 'payload'
import YAML from 'yaml'
import {
  CONTENT, lessonToFrontmatter, listDirs, listMarkdown, pad, readMarkdown, resourceToFrontmatter,
  sameContent, showcaseToFrontmatter, type Frontmatter
} from './markdown'

const dry = Boolean(process.env.DRY_RUN)
const payload = await getPayload({ config })
const changed: string[] = []
const seen = new Set<string>()

function write(rel: string, data: Frontmatter, body: string, previous?: { data: Frontmatter, body: string }) {
  seen.add(rel)
  if (previous && sameContent(previous, { data, body })) return
  changed.push(rel)
  if (dry) return
  const file = path.join(CONTENT, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  const yaml = YAML.stringify(data, { lineWidth: 0 }).trimEnd()
  const text = body.startsWith('\n') ? body : `\n${body}`
  writeFileSync(file, `---\n${yaml}\n---${text.endsWith('\n') ? text : `${text}\n`}`)
}

async function all<T extends 'sections' | 'lessons' | 'showcase' | 'resources'>(collection: T) {
  const res = await payload.find({ collection, limit: 0, pagination: false, depth: 0, overrideAccess: true })
  return res.docs
}

const sections = await all('sections')
const sectionDir = new Map<string | number, string>()
for (const s of sections) {
  const dir = s.file?.replace(/^en\//, '') || `${pad(s.order)}.${s.slug}`
  sectionDir.set(s.id, dir)
  const navRel = `en/${dir}/.navigation.yml`
  const nav = { title: s.title, ...(s.icon ? { icon: s.icon } : {}) }
  const navFile = path.join(CONTENT, navRel)
  const prev = existsSync(navFile) ? YAML.parse((await import('node:fs')).readFileSync(navFile, 'utf8')) : null
  if (JSON.stringify(prev) !== JSON.stringify(nav)) {
    changed.push(navRel)
    if (!dry) {
      mkdirSync(path.dirname(navFile), { recursive: true })
      writeFileSync(navFile, YAML.stringify(nav))
    }
  }
}

for (const l of await all('lessons')) {
  const dir = sectionDir.get(l.section as string | number)
  if (!dir) continue
  const rel = l.file || `en/${dir}/${pad(l.order)}.${l.slug}.md`
  const file = path.join(CONTENT, rel)
  const previous = existsSync(file) ? readMarkdown(file) : undefined
  write(rel, lessonToFrontmatter(l, previous?.data), l.body ?? '', previous)
}

for (const s of await all('showcase')) {
  const rel = s.file || `showcase/${s.slug}.md`
  const file = path.join(CONTENT, rel)
  const previous = existsSync(file) ? readMarkdown(file) : undefined
  write(rel, showcaseToFrontmatter(s, previous?.data), s.body ?? '', previous)
}

for (const r of await all('resources')) {
  const rel = r.file || `resources/${r.slug}.md`
  const file = path.join(CONTENT, rel)
  const previous = existsSync(file) ? readMarkdown(file) : undefined
  write(rel, resourceToFrontmatter(r, previous?.data), previous?.body ?? '', previous)
}

// Files on disk with no record behind them.
const orphans: string[] = []
for (const dir of listDirs(path.join(CONTENT, 'en'))) {
  for (const name of listMarkdown(path.join(CONTENT, 'en', dir))) {
    if (!seen.has(`en/${dir}/${name}`)) orphans.push(`en/${dir}/${name}`)
  }
}
for (const sub of ['showcase', 'resources']) {
  for (const name of listMarkdown(path.join(CONTENT, sub))) if (!seen.has(`${sub}/${name}`)) orphans.push(`${sub}/${name}`)
}

payload.logger.info(`${dry ? 'Would write' : 'Wrote'} ${changed.length} file(s)${changed.length ? `:\n  ${changed.join('\n  ')}` : ''}`)
if (orphans.length) payload.logger.warn(`${orphans.length} file(s) have no record in Payload (left alone):\n  ${orphans.join('\n  ')}`)
process.exit(0)
