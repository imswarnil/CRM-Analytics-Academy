/**
 * Interview upvotes, shared by the list and the open question, and kept in
 * localStorage for half an hour: opening questions never costs a Worker
 * request, and the list asks GET /api/interview/votes at most twice an hour
 * per browser (once signed out, once signed in). A vote updates the cache.
 */
const TTL = 30 * 60_000

export function useInterviewVotes() {
  const counts = useState<Record<string, number>>('iq-votes', () => ({}))
  const mine = useState<string[]>('iq-mine', () => [])
  const loading = useState('iq-votes-loading', () => false)
  const { isSignedIn } = useAuth()
  const key = () => `crma-iq-votes-${isSignedIn.value ? 'u' : 'a'}`
  const save = () => {
    try {
      localStorage.setItem(key(), JSON.stringify({ at: Date.now(), counts: counts.value, mine: mine.value }))
    } catch { /* storage blocked */ }
  }

  async function load() {
    if (import.meta.server || loading.value) return
    try {
      const c = JSON.parse(localStorage.getItem(key()) ?? 'null') as { at: number, counts: Record<string, number>, mine: string[] } | null
      if (c && Date.now() - c.at < TTL) {
        counts.value = c.counts
        mine.value = c.mine
        return
      }
    } catch { /* storage blocked or bad JSON */ }
    loading.value = true
    const res = await $fetch<{ counts: Record<string, number>, mine: string[] }>('/api/interview/votes').catch(() => null)
    loading.value = false
    if (!res) return
    counts.value = res.counts
    mine.value = res.mine
    save()
  }

  function set(slug: string, voted: boolean, n: number) {
    counts.value = { ...counts.value, [slug]: n }
    mine.value = voted ? [...new Set([...mine.value, slug])] : mine.value.filter(s => s !== slug)
    save()
  }

  return { counts, mine, load, set }
}
