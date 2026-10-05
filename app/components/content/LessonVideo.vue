<script setup lang="ts">
/**
 * A Mux video inside a lesson body:
 *
 *   ::lesson-video{mux="PLAYBACK_ID" title="The join, step by step"}
 *   ::
 *
 * Inside a `::pro` block it is written with three colons (`:::lesson-video`)
 * and uploaded with a signed policy; the block's API response carries its
 * token, provided here by whatever unlocked the block (ProLocked or
 * LessonProGate). Outside one it plays as a public video.
 */
import type { PlaybackTokens } from '#shared/utils/lessonVideo'
import { MUX_PLAYBACK } from '~/utils/proContent'

const props = defineProps<{
  mux: string
  title?: string
}>()

const signed = inject(MUX_PLAYBACK, ref<Record<string, PlaybackTokens>>({}))
const tokens = computed(() => signed.value[props.mux])
</script>

<template>
  <figure class="not-prose my-6">
    <ClientOnly>
      <LessonPlayer
        :playback-id="mux"
        :title="title"
        :tokens="tokens"
      />
      <template #fallback>
        <div class="aspect-video w-full border-[1.5px] border-(--ink) bg-(--ink)" />
      </template>
    </ClientOnly>
    <figcaption
      v-if="title"
      class="mt-2 font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)"
    >
      {{ title }}
    </figcaption>
  </figure>
</template>
