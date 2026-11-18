<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { ROADMAP } from '~/data/roadmap'

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
const { isDone, normalise, pro: hasPro } = useProgress()
const { of: metaOf } = useLessonMeta()
const { total } = useCourse()
const { t } = useI18n()

const here = computed(() => normalise(route.path))

const sections = computed(() =>
  (navigation.value ?? []).map((mod, index) => {
    const lessons = ((mod.children ?? []) as ContentNavigationItem[])
      .filter(l => l.path)
      .map(l => ({ title: String(l.title ?? ''), path: String(l.path), soon: Boolean((l as { comingSoon?: boolean }).comingSoon), ...metaOf(String(l.path)) }))
    const done = lessons.filter(l => isDone(l.path)).length
    return {
      n: String(index + 1).padStart(2, '0'),
      title: String(mod.title ?? ''),
      icon: String((mod as { icon?: string }).icon ?? 'i-lucide-book-open'),
      path: String(mod.path ?? ''),
      lessons,
      soon: lessons.length > 0 && lessons.every(l => l.soon),
      done,
      minutes: lessons.reduce((s, l) => s + l.minutes, 0),
      active: lessons.some(l => normalise(l.path) === here.value) || normalise(String(mod.path ?? '')) === here.value
    }
  })
)

// The planned sections not published yet, from the course plan, so the
// sidebar always shows the whole path. Their lessons are titles, not links.
const slugOf = (p: string) => p.replace(/\/+$/, '').split('/').pop() ?? ''
const upcoming = computed(() => {
  const live = new Set(sections.value.map(s => slugOf(s.path)))
  return ROADMAP.map((r, i) => ({ ...r, n: String(i + 1).padStart(2, '0') }))
    .filter(r => !live.has(r.slug))
    .map(r => ({ ...r, title: t(`roadmap.${r.key}.title`), lessonTitles: Array.from({ length: r.lessons }, (_, k) => t(`roadmap.${r.key}.l${k + 1}`)) }))
})
const openSoon = ref<string | null>(null)

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
function lessonIcon(l: { path: string, type: string, soon?: boolean }) {
  if (l.soon) return 'i-lucide-hourglass'
  if (isDone(l.path)) return 'i-lucide-check'
  return l.type === 'video' ? 'i-lucide-play' : 'i-lucide-file-text'
}

// Keep the current lesson in view — by scrolling the sidebar's own scroll box
// only. scrollIntoView() would also scroll the page, so every lesson opened
// jumped the window down and slid the breadcrumbs under the header.
const list = ref<HTMLElement | null>(null)
function revealCurrent(center: boolean) {
  const el = list.value?.querySelector<HTMLElement>('[aria-current="page"]')
  if (!el) return
  let box: HTMLElement | null = el.parentElement
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement
  if (!box) return
  const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
  const bottom = top + el.offsetHeight
  if (center) box.scrollTop = top - box.clientHeight / 2 + el.offsetHeight / 2
  else if (top < box.scrollTop) box.scrollTop = top
  else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight
}
watch(() => route.path, () => nextTick(() => revealCurrent(false)))
onMounted(() => revealCurrent(true))
</script>

