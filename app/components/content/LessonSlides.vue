<script setup lang="ts">
/**
 * A swipeable deck of short slides.
 *
 * For the parts of a lesson that are genuinely a sequence of small ideas — five
 * things that break, four questions to ask first — prose makes the reader hunt
 * for the boundaries. A deck makes each idea one object with a number on it.
 *
 * Scroll-snap rather than JavaScript: it works before hydration, it keeps
 * keyboard and trackpad behaviour the browser already implements, and there is
 * no state to get out of sync. On a phone it is a swipe; on a desktop the cards
 * sit side by side and scroll horizontally.
 *
 * ::lesson-slides
 * ---
 * items:
 *   - title: Who reads it
 *     bullets: [The AE, weekly, on Monday]
 *     kicker: Audience
 * ---
 * ::
 */
defineProps<{
  items: {
    title: string
    /** Short lines. Three or four is the sweet spot. */
    bullets?: string[]
    body?: string
    kicker?: string
    icon?: string
  }[]
}>()
</script>

<template>
  <div class="not-prose my-8">
    <ol
      class="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0"
      style="scrollbar-width: thin"
    >
      <li
        v-for="(s, i) in items"
        :key="i"
        class="flex w-[calc(100%-2rem)] shrink-0 snap-start flex-col border-[1.5px] border-(--ink) graph-paper-fine bg-(--card) p-5 sm:w-[19rem]"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <span
            v-if="s.kicker"
            class="bg-(--ice) px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--signal)"
          >
            {{ s.kicker }}
          </span>
          <span
            v-else
            class="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-(--ink2)"
          >
            {{ String(i + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}
          </span>
          <UIcon
            v-if="s.icon"
            :name="s.icon"
            class="size-4 shrink-0 text-(--signal)"
          />
        </div>

        <h4 class="text-base font-semibold leading-snug text-(--ink)">
          {{ s.title }}
        </h4>
        <p
          v-if="s.body"
          class="mt-2 text-sm leading-relaxed text-(--ink2)"
        >
          {{ s.body }}
        </p>
        <ul
          v-if="s.bullets?.length"
          class="mt-3 space-y-1.5"
        >
          <li
            v-for="(b, j) in s.bullets"
            :key="j"
            class="flex gap-2 text-sm leading-snug text-(--ink2)"
          >
            <UIcon
              name="i-lucide-dot"
              class="mt-0.5 size-4 shrink-0 text-(--signal)"
            />
            <span>{{ b }}</span>
          </li>
        </ul>
      </li>
    </ol>
    <p class="mt-1 flex items-center gap-1 text-xs text-(--ink2)">
      <UIcon
        name="i-lucide-move-horizontal"
        class="size-3.5"
      />
      Scroll for {{ items.length }} cards
    </p>
  </div>
</template>
