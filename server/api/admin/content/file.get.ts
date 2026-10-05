/**
 * One content file, decoded, plus the blob sha the editor must send back on
 * save — the sha is the optimistic lock, so a stale editor gets a 409 instead
 * of silently overwriting someone else's commit.
 *
 * Lessons (content/en/**.md) for admins and instructors; people entries
 * (content/people/<slug>.yml) for admins. An instructor with an open draft of
 * the lesson reads it from the draft's branch — that is the copy their next
 * save will land on — and `canEdit` says whether they may change it at all.
 */
export default defineEventHandler(async (event) => {
  const { user, role } = await requireEditor(event)
  const raw = getQuery(event).path
  const isPerson = typeof raw === 'string' && raw.startsWith('content/people/')
  if (isPerson && role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only admins edit the people registry.' })
  }
  const path = isPerson ? assertPersonPath(raw) : assertLessonPath(raw)

  let draft: DraftRow | null = null
  let canEdit = role === 'admin'
  let reason: string | null = null
  if (role === 'instructor') {
    try {
      const ctx = await editorContext(event)
      draft = await findDraft(user.id, [path])
      await assertMayEdit(ctx, path, draft)
      canEdit = true
    } catch (e) {
      const err = e as { statusCode?: number, statusMessage?: string }
      if (err.statusCode !== 403) throw e
      reason = err.statusMessage ?? 'You cannot edit this lesson.'
    }
  }

  const ref = draft?.branch ?? contentBranch()
  const file = await readFileAt(path, ref)
  if (!file) throw createError({ statusCode: 404, statusMessage: 'File not found in the repo.' })

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    path,
    sha: file.sha,
    content: file.content,
    ref,
    canEdit,
    reason,
    draft: draft
      ? { branch: draft.branch, prNumber: draft.prNumber, prUrl: draft.prUrl, status: draft.status, reviewNote: draft.reviewNote }
      : null
  }
})
