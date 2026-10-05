/**
 * Where a save goes, decided by who is saving.
 *
 *   admin       → one commit straight to main. The push triggers the
 *                 translate and deploy workflows, as a local push would.
 *   instructor  → one commit to a branch `lesson/<slug>-<shortid>` and a pull
 *                 request against main. The next save to the same lesson
 *                 lands on the same branch and updates the same pull request,
 *                 until an admin publishes (merges) it or it is closed.
 *
 * Instructors may only touch lessons that list them as an author, plus the
 * lessons and sections they create. That is checked here, against main, on
 * every save — never trusted from the editor.
 */
import type { H3Event } from 'h3'
import { parse as parseYaml } from 'yaml'
import type { GitChange } from './content-git'

export interface EditorContext {
  user: SessionUser
  role: 'admin' | 'instructor'
  /** The instructor's slug in content/people; null for admins. */
  personSlug: string | null
}

export interface DraftRow {
  id: number
  branch: string
  prNumber: number | null
  prUrl: string | null
  title: string
  paths: string[]
  status: 'open' | 'changes_requested' | 'published' | 'closed'
  reviewNote: string | null
  userId: string
}

export interface PublishResult {
  mode: 'commit' | 'pull'
  commitSha: string
  commitUrl: string
  branch: string
  prNumber?: number
  prUrl?: string
}

function missingMigration(e: unknown): boolean {
  return /relation .*(instructor_profile|lesson_draft).* does not exist/i.test(String((e as Error)?.message ?? e))
}

const MIGRATION_HINT = 'Instructor tables are missing - apply server/db/012_instructors.sql.'

export async function editorContext(event: H3Event): Promise<EditorContext> {
  const { user, role } = await requireEditor(event)
  if (role === 'admin') return { user, role, personSlug: null }
  let slug: string | null
  try {
    const rows = await useDb()`select person_slug from app.instructor_profile where user_id = ${user.id}`
    slug = (rows[0]?.person_slug as string | undefined) ?? null
  } catch (e) {
    if (missingMigration(e)) throw createError({ statusCode: 503, statusMessage: MIGRATION_HINT })
    throw e
  }
  if (!slug) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your instructor account is not linked to a person in the registry yet - ask an admin to link it (Content → People).'
    })
  }
  return { user, role, personSlug: slug }
}

function toDraft(r: Record<string, unknown>): DraftRow {
  return {
    id: Number(r.id),
    branch: String(r.branch),
    prNumber: r.pr_number == null ? null : Number(r.pr_number),
    prUrl: (r.pr_url as string | null) ?? null,
    title: String(r.title),
    paths: (r.paths as string[]) ?? [],
    status: r.status as DraftRow['status'],
    reviewNote: (r.review_note as string | null) ?? null,
    userId: String(r.user_id)
  }
}

/**
 * The instructor's live draft touching any of these paths, or null. A draft
 * whose pull request was merged or closed on GitHub is retired here, so the
 * next save opens a fresh one instead of pushing to a dead branch.
 */
export async function findDraft(userId: string, paths: string[]): Promise<DraftRow | null> {
  let rows: Record<string, unknown>[]
  try {
    rows = await useDb()`
      select * from app.lesson_draft
      where user_id = ${userId}
        and status in ('open', 'changes_requested')
        and paths && ${paths}::text[]
      order by updated_at desc
      limit 1
    `
  } catch (e) {
    if (missingMigration(e)) throw createError({ statusCode: 503, statusMessage: MIGRATION_HINT })
    throw e
  }
  if (!rows[0]) return null
  const draft = toDraft(rows[0])
  if (draft.prNumber) {
    const pr = await getPull(draft.prNumber)
    if (!pr || pr.state !== 'open') {
      await useDb()`
        update app.lesson_draft
        set status = ${pr?.merged ? 'published' : 'closed'}, updated_at = now()
        where id = ${draft.id}
      `
      return null
    }
  }
  return draft
}

export async function draftsOf(userId: string): Promise<DraftRow[]> {
  try {
    const rows = await useDb()`
      select * from app.lesson_draft where user_id = ${userId}
      order by updated_at desc limit 50
    `
    return rows.map(toDraft)
  } catch (e) {
    if (missingMigration(e)) return []
    throw e
  }
}

export async function draftsByBranch(branches: string[]): Promise<Map<string, DraftRow & { userName: string | null, userEmail: string | null }>> {
  const out = new Map<string, DraftRow & { userName: string | null, userEmail: string | null }>()
  if (!branches.length) return out
  try {
    const rows = await useDb()`
      select d.*, u.name as user_name, u.email as user_email
      from app.lesson_draft d
      left join neon_auth."user" u on u.id::text = d.user_id
      where d.branch = any(${branches}::text[])
    `
    for (const r of rows) {
      out.set(String(r.branch), { ...toDraft(r), userName: (r.user_name as string | null) ?? null, userEmail: (r.user_email as string | null) ?? null })
    }
  } catch (e) {
    if (!missingMigration(e)) throw e
  }
  return out
}

/**
 * May this instructor change this lesson? Yes when main's copy lists them as
 * an author, or when the file exists only in their own open draft (a lesson
 * they created). Admins may edit anything.
 */
