import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '~~/server/utils/auth'
import {
  BLOG_DIR,
  CONTENT_ROOT,
  DOCS_LOCALE,
  bad,
  dirExists,
  fileExists,
  parsePrefixed,
  requireLocalDev,
  safeContentPath,
  safeSegment,
  slugifySegment,
  stringifyFrontmatterFile
} from '~~/server/utils/studio'

interface CreateSectionInput {
  kind: 'section'
  title: string
  icon?: string
}

interface CreateLessonInput {
  kind: 'lesson'
  sectionPath: string
  title: string
  slug?: string
  description?: string
  body?: string
  frontmatter?: Record<string, unknown>
}

interface CreateBlogInput {
  kind: 'blog'
  title: string
  slug?: string
  description?: string
  body?: string
  frontmatter?: Record<string, unknown>
}

type CreateInput = CreateSectionInput | CreateLessonInput | CreateBlogInput

/** Highest numeric prefix among `.md` siblings (or bare folder names), or 0. */
async function maxPrefix(dir: string, isDir: boolean): Promise<number> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  let max = 0
  for (const entry of entries) {
    if (isDir ? !entry.isDirectory() : !(entry.isFile() && entry.name.endsWith('.md'))) continue
    const stem = isDir ? entry.name : entry.name.replace(/\.md$/, '')
    const parsed = parsePrefixed(stem)
    if (parsed && parsed.num > max) max = parsed.num
  }
  return max
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  requireLocalDev()

  const input = await readBody<CreateInput>(event)
  if (!input?.kind) bad('Missing kind')

  if (input.kind === 'section') {
    const title = input.title?.trim()
    if (!title) bad('Section title is required')
    const slug = slugifySegment(title)
    if (!slug) bad('Could not derive a section slug')

    const localeDir = path.join(CONTENT_ROOT, DOCS_LOCALE)
    const next = (await maxPrefix(localeDir, true)) + 1
    const folder = `${next}.${slug}`
    const sectionDir = path.join(localeDir, folder)
    if (await dirExists(sectionDir)) bad('A section with that slug already exists')

    await fs.mkdir(sectionDir, { recursive: true })
    await fs.writeFile(
      path.join(sectionDir, '.navigation.yml'),
      `title: ${JSON.stringify(title)}\nicon: ${JSON.stringify(input.icon?.trim() || 'i-lucide-book-open')}\n`
    )
    await fs.writeFile(
      path.join(sectionDir, '1.index.md'),
      stringifyFrontmatterFile({ title, description: '' }, `# ${title}\n\nStart writing this section's introduction.`)
    )

    return { path: `${DOCS_LOCALE}/${folder}`, folder }
  }

  if (input.kind === 'lesson') {
    const sectionAbs = safeContentPath(input.sectionPath)
    if (!(await dirExists(sectionAbs)) || !sectionAbs.startsWith(path.join(CONTENT_ROOT, DOCS_LOCALE) + path.sep)) {
      bad('That section does not exist')
    }

    const title = input.title?.trim()
    if (!title) bad('Lesson title is required')
    const slug = slugifySegment(input.slug?.trim() || title)
    if (!slug) bad('Could not derive a lesson slug')

    const next = (await maxPrefix(sectionAbs, false)) + 1
    const file = `${next}.${slug}.md`
    const filePath = path.join(sectionAbs, file)
    if (await fileExists(filePath)) bad('That section already has a lesson with this slug')

    const frontmatter = {
      title,
      description: input.description?.trim() || '',
      ...(input.frontmatter ?? {})
    }
    await fs.writeFile(filePath, stringifyFrontmatterFile(frontmatter, input.body ?? `# ${title}\n`))

    const sectionRel = path.relative(CONTENT_ROOT, sectionAbs).split(path.sep).join('/')
    return { path: `${sectionRel}/${file}`, file }
  }

  if (input.kind === 'blog') {
    const title = input.title?.trim()
    if (!title) bad('Post title is required')
    const slug = slugifySegment(input.slug?.trim() || title)
    if (!slug) bad('Could not derive a post slug')

    const blogDir = path.join(CONTENT_ROOT, BLOG_DIR)
    await fs.mkdir(blogDir, { recursive: true })
    const file = safeSegment(`${slug}.md`, 'slug')
    const filePath = path.join(blogDir, file)
    if (await fileExists(filePath)) bad('A post with that slug already exists')

    const frontmatter = {
      title,
      description: input.description?.trim() || '',
      status: 'draft',
      ...(input.frontmatter ?? {})
    }
    await fs.writeFile(filePath, stringifyFrontmatterFile(frontmatter, input.body ?? `# ${title}\n`))

    return { path: `${BLOG_DIR}/${file}`, file }
  }

  bad('Unknown kind')
})
