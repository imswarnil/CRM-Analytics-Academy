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
    if (!user.value) {
      profile.value = null
      loadedFor.value = null
      return
    }
    pending.value = true
    let { data } = await client
      .from('profiles')
      .select(SELECT)
      .eq('id', user.value.id)
      .maybeSingle()

    // Self-heal: if the profile row is missing (e.g. the user signed up before
    // the DB trigger existed), create it now. Comments/resources/projects FK to
    // profiles, so this is what makes those features work after login.
    if (!data) {
      const meta = (user.value.user_metadata ?? {}) as Record<string, string>
      await client.from('profiles').upsert({
        id: user.value.id,
        full_name: meta.full_name || meta.name || null,
        avatar_url: meta.avatar_url || meta.picture || null
      }, { onConflict: 'id' })
      const retry = await client
        .from('profiles')
        .select(SELECT)
        .eq('id', user.value.id)
        .maybeSingle()
      data = retry.data
    }

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
