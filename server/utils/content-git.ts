/**
 * The GitHub calls behind the content editor, in one place.
 *
 * Two APIs, for two different jobs:
 *
 *   - The Git Data API (refs, trees, commits) for every write. A save, a new
 *     section or a reorder is ONE commit however many files it touches: a
 *     tree is built on top of the parent's tree, a commit points at it, and
 *     the branch ref is moved with force:false. If someone else committed in
 *     between, GitHub refuses the fast-forward and the editor gets a 409 —
 *     nothing is half-applied, because nothing is applied until the ref moves.
 *   - GraphQL for the course tree read: every English lesson's text in one
 *     request, where the REST contents API would need one call per file.
 *
 * The token never leaves the server (see content-studio.ts).
 */
const API = 'https://api.github.com'

export interface GitChange {
  path: string
  /** New text for the file. */
  content?: string
  /** Point the path at an existing blob (a rename/move). */
  blob?: string
  /** Point the path at an existing tree (a moved folder). */
  tree?: string
  /** Remove the path. */
  remove?: boolean
  /** File mode for a moved blob; regular file when omitted. */
  mode?: string
}

function repoPath(): string {
  return `${API}/repos/${contentRepo()}`
}

/**
 * Turn a GitHub failure into an error the editor can show. GitHub's own
 * message is never echoed (it can quote the request); only the status is used.
 */
export function githubError(e: unknown, action: string): never {
  const status = ghStatus(e)
  if (status === 401 || status === 403) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub rejected the content token - it needs Contents and Pull requests read/write on this repository.' })
  }
  if (status === 404) {
    throw createError({ statusCode: 404, statusMessage: `${action}: not found on GitHub.` })
  }
  if (status === 409 || status === 422) {
    throw createError({ statusCode: 409, statusMessage: `${action}: the content changed on GitHub since it was loaded - reload and reapply your edit.` })
  }
  throw createError({ statusCode: 502, statusMessage: `${action}: GitHub did not answer.` })
}

/** A REST call against the content repo. Throws the raw FetchError. */
export function gh<T>(path: string, opts: { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', body?: Record<string, unknown>, query?: Record<string, string | number> } = {}): Promise<T> {
  const token = requireContentToken()
  return $fetch<T>(`${repoPath()}${path}`, {
    method: opts.method ?? 'GET',
    headers: ghHeaders(token),
    body: opts.body,
    query: opts.query
  })
}

export async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = requireContentToken()
  let res: { data?: T, errors?: { message?: string }[] }
  try {
    res = await $fetch<{ data?: T, errors?: { message?: string }[] }>(`${API}/graphql`, {
      method: 'POST',
      headers: ghHeaders(token),
      body: { query, variables }
    })
  } catch (e) {
    githubError(e, 'Read course')
  }
  if (res.errors?.length || !res.data) {
    throw createError({ statusCode: 502, statusMessage: 'GitHub could not read the course tree.' })
  }
  return res.data
}

