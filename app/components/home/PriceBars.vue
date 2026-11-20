<script setup lang="ts">
/**
 * Home → the price story in one glance: three bars, drawn to scale, that grow
 * in when they scroll into view. Classroom prices are the public list prices
 * shown (with sources) in HomeCompare on /pro.
 */
const { t, locale } = useI18n()
const usd = (n: number) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const MAX = 2700
const bars = computed(() => [
  { key: 'day', icon: 'i-lucide-presentation', label: t('home.v2.barDay'), value: 600, price: usd(600) },
  { key: 'days', icon: 'i-lucide-calendar-range', label: t('home.v2.barDays'), value: 2700, price: usd(2700) },
  { key: 'academy', icon: 'i-lucide-graduation-cap', label: t('home.v2.barAcademy'), value: PRICES.lifetime.usd, price: `${usd(0)} – ${usd(PRICES.lifetime.usd)}`, ours: true }
])
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 pt-20 sm:px-6">
    <div class="reveal text-center">
      <p class="eyebrow">
        {{ t('home.compare.eyebrow') }}
      </p>
      <h2 class="bp-h2 mt-3">
        {{ t('home.compare.title') }}
      </h2>
      <p class="bp-lead mt-3">
        {{ t('home.compare.lead') }}
      </p>
    </div>
    <ul class="mt-10 space-y-4">
      <li
        v-for="(b, i) in bars"
        :key="b.key"
        class="reveal grid items-center gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]"
      >
        <span
          class="flex items-center gap-2 text-sm font-semibold"
          :class="b.ours ? 'text-(--signal)' : 'text-(--ink)'"
        >
          <UIcon
            :name="b.icon"
            class="size-5 shrink-0"
          />{{ b.label }}
        </span>
        <span class="relative block h-11 overflow-hidden rounded-[6px] bg-(--paper)">
          <span
            class="bar absolute inset-y-0 start-0 rounded-[6px]"
            :class="b.ours ? 'bg-(--signal)' : 'bg-(--navy)/80'"
            :style="{ width: `${Math.max(8, (b.value / MAX) * 100)}%`, animationDelay: `${i * 0.15}s` }"
          />
          <span
            class="absolute inset-y-0 flex items-center px-3 text-sm font-bold tabular-nums"
            :class="b.ours ? 'text-(--signal)' : 'text-white'"
            :style="{ insetInlineStart: b.ours ? `calc(${Math.max(8, (b.value / MAX) * 100)}% + 0.25rem)` : '0' }"
          >{{ b.price }}</span>
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.bar { transform-origin: left; animation: grow 1s cubic-bezier(.2, .8, .2, 1) both; animation-timeline: view(); animation-range: entry 10% cover 40% }
@supports not (animation-timeline: view()) { .bar { animation-timeline: auto } }
@keyframes grow { from { transform: scaleX(0) } }
@media (prefers-reduced-motion: reduce) { .bar { animation: none } }
</style>
