// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public routes (no auth required)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/forgot-password',
    '/reset-password',
    '/docs',
    '/pricing',
    '/blog',
    '/changelog'
  ]

  if (publicRoutes.some(path => to.path === path || to.path.startsWith(path))) {
    return
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
