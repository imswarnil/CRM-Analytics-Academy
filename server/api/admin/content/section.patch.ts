/**
 * Rename a section: the title (and icon) in its English .navigation.yml. The
 * folder — and so the URL — stays. The translate workflow regenerates the
 * other locales' .navigation.yml from this file on the next push.
 *
 * Admins only: a section holds many authors' lessons, so no single
 * instructor owns its name.
 */
import { isScalar, parseDocument } from 'yaml'

export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  if (ctx.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Only admins rename sections.' })

  const body = await readBody<{ dir?: unknown, title?: unknown, icon?: unknown, sha?: unknown }>(event)
  const dir = assertSectionDir(body?.dir)
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 80) : ''
  if (!title) throw createError({ statusCode: 400, statusMessage: 'A title is required.' })
  const icon = typeof body?.icon === 'string' && /^i-[a-z0-9-]+$/.test(body.icon.trim()) ? body.icon.trim() : null
  const sha = typeof body?.sha === 'string' && body.sha ? body.sha : null

  const path = `content/en/${dir}/.navigation.yml`
  const file = await readFileAt(path, contentBranch())
  if ((file?.sha ?? null) !== sha) {
    throw createError({ statusCode: 409, statusMessage: 'The section changed on GitHub since it was loaded - reload.' })
  }

  const doc = parseDocument(file?.content ?? '')
  const setText = (key: string, value: string) => {
    const node = doc.get(key, true)
    if (isScalar(node)) node.value = value
    else doc.set(key, value)
  }
  setText('title', title)
  if (icon) setText('icon', icon)
  const content = `${doc.toString({ lineWidth: 0 }).trimEnd()}\n`
  if (file && content === file.content) return { path, sha, unchanged: true }

  const result = await publishChanges(ctx, {
    summary: title,
    slug: splitPrefix(dir).slug,
    message: `content: rename section ${dir} → "${title}"`,
    changes: [{ path, content }],
    expect: { [path]: sha }
  })
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { path, sha: await gitBlobSha(content), ...result }
})
