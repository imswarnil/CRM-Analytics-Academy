/**
 * The learner's completed lessons, shared across the rail, the course bar and
 * the dashboard so they cannot disagree.
 *
 * Completion is optimistic: the tick flips immediately and the request follows.
 * A learner who finishes a lesson and clicks "done" should not wait on a
 * round trip to see it acknowledged, and if the write fails the state is
 * rolled back rather than left lying.
 *
 * Paths are stored locale-stripped, so switching language keeps progress.
 */
export function useProgress() {
  const completed = useState<Set<string>>('progress-completed', () => new Set())
  // Entitlement rides along with progress because /api/progress returns both
  // in one response. Keeping it here rather than refetching on the dashboard
  // is what stops the page from asking a second time for something the rail
  // already loaded — and from briefly disagreeing with it.
  const pro = useState('progress-pro', () => false)
  const points = useState('progress-points', () => 0)
  const rank = useState<number | null>('progress-rank', () => null)
  const contributions = useState('progress-contributions', () => 0)
  const loaded = useState('progress-loaded', () => false)
  const { isSignedIn } = useAuth()
  const { locales } = useI18n()

  function normalise(path: string) {
    const codes = locales.value.map(l => l.code).join('|')
    return path.replace(new RegExp(`^/(${codes})(?=/|$)`), '') || '/'
  }

  async function load() {
    if (!isSignedIn.value) return
    try {
      const res = await $fetch<{
        completed: string[]
        pro: boolean
        points: number
        rank: number | null
        contributions: number
      }>('/api/progress')
      completed.value = new Set(res.completed)
      pro.value = Boolean(res.pro)
      points.value = res.points ?? 0
      rank.value = res.rank ?? null
      contributions.value = res.contributions ?? 0
      loaded.value = true
    } catch {
      // Progress is an enhancement; failing to load it must not break a lesson.
    }
  }

  function isDone(path: string) {
    return completed.value.has(normalise(path))
  }

  async function setDone(path: string, done = true) {
    const key = normalise(path)
    const next = new Set(completed.value)
    // Reassigned rather than mutated — a Set mutated in place does not trip
    // Vue's reactivity, so the tick would not move until something else did.
    if (done) next.add(key)
    else next.delete(key)
    const previous = completed.value
    completed.value = next

    try {
      await $fetch('/api/progress', { method: 'POST', body: { lessonPath: key, done } })
    } catch {
      completed.value = previous
    }
  }

  return { completed, pro, points, rank, contributions, loaded, load, isDone, setDone, normalise }
}
