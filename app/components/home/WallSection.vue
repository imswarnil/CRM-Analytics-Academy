<script setup lang="ts">
/**
 * The Wall of Fame on the home page: the first eight people on the board, and
 * the way to nominate someone. Curated people render at build time; approved
 * community nominations join in the browser (useWall).
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { people } = useWall()
const shown = computed(() => people.value.slice(0, 8))
</script>

<template>
  <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl">
        <p class="eyebrow">
          {{ t('home.wall.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-4">
          {{ t('wall.title') }}
        </h2>
        <p class="bp-lead mt-4">
          {{ t('wall.subtitle') }}
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UButton
          :to="localePath(NOMINATE_PATH)"
          icon="i-lucide-heart-handshake"
        >
          {{ t('wall.nominate') }}
        </UButton>
        <UButton
          :to="localePath('/wall-of-fame')"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('home.wall.all') }}
        </UButton>
      </div>
    </div>
    <BpPolaroidWall
      class="mt-10"
      :people="shown"
      :min-slots="8"
      :label="`${t('wall.board')} — ${people.length}`"
    />
  </section>
</template>
