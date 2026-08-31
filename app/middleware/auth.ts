/**
 * Client-side guard for personal routes.
 *
 * This is convenience, not security: it decides what the browser bothers
 * rendering. Every route that returns real data enforces the session again on
 * the server, because anything decided in the client can be skipped by not
 * running the client.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Nothing to guard during prerender — these routes are excluded from it.
  if (import.meta.server) return

  const { user, fetchSession } = useAuth()
  if (!user.value) await fetchSession()

  if (!user.value) {
    const localePath = useLocalePath()
    return navigateTo({
      path: localePath('/sign-in'),
      query: { redirect: to.fullPath }
    })
  }
})
