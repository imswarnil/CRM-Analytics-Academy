// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public routes that do NOT require auth
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

  // Allow nested routes like /docs/getting-started
  if (publicRoutes.some(path => to.path === path || to.path.startsWith(path))) {
    return
  }

  // If there is no user, send them to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