<template>
  <!-- Collapsed rail -->
  <div
    v-if="props.collapsed"
    class="flex min-h-full flex-col items-center gap-3 py-4"
  >
    <UButton
      icon="i-lucide-panel-right-open"
      color="neutral"
      variant="ghost"
      square
      :aria-label="t('course.showContents')"
      @click="emit('toggle')"
    />
    <NuxtLink
      v-for="s in sections"
      :key="s.path"
      :to="localePath(s.lessons[0]?.path ?? s.path)"
      :title="`${s.n} — ${s.title}`"
    >
      <span class="relative flex size-[34px] items-center justify-center">
        <BpDonut
          :value="s.lessons.length ? s.done / s.lessons.length : 0"
          :active="s.active"
          :size="34"
        />
        <UIcon
          :name="s.icon"
          class="absolute size-3.5"
          :class="s.active || (s.lessons.length && s.done === s.lessons.length) ? 'text-white' : 'text-(--signal)'"
        />
      </span>
    </NuxtLink>
    <span class="mt-2 font-medium text-[11px] text-(--ink2) [writing-mode:vertical-rl]">{{ t('course.contentsPct', { pct }) }}</span>
  </div>

  <!-- Full list -->
  <div
    v-else
    ref="list"
    class="min-h-full bg-(--card)"
  >
    <div class="sticky top-0 z-10 border-b border-(--line) bg-(--card) px-4 py-3">
      <div class="flex items-center justify-between gap-2">
        <p class="eyebrow">
          {{ t('course.contents') }}
        </p>
        <UButton
          v-if="collapsible"
          icon="i-lucide-panel-right-close"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :aria-label="t('course.collapseContents')"
          @click="emit('toggle')"
        />
      </div>
      <div class="mt-2 flex items-center gap-3">
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-(--line)">
          <div
            class="h-full rounded-full bg-(--signal)"
            :style="{ width: `${pct}%` }"
          />
        </div>
        <span class="text-xs font-semibold tabular-nums text-(--ink2)">{{ doneAll }}/{{ total }}</span>
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
          <span class="w-6 text-xs font-bold tabular-nums text-(--signal)">{{ s.n }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[0.9375rem] font-bold text-(--ink)">{{ s.title }}</span>
            <span class="text-xs text-(--ink2)">{{ s.soon ? t('course.comingSoon') : t('course.sectionMeta', { lessons: s.lessons.length, minutes: s.minutes }) }}</span>
          </span>
          <!-- The section's own icon inside its progress ring. -->
          <span class="relative flex size-8 flex-none items-center justify-center">
            <BpDonut
              :value="s.lessons.length ? s.done / s.lessons.length : 0"
              :size="32"
            />
            <UIcon
              :name="s.icon"
              class="absolute size-3.5"
              :class="s.lessons.length && s.done === s.lessons.length ? 'text-white' : 'text-(--signal)'"
            />
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 shrink-0 text-(--ink2) transition-transform"
            :class="isOpen(s) ? 'rotate-180' : ''"
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
              class="relative flex items-center gap-2.5 py-2.5 pe-4 ps-10 text-sm hover:bg-(--ice)/60"
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
              <!-- Free or Pro, on every lesson: Pro is locked unless the reader has it. -->
              <span
                v-if="!l.soon"
                class="flex flex-none items-center gap-0.5 rounded-full px-1.5 text-[10px] font-bold uppercase tracking-[.06em]"
                :class="l.pro ? 'bg-(--navy) text-white' : 'bg-success/10 text-success'"
                :title="l.pro ? t('pro.eyebrow') : t('pro.freeLesson')"
              ><UIcon
                v-if="l.pro && !hasPro"
                name="i-lucide-lock-keyhole"
                class="size-2.5"
              />{{ l.pro ? t('pro.tag') : t('pro.freeTag') }}</span>
              <span class="flex w-8 justify-end">
                <span
                  class="h-1.5"
                  :class="l.type === 'video' ? 'bg-(--signal)' : 'bg-(--frost)'"
                  :style="{ width: `${Math.max(12, (l.minutes / maxMin) * 100)}%` }"
                />
              </span>
              <span class="w-8 text-end text-xs tabular-nums text-(--ink2)">{{ l.minutes }}m</span>
            </NuxtLink>
          </li>
        </ol>
      </li>
      <!-- Planned sections: the rest of the path -->
      <li
        v-for="u in upcoming"
        :key="u.key"
        class="border-b border-(--line)"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-(--paper)"
          :aria-expanded="openSoon === u.key"
          @click="openSoon = openSoon === u.key ? null : u.key"
        >
          <span class="w-6 text-xs font-bold tabular-nums text-(--label)">{{ u.n }}</span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[0.9375rem] font-semibold text-(--ink2)">{{ u.title }}</span>
            <span class="text-xs text-(--label)">{{ t('course.comingSoon') }}</span>
          </span>
          <span class="flex size-8 flex-none items-center justify-center rounded-full bg-(--paper)">
            <UIcon
              :name="u.icon"
              class="size-3.5 text-(--label)"
            />
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 shrink-0 text-(--ink2) transition-transform"
            :class="openSoon === u.key ? 'rotate-180' : ''"
          />
        </button>
        <ol
          v-if="openSoon === u.key"
          class="pb-2"
        >
          <li
            v-for="(title, k) in u.lessonTitles"
            :key="k"
            class="flex items-center gap-2.5 py-2 pe-4 ps-10 text-sm text-(--ink2)"
          >
            <UIcon
              name="i-lucide-circle-dashed"
              class="size-3.5 flex-none text-(--x)"
            />
            <span class="min-w-0 flex-1 truncate">{{ title }}</span>
          </li>
        </ol>
      </li>
    </ol>
    <div class="p-3">
      <PromoSlot
        :key="route.path"
        unit="square300x250"
      />
    </div>
  </div>
</template>
