export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'member' | 'admin'
}

/**
 * Current user's profile row (created automatically on signup by a DB trigger).
 * Shared across components via useState; refetched when the auth user changes.
 */
export function useProfile() {
  const user = useSupabaseUser()
  const client = useDb()

  const profile = useState<Profile | null>('crma-profile', () => null)
  const pending = useState<boolean>('crma-profile-pending', () => false)
  const loadedFor = useState<string | null>('crma-profile-loaded-for', () => null)

  const SELECT = 'id, username, full_name, avatar_url, bio, role'

  async function refresh() {
    // useSupabaseUser() returns JWT claims — the user id is `sub`, not `id`.
    const uid = user.value?.sub
    if (!uid) {
      profile.value = null
      loadedFor.value = null
      return
    }
    pending.value = true
    // profiles are publicly readable, so this works even if the browser client
    // is unauthenticated.
    const { data } = await client
      .from('profiles')
      .select(SELECT)
      .eq('id', uid)
      .maybeSingle()

    profile.value = (data as Profile) ?? null
    loadedFor.value = uid
    pending.value = false
  }

  const userId = computed(() => user.value?.sub ?? null)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  const displayName = computed(() =>
    profile.value?.full_name
    || profile.value?.username
    || (user.value?.email as string | undefined)?.split('@')[0]
    || 'Member'
  )

  // Fetch once per signed-in user (client-only).
  if (import.meta.client) {
    watch(user, () => {
      const uid = user.value?.sub
      if (uid && loadedFor.value !== uid) refresh()
      else if (!uid) refresh()
    }, { immediate: true })
  }

  return { user, userId, profile, isAdmin, displayName, pending, refresh }
}
