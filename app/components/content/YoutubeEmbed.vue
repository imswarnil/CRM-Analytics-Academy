<script setup lang="ts">
/**
 * The lesson clip: a plain YouTube embed, cut to the lesson's segment.
 *
 * There is no custom player here and no click-to-load poster. Both existed
 * before and both were removed on request — the original wrapped YouTube's
 * IFrame API in a bespoke scrub bar, volume and end screen, which is what
 * made a lesson slow to start.
 *
 * The one thing kept from all of it is the part that carries meaning: `start`
 * and `end` from the lesson's frontmatter, so the embed plays the segment the
 * lesson is about rather than the whole video. YouTube honours both as URL
 * parameters, so the clipping needs no JavaScript at all.
 *
 * `loading="lazy"` is doing real work: without it every one of the 49 lessons
 * would pull YouTube's player on page load, for a video most readers scroll
 * past. -nocookie keeps a reader who never presses play out of YouTube's
 * tracking cookie.
 */
const props = withDefaults(defineProps<{
  id: string
  start?: number
  end?: number
  title?: string
}>(), {
  start: 0,
  end: undefined,
  title: ''
})

const src = computed(() => {
  const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
  if (props.start) q.set('start', String(props.start))
  if (props.end) q.set('end', String(props.end))
  return `https://www.youtube-nocookie.com/embed/${props.id}?${q.toString()}`
})
</script>

<template>
  <div class="aspect-video w-full overflow-hidden rounded-lg bg-elevated">
    <iframe
      :src="src"
      :title="title"
      class="size-full border-0"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
  </div>
</template>
