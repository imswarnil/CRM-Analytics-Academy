<script setup lang="ts">
import { seeded, WALL_TYPE_ICONS, type WallPerson } from '~/data/wall-of-fame'

/**
 * One polaroid on the wall. Its tilt (−6°…6°), its nudge off the grid and
 * whether it is taped or pinned all come from the person's name, so the wall
 * looks hand-hung but renders identically on every visit (it is
 * prerendered). Without a `person` it is an empty frame inviting a
 * nomination — never a made-up face.
 */
const props = defineProps<{ person?: WallPerson, n?: number }>()
const { t } = useI18n()

const key = computed(() => props.person?.name ?? `empty-${props.n ?? 0}`)
const look = computed(() => ({
  '--rot': `${(seeded(key.value, 1) * 12 - 6).toFixed(2)}deg`,
  '--dx': `${Math.round(seeded(key.value, 2) * 14 - 7)}px`,
  '--dy': `${Math.round(seeded(key.value, 3) * 18 - 9)}px`,
  '--tape': `${(seeded(key.value, 4) * 10 - 5).toFixed(1)}deg`
}))
const pinned = computed(() => seeded(key.value, 5) > 0.55)
</script>

<template>
  <figure
    class="bp-polaroid m-0"
    :style="look"
  >
    <span
      :class="pinned ? 'bp-polaroid__pin' : 'bp-polaroid__tape'"
      aria-hidden="true"
    />

    <!-- Photo -->
    <div
      class="relative aspect-square overflow-hidden"
      :class="person ? 'bg-(--ice)' : 'border-[1.5px] border-dashed border-(--tide) bg-(--paper)'"
    >
      <img
        v-if="person?.photo"
        :src="person.photo"
        :alt="person.name"
        loading="lazy"
        class="size-full object-cover grayscale-[15%]"
      >
      <template v-else-if="person">
        <div
          class="hatch absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <UIcon
          name="i-lucide-user-round"
          class="absolute bottom-0 left-1/2 size-[70%] -translate-x-1/2 text-(--tide)"
        />
        <span class="absolute end-2 top-2 flex size-7 items-center justify-center border-[1.5px] border-(--ink) bg-white text-(--signal)">
          <UIcon
            :name="WALL_TYPE_ICONS[person.type]"
            class="size-3.5"
          />
        </span>
      </template>
      <div
        v-else
        class="flex size-full flex-col items-center justify-center gap-2 p-3 text-center"
      >
        <UIcon
          name="i-lucide-camera"
          class="size-7 text-(--tide)"
        />
        <span class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">{{ t('wall.emptyPhoto') }}</span>
      </div>
    </div>

    <!-- Caption -->
    <figcaption class="px-1 pb-3 pt-2.5">
      <template v-if="person">
        <a
          :href="person.linkedin"
          target="_blank"
          rel="noopener"
          class="bp-polaroid__caption block truncate text-[#0C1B33] after:absolute after:inset-0"
        >{{ person.name }}</a>
        <span class="mt-0.5 flex items-center justify-between gap-2">
          <span class="font-mono text-[9.5px] uppercase tracking-[.12em] text-[#3D4E6B]">{{ t(`wall.types.${person.type}`) }}</span>
          <a
            v-if="person.url"
            :href="person.url"
            target="_blank"
            rel="noopener"
            :aria-label="`${t('wall.visit')} — ${person.name}`"
            class="relative z-10 text-[#3D4E6B] hover:text-(--signal)"
          >
            <UIcon
              :name="person.icon || 'i-lucide-globe'"
              class="size-3.5"
            />
          </a>
        </span>
      </template>
      <template v-else>
        <NuxtLink
          to="/nominate"
          class="bp-polaroid__caption block text-(--signal) after:absolute after:inset-0"
        >{{ t('wall.emptyCaption') }}</NuxtLink>
        <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[.12em] text-[#3D4E6B]">{{ t('wall.emptyHint') }}</span>
      </template>
    </figcaption>
  </figure>
</template>
