/**
 * Create or update one English lesson by committing straight to the repo's
 * default branch through the GitHub contents API.
 *
 * sha present  → update (GitHub rejects a stale sha with 409/422, surfaced as
 *                a clear conflict message instead of a silent overwrite).
 * sha absent   → create (GitHub 422s if the file already exists).
 *
 * No committer is set: the commit is authored by whatever identity the
 * fine-grained PAT belongs to, which is exactly the audit trail wanted.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = requireContentToken()
  const repo = contentRepo()

  const body = await readBody<{ path?: unknown, content?: unknown, sha?: unknown, message?: unknown }>(event)
  const path = assertLessonPath(body?.path)

  if (typeof body?.content !== 'string' || !body.content.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required.' })
  }
  const content = assertContentSize(body.content)

  const sha = typeof body?.sha === 'string' && body.sha ? body.sha : undefined
  const message = typeof body?.message === 'string' && body.message.trim()
    ? body.message.trim()
    : `content: update ${path} via admin studio`

  let res: { content?: { sha?: string }, commit?: { sha?: string, html_url?: string } }
  try {
    res = await $fetch<{ content?: { sha?: string }, commit?: { sha?: string, html_url?: string } }>(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: ghHeaders(token),
        body: {
          message,
          content: Buffer.from(content, 'utf8').toString('base64'),
          ...(sha ? { sha } : {})
        }
      }
    )
  } catch (e) {
    const status = ghStatus(e)
    // 409 = branch moved under us; 422 = sha stale/missing for an existing
    // file (or present for a new one). Both mean the editor's view is out of
    // date — same remedy either way.
    if (status === 409 || status === 422) {
      throw createError({
        statusCode: 409,
        statusMessage: 'The file changed on GitHub since it was loaded - reload it and reapply your edit.'
      })
    }
    if (status === 401 || status === 403) {
      throw createError({ statusCode: 502, statusMessage: 'GitHub rejected the content token - check GITHUB_CONTENT_TOKEN permissions.' })
    }
    throw createError({ statusCode: 502, statusMessage: 'Could not publish the file to GitHub.' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    path,
    sha: String(res.content?.sha ?? ''),
    commitSha: String(res.commit?.sha ?? ''),
    commitUrl: res.commit?.html_url ? String(res.commit.html_url) : null
  }
})
