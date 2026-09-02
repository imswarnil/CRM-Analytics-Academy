<script setup lang="ts">
/**
 * The hero's video: a 16:9 poster with a corner play control that swaps to
 * the real YouTube iframe in the same frame. The facade keeps YouTube's
 * player (and its cookies) off the critical path — the iframe exists only
 * after a click, and then with autoplay so the click feels like "play",
 * not "load".
 */
const props = withDefaults(defineProps<{
  id: string
  start?: number
  title?: string
}>(), {
  start: 0,
  title: ''
})

const playing = ref(false)

const thumb = computed(() => `https://i.ytimg.com/vi/${props.id}/maxresdefault.jpg`)

const src = computed(() => {
  const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1', autoplay: '1' })
  if (props.start) q.set('start', String(props.start))
  return `https://www.youtube-nocookie.com/embed/${props.id}?${q.toString()}`
})
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden rounded-2xl border border-default bg-neutral-950 shadow-2xl">
    <iframe
      v-if="playing"
      :src="src"
      :title="title"
      class="size-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
    <template v-else>
      <img
        :src="thumb"
        :alt="title"
        class="size-full object-cover"
        width="1280"
        height="720"
      >
      <!-- A quiet scrim so the corner control reads on any poster frame. -->
      <span
        class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        aria-hidden="true"
      />
      <UButton
        icon="i-lucide-play"
        size="lg"
        color="primary"
        class="absolute bottom-4 left-4 rounded-full shadow-lg"
        :label="title"
        :aria-label="title"
        @click="playing = true"
      />
    </template>
  </div>
</template>
