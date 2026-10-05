/**
 * Create a section at the end of the course: content/en/<NN.slug>/ with its
 * .navigation.yml (title + icon) and a first page, 01.index.md, which is the
 * section's own URL (/<slug>). A folder with no markdown in it would not exist
 * in git, so the index page is not optional.
 *
 * Section slugs must be unique across the course — the numeric prefix is
 * stripped from the URL, so two sections called "saql" would be one route.
 *
 * Not done here, on purpose: llms.txt lists sections in nuxt.config.ts
 * (LLM_SECTIONS), which is code, and the editor only writes under content/.
 * The response says so.
 */
import { stringify as stringifyYaml } from 'yaml'

const YAML_OPTS = { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' } as const

export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  if (ctx.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Only admins create sections.' })
  const body = await readBody<{ title?: unknown, slug?: unknown, icon?: unknown, description?: unknown }>(event)

  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 80) : ''
  if (!title) throw createError({ statusCode: 400, statusMessage: 'A title is required.' })
  const slug = assertSlug(typeof body?.slug === 'string' && body.slug.trim() ? body.slug.trim() : slugify(title), 'Slug')
  const icon = typeof body?.icon === 'string' && /^i-[a-z0-9-]+$/.test(body.icon.trim()) ? body.icon.trim() : 'i-lucide-book-open'
  const description = typeof body?.description === 'string' && body.description.trim()
    ? body.description.trim().slice(0, 300)
    : `What the ${title} section covers, in one sentence.`

  const course = await readCourse()
  if (course.sections.some(s => s.slug === slug)) {
    throw createError({ statusCode: 409, statusMessage: `A section with the slug "${slug}" already exists.` })
  }
  const last = Math.max(-1, ...course.sections.map(s => s.num).filter(n => Number.isFinite(n)))
  const dir = `${padPrefix(last + 1, 2)}.${slug}`
  const navPath = `content/en/${dir}/.navigation.yml`
  const indexPath = `content/en/${dir}/01.index.md`

  const fm: Record<string, unknown> = { title, description }
  if (ctx.personSlug) fm.authors = [ctx.personSlug]
  const index = `---\n${stringifyYaml(fm, YAML_OPTS).trim()}\n---\n\n# ${title}\n\nIntroduce the section: what it covers, who it is for, and what the learner can do at the end.\n`
  const nav = `title: ${JSON.stringify(title)}\nicon: ${icon}\n`

  const result = await publishChanges(ctx, {
    summary: `New section — ${title}`,
    slug,
    message: `content: add section ${dir}`,
    changes: [{ path: navPath, content: nav }, { path: indexPath, content: index }],
    expect: { [navPath]: null, [indexPath]: null },
    draft: null
  })

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    dir,
    paths: [navPath, indexPath],
    note: `Add ['${slug}', ${JSON.stringify(title)}] to LLM_SECTIONS in nuxt.config.ts so llms.txt lists the section.`,
    ...result
  }
})
