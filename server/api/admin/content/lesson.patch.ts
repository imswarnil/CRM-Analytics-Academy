/**
 * Rename a lesson: its title (and optionally its short sidebar title). The
 * file name — and so the URL — stays; only the frontmatter changes, plus the
 * leading `# Title` heading when it repeats the old title, as every lesson's
 * does.
 *
 * Edited through the YAML document model so every other key, its quoting and
 * its comments are left exactly as they were: the commit diff is the title
 * lines and nothing else.
 */
import { isScalar, parseDocument } from 'yaml'

export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  const body = await readBody<{ path?: unknown, sha?: unknown, title?: unknown, navTitle?: unknown }>(event)
  const path = assertLessonPath(body?.path)
  const sha = typeof body?.sha === 'string' ? body.sha : ''
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 140) : ''
  if (!title || !sha) throw createError({ statusCode: 400, statusMessage: 'Title and sha are required.' })
  const navTitle = typeof body?.navTitle === 'string' ? body.navTitle.trim().slice(0, 60) : undefined

  const draft = ctx.role === 'instructor' ? await findDraft(ctx.user.id, [path]) : null
  await assertMayEdit(ctx, path, draft)
  const file = await readFileAt(path, draft?.branch ?? contentBranch())
  if (!file) throw createError({ statusCode: 404, statusMessage: 'File not found in the repo.' })
  if (file.sha !== sha) {
    throw createError({ statusCode: 409, statusMessage: 'The lesson changed on GitHub since it was loaded - reload it.' })
  }

  const m = file.content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) throw createError({ statusCode: 422, statusMessage: 'The lesson has no frontmatter.' })
  const doc = parseDocument(m[1]!)
  const oldTitle = String(doc.get('title') ?? '')
  // Set the existing scalar's value rather than replacing the node, so a
  // double-quoted title stays double-quoted.
  const setText = (keys: string[], value: string) => {
    const node = doc.getIn(keys, true)
    if (isScalar(node)) node.value = value
    else doc.setIn(keys, value)
  }
  setText(['title'], title)
  if (navTitle !== undefined) {
    if (navTitle) setText(['navigation', 'title'], navTitle)
    else if (doc.hasIn(['navigation', 'title'])) doc.deleteIn(['navigation', 'title'])
  }
  let rest = file.content.slice(m[0].length)
  if (oldTitle) {
    const esc = oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    rest = rest.replace(new RegExp(`^(\\s*)# ${esc}[ \\t]*$`, 'm'), (_m, ws: string) => `${ws}# ${title}`)
  }
  const content = `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${rest}`
  if (content === file.content) return { path, sha, unchanged: true }

  const result = await publishChanges(ctx, {
    summary: title,
    slug: splitPrefix(path.split('/').pop()!).slug,
    message: `content: rename ${path.replace('content/en/', '')} → "${title}"`,
    changes: [{ path, content }],
    expect: { [path]: sha },
    draft
  })
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { path, sha: await gitBlobSha(content), ...result }
})
