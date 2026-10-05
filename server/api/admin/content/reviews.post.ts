/**
 * Act on an instructor's pull request. Admins only.
 *
 *   { number, action: 'publish', headSha }   squash-merge into main (the
 *       translate and deploy workflows run on that push) and delete the branch.
 *       headSha pins what the admin reviewed: if the instructor saved again
 *       since, GitHub refuses and the queue reloads.
 *   { number, action: 'request-changes', note }   comment on the pull request
 *       and mark the draft, so the instructor sees the note in their studio.
 *       Their next save reopens it for review.
 *   { number, action: 'close', note? }   close without publishing.
 *
 * A "Request changes" review is not used: every pull request here is opened
 * by the same token, and GitHub refuses a review on one's own pull request.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{ number?: unknown, action?: unknown, headSha?: unknown, note?: unknown }>(event)
  const number = Number(body?.number)
  if (!Number.isInteger(number) || number <= 0) throw createError({ statusCode: 400, statusMessage: 'Which pull request?' })
  const action = body?.action
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 4000) : ''

  const pr = await getPull(number)
  if (!pr || pr.state !== 'open' || !pr.head.ref.startsWith('lesson/')) {
    throw createError({ statusCode: 404, statusMessage: 'That pull request is not in the review queue any more.' })
  }

  const sql = useDb()
  const markDraft = async (status: string, reviewNote: string | null) => {
    try {
      await sql`
        update app.lesson_draft
        set status = ${status}, review_note = ${reviewNote}, reviewed_by = ${admin.id}, updated_at = now()
        where branch = ${pr.head.ref}
      `
    } catch {
      // No draft row (opened outside the studio, or 012 not applied): the
      // GitHub side of the action is what matters.
    }
  }

  setResponseHeader(event, 'cache-control', 'no-store')

  if (action === 'publish') {
    if (typeof body?.headSha !== 'string' || body.headSha !== pr.head.sha) {
      throw createError({ statusCode: 409, statusMessage: 'The instructor saved again since this loaded - reload the queue and review the latest version.' })
    }
    const files = await pullFiles(number)
    if (files.some(f => !f.filename.startsWith('content/'))) {
      throw createError({ statusCode: 422, statusMessage: 'This pull request touches files outside content/ - review and merge it on GitHub instead.' })
    }
    const merged = await mergePull(number, pr.head.sha, `content: ${pr.title.replace(/^Lesson:\s*/, '')} (#${number})`)
    await deleteBranch(pr.head.ref)
    await markDraft('published', null)
    forget('content:head:')
    return { ok: true, commitSha: merged.sha }
  }

  if (action === 'request-changes') {
    if (!note) throw createError({ statusCode: 400, statusMessage: 'Say what needs to change.' })
    await commentOnPull(number, `**Changes requested** from the admin studio:\n\n${note}`)
    await markDraft('changes_requested', note)
    return { ok: true }
  }

  if (action === 'close') {
    if (note) await commentOnPull(number, `Closed from the admin studio:\n\n${note}`)
    try {
      await gh(`/pulls/${number}`, { method: 'PATCH', body: { state: 'closed' } })
    } catch (e) {
      githubError(e, 'Close pull request')
    }
    await deleteBranch(pr.head.ref)
    await markDraft('closed', note || null)
    return { ok: true }
  }

  throw createError({ statusCode: 400, statusMessage: 'Unknown action.' })
})
