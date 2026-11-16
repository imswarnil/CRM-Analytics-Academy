<script setup lang="ts">
/**
 * The end of a gated lesson's teaser. `youtube` lessons open for verified
 * subscribers of the channel (or All Access); `pro` lessons for All Access.
 */
const props = defineProps<{
  lessonTitle: string
  needs: Access
  loading?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const proTo = computed(() => ({ path: localePath('/pro'), query: { from: route.path } }))
</script>

<template>
  <section
    class="pro-locked relative my-10 overflow-hidden rounded-2xl border border-(--line) bg-(--card) shadow-sm"
    :aria-busy="props.loading"
  >
    <div class="pointer-events-none absolute -top-24 inset-x-0 h-24 bg-gradient-to-b from-transparent to-(--paper)" />
    <div class="p-6 sm:p-8">
      <p class="flex items-center gap-2 text-sm font-semibold text-(--ink2)">
        <UIcon
          :name="props.needs === 'youtube' ? 'i-simple-icons-youtube' : 'i-lucide-lock-keyhole'"
          class="size-4"
          :class="props.needs === 'youtube' ? 'text-[#FF0000]' : ''"
        />{{ props.needs === 'youtube' ? t('youtube.lockedEyebrow') : t('pro.eyebrow') }}
      </p>
      <h2 class="mt-2 text-2xl font-bold tracking-tight text-(--ink)">
        {{ props.needs === 'youtube' ? t('youtube.lockedTitle') : t('pro.lockedTitle') }}
      </h2>
      <p class="mt-2 text-[17px] leading-relaxed text-(--ink2)">
        {{ props.needs === 'youtube' ? t('youtube.lockedBody', { title: props.lessonTitle }) : t('pro.lockedBody', { title: props.lessonTitle }) }}
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <YoutubeUnlock v-if="props.needs === 'youtube'" />
        <UButton
          :to="proTo"
          size="lg"
          :color="props.needs === 'youtube' ? 'neutral' : 'primary'"
          :variant="props.needs === 'youtube' ? 'ghost' : 'solid'"
          icon="i-lucide-infinity"
        >
          {{ t('pro.getPro', { price: `$${PRICES.allAccess.usd}` }) }}
        </UButton>
      </div>
    </div>
  </section>
</template>
