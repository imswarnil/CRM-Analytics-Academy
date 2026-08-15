import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '~~/server/utils/auth'
import {
  BLOG_DIR,
  CONTENT_ROOT,
  DOCS_LOCALE,
  bad,
  fileExists,
  parseFrontmatterFile,
  parsePrefixed,
  requireLocalDev,
  safeContentPath,
  slugifySegment,
  stringifyFrontmatterFile
} from '~~/server/utils/studio'

interface PatchSectionInput {
  kind: 'section'
  path: string
  title: string
  icon?: string
  newSlug?: string
}

interface PatchLessonInput {
  kind: 'lesson'
  path: string
  title: string
  description?: string
  body?: string
  frontmatter?: Record<string, unknown>
  newSlug?: string
}

interface PatchBlogInput {
  kind: 'blog'
  path: string
  title: string
  description?: string
  body?: string
  frontmatter?: Record<string, unknown>
  newSlug?: string
}

type PatchInput = PatchSectionInput | PatchLessonInput | PatchBlogInput

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  requireLocalDev()

  const input = await readBody<PatchInput>(event)
  if (!input?.kind) bad('Missing kind')
  if (!input.path) bad('Missing path')

  if (input.kind === 'section') {
    const dirAbs = safeContentPath(input.path)
    const stat = await fs.stat(dirAbs).catch(() => null)
    if (!stat?.isDirectory()) bad('Section not found')

    const title = input.title?.trim()
    if (!title) bad('Section title is required')

    await fs.writeFile(
      path.join(dirAbs, '.navigation.yml'),
      `title: ${JSON.stringify(title)}\nicon: ${JSON.stringify(input.icon?.trim() || 'i-lucide-book-open')}\n`
    )

    let finalPath = input.path
    const folderName = path.basename(dirAbs)
    const parsed = parsePrefixed(folderName)
    const newSlug = input.newSlug?.trim() ? slugifySegment(input.newSlug.trim()) : null
    if (parsed && newSlug && newSlug !== parsed.slug) {
      const newFolder = `${parsed.num}.${newSlug}`
      const newAbs = path.join(path.dirname(dirAbs), newFolder)
      if (await fs.stat(newAbs).catch(() => null)) bad('A section with that slug already exists')
      await fs.rename(dirAbs, newAbs)
      finalPath = `${DOCS_LOCALE}/${newFolder}`
    }

    return { path: finalPath }
  }

  if (input.kind === 'lesson' || input.kind === 'blog') {
    const fileAbs = safeContentPath(input.path)
    if (!(await fileExists(fileAbs))) bad('File not found')

    const title = input.title?.trim()
    if (!title) bad('Title is required')

    const raw = await fs.readFile(fileAbs, 'utf8')
    const existing = parseFrontmatterFile(raw)

    // stringifyFrontmatterFile drops null/''/undefined values, so a client
    // that explicitly clears a field (e.g. video: null) doesn't leave the old
    // value behind from `existing.data`.
    const frontmatter: Record<string, unknown> = {
      ...existing.data,
      title,
      description: input.description?.trim() || '',
      ...(input.frontmatter ?? {})
    }

    await fs.writeFile(fileAbs, stringifyFrontmatterFile(frontmatter, input.body ?? existing.body))

    let finalPath = input.path
    const fileName = path.basename(fileAbs)
    const stem = fileName.replace(/\.md$/, '')
    const newSlugRaw = input.newSlug?.trim()

    if (newSlugRaw) {
      const newSlug = slugifySegment(newSlugRaw)
      if (input.kind === 'lesson') {
        const parsed = parsePrefixed(stem)
        if (parsed && newSlug !== parsed.slug) {
          const newFile = `${parsed.num}.${newSlug}.md`
          const newAbs = path.join(path.dirname(fileAbs), newFile)
          if (await fileExists(newAbs)) bad('That section already has a lesson with this slug')
          await fs.rename(fileAbs, newAbs)
          const sectionRel = path.relative(CONTENT_ROOT, path.dirname(newAbs)).split(path.sep).join('/')
          finalPath = `${sectionRel}/${newFile}`
        }
      } else if (newSlug !== stem) {
        const newFile = `${newSlug}.md`
        const newAbs = path.join(path.dirname(fileAbs), newFile)
        if (await fileExists(newAbs)) bad('A post with that slug already exists')
        await fs.rename(fileAbs, newAbs)
        finalPath = `${BLOG_DIR}/${newFile}`
      }
    }

    return { path: finalPath }
  }

  bad('Unknown kind')
})
