<script setup lang="ts">
/**
 * What a learner sees on a lesson that is written but not published
 * (`comingSoon: true`): the lesson is being recorded, here is where it will
 * appear first, and here is what to do meanwhile. The body itself never
 * reaches the browser (scripts/gate-content.mjs) — the admin gets it from
 * /api/lesson instead of this card.
 */
const props = defineProps<{
  title: string
  loading?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section
    class="not-prose my-6 overflow-hidden rounded-[8px] border border-(--line) bg-(--card)"
    :aria-busy="props.loading"
  >
    <div class="flex items-center gap-2 bg-(--navy) px-6 py-3 text-[11px] font-bold uppercase tracking-[.09em] text-white/85">
      <UIcon
        name="i-lucide-clapperboard"
        class="size-3.5"
      />{{ t('soon.eyebrow') }}
    </div>
    <div class="p-6 sm:p-8">
      <h2 class="text-2xl font-bold tracking-tight text-(--ink)">
        {{ t('soon.title') }}
      </h2>
      <p class="mt-2 max-w-xl text-[17px] leading-relaxed text-(--ink2)">
        {{ t('soon.body', { title: props.title }) }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <UButton
          :to="SITE.youtube"
          target="_blank"
          icon="i-simple-icons-youtube"
          size="lg"
        >
          {{ t('soon.youtube') }}
        </UButton>
        <UButton
          :to="localePath('/start')"
          color="neutral"
          variant="outline"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('soon.start') }}
        </UButton>
      </div>
    </div>
  </section>
</template>
