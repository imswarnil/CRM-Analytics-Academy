// The current user's completed lesson keys (locale-independent, e.g. /saql).
// Shared app-wide so the sidebar can tick completed lessons.
export function useCompletedLessons() {
  const user = useSupabaseUser()
  const completed = useState<string[]>('crma-completed-lessons', () => [])

  async function refresh() {
    if (!user.value) {
      completed.value = []
      return
    }
    try {
      const { paths } = await $fetch<{ paths: string[] }>('/api/progress')
      completed.value = paths
    } catch {
      // ignore — sidebar just won't show ticks
    }
  }

  if (import.meta.client) {
    watch(user, refresh, { immediate: true })
  }

  return { completed, refresh }
}
