// Route middleware for members-only pages. Opt in per page with:
//   definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  if (user.value) return

  const localePath = useLocalePath()
  return navigateTo({
    path: localePath('/login'),
    query: { redirect: to.fullPath }
  })
})
