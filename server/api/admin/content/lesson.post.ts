/**
 * Create a lesson at the end of a section.
 *
 * The server picks the file name: the next two-digit prefix after the
 * section's last lesson, then the slug (from the title unless given). Prefixes
 * sort as strings, which is why they are always padded — see CLAUDE.md. To put
 * the lesson somewhere else, reorder the section afterwards.
 *
 * An instructor's new lesson lists them as an author (added if missing) and
 * goes to a pull request. A lesson in a section the instructor created and
 * has not had published yet lands on that section's draft branch.
 */
import { stringify as stringifyYaml } from 'yaml'

export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  const body = await readBody<{ section?: unknown, title?: unknown, slug?: unknown, description?: unknown, content?: unknown }>(event)

  const dir = assertSectionDir(body?.section)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 140) : ''
  if (!title) throw createError({ statusCode: 400, statusMessage: 'A title is required.' })
  const slug = assertSlug(typeof body?.slug === 'string' && body.slug.trim() ? body.slug.trim() : slugify(title), 'Slug')
  if (slug === 'index') throw createError({ statusCode: 400, statusMessage: '"index" is reserved for the section\'s first page.' })

  const navPath = `content/en/${dir}/.navigation.yml`
  const draft = ctx.role === 'instructor' ? await findDraft(ctx.user.id, [navPath]) : null
  const ref = draft?.branch ?? contentBranch()

  const existing = (await listDir(`content/en/${dir}`, ref)).filter(f => f.type === 'file' && f.name.endsWith('.md'))
  if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Unknown section.' })
  if (existing.some(f => splitPrefix(f.name).slug === slug)) {
    throw createError({ statusCode: 409, statusMessage: `A lesson with the slug "${slug}" already exists in this section.` })
  }
  const last = Math.max(...existing.map(f => splitPrefix(f.name).num).filter(n => Number.isFinite(n)))
  const width = Math.max(2, ...existing.map(f => splitPrefix(f.name).width))
  const path = `content/en/${dir}/${padPrefix(last + 1, width)}.${slug}.md`

  let content: string
  if (typeof body?.content === 'string' && body.content.trim()) {
    content = assertContentSize(body.content.replace(/\r\n/g, '\n'))
  } else {
    const description = typeof body?.description === 'string' && body.description.trim()
      ? body.description.trim()
      : 'One sentence on what this lesson teaches - shown in navigation and search results.'
    const fm: Record<string, unknown> = { title, description }
    if (ctx.personSlug) fm.authors = [ctx.personSlug]
    content = `---\n${stringifyYaml(fm, { lineWidth: 0, defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' }).trim()}\n---\n\n# ${title}\n\nWrite the lesson here.\n`
  }

  const course = await readCourse()
  const data = assertLessonFile(content, new Set(course.people.map(p => p.slug)))
  if (ctx.role === 'instructor' && !(data.authors as string[] | undefined)?.includes(ctx.personSlug!)) {
    throw createError({ statusCode: 422, statusMessage: 'Add yourself to authors - it is what lets you keep editing this lesson.' })
  }

  const result = await publishChanges(ctx, {
    summary: String(data.title),
    slug,
    message: `content: add ${path.replace('content/en/', '')}`,
    changes: [{ path, content }],
    expect: { [path]: null },
    draft
  })

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { path, sha: await gitBlobSha(content), content, ...result }
})
