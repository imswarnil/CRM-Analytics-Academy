/**
 * One lesson file, decoded, plus the blob sha the editor must send back on
 * save — the sha is GitHub's optimistic lock, so a stale editor gets a 409
 * instead of silently overwriting someone else's commit.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = requireContentToken()
  const repo = contentRepo()
  const path = assertLessonPath(getQuery(event).path)

  let file: { sha?: string, content?: string, encoding?: string, size?: number }
  try {
    file = await $fetch<{ sha?: string, content?: string, encoding?: string, size?: number }>(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      { headers: ghHeaders(token) }
    )
  } catch (e) {
    const status = ghStatus(e)
    if (status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'File not found in the repo.' })
    }
    if (status === 401 || status === 403) {
      throw createError({ statusCode: 502, statusMessage: 'GitHub rejected the content token - check GITHUB_CONTENT_TOKEN permissions.' })
    }
    throw createError({ statusCode: 502, statusMessage: 'Could not read the file from GitHub.' })
  }

  // The contents API stops inlining content above 1 MB; that is also our own
  // editing cap, so refuse rather than returning an empty body.
  if (Number(file.size ?? 0) > 1024 * 1024 || file.encoding !== 'base64' || typeof file.content !== 'string') {
    throw createError({ statusCode: 413, statusMessage: 'File is too large to edit in the studio (1 MB limit).' })
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')

  return {
    path,
    sha: String(file.sha),
    content: Buffer.from(file.content, 'base64').toString('utf8')
  }
})
