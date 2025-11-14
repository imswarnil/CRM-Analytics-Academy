// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // public routes
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/docs']

  if (publicRoutes.some(path => to.path === path || to.path.startsWith(path))) {
    return
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
