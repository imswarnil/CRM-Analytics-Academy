<script setup lang="ts">
// The recording script for a lesson's screen walkthrough, held in frontmatter
// and rendered where the video will eventually sit:
//
//   walkthrough:
//     org: "Your CRM Analytics org — Analytics Studio, Academy Analytics app"
//     shots:
//       - shot: "Open the recipe"
//         screen: "Data Manager → Recipes → gtm_pipeline → Edit"
//         say: "Every dataset on this site starts as a recipe..."
//         onscreen: "Recipes ≠ dataflows"
//         seconds: 40
//
// It is not a placeholder. Until a clip exists this IS the walkthrough, and it
// is written to be read: the `say` lines are teaching prose, not stage
// direction, so a reader who never watches the video still gets the tour. The
// production metadata -- the click path, the overlay, the timing -- stays
// visually secondary, useful to whoever records it and skippable by everyone
// else.
//
// Once `clip` or `video` frontmatter lands, the lesson page passes
// `has-video` and this collapses to a closed disclosure: the video supersedes
// it, but the script stays available as the transcript-shaped version of the
// same tour. <details> rather than reactive state, so it works before
// hydration and there is nothing to desync.
const props = defineProps<{
  shots: {
    shot: string
    screen?: string
    say: string
    onscreen?: string
    seconds?: number
  }[]
  org?: string
  hasVideo?: boolean
}>()

// Rounded to the nearest half minute: the sum of hand-estimated shot lengths
// does not deserve second-level precision.
const runtime = computed(() => {
  const total = props.shots.reduce((sum, s) => sum + (s.seconds ?? 0), 0)
  if (!total) return null
  const mins = total / 60
  return mins < 1 ? `${total}s` : `${(Math.round(mins * 2) / 2).toFixed(1).replace(/\.0$/, '')} min`
})
</script>

<template>
  <details
    class="not-prose group mb-8 border-[1.5px] border-(--ink) bg-(--card)"
    :open="!hasVideo"
  >
    <summary class="flex cursor-pointer list-none items-center gap-3 bg-(--ice) px-4 py-3 hover:bg-(--frost)/40">
      <span class="flex size-8 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--card)">
        <UIcon
          name="i-lucide-monitor-play"
          class="size-4 text-(--signal)"
        />
      </span>
      <span class="min-w-0 flex-1">
        <span class="eyebrow block">
          Screen walkthrough
        </span>
        <span class="block text-xs text-(--ink2)">
          {{ hasVideo ? 'The script behind the video above' : 'Follow along in your own org — the video for this lesson is not recorded yet' }}
        </span>
      </span>
      <span
        v-if="runtime"
        class="shrink-0 border-[1.5px] border-(--ink) bg-(--card) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]"
      >
        {{ runtime }}
      </span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 shrink-0 text-(--ink2) transition-transform group-open:rotate-180"
      />
    </summary>

    <div class="border-t-[1.5px] border-(--ink) px-4 py-5">
      <p
        v-if="org"
        class="mb-5 flex items-start gap-2 border border-dashed border-(--line) px-3 py-2 text-xs text-(--ink2)"
      >
        <UIcon
          name="i-lucide-crosshair"
          class="mt-0.5 size-3.5 shrink-0 text-(--signal)"
        />
        <span><span class="font-mono font-semibold uppercase tracking-[.08em] text-(--ink)">Have open:</span> {{ org }}</span>
      </p>

      <ol class="space-y-6">
        <li
          v-for="(s, i) in shots"
          :id="`step-${i + 1}`"
          :key="i"
          class="flex gap-3"
        >
          <span class="mt-0.5 flex size-7 shrink-0 items-center justify-center border-[1.5px] border-(--ink) bg-(--signal) font-mono text-xs font-semibold leading-none text-white">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4 class="text-sm font-bold text-(--ink)">
                {{ s.shot }}
              </h4>
              <span
                v-if="s.seconds"
                class="font-mono text-[10px] tabular-nums text-(--ink2)"
              >{{ s.seconds }}s</span>
            </div>

            <p
              v-if="s.screen"
              class="mt-1 font-mono text-xs leading-relaxed text-(--signal)"
            >
              {{ s.screen }}
            </p>

            <!-- The narration carries the teaching, so it is the one part set
                 at body size rather than in the metadata's smaller type. -->
            <p class="lesson-walkthrough-say mt-2 pl-3 text-sm leading-relaxed text-(--ink)">
              {{ s.say }}
            </p>

            <p
              v-if="s.onscreen"
              class="mt-2 inline-flex items-center gap-1.5 border border-dashed border-(--ink2) px-2 py-1 font-mono text-[11px] text-(--ink2)"
            >
              <UIcon
                name="i-lucide-type"
                class="size-3 shrink-0"
              />
              <span>{{ s.onscreen }}</span>
            </p>
          </div>
        </li>
      </ol>
    </div>
  </details>
</template>
