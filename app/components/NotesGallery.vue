<script setup lang="ts">
import type { NotesCollectionItem } from '@nuxt/content'

/**
 * The product gallery on /notes: a main image, thumbnails, arrows (and the
 * keyboard's), and a zoom view. Slides are drawn, not photographed — the
 * cover stack, each real sheet scaled down, and the two formats — so they
 * stay crisp, follow the language and cost no image requests.
 */
const props = defineProps<{ sheets: NotesCollectionItem[] }>()
const { t } = useI18n()

type Slide = { kind: 'cover' } | { kind: 'sheet', sheet: NotesCollectionItem } | { kind: 'formats' }
const slides = computed<Slide[]>(() => [
  { kind: 'cover' },
  ...props.sheets.map(sheet => ({ kind: 'sheet' as const, sheet })),
  { kind: 'formats' }
])
const i = ref(0)
const zoom = ref(false)
const go = (d: number) => (i.value = (i.value + d + slides.value.length) % slides.value.length)
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}
const label = (s: Slide) => s.kind === 'sheet' ? s.sheet.title : t(`notes.gallery.${s.kind}`)
</script>

<template>
  <div
    class="space-y-3"
    role="region"
    :aria-label="t('notes.gallery.label')"
    tabindex="0"
    @keydown="onKey"
  >
    <!-- Main image -->
    <div class="group relative aspect-[4/3] overflow-hidden rounded-[6px] border border-(--line) bg-(--paper2)">
      <button
        type="button"
        class="absolute inset-0 cursor-zoom-in"
        :aria-label="t('notes.gallery.zoom')"
        @click="zoom = true"
      >
        <NotesSlide
          :slide="slides[i]!"
          class="size-full"
        />
      </button>
      <button
        type="button"
        class="gallery-arrow start-3"
        :aria-label="t('notes.gallery.prev')"
        @click="go(-1)"
      >
        <UIcon
          name="i-lucide-chevron-left"
          class="size-5"
        />
      </button>
      <button
        type="button"
        class="gallery-arrow end-3"
        :aria-label="t('notes.gallery.next')"
        @click="go(1)"
      >
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5"
        />
      </button>
      <span class="pointer-events-none absolute end-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
        <UIcon
          name="i-lucide-zoom-in"
          class="size-3.5"
        />{{ i + 1 }} / {{ slides.length }}
      </span>
    </div>

    <!-- Thumbnails -->
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(s, k) in slides"
        :key="k"
        type="button"
        class="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-[4px] border-2 bg-(--paper2) transition-colors"
        :class="k === i ? 'border-(--signal)' : 'border-(--line) opacity-75 hover:opacity-100'"
        :aria-label="label(s)"
        :aria-current="k === i ? 'true' : undefined"
        @click="i = k"
      >
        <NotesSlide
          :slide="s"
          thumb
          class="size-full"
        />
      </button>
    </div>

    <!-- Zoom -->
    <UModal
      v-model:open="zoom"
      :title="label(slides[i]!)"
      :ui="{ content: 'sm:max-w-5xl', body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <div
          class="relative max-h-[80vh] overflow-y-auto bg-(--paper2)"
          @keydown="onKey"
        >
          <NotesSheet
            v-if="slides[i]!.kind === 'sheet'"
            :sheet="(slides[i] as { sheet: NotesCollectionItem }).sheet"
            :anchor="false"
          />
          <NotesSlide
            v-else
            :slide="slides[i]!"
            class="aspect-[4/3] w-full"
          />
        </div>
        <div class="flex items-center justify-between border-t border-(--line) px-4 py-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-chevron-left"
            @click="go(-1)"
          >
            {{ t('notes.gallery.prev') }}
          </UButton>
          <span class="text-sm tabular-nums text-(--ink2)">{{ i + 1 }} / {{ slides.length }}</span>
          <UButton
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-right"
            @click="go(1)"
          >
            {{ t('notes.gallery.next') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.gallery-arrow {
  position: absolute;
  top: 50%;
  translate: 0 -50%;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  opacity: 0;
  transition: opacity .15s;
}
.group:hover .gallery-arrow, .gallery-arrow:focus-visible { opacity: 1; }
@media (hover: none) { .gallery-arrow { opacity: 1; } }
</style>
