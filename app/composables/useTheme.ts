/**
 * Theme toggle.
 *
 * Rolled by hand rather than pulled from @nuxtjs/color-mode, which arrived as a
 * transitive dependency of Nuxt UI and leaves with it. The whole contract is a
 * `data-theme` attribute on <html>, which is exactly what the token layer in
 * app/assets/styles/_tokens.scss keys its dark palette off, so there is nothing
 * else to wire up.
 *
 * `system` is a real, persisted third state, not the absence of a choice: a
 * reader who has never touched the toggle follows their OS, and one who picked
 * light at noon does not get flipped to dark when their laptop does.
 */
export type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'crma-theme'

export function useTheme() {
  const choice = useState<ThemeChoice>('theme-choice', () => 'system')

  function resolve(value: ThemeChoice): 'light' | 'dark' {
    if (value !== 'system') return value
    if (!import.meta.client) return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function apply(value: ThemeChoice) {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = resolve(value)
  }

  function set(value: ThemeChoice) {
    choice.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value)
      apply(value)
    }
  }

  /** light -> dark -> system -> light. */
  function cycle() {
    set(choice.value === 'light' ? 'dark' : choice.value === 'dark' ? 'system' : 'light')
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null
    choice.value = stored ?? 'system'
    apply(choice.value)

    // Only meaningful while the choice is `system`; a fixed choice ignores it.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => choice.value === 'system' && apply('system')
    mq.addEventListener('change', onChange)
    onScopeDispose(() => mq.removeEventListener('change', onChange))
  })

  const resolved = computed(() => resolve(choice.value))

  return { choice, resolved, set, cycle }
}
