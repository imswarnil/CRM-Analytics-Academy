<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

/**
 * The player's course contents: every section with its number, lesson count,
 * minutes and a mini donut, and under the open section every lesson with a
 * 3px active bar and a length bar proportional to its minutes.
 *
 * Collapsed, it becomes a 60px rail of section donuts and a vertical
 * "CONTENTS · N%" label — enough to see where you are without the list.
 */
const props = withDefaults(defineProps<{ collapsed?: boolean, collapsible?: boolean }>(), { collapsed: false, collapsible: true })
const emit = defineEmits<{ toggle: [], navigate: [] }>()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const route = useRoute()
const localePath = useLocalePath()
const { isDone, pro, normalise } = useProgress()
const { of: metaOf } = useLessonMeta()
const { total } = useCourse()

const here = computed(() => normalise(route.path))

const sections = computed(() =>
  (navigation.value ?? []).map((mod, index) => {
    const lessons = ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map(l => ({ title: String(l.title ?? ''), path: String(l.path), ...metaOf(String(l.path)) }))
    const done = lessons.filter(l => isDone(l.path)).length
    return {
      n: String(index).padStart(2, '0'),
      title: String(mod.title ?? ''),
      path: String(mod.path ?? ''),
      lessons,
      done,
      minutes: lessons.reduce((s, l) => s + l.minutes, 0),
      active: lessons.some(l => normalise(l.path) === here.value) || normalise(String(mod.path ?? '')) === here.value
    }
  })
)

// Sections the reader opened by hand, on top of the one they are in.
const open = ref(new Set<string>())
const isOpen = (s: { path: string, active: boolean }) => s.active || open.value.has(s.path)
function toggleSection(path: string) {
  const next = new Set(open.value)
  if (next.has(path)) next.delete(path)
  else next.add(path)
  open.value = next
}

const maxMin = computed(() => Math.max(1, ...sections.value.flatMap(s => s.lessons.map(l => l.minutes))))
const doneAll = computed(() => sections.value.reduce((n, s) => n + s.done, 0))
const pct = computed(() => (total.value ? Math.round((doneAll.value / total.value) * 100) : 0))

const isHere = (p: string) => normalise(p) === here.value
function lessonIcon(l: { path: string, type: string, access: string }) {
  if (isDone(l.path)) return 'i-lucide-check'
  if (l.access === 'pro' && !pro.value) return 'i-lucide-lock'
  return l.type === 'video' ? 'i-lucide-play' : 'i-lucide-file-text'
}

// Keep the current lesson in view when the page changes.
const list = ref<HTMLElement | null>(null)
watch(() => route.path, () => nextTick(() => {
  list.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
}), { immediate: false })
onMounted(() => list.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'center' }))
</script>

<template>
  <!-- Collapsed rail -->
  <div
    v-if="props.collapsed"
    class="graph-paper-fine flex min-h-full flex-col items-center gap-3 py-4"
  >
    <UButton
      icon="i-lucide-panel-right-open"
      color="neutral"
      variant="ghost"
      square
      aria-label="Show course contents"
      @click="emit('toggle')"
    />
    <NuxtLink
      v-for="s in sections"
      :key="s.path"
      :to="localePath(s.lessons[0]?.path ?? s.path)"
      :title="`${s.n} — ${s.title}`"
    >
      <BpDonut
        :value="s.lessons.length ? s.done / s.lessons.length : 0"
        :active="s.active"
        :size="28"
      />
    </NuxtLink>
    <span class="mt-2 font-mono text-[10px] uppercase tracking-[.15em] text-(--ink2) [writing-mode:vertical-rl]">Contents · {{ pct }}%</span>
  </div>

  <!-- Full list -->
  <div
    v-else
    ref="list"
    class="graph-paper-fine min-h-full"
  >
    <div class="sticky top-0 z-10 border-b-[1.5px] border-(--ink) bg-(--paper) px-4 py-3">
      <div class="flex items-center justify-between gap-2">
        <p class="eyebrow">
          Course contents
        </p>
        <UButton
          v-if="collapsible"
          icon="i-lucide-panel-right-close"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          aria-label="Collapse course contents"
          @click="emit('toggle')"
        />
      </div>
      <div class="mt-2 flex items-center gap-3">
        <div class="h-2.5 flex-1 border-[1.5px] border-(--ink) bg-(--card)">
          <div
            class="hatch-signal h-full"
            :style="{ width: `${pct}%` }"
          />
        </div>
        <span class="font-mono text-[10px] text-(--ink2)">{{ doneAll }}/{{ total }}</span>
      </div>
    </div>

    <ol>
      <li
        v-for="s in sections"
        :key="s.path"
        class="border-b border-(--line)"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-(--ice)/60"
          :class="s.active ? 'bg-(--ice)' : ''"
          :aria-expanded="isOpen(s)"
          @click="toggleSection(s.path)"
        >
          <span class="w-7 font-mono text-xs font-semibold text-(--signal)">{{ s.n }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-(--ink)">{{ s.title }}</span>
            <span class="font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">{{ s.lessons.length }} lessons · {{ s.minutes }}m</span>
          </span>
          <BpDonut
            :value="s.lessons.length ? s.done / s.lessons.length : 0"
            :size="24"
          />
        </button>

        <ol
          v-if="isOpen(s)"
          class="pb-2"
        >
          <li
            v-for="l in s.lessons"
            :key="l.path"
          >
            <NuxtLink
              :to="localePath(l.path)"
              :aria-current="isHere(l.path) ? 'page' : undefined"
              class="relative flex items-center gap-2.5 py-2 pe-4 ps-11 text-[13px] hover:bg-(--ice)/60"
              :class="isHere(l.path) ? 'bg-(--card) font-bold text-(--signal)' : 'text-(--ink)'"
              @click="emit('navigate')"
            >
              <span
                v-if="isHere(l.path)"
                class="absolute inset-y-0 start-0 w-[3px] bg-(--signal)"
              />
              <UIcon
                :name="lessonIcon(l)"
                class="size-3.5 flex-none"
                :class="isDone(l.path) ? 'text-(--signal)' : 'text-(--ink2)'"
              />
              <span class="min-w-0 flex-1 truncate">{{ l.title }}</span>
              <span class="flex w-8 justify-end">
                <span
                  class="h-1.5"
                  :class="l.type === 'video' ? 'bg-(--signal)' : 'bg-(--frost)'"
                  :style="{ width: `${Math.max(12, (l.minutes / maxMin) * 100)}%` }"
                />
              </span>
              <span class="w-7 text-end font-mono text-[10px] text-(--ink2)">{{ l.minutes }}m</span>
            </NuxtLink>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</template>
