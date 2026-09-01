<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The curriculum pane, drawn exactly as design page 02 draws it:
 *
 * - a progress header — "PROGRESS" in the display face, the count in blue,
 *   the bar under them;
 * - one block per section, headed by its coloured icon tile, its title and
 *   its done-count, collapsible on the chevron;
 * - inside an open section, one row per lesson: a green check square once
 *   finished, the solid blue row with a white play square for where you
 *   are, a numbered outline square for everything still ahead.
 *
 * The section holding the current lesson opens itself; the rest start
 * collapsed, the way the design shows them.
 */
const props = defineProps<{
  items: ContentNavigationItem[]
}>()

const route = useRoute()
const localePath = useLocalePath()
const { isDone } = useProgress()
const { position, total, percent } = useCourse()
const { t } = useI18n()

// The design system's section accents and icons, in curriculum order —
// the same sequence the homepage cards use.
const accents = [
  { tile: 'bg-brand-yellow text-ink', icon: 'i-lucide-compass' },
  { tile: 'bg-brand-pink text-white', icon: 'i-lucide-settings-2' },
  { tile: 'bg-primary text-white', icon: 'i-lucide-database' },
  { tile: 'bg-brand-green text-ink', icon: 'i-lucide-search' },
  { tile: 'bg-brand-purple text-white', icon: 'i-lucide-layout-dashboard' },
  { tile: 'bg-brand-sky text-ink', icon: 'i-lucide-users' }
]

function isCurrent(path?: string) {
  if (!path) return false
  return route.path === localePath(path) || route.path === path
}

/** Modules flattened with lessons numbered across the course. */
const sections = computed(() => {
  let n = 0
  return props.items.map((mod, i) => {
    const children = (mod.children ?? []) as ContentNavigationItem[]
    const lessons = (children.length ? children : [mod]).map(lesson => ({
      path: lesson.path as string,
      title: String(lesson.title ?? ''),
      index: ++n
    }))
    return {
      key: String(mod.path ?? i),
      title: String(mod.title ?? ''),
      accent: accents[i % accents.length]!,
      lessons,
      done: lessons.filter(l => isDone(l.path)).length,
      total: lessons.length,
      hasCurrent: lessons.some(l => isCurrent(l.path))
    }
  })
})

/* Collapse state. The current section opens itself; a chevron click is an
   explicit choice that then wins over the automatic behaviour. */
const toggled = ref<Record<string, boolean>>({})
function isOpen(s: { key: string, hasCurrent: boolean }) {
  return toggled.value[s.key] ?? s.hasCurrent
}
function toggle(s: { key: string, hasCurrent: boolean }) {
  toggled.value[s.key] = !isOpen(s)
}
watch(() => route.path, () => {
  // A new lesson can live in a new section: clear explicit choices so the
  // pane follows the learner again.
  toggled.value = {}
})

const current = ref<HTMLElement | null>(null)
onMounted(() => {
  current.value?.scrollIntoView({ block: 'center' })
})
</script>

<template>
  <div>
    <!-- Progress header -->
    <div class="border-b border-default px-4 py-3.5">
      <div class="mb-1.5 flex items-baseline justify-between">
        <span class="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted">
          {{ t('course.curriculum') }}
        </span>
        <span class="tabular font-display text-[0.8125rem] font-bold text-primary">{{ position }}/{{ total }}</span>
      </div>
      <UProgress
        :model-value="percent"
        :max="100"
        size="sm"
        :aria-label="t('course.courseProgress')"
      />
    </div>

    <nav :aria-label="t('course.curriculum')">
      <div
        v-for="s in sections"
        :key="s.key"
        class="border-b border-default"
      >
        <!-- Section header: coloured tile, title, done-count, chevron. -->
        <button
          type="button"
          class="flex w-full items-center gap-2.5 px-4 py-3 text-start"
          :aria-expanded="isOpen(s)"
          @click="toggle(s)"
        >
          <span
            class="nb-tile size-8 border-2"
            :class="s.accent.tile"
          >
            <UIcon
              :name="s.accent.icon"
              class="size-4"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span class="font-display block truncate text-[0.8125rem] font-bold text-highlighted">{{ s.title }}</span>
            <span class="block text-[0.625rem] text-muted">{{ t('course.moduleProgress', { done: s.done, total: s.total }) }}</span>
          </span>
          <UIcon
            :name="isOpen(s) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-3.5 shrink-0 text-muted"
          />
        </button>

        <div
          v-show="isOpen(s)"
          class="px-2.5 pb-2.5"
        >
          <NuxtLink
            v-for="lesson in s.lessons"
            :key="lesson.path"
            :ref="(el) => { if (isCurrent(lesson.path)) current = (el as { $el?: HTMLElement })?.$el ?? (el as HTMLElement | null) }"
            :to="localePath(lesson.path)"
            :aria-current="isCurrent(lesson.path) ? 'page' : undefined"
            class="flex items-center gap-2 rounded px-2.5 py-1.5 text-xs transition-colors"
            :class="isCurrent(lesson.path)
              ? 'bg-primary font-bold text-white'
              : isDone(lesson.path)
                ? 'font-medium text-emerald-600 hover:bg-elevated dark:text-brand-green'
                : 'font-medium text-muted hover:bg-elevated hover:text-highlighted'"
          >
            <!-- Green check once finished, white play square for where you
                 are, the lesson's number until then. -->
            <span
              v-if="isDone(lesson.path)"
              class="flex size-[1.125rem] shrink-0 items-center justify-center rounded border-2 border-(--nb-ink) bg-brand-green"
            >
              <UIcon
                name="i-lucide-check"
                class="size-2.5 text-white"
              />
            </span>
            <span
              v-else-if="isCurrent(lesson.path)"
              class="flex size-[1.125rem] shrink-0 items-center justify-center rounded bg-white"
            >
              <UIcon
                name="i-lucide-play"
                class="size-2.5 text-primary"
              />
            </span>
            <span
              v-else
              class="tabular flex size-[1.125rem] shrink-0 items-center justify-center rounded border-[1.5px] border-default text-[0.5625rem] font-bold text-muted"
            >{{ lesson.index }}</span>

            <span class="min-w-0 flex-1 truncate">{{ lesson.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <SponsorCard class="mx-3 my-4" />
  </div>
</template>
