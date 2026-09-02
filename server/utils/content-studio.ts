/**
 * Shared plumbing for the Content Studio routes (/api/admin/content/*).
 *
 * The studio edits English lessons by proxying the GitHub REST contents API —
 * the repo itself stays the source of truth, and a publish is just a commit to
 * main, which triggers the translate workflow and the Pages deploy exactly as
 * a local push would.
 *
 * Security posture:
 *   - GITHUB_CONTENT_TOKEN never leaves the server. It is read here, sent to
 *     api.github.com, and never echoed into any response or error message.
 *   - Every route validates the path with assertLessonPath before doing
 *     anything: only markdown under content/en/, no traversal, no characters
 *     that could smuggle query strings into the proxied URL.
 */

const MAX_CONTENT_BYTES = 1024 * 1024 // 1 MB — far beyond any real lesson.

export function contentRepo(): string {
  return process.env.GITHUB_CONTENT_REPO || 'imswarnil/CRM-Analytics-Academy'
}

export function requireContentToken(): string {
  const token = process.env.GITHUB_CONTENT_TOKEN
  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Content studio is not configured - set GITHUB_CONTENT_TOKEN.'
    })
  }
  return token
}

/**
 * Only markdown files under content/en/ are reachable, ever. The charset is
 * deliberately tight — beyond blocking '..' it keeps '?', '#', '%' and spaces
 * out of the URL we build for GitHub.
 */
export function assertLessonPath(path: unknown): string {
  if (
    typeof path !== 'string'
    || !path.startsWith('content/en/')
    || !path.endsWith('.md')
    || path.includes('..')
    || !/^content\/en\/[A-Za-z0-9][A-Za-z0-9._/-]*\.md$/.test(path)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path must be a markdown file under content/en/.'
    })
  }
  return path
}

export function assertContentSize(content: string): string {
  if (new TextEncoder().encode(content).length > MAX_CONTENT_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Content exceeds the 1 MB limit.' })
  }
  return content
}

export function ghHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'crm-analytics-academy-admin'
  }
}

/** HTTP status from an ofetch FetchError, whatever shape this version uses. */
export function ghStatus(e: unknown): number {
  const err = e as { status?: number, statusCode?: number, response?: { status?: number } }
  return Number(err?.status ?? err?.statusCode ?? err?.response?.status ?? 0)
}
