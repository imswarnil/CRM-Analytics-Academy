import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '~~/server/utils/auth'
import { CONTENT_ROOT, DOCS_LOCALE, bad, dirExists, parsePrefixed, requireLocalDev, safeContentPath } from '~~/server/utils/studio'

interface ReorderInput {
  kind: 'section' | 'lesson'
  // For kind: 'lesson', the section this lesson belongs to (relPath).
  sectionPath?: string
  path: string
  direction: 'up' | 'down'
}

/**
 * Moves a section or lesson up/down among its siblings by swapping numeric
 * prefixes with the adjacent sibling and renaming both files/folders. Slugs
 * are untouched, so URLs for the sibling that didn't move stay stable.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  requireLocalDev()

  const input = await readBody<ReorderInput>(event)
  if (!input?.kind) bad('Missing kind')
  if (input.direction !== 'up' && input.direction !== 'down') bad('Invalid direction')

  const delta = input.direction === 'up' ? -1 : 1

  if (input.kind === 'section') {
    const localeDir = path.join(CONTENT_ROOT, DOCS_LOCALE)
    const entries = await fs.readdir(localeDir, { withFileTypes: true })
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name)
      .map(name => ({ name, parsed: parsePrefixed(name) }))
      .filter((e): e is { name: string, parsed: { num: number, slug: string } } => !!e.parsed)
      .sort((a, b) => a.parsed.num - b.parsed.num)

    const abs = safeContentPath(input.path)
    const index = dirs.findIndex(d => path.join(localeDir, d.name) === abs)
    if (index === -1) bad('Section not found')
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= dirs.length) return { ok: true, moved: false }

    const a = dirs[index]!
    const b = dirs[targetIndex]!
    const aAbs = path.join(localeDir, a.name)
    const bAbs = path.join(localeDir, b.name)
    const aNewName = `${b.parsed.num}.${a.parsed.slug}`
    const bNewName = `${a.parsed.num}.${b.parsed.slug}`

    // Rename through temp names first — swapping prefixes can otherwise
    // collide mid-flight if two dirs briefly share a name.
    const tmp = path.join(localeDir, `.tmp-${Date.now()}-${a.name}`)
    await fs.rename(aAbs, tmp)
    await fs.rename(bAbs, path.join(localeDir, bNewName))
    await fs.rename(tmp, path.join(localeDir, aNewName))

    return { ok: true, moved: true }
  }

  // kind: 'lesson'
  if (!input.sectionPath) bad('Missing sectionPath')
  const sectionAbs = safeContentPath(input.sectionPath)
  if (!(await dirExists(sectionAbs))) bad('Section not found')

  const entries = await fs.readdir(sectionAbs, { withFileTypes: true })
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name)
    .map(name => ({ name, parsed: parsePrefixed(name.replace(/\.md$/, '')) }))
    .filter((e): e is { name: string, parsed: { num: number, slug: string } } => !!e.parsed)
    .sort((a, b) => a.parsed.num - b.parsed.num)

  const abs = safeContentPath(input.path)
  const index = files.findIndex(f => path.join(sectionAbs, f.name) === abs)
  if (index === -1) bad('Lesson not found')
  const targetIndex = index + delta
  if (targetIndex < 0 || targetIndex >= files.length) return { ok: true, moved: false }

  const a = files[index]!
  const b = files[targetIndex]!
  const aAbs = path.join(sectionAbs, a.name)
  const bAbs = path.join(sectionAbs, b.name)
  const aNewName = `${b.parsed.num}.${a.parsed.slug}.md`
  const bNewName = `${a.parsed.num}.${b.parsed.slug}.md`

  const tmp = path.join(sectionAbs, `.tmp-${Date.now()}-${a.name}`)
  await fs.rename(aAbs, tmp)
  await fs.rename(bAbs, path.join(sectionAbs, bNewName))
  await fs.rename(tmp, path.join(sectionAbs, aNewName))

  return { ok: true, moved: true }
})
