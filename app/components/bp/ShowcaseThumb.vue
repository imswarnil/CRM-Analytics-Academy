<script setup lang="ts">
/**
 * A showcase card's thumbnail: an ice sheet of graph paper with the
 * dashboard screenshot framed on it, a corner icon, and a line chart that
 * draws itself when the card is hovered. With no screenshot yet, the frame
 * reads "drop screenshot" instead of showing a broken image.
 */
const props = withDefaults(defineProps<{ image?: string, alt?: string, icon?: string, seed?: string }>(), { icon: 'i-lucide-layout-dashboard', seed: '' })

// The shared placeholder is not a screenshot; show the drawing instead.
const shot = computed(() => (props.image && !props.image.includes('placeholder') ? props.image : ''))

// A deterministic squiggle per card, so each thumbnail's chart differs.
const points = computed(() => {
  let h = 0
  for (const c of props.seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const ys: number[] = []
  for (let i = 0; i < 9; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    ys.push(18 + (h % 44) - i * 2)
  }
  return ys.map((y, i) => `${i * 25},${Math.max(4, y)}`).join(' ')
})
</script>

<template>
  <div class="graph-paper relative aspect-video overflow-hidden border-b-[1.5px] border-(--ink) bg-(--ice) p-4">
    <div
      v-if="shot"
      class="size-full overflow-hidden border-[1.5px] border-(--ink) bg-(--card)"
    >
      <NuxtImg
        :src="shot"
        :alt="alt"
        loading="lazy"
        width="600"
        height="338"
        class="size-full object-cover"
      />
    </div>
    <div
      v-else
      class="flex size-full items-center justify-center border-[1.5px] border-dashed border-(--ink2) font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)"
    >
      Drop screenshot
    </div>

    <span class="bp-iconbox absolute end-3 top-3 size-9! text-(--signal)">
      <UIcon
        :name="icon"
        class="size-4"
      />
    </span>

    <svg
      viewBox="0 0 200 70"
      class="pointer-events-none absolute inset-x-4 bottom-3 h-14 w-[calc(100%-2rem)]"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        :points="points"
        fill="none"
        stroke="var(--signal)"
        stroke-width="2.5"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
        class="bp-draw"
      />
    </svg>
  </div>
</template>
