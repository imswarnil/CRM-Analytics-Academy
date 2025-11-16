// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public pages – everything else will require auth
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/docs',
    '/pricing',
    '/blog',
    '/changelog'
  ]

  // Allow nested docs etc.
  if (publicRoutes.some(path => to.path === path || to.path.startsWith(path))) {
    return
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
