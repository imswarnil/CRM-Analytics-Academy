export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

/**
 * Session state and the four actions that change it.
 *
 * Everything goes through /api/auth/* on this origin rather than to the Neon
 * Auth host directly — see server/api/auth/[...all].ts for why. The practical
 * consequence here is that no auth URL, key or credential appears in client
 * code at all; this composable only knows about same-origin paths.
 *
 * `user` is useState so the session survives navigation and is shared by the
 * header, the player and the account page without each refetching it.
 */
export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const pending = useState('auth-pending', () => false)

  async function fetchSession() {
    try {
      const res = await $fetch<{ user?: AuthUser }>('/api/auth/get-session')
      user.value = res?.user ?? null
    } catch {
      user.value = null
    }
    return user.value
  }

  async function signIn(email: string, password: string) {
    pending.value = true
    try {
      await $fetch('/api/auth/sign-in/email', {
        method: 'POST',
        body: { email, password }
      })
      return await fetchSession()
    } finally {
      pending.value = false
    }
  }

  async function signUp(email: string, password: string, name: string) {
    pending.value = true
    try {
      await $fetch('/api/auth/sign-up/email', {
        method: 'POST',
        body: { email, password, name }
      })
      return await fetchSession()
    } finally {
      pending.value = false
    }
  }

  /** Signs into the shared demo account. No credentials cross the wire. */
  async function signInAsDemo() {
    pending.value = true
    try {
      await $fetch('/api/auth/demo', { method: 'POST' })
      return await fetchSession()
    } finally {
      pending.value = false
    }
  }

  async function signOut() {
    pending.value = true
    try {
      await $fetch('/api/auth/sign-out', { method: 'POST' })
    } catch {
      // A failed sign-out still has to clear the local session — leaving the
      // UI signed in after the user asked to leave is the worse failure.
    } finally {
      user.value = null
      pending.value = false
    }
  }

  return {
    user,
    pending,
    isSignedIn: computed(() => Boolean(user.value)),
    fetchSession,
    signIn,
    signUp,
    signInAsDemo,
    signOut
  }
}
