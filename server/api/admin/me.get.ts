/**
 * Whether the current session is the admin.
 *
 * /admin uses this to decide whether to render at all. It is not the security
 * boundary — every admin route re-checks server-side — it lets the page show
 * "not found" instead of flashing an admin shell.
 */
export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { signedIn: !!user, admin: isAdmin(user), email: user?.email ?? null }
})
