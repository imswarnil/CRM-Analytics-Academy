export interface ProgressData {
  completed: string[]
  completedAt: Record<string, string>
  bookmarks: string[]
  quizzes: { path: string, best: number, total: number, attempts: number }[]
  days: { day: string, count: number }[]
  streak: number
  longestStreak: number
  admin: boolean
  demo: boolean
  points: number
  contributions: number
  rank: number | null
  ranked: number
  leaders: { me: boolean, name: string, image: string | null, points: number, lessons: number }[]
}

/**
 * The learner's progress, shared across the rail, the course bar, the lesson
 * page and the dashboard so they cannot disagree. One request (/api/progress)
 * fills all of it.
 *
 * Completion and bookmarks are optimistic: the tick flips immediately and the
 * request follows; if the write fails the state is rolled back.
 *
 * Paths are stored locale-stripped, so switching language keeps progress.
 */
export function useProgress() {
  const completed = useState<Set<string>>('progress-completed', () => new Set())
  const bookmarks = useState<Set<string>>('progress-bookmarks', () => new Set())
  const data = useState<ProgressData | null>('progress-data', () => null)
  const loaded = useState('progress-loaded', () => false)
  const { isSignedIn } = useAuth()
  const { locales } = useI18n()

  const admin = computed(() => Boolean(data.value?.admin))
  const demo = computed(() => Boolean(data.value?.demo))
  const points = computed(() => data.value?.points ?? 0)
  const rank = computed(() => data.value?.rank ?? null)

  function normalise(path: string) {
    const codes = locales.value.map(l => l.code).join('|')
    return path.replace(new RegExp(`^/(${codes})(?=/|$)`), '') || '/'
  }

  async function load() {
    if (!isSignedIn.value) return
    try {
      const res = await $fetch<ProgressData>('/api/progress')
      data.value = res
      completed.value = new Set(res.completed)
      bookmarks.value = new Set(res.bookmarks)
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
    // Vue's reactivity.
    if (done) next.add(key)
    else next.delete(key)
    const previous = completed.value
    completed.value = next
    try {
      await $fetch('/api/progress', { method: 'POST', body: { lessonPath: key, done } })
      if (done) useNuxtApp().$track?.('lesson_complete', key)
    } catch {
      completed.value = previous
    }
  }

  function isSaved(path: string) {
    return bookmarks.value.has(normalise(path))
  }

  async function setSaved(path: string, saved = true) {
    const key = normalise(path)
    const next = new Set(bookmarks.value)
    if (saved) next.add(key)
    else next.delete(key)
    const previous = bookmarks.value
    bookmarks.value = next
    try {
      await $fetch('/api/bookmarks', { method: 'POST', body: { path: key, saved } })
      if (saved) useNuxtApp().$track?.('bookmark', key)
    } catch {
      bookmarks.value = previous
    }
  }

  return { completed, bookmarks, data, admin, demo, points, rank, loaded, load, isDone, setDone, isSaved, setSaved, normalise }
}