/** The commit a branch points at, or null when the branch does not exist. */
export async function branchHead(branch: string): Promise<string | null> {
  try {
    const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch}`)
    return ref.object.sha
  } catch (e) {
    if (ghStatus(e) === 404) return null
    githubError(e, 'Read branch')
  }
}

/** The main branch's head, cached for a few seconds so a burst of reads shares one lookup. */
export function mainHead(): Promise<string> {
  return memo(`content:head:${contentBranch()}`, 5_000, async () => {
    const sha = await branchHead(contentBranch())
    if (!sha) throw createError({ statusCode: 502, statusMessage: 'The content branch does not exist on GitHub.' })
    return sha
  })
}

/** One file at a ref, decoded; null when it does not exist there. */
export async function readFileAt(path: string, ref: string): Promise<{ sha: string, content: string } | null> {
  try {
    const file = await gh<{ sha?: string, content?: string, encoding?: string, size?: number, type?: string }>(
      `/contents/${path}`, { query: { ref } }
    )
    if (file.type && file.type !== 'file') return null
    if (Number(file.size ?? 0) > 1024 * 1024 || file.encoding !== 'base64' || typeof file.content !== 'string') {
      throw createError({ statusCode: 413, statusMessage: 'File is too large to edit in the studio (1 MB limit).' })
    }
    return { sha: String(file.sha), content: Buffer.from(file.content, 'base64').toString('utf8') }
  } catch (e) {
    if (isError(e)) throw e
    if (ghStatus(e) === 404) return null
    githubError(e, 'Read file')
  }
}

/** The entries of one directory at a ref; [] when it does not exist there. */
export async function listDir(path: string, ref: string): Promise<{ name: string, type: string, sha: string }[]> {
  try {
    const res = await gh<{ name: string, type: string, sha: string }[] | Record<string, unknown>>(`/contents/${path}`, { query: { ref } })
    return Array.isArray(res) ? res : []
  } catch (e) {
    if (ghStatus(e) === 404) return []
    githubError(e, 'List folder')
  }
}

/**
 * The sha git gives this text as a blob — what GitHub will report for the
 * file after a commit, so the editor can keep saving without a re-read.
 */
export async function gitBlobSha(text: string): Promise<string> {
  const body = new TextEncoder().encode(text)
  const head = new TextEncoder().encode(`blob ${body.length}\0`)
  const buf = new Uint8Array(head.length + body.length)
  buf.set(head)
  buf.set(body, head.length)
  const digest = await crypto.subtle.digest('SHA-1', buf)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** A blob's text by sha (works past the contents API's 1 MB inline limit). */
export async function readBlob(sha: string): Promise<string> {
  try {
    const blob = await gh<{ content: string, encoding: string }>(`/git/blobs/${sha}`)
    return Buffer.from(blob.content, blob.encoding === 'base64' ? 'base64' : 'utf8').toString('utf8')
  } catch (e) {
    githubError(e, 'Read blob')
  }
}

export interface TreeEntry {
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
  mode: string
}

/** The root tree of a commit. */
export async function commitTree(commit: string): Promise<string> {
  try {
    const c = await gh<{ tree: { sha: string } }>(`/git/commits/${commit}`)
    return c.tree.sha
  } catch (e) {
    githubError(e, 'Read commit')
  }
}

/** A tree's entries, optionally recursive. Paths are relative to that tree. */
export async function listTree(tree: string, recursive = false): Promise<TreeEntry[]> {
  try {
    const res = await gh<{ tree: TreeEntry[], truncated?: boolean }>(`/git/trees/${tree}`, recursive ? { query: { recursive: 1 } } : {})
    if (res.truncated) {
      throw createError({ statusCode: 502, statusMessage: 'The content tree is too large for one GitHub request.' })
    }
    return res.tree
  } catch (e) {
    if (isError(e)) throw e
    githubError(e, 'Read tree')
  }
}

/**
 * Commit a set of changes on top of `parent` and move `branch` to it — one
 * commit, however many files. force:false makes the ref move a compare-and-
 * swap: if the branch is no longer at `parent`, GitHub answers 422 and the
 * caller gets a 409 telling the editor to reload.
 */
export async function commitChanges(opts: { branch: string, parent: string, message: string, changes: GitChange[] }): Promise<{ sha: string, url: string }> {
  if (!opts.changes.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to commit.' })
  }
  for (const c of opts.changes) {
    if (!c.path.startsWith('content/') && c.path !== '.translation-manifest.json') {
      // The editor's whole write surface. Anything else is a bug upstream.
      throw createError({ statusCode: 400, statusMessage: 'The editor only writes under content/.' })
    }
  }
  const baseTree = await commitTree(opts.parent)
  try {
    const tree = await gh<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: {
        base_tree: baseTree,
        tree: opts.changes.map(c => c.remove
          ? { path: c.path, mode: '100644', type: 'blob', sha: null }
          : c.tree
            ? { path: c.path, mode: '040000', type: 'tree', sha: c.tree }
            : c.blob
              ? { path: c.path, mode: c.mode ?? '100644', type: 'blob', sha: c.blob }
              : { path: c.path, mode: '100644', type: 'blob', content: c.content ?? '' })
      }
    })
    const commit = await gh<{ sha: string, html_url: string }>('/git/commits', {
      method: 'POST',
      body: { message: opts.message, tree: tree.sha, parents: [opts.parent] }
    })
    await gh(`/git/refs/heads/${opts.branch}`, {
      method: 'PATCH',
      body: { sha: commit.sha, force: false }
    })
    return { sha: commit.sha, url: commit.html_url }
  } catch (e) {
    githubError(e, 'Commit')
  }
}

export async function createBranch(name: string, sha: string): Promise<void> {
  try {
    await gh('/git/refs', { method: 'POST', body: { ref: `refs/heads/${name}`, sha } })
  } catch (e) {
    githubError(e, 'Create branch')
  }
}

export async function deleteBranch(name: string): Promise<void> {
  try {
    await gh(`/git/refs/heads/${name}`, { method: 'DELETE' })
  } catch {
    // Already gone, or protected: either way the merge itself succeeded.
  }
}

export interface PullRequest {
  number: number
  html_url: string
  state: 'open' | 'closed'
  merged?: boolean
  title: string
  body: string | null
  created_at: string
  updated_at: string
  head: { ref: string, sha: string }
  mergeable?: boolean | null
}

export async function getPull(n: number): Promise<PullRequest | null> {
  try {
    return await gh<PullRequest>(`/pulls/${n}`)
  } catch (e) {
    if (ghStatus(e) === 404) return null
    githubError(e, 'Read pull request')
  }
}

export async function openPulls(): Promise<PullRequest[]> {
  try {
    return await gh<PullRequest[]>('/pulls', { query: { state: 'open', base: contentBranch(), per_page: 100 } })
  } catch (e) {
    githubError(e, 'List pull requests')
  }
}

export async function createPull(opts: { branch: string, title: string, body: string }): Promise<PullRequest> {
  try {
    return await gh<PullRequest>('/pulls', {
      method: 'POST',
      body: { title: opts.title, head: opts.branch, base: contentBranch(), body: opts.body, maintainer_can_modify: true }
    })
  } catch (e) {
    githubError(e, 'Open pull request')
  }
}

export interface PullFile {
  filename: string
  previous_filename?: string
  status: string
  additions: number
  deletions: number
  patch?: string
}

export async function pullFiles(n: number): Promise<PullFile[]> {
  try {
    return await gh<PullFile[]>(`/pulls/${n}/files`, { query: { per_page: 100 } })
  } catch (e) {
    githubError(e, 'List changed files')
  }
}

/**
 * Squash-merge a pull request. `sha` pins the head the admin reviewed: if the
 * instructor pushed again after the review screen loaded, GitHub refuses (409)
 * rather than publishing changes nobody looked at.
 */
export async function mergePull(n: number, sha: string, title: string): Promise<{ sha: string }> {
  try {
    return await gh<{ sha: string }>(`/pulls/${n}/merge`, {
      method: 'PUT',
      body: { merge_method: 'squash', sha, commit_title: title }
    })
  } catch (e) {
    const status = ghStatus(e)
    if (status === 405) {
      throw createError({ statusCode: 409, statusMessage: 'GitHub cannot merge this pull request (conflict with main, or checks pending). Resolve it on GitHub.' })
    }
    githubError(e, 'Merge')
  }
}

/** A comment on the pull request's conversation (the issues endpoint is the one PRs share). */
export async function commentOnPull(n: number, body: string): Promise<void> {
  try {
    await gh(`/issues/${n}/comments`, { method: 'POST', body: { body } })
  } catch (e) {
    githubError(e, 'Comment')
  }
}
