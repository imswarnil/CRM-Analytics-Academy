/**
 * The course as main holds it — sections (title, icon from .navigation.yml)
 * and their lessons (title, access, authors) — plus the people registry, for
 * the content editor's tree and its author picker.
 *
 * One GraphQL request per commit (cached), so the tree reflects a commit made
 * a minute ago even though the site has not redeployed yet.
 *
 * An instructor also gets their drafts, and `personSlug` — which lessons they
 * may edit is "authors includes personSlug". An instructor whose account is not
 * linked to a person yet still gets the tree, with `linkError` saying why
 * every edit button is off.
 */
export default defineEventHandler(async (event) => {
  const { user, role } = await requireEditor(event)

  let personSlug: string | null = null
  let linkError: string | null = null
  if (role === 'instructor') {
    try {
      personSlug = (await editorContext(event)).personSlug
    } catch (e) {
      linkError = (e as { statusMessage?: string }).statusMessage || 'Your account is not linked to a person yet.'
    }
  }

  let course: Course
  try {
    course = await readCourse()
  } catch (e) {
    if (isError(e)) throw e
    githubError(e, 'Read course')
  }

  setResponseHeader(event, 'cache-control', 'private, no-store')
  return {
    role,
    personSlug,
    linkError,
    repo: contentRepo(),
    branch: contentBranch(),
    ...course,
    drafts: role === 'instructor' ? await draftsOf(user.id) : []
  }
})
