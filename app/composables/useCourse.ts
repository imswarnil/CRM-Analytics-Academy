import type { ContentNavigationItem } from '@nuxt/content'

/**
 * Turns the content navigation tree into a flat, ordered course.
 *
 * The docs tree is a nesting of modules and lessons; a course player needs a
 * single sequence — "lesson 14 of 49", previous, next, and which module you are
 * inside. Deriving that here rather than in each component means the sidebar,
 * the progress bar and the prev/next controls can never disagree about where
 * the learner is.
 */
export interface CourseLesson {
  path: string
  title: string
  moduleTitle: string
  moduleIndex: number
  indexInModule: number
  lessonsInModule: number
}

export function useCourse() {
  const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
  const route = useRoute()
  const localePath = useLocalePath()

  const lessons = computed<CourseLesson[]>(() => {
    const out: CourseLesson[] = []
    const modules = navigation.value ?? []

    modules.forEach((mod, moduleIndex) => {
      const children = (mod.children ?? []) as ContentNavigationItem[]
      // A module page with no children is itself a lesson.
      const items = children.length ? children : [mod]
      items.forEach((lesson, indexInModule) => {
        if (!lesson.path) return
        out.push({
          path: lesson.path,
          title: String(lesson.title ?? ''),
          moduleTitle: String(mod.title ?? ''),
          moduleIndex,
          indexInModule,
          lessonsInModule: items.length
        })
      })
    })

    return out
  })

  const currentIndex = computed(() =>
    lessons.value.findIndex(l => localePath(l.path) === route.path || l.path === route.path)
  )

  const current = computed(() => (currentIndex.value >= 0 ? lessons.value[currentIndex.value] : undefined))
  const previous = computed(() => (currentIndex.value > 0 ? lessons.value[currentIndex.value - 1] : undefined))
  const next = computed(() =>
    currentIndex.value >= 0 && currentIndex.value < lessons.value.length - 1
      ? lessons.value[currentIndex.value + 1]
      : undefined
  )

  const total = computed(() => lessons.value.length)
  const position = computed(() => (currentIndex.value >= 0 ? currentIndex.value + 1 : 0))
  const percent = computed(() => (total.value ? (position.value / total.value) * 100 : 0))

  return { lessons, current, previous, next, total, position, percent, currentIndex }
}