export async function assertMayEdit(ctx: EditorContext, path: string, draft: DraftRow | null): Promise<void> {
  if (ctx.role === 'admin') return
  const onMain = await readFileAt(path, contentBranch())
  if (!onMain) {
    if (draft?.paths.includes(path)) return
    throw createError({ statusCode: 403, statusMessage: 'Instructors create lessons with "New lesson"; this file is not in one of your drafts.' })
  }
  const authors = frontmatterOf(onMain.content).authors
  if (!Array.isArray(authors) || !authors.includes(ctx.personSlug)) {
    throw createError({ statusCode: 403, statusMessage: 'You can edit only lessons that list you as an author.' })
  }
}

/** Short, unguessable-enough suffix for a branch name. */
function shortId(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 6)
}

/**
 * Commit `changes` for this editor. `expect` maps a path to the blob sha the
 * editor loaded (null: must not exist yet) and is checked against the branch
 * the commit lands on — the optimistic lock. The ref move itself is a second
 * lock (force:false), so a race between the check and the commit still fails
 * safe.
 */
export async function publishChanges(ctx: EditorContext, opts: {
  summary: string
  slug: string
  message: string
  changes: GitChange[]
  expect?: Record<string, string | null>
  /** Reuse this draft (already looked up by the caller). */
  draft?: DraftRow | null
  /**
   * Admins: the commit the changes were computed against. The ref move only
   * succeeds if main is still there, so a plan made on an older head can never
   * land on a newer one.
   */
  parent?: string
}): Promise<PublishResult> {
  const paths = opts.changes.map(c => c.path)
  const draft = ctx.role === 'instructor' ? (opts.draft !== undefined ? opts.draft : await findDraft(ctx.user.id, paths)) : null
  const branch = ctx.role === 'admin' ? contentBranch() : (draft?.branch ?? `lesson/${opts.slug}-${shortId()}`)
  // Fresh, not the cached head: a write must build on the branch as it is now.
  const base = (ctx.role === 'admin' && opts.parent) || await branchHead(draft?.branch ?? contentBranch())
  if (!base) throw createError({ statusCode: 409, statusMessage: 'The draft branch is gone on GitHub - reload.' })

  for (const [path, sha] of Object.entries(opts.expect ?? {})) {
    const current = await readFileAt(path, base)
    if ((current?.sha ?? null) !== sha) {
      throw createError({
        statusCode: 409,
        statusMessage: sha
          ? `${path} changed on GitHub since it was loaded - reload it and reapply your edit.`
          : `${path} already exists - pick another title or slug.`
      })
    }
  }

  if (ctx.role === 'instructor' && !draft) await createBranch(branch, base)

  // The tag goes on the subject line, ahead of any body the caller wrote.
  const [subject, ...bodyLines] = opts.message.split('\n')
  const tag = ctx.role === 'admin' ? 'admin studio' : `instructor: ${ctx.personSlug}`
  const message = [`${subject} (${tag})`, ...bodyLines].join('\n')
  const commit = await commitChanges({ branch, parent: base, message, changes: opts.changes })
  // The course tree is cached per commit; a new head means a new key, but drop
  // the head lookup so the next read sees this commit straight away.
  forget('content:head:')

  if (ctx.role === 'admin') {
    return { mode: 'commit', commitSha: commit.sha, commitUrl: commit.url, branch }
  }

  if (draft) {
    const merged = [...new Set([...draft.paths, ...paths])]
    await useDb()`
      update app.lesson_draft
      set paths = ${merged}::text[], status = 'open', updated_at = now()
      where id = ${draft.id}
    `
    return { mode: 'pull', commitSha: commit.sha, commitUrl: commit.url, branch, prNumber: draft.prNumber ?? undefined, prUrl: draft.prUrl ?? undefined }
  }

  const pr = await createPull({
    branch,
    title: `Lesson: ${opts.summary}`,
    body: [
      `Submitted from the instructor studio by **${ctx.user.name || ctx.personSlug}** (\`${ctx.personSlug}\`).`,
      '',
      'Review and publish it in **/admin → Content → Review queue**, or merge it here. Merging to main runs the translate and deploy workflows.',
      '',
      '**Files**',
      ...paths.map(p => `- \`${p}\``)
    ].join('\n')
  })
  await useDb()`
    insert into app.lesson_draft (user_id, branch, pr_number, pr_url, title, paths)
    values (${ctx.user.id}, ${branch}, ${pr.number}, ${pr.html_url}, ${opts.summary}, ${paths}::text[])
  `
  return { mode: 'pull', commitSha: commit.sha, commitUrl: commit.url, branch, prNumber: pr.number, prUrl: pr.html_url }
}

/** Parse + validate a lesson file; 422 listing every problem. */
export function assertLessonFile(raw: string, knownPeople?: Set<string>): Record<string, unknown> {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) {
    throw createError({ statusCode: 422, statusMessage: 'The lesson needs a frontmatter block (--- … ---) at the top.' })
  }
  let data: Record<string, unknown>
  try {
    const parsed = parseYaml(m[1]!)
    data = parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    throw createError({ statusCode: 422, statusMessage: `The frontmatter is not valid YAML: ${String((e as Error).message).split('\n')[0]}` })
  }
  const problems = lessonProblems(data, knownPeople)
  if (problems.length) {
    throw createError({ statusCode: 422, statusMessage: problems.join(' ') })
  }
  return data
}
