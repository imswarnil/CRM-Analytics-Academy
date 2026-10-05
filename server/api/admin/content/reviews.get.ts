/**
 * The review queue.
 *
 *   admin       → every open pull request from a `lesson/*` branch, with the
 *                 instructor who sent it and a per-file diff summary.
 *   instructor  → their own drafts and where each one stands (open, changes
 *                 requested with the admin's note, published, closed).
 *
 * GitHub is the source of truth for what is open; app.lesson_draft only says
 * whose branch is whose.
 */
const PATCH_LIMIT = 6000

export default defineEventHandler(async (event) => {
  const { user, role } = await requireEditor(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')

  if (role === 'instructor') {
    return { role, drafts: await draftsOf(user.id), pulls: [] }
  }

  const pulls = (await openPulls()).filter(p => p.head.ref.startsWith('lesson/'))
  const drafts = await draftsByBranch(pulls.map(p => p.head.ref))
  const detailed = await Promise.all(pulls.map(async (p) => {
    const files = await pullFiles(p.number)
    const d = drafts.get(p.head.ref)
    return {
      number: p.number,
      url: p.html_url,
      title: p.title,
      branch: p.head.ref,
      headSha: p.head.sha,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      instructor: d ? { name: d.userName, email: d.userEmail } : null,
      status: d?.status ?? 'open',
      reviewNote: d?.reviewNote ?? null,
      // Anything outside content/ did not come from the editor; Publish
      // refuses it, so say so up front.
      outsideContent: files.some(f => !f.filename.startsWith('content/')),
      files: files.map(f => ({
        filename: f.filename,
        previous: f.previous_filename ?? null,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch ? (f.patch.length > PATCH_LIMIT ? `${f.patch.slice(0, PATCH_LIMIT)}\n… (truncated - open on GitHub for the rest)` : f.patch) : null
      }))
    }
  }))

  return { role, drafts: [], pulls: detailed }
})
