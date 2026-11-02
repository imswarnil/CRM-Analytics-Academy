<script setup lang="ts">
/**
 * The frame every visualiser plays in — exactly one viewport under the navbar,
 * no footer (focus mode), nothing below the fold:
 *
 *   top     title, presets, Edit (a side panel with the editor)
 *   left    the rail: the code or the execution order, clickable
 *   centre  the stage — the motion graphic
 *   bottom  the narration (written out, whiteboard style) and the player
 *
 * The stage (a VisCanvas) animates each step itself; the player waits
 * long enough for a step's flow to finish before moving on.
 */
const props = withDefaults(defineProps<{
  sheet: string
  title: string
  count: number
  caption: string
  eyebrow?: string
  error?: boolean
  presets?: { id: string, label: string }[]
  preset?: string
  editLabel?: string
  /** Whether the left rail starts open (on large screens). */
  rail?: boolean
}>(), { presets: () => [], preset: '', eyebrow: '', error: false, editLabel: '', rail: true })
const step = defineModel<number>('step', { required: true })
const emit = defineEmits<{ preset: [id: string] }>()
const { t } = useI18n()

const focus = useState('exam-focus', () => false)
focus.value = true
onBeforeUnmount(() => (focus.value = false))

const editOpen = ref(false)
const railOpen = ref(props.rail)
</script>

<template>
  <div class="flex h-[calc(100dvh-var(--ui-header-height))] flex-col overflow-hidden">
    <!-- Top: title, presets, edit -->
    <header class="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b-[1.5px] border-(--ink) bg-(--card) px-4 py-2.5 sm:px-6">
      <div class="flex min-w-0 items-baseline gap-3">
        <span class="font-mono text-[10px] uppercase tracking-[.14em] text-(--signal)">{{ props.sheet }}</span>
        <h1 class="truncate text-lg font-extrabold tracking-[-0.02em] text-(--ink)">
          {{ props.title }}
        </h1>
      </div>
      <nav
        v-if="props.presets.length"
        class="flex min-w-0 flex-1 gap-1.5 overflow-x-auto"
        :aria-label="t('vis.examples')"
      >
        <button
          v-for="p in props.presets"
          :key="p.id"
          type="button"
          class="shrink-0 border-[1.5px] px-2.5 py-1 text-[13px] font-semibold"
          :class="props.preset === p.id ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--paper) hover:border-(--ink)'"
          @click="emit('preset', p.id)"
        >
          {{ p.label }}
        </button>
      </nav>
      <div class="ms-auto flex items-center gap-1.5">
        <ShareBar
          :title="props.title"
          compact
          class="max-md:hidden"
        />
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="max-lg:hidden"
          :aria-label="t('vis.toggleRail')"
          @click="railOpen = !railOpen"
        />
        <UButton
          icon="i-lucide-sliders-horizontal"
          size="sm"
          @click="editOpen = true"
        >
          {{ props.editLabel || t('vis.edit') }}
        </UButton>
      </div>
    </header>

    <!-- Middle: rail + stage -->
    <div
      class="grid min-h-0 flex-1"
      :class="railOpen ? 'lg:grid-cols-[19rem_minmax(0,1fr)]' : 'grid-cols-1'"
    >
      <aside
        v-if="railOpen"
        class="min-h-0 overflow-y-auto border-e-[1.5px] border-(--ink) bg-(--card) max-lg:hidden"
      >
        <slot name="rail" />
        <div class="border-t-[1.5px] border-(--ink) p-3">
          <PromoSlot
            :key="`vis-rail-${step}`"
            unit="square250"
          />
        </div>
      </aside>
      <section class="relative min-h-0 overflow-hidden bg-[#0b1020] max-lg:min-h-[60dvh]">
        <slot name="stage" />
      </section>
    </div>

    <!-- Bottom: narration + player -->
    <footer class="grid shrink-0 gap-3 border-t-[1.5px] border-(--ink) bg-(--card) px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <VisCaption
        :text="props.caption"
        :eyebrow="props.eyebrow"
        :error="props.error"
      />
      <VisPlayer
        v-model="step"
        :count="props.count"
        :interval="7000"
        autoplay
        class="lg:min-w-[30rem]"
      />
    </footer>

    <USlideover
      v-model:open="editOpen"
      side="right"
      :title="props.editLabel || t('vis.edit')"
      :ui="{ content: 'max-w-xl' }"
    >
      <template #body>
        <slot name="edit" />
      </template>
    </USlideover>
  </div>
</template>
