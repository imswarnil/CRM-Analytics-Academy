/**
 * Save one content file.
 *
 *   content/en/**.md         update an existing lesson (sha required). New
 *                            lessons go through POST /lesson, which picks the
 *                            numeric prefix.
 *   content/people/<s>.yml   create (no sha) or update a person — admins only.
 *
 * Admins commit to main; instructors to their draft branch and pull request
 * (server/utils/content-publish.ts). The frontmatter is validated first — an
 * unknown author slug or a credit without a link is refused here rather than
 * discovered by the build.
 */
import { parse as parseYaml } from 'yaml'

export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  const body = await readBody<{ path?: unknown, content?: unknown, sha?: unknown, message?: unknown }>(event)

  if (typeof body?.content !== 'string' || !body.content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required.' })
  }
  const content = assertContentSize(body.content.replace(/\r\n/g, '\n'))
  const sha = typeof body?.sha === 'string' && body.sha ? body.sha : null
  const custom = typeof body?.message === 'string' ? body.message.trim().slice(0, 200) : ''

  setResponseHeader(event, 'cache-control', 'private, no-store')

  // People registry -----------------------------------------------------------
  if (typeof body?.path === 'string' && body.path.startsWith('content/people/')) {
    if (ctx.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Only admins edit the people registry.' })
    }
    const path = assertPersonPath(body.path)
    let data: Record<string, unknown>
    try {
      data = (parseYaml(content) ?? {}) as Record<string, unknown>
    } catch (e) {
      throw createError({ statusCode: 422, statusMessage: `Not valid YAML: ${String((e as Error).message).split('\n')[0]}` })
    }
    const problems = personProblems(data)
    if (problems.length) throw createError({ statusCode: 422, statusMessage: problems.join(' ') })

    const slug = path.replace(/^content\/people\/|\.yml$/g, '')
    const result = await publishChanges(ctx, {
      summary: String(data.name),
      slug,
      message: custom || `content: ${sha ? 'update' : 'add'} person ${slug}`,
      changes: [{ path, content }],
      expect: { [path]: sha }
    })
    return { path, sha: await gitBlobSha(content), ...result }
  }

  // Lesson ---------------------------------------------------------------------
  const path = assertLessonPath(body?.path)
  if (!sha) {
    throw createError({ statusCode: 400, statusMessage: 'Reload the lesson before saving (missing sha). New lessons are created with "New lesson".' })
  }

  const course = await readCourse()
  const data = assertLessonFile(content, new Set(course.people.map(p => p.slug)))

  const draft = ctx.role === 'instructor' ? await findDraft(ctx.user.id, [path]) : null
  await assertMayEdit(ctx, path, draft)
  if (ctx.role === 'instructor' && !(data.authors as string[] | undefined)?.includes(ctx.personSlug!)) {
    throw createError({ statusCode: 422, statusMessage: 'Keep yourself in authors - it is what lets you keep editing this lesson.' })
  }

  const rel = path.replace('content/en/', '')
  const result = await publishChanges(ctx, {
    summary: String(data.title),
    slug: lessonRoute(rel.split('/')[0]!, rel.split('/').pop()!).split('/').pop()!,
    message: custom || `content: update ${rel}`,
    changes: [{ path, content }],
    expect: { [path]: sha },
    draft
  })
  return { path, sha: await gitBlobSha(content), ...result }
})
