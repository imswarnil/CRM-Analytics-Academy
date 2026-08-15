import { promises as fs } from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { requireAdmin } from '~~/server/utils/auth'
import { BLOG_DIR, CONTENT_ROOT, DOCS_LOCALE, isLocalDev, parseFrontmatterFile, parsePrefixed } from '~~/server/utils/studio'

export interface StudioLesson {
  path: string
  file: string
  num: number
  slug: string
  title: string
  access: string | null
  hasVideo: boolean
  hasQuiz: boolean
}

export interface StudioSection {
  path: string
  folder: string
  num: number
  slug: string
  title: string
  icon: string | null
  lessons: StudioLesson[]
}

export interface StudioBlogPost {
  path: string
  file: string
  slug: string
  title: string
  status: string
  publishedAt: string | null
  isExternal: boolean
}

/**
 * Walks content/en/** and content/blog/* live from disk on every call — there
 * is no cached index or separate "sync" step, so a manual edit made outside
 * this UI (a direct file edit, a `git pull`) is reflected the next time the
 * tree is loaded.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const localeDir = path.join(CONTENT_ROOT, DOCS_LOCALE)
  const sectionEntries = await fs.readdir(localeDir, { withFileTypes: true }).catch(() => [])

  const sectionDirs = sectionEntries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort((a, b) => (parsePrefixed(a)?.num ?? 0) - (parsePrefixed(b)?.num ?? 0))

  const sections: StudioSection[] = []

  for (const folder of sectionDirs) {
    const parsedFolder = parsePrefixed(folder)
    if (!parsedFolder) continue

    const sectionDir = path.join(localeDir, folder)
    let title = parsedFolder.slug
    let icon: string | null = null
    try {
      const navRaw = await fs.readFile(path.join(sectionDir, '.navigation.yml'), 'utf8')
      const nav = (YAML.parse(navRaw) as Record<string, unknown>) || {}
      if (typeof nav.title === 'string') title = nav.title
      if (typeof nav.icon === 'string') icon = nav.icon
    } catch {
      // No .navigation.yml yet — fall back to the folder slug as the title.
    }

    const lessonEntries = await fs.readdir(sectionDir, { withFileTypes: true }).catch(() => [])
    const lessonFiles = lessonEntries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => e.name)
      .sort((a, b) => (parsePrefixed(a)?.num ?? 0) - (parsePrefixed(b)?.num ?? 0))

    const lessons: StudioLesson[] = []
    for (const file of lessonFiles) {
      const stem = file.replace(/\.md$/, '')
      const parsedLesson = parsePrefixed(stem)
      if (!parsedLesson) continue

      const raw = await fs.readFile(path.join(sectionDir, file), 'utf8')
      const { data } = parseFrontmatterFile(raw)

      lessons.push({
        path: `${DOCS_LOCALE}/${folder}/${file}`,
        file,
        num: parsedLesson.num,
        slug: parsedLesson.slug,
        title: typeof data.title === 'string' ? data.title : parsedLesson.slug,
        access: typeof data.access === 'string' ? data.access : null,
        hasVideo: Boolean(data.video),
        hasQuiz: Array.isArray(data.quiz) && data.quiz.length > 0
      })
    }

    sections.push({
      path: `${DOCS_LOCALE}/${folder}`,
      folder,
      num: parsedFolder.num,
      slug: parsedFolder.slug,
      title,
      icon,
      lessons
    })
  }

  const blogDir = path.join(CONTENT_ROOT, BLOG_DIR)
  const blogEntries = await fs.readdir(blogDir, { withFileTypes: true }).catch(() => [])
  const blogFiles = blogEntries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => e.name)
    .sort()

  const blog: StudioBlogPost[] = []
  for (const file of blogFiles) {
    const slug = file.replace(/\.md$/, '')
    const raw = await fs.readFile(path.join(blogDir, file), 'utf8')
    const { data } = parseFrontmatterFile(raw)

    blog.push({
      path: `${BLOG_DIR}/${file}`,
      file,
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      status: typeof data.status === 'string' ? data.status : 'published',
      publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
      isExternal: Boolean(data.isExternal)
    })
  }

  return {
    readonly: !isLocalDev(),
    locale: DOCS_LOCALE,
    sections,
    blog
  }
})
