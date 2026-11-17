<script setup lang="ts">
/**
 * The end of a Pro lesson's teaser: what Pro is, and the two ways to get it
 * (monthly or lifetime). Teams and colleges are pointed at the seats plan.
 */
const props = defineProps<{
  lessonTitle: string
  loading?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const proTo = computed(() => ({ path: localePath('/pro'), query: { from: route.path } }))
</script>

<template>
  <section
    class="pro-locked relative my-10 overflow-hidden rounded-[6px] border border-(--line) bg-(--card)"
    :aria-busy="props.loading"
  >
    <div class="pointer-events-none absolute -top-24 inset-x-0 h-24 bg-gradient-to-b from-transparent to-(--paper)" />
    <div class="border-b border-(--line) bg-(--navy) px-6 py-3">
      <p class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.09em] text-white/80">
        <UIcon
          name="i-lucide-lock-keyhole"
          class="size-3.5"
        />{{ t('pro.eyebrow') }}
      </p>
    </div>
    <div class="p-6 sm:p-8">
      <h2 class="text-2xl font-bold tracking-tight text-(--ink)">
        {{ t('pro.lockedTitle') }}
      </h2>
      <p class="mt-2 text-[17px] leading-relaxed text-(--ink2)">
        {{ t('pro.lockedBody', { title: props.lessonTitle }) }}
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UButton
          :to="proTo"
          size="lg"
          icon="i-lucide-sparkles"
        >
          {{ t('pro.getPro', { monthly: `$${PRICES.monthly.usd}`, lifetime: `$${PRICES.lifetime.usd}` }) }}
        </UButton>
        <UButton
          :to="{ path: localePath('/pro'), hash: '#teams' }"
          size="lg"
          color="neutral"
          variant="ghost"
          icon="i-lucide-building-2"
        >
          {{ t('pro.forTeams') }}
        </UButton>
      </div>
    </div>
  </section>
</template>
