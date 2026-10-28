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

  // A first-party, non-secret hint that this browser has signed in. Pages
  // only ask the Worker for a session when it is present, so anonymous
  // visitors and crawlers never cost a request. The real session cookie is
  // httpOnly; this one carries nothing but "1".
  const hint = useCookie<string | null>('crma_signed_in', { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', path: '/' })

  async function fetchSession() {
    try {
      const res = await $fetch<{ user?: AuthUser }>('/api/auth/get-session')
      user.value = res?.user ?? null
    } catch {
      user.value = null
    }
    hint.value = user.value ? '1' : null
    return user.value
  }

  async function signIn(email: string, password: string, humanToken = '') {
    pending.value = true
    try {
      await $fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: humanToken ? { 'x-human-token': humanToken } : undefined,
        body: { email, password }
      })
      useNuxtApp().$track?.('sign_in')
      return await fetchSession()
    } finally {
      pending.value = false
    }
  }

  async function signUp(email: string, password: string, name: string, humanToken = '') {
    pending.value = true
    try {
      await $fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: humanToken ? { 'x-human-token': humanToken } : undefined,
        body: { email, password, name }
      })
      useNuxtApp().$track?.('sign_up')
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
      hint.value = null
      pending.value = false
    }
  }

  /** The session, but only for a browser that has signed in before. */
  async function restoreSession() {
    if (hint.value) await fetchSession()
  }

  return {
    user,
    pending,
    isSignedIn: computed(() => Boolean(user.value)),
    fetchSession,
    restoreSession,
    signIn,
    signUp,
    signInAsDemo,
    signOut
  }
}
