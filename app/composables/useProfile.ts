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

  async function refresh() {
    if (!user.value) {
      profile.value = null
      loadedFor.value = null
      return
    }
    pending.value = true
    const { data } = await client
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, role')
      .eq('id', user.value.id)
      .single()
    profile.value = (data as Profile) ?? null
    loadedFor.value = user.value.id
    pending.value = false
  }

  const isAdmin = computed(() => profile.value?.role === 'admin')

  const displayName = computed(() =>
    profile.value?.full_name
    || profile.value?.username
    || user.value?.email?.split('@')[0]
    || 'Member'
  )

  // Fetch once per signed-in user (client-only; RLS needs the user's token).
  if (import.meta.client) {
    watch(user, () => {
      if (user.value && loadedFor.value !== user.value.id) refresh()
      else if (!user.value) refresh()
    }, { immediate: true })
  }

  return { user, profile, isAdmin, displayName, pending, refresh }
}
