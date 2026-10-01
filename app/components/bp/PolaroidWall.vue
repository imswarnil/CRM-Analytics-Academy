<script setup lang="ts">
import type { WallPerson } from '~/data/wall-of-fame'

/**
 * A framed drawing board with polaroids hung on it in a loose grid. When
 * there are fewer people than `minSlots`, the rest of the board is empty
 * frames that link to /nominate — the wall never pads itself with strangers.
 */
const props = withDefaults(defineProps<{ people: WallPerson[], minSlots?: number, label?: string }>(), { minSlots: 0, label: '' })

const empties = computed(() => Math.max(0, props.minSlots - props.people.length))
</script>

<template>
  <div class="bp-wall crosshair px-6 pb-12 pt-14 sm:px-10">
    <span
      v-if="label"
      class="absolute start-4 top-3 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)"
    >{{ label }}</span>
    <div class="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4">
      <BpPolaroid
        v-for="p in people"
        :key="p.name"
        :person="p"
      />
      <BpPolaroid
        v-for="n in empties"
        :key="`empty-${n}`"
        :n="n"
      />
    </div>
  </div>
</template>
