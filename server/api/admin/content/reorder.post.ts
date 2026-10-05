/**
 * Reorder the lessons of a section, or the sections of the course — as ONE
 * commit to main.
 *
 *   { kind: 'lessons', section: '07.saql', treeSha, order: ['01.index.md', '03.functions.md', …] }
 *   { kind: 'sections', treeSha, order: ['00.introduction', '02.setup', …] }
 *
 * `order` is the current names in the wanted order; `treeSha` is the git tree
 * of the folder the editor saw (the section, or content/en) — if anything in
 * it changed since, the reorder is refused with a 409 rather than applied to
 * a list the admin never looked at.
 *
 * What moves (server/utils/content-reorder.ts): the English files, the same
 * relative paths in every locale folder, and the keys of
 * .translation-manifest.json — nothing else. Moves reuse the existing blobs,
 * so the commit shows pure renames.
 *
 * Admins only. A reorder rewrites the manifest, which the translate workflow
 * also writes; a pull request that sat open while translations landed would
 * conflict on it, so reorders go straight to main.
 */
export default defineEventHandler(async (event) => {
  const ctx = await editorContext(event)
  if (ctx.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Only admins reorder the course.' })

  const body = await readBody<{ kind?: unknown, section?: unknown, treeSha?: unknown, order?: unknown }>(event)
  const kind = body?.kind === 'sections' ? 'sections' : 'lessons'
  const section = kind === 'lessons' ? assertSectionDir(body?.section) : ''
  const order = Array.isArray(body?.order) && body.order.every(n => typeof n === 'string') ? body.order as string[] : null
  if (!order?.length) throw createError({ statusCode: 400, statusMessage: 'order is required.' })

  const head = await branchHead(contentBranch())
  if (!head) throw createError({ statusCode: 502, statusMessage: 'The content branch does not exist on GitHub.' })
  const course = await readCourse(head)
  const current = kind === 'sections'
    ? { treeSha: course.enTreeSha, names: course.sections.map(s => s.dir) }
    : (() => {
        const s = course.sections.find(x => x.dir === section)
        if (!s) throw createError({ statusCode: 404, statusMessage: 'Unknown section.' })
        return { treeSha: s.treeSha, names: s.lessons.map(l => l.file) }
      })()
  if (body?.treeSha !== current.treeSha) {
    throw createError({ statusCode: 409, statusMessage: 'The course changed on GitHub since it was loaded - reload and reorder again.' })
  }

  let renames: Record<string, string>
  try {
    renames = renumber(current.names, order)
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: (e as Error).message })
  }
  if (!Object.keys(renames).length) return { ok: true, unchanged: true }

  // The whole content/ tree in one call (≈2,500 entries), and the manifest blob.
  const root = await listTree(await commitTree(head))
  const contentTree = root.find(e => e.path === 'content' && e.type === 'tree')
  const manifestEntry = root.find(e => e.path === '.translation-manifest.json' && e.type === 'blob')
  if (!contentTree) throw createError({ statusCode: 502, statusMessage: 'content/ is missing on the content branch.' })
  const entries = await listTree(contentTree.sha, true)

  let manifest: Record<string, unknown> | null = null
  if (manifestEntry) {
    try {
      manifest = JSON.parse(await readBlob(manifestEntry.sha))
    } catch {
      throw createError({ statusCode: 502, statusMessage: '.translation-manifest.json is not valid JSON - fix it before reordering.' })
    }
  }

  const plan = planReorder({ scope: section, renames, entries, locales: CONTENT_LOCALES, manifest })
  const changes: GitChange[] = [
    ...plan.adds.map(a => a.type === 'tree' ? { path: a.path, tree: a.sha } : { path: a.path, blob: a.sha, mode: a.mode }),
    ...plan.removes.map(path => ({ path, remove: true }))
  ]
  if (plan.manifest) {
    changes.push({ path: '.translation-manifest.json', content: `${JSON.stringify(plan.manifest, null, 2)}\n` })
  }

  const what = kind === 'sections' ? 'sections' : `lessons in ${section}`
  const result = await publishChanges(ctx, {
    summary: `Reorder ${what}`,
    slug: 'reorder',
    message: `content: reorder ${what}\n\n${Object.entries(renames).map(([a, b]) => `${a} → ${b}`).join('\n')}`,
    changes,
    parent: head
  })

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    ...result,
    renames,
    moved: plan.adds.length,
    removed: plan.removes.length,
    manifestKeys: plan.manifestKeys
  }
})
