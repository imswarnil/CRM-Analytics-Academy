/**
 * What the current session is allowed to do.
 *
 * /admin uses this to decide whether to render at all. It is not the security
 * boundary — every admin route re-checks the role server-side — it exists so
 * the page can show "not found" instead of flashing an admin shell and then
 * failing every request inside it.
 */
export default defineEventHandler(async (event) => {
  const resolved = await getRole(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  if (!resolved) return { signedIn: false, role: null }
  return { signedIn: true, role: resolved.role, email: resolved.user.email }
})
