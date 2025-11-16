// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Public routes. Everything else will require authentication.
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

  // Allow nested paths like /docs/getting-started
  if (publicRoutes.some(path => to.path === path || to.path.startsWith(path))) {
    return
  }

  // If user not logged in → send to login
  if (!user.value) {
    return navigateTo('/login')
  }
})