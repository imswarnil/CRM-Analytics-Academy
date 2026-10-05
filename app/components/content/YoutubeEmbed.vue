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
 *
 * When the video is someone else's, `author` (and `authorUrl`, `creditTitle`)
 * print a credit line under the frame — "Video by <author> — <title> ↗" —
 * from the lesson header or from a body block:
 *   ::youtube-embed{id="…" author="Channel" authorUrl="https://youtube.com/@channel" creditTitle="Video title"}
 */
const props = withDefaults(defineProps<{
  id: string
  start?: number
  end?: number
  title?: string
  author?: string
  authorUrl?: string
  creditTitle?: string
}>(), {
  start: 0,
  end: undefined,
  title: '',
  author: undefined,
  authorUrl: undefined,
  creditTitle: undefined
})
const { t } = useI18n()
const watchUrl = computed(() => `https://www.youtube.com/watch?v=${props.id}${props.start ? `&t=${props.start}s` : ''}`)

const src = computed(() => {
  const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1' })
  if (props.start) q.set('start', String(props.start))
  if (props.end) q.set('end', String(props.end))
  return `https://www.youtube-nocookie.com/embed/${props.id}?${q.toString()}`
})
</script>

<template>
  <!-- The design system's video well: a heavy ink frame around a dark stage. -->
  <figure
    v-if="author"
    class="not-prose m-0"
  >
    <div class="aspect-video w-full overflow-hidden border-[1.5px] border-(--ink) bg-(--ink)">
      <iframe
        :src="src"
        :title="title || creditTitle"
        class="size-full border-0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      />
    </div>
    <figcaption class="mt-2 flex flex-wrap items-baseline gap-x-1.5 font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)">
      <UIcon
        name="i-lucide-video"
        class="size-3.5 self-center text-(--signal)"
      />
      {{ t('credits.videoBy') }}
      <a
        v-if="authorUrl"
        :href="authorUrl"
        target="_blank"
        rel="noopener"
        class="font-semibold text-(--ink) hover:text-(--signal)"
      >{{ author }}</a>
      <span
        v-else
        class="font-semibold text-(--ink)"
      >{{ author }}</span>
      <span aria-hidden="true">—</span>
      <a
        :href="watchUrl"
        target="_blank"
        rel="noopener"
        class="normal-case tracking-normal text-(--ink) underline-offset-4 hover:text-(--signal) hover:underline"
      >{{ creditTitle || t('credits.onYoutube') }} ↗</a>
    </figcaption>
  </figure>
  <div
    v-else
    class="aspect-video w-full overflow-hidden border-[1.5px] border-(--ink) bg-(--ink)"
  >
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
