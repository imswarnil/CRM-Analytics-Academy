/**
 * Every English lesson file in the repo, for the Content Studio's file list.
 *
 * One git/trees call with recursive=1 rather than walking the contents API
 * directory by directory — a single request returns the whole tree, and the
 * filter down to content/en/**.md happens here, not on GitHub.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = requireContentToken()
  const repo = contentRepo()

  let tree: { path?: string, type?: string, size?: number }[]
  try {
    // "HEAD" resolves to the default branch's tip, so this never needs to know
    // whether the default branch is main or something else.
    const res = await $fetch<{ tree: { path?: string, type?: string, size?: number }[] }>(
      `https://api.github.com/repos/${repo}/git/trees/HEAD?recursive=1`,
      { headers: ghHeaders(token) }
    )
    tree = res.tree || []
  } catch (e) {
    const status = ghStatus(e)
    if (status === 401 || status === 403) {
      throw createError({ statusCode: 502, statusMessage: 'GitHub rejected the content token - check GITHUB_CONTENT_TOKEN permissions.' })
    }
    throw createError({ statusCode: 502, statusMessage: 'Could not list content from GitHub.' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return tree
    .filter(t => t.type === 'blob'
      && typeof t.path === 'string'
      && t.path.startsWith('content/en/')
      && t.path.endsWith('.md'))
    .map(t => ({ path: t.path as string, size: Number(t.size ?? 0) }))
})
