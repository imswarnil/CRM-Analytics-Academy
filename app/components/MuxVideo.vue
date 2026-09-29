<script setup lang="ts">
/**
 * A lesson video on Mux, in the reader's language.
 *
 * `ids` is the lesson's `mux` frontmatter: one playback id per language
 * (`{ en: abc, es: def }`) or a single string for English only. The site's
 * language setting picks the track and English is the fallback, so a lesson
 * recorded only in English plays everywhere and a translated recording takes
 * over for its readers the moment its id is added.
 *
 * Free lessons use Mux's public playback policy and need nothing else. For a
 * Pro lesson the caller passes the signed `token` from /api/lesson — the id on
 * its own does not play.
 *
 * Rendered through Mux's hosted player (player.mux.com), which needs no
 * client dependency and loads nothing until the reader reaches it.
 */
const props = defineProps<{
  ids: string | Record<string, string>
  title?: string
  token?: string
}>()

const { locale } = useI18n()

const playbackId = computed(() => {
  if (typeof props.ids === 'string') return props.ids
  return props.ids[locale.value] ?? props.ids.en ?? Object.values(props.ids)[0]
})

const src = computed(() => {
  if (!playbackId.value) return ''
  const params = new URLSearchParams()
  if (props.token) params.set('playback-token', props.token)
  if (props.title) params.set('metadata-video-title', props.title)
  params.set('accent-color', '#2f54eb')
  const q = params.toString()
  return `https://player.mux.com/${playbackId.value}${q ? `?${q}` : ''}`
})
</script>

<template>
  <div
    v-if="src"
    class="mb-8 overflow-hidden rounded-xl border border-default bg-black"
    style="aspect-ratio: 16 / 9"
  >
    <iframe
      :src="src"
      :title="title || 'Lesson video'"
      class="size-full"
      loading="lazy"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
    />
  </div>
</template>
