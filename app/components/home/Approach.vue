<script setup lang="ts">
/**
 * Home → "How you will learn it": the course approach as six steps, from the
 * Salesforce platform to embedded, secured dashboards — and the dashboard
 * patterns every GTM team uses. Static and prerendered; wording in i18n
 * (`home.approach.*`).
 */
const { t } = useI18n()
const localePath = useLocalePath()

const STEPS = [
  { key: 'platform', icon: 'i-lucide-database' },
  { key: 'build', icon: 'i-lucide-code-xml' },
  { key: 'gtm', icon: 'i-lucide-funnel' },
  { key: 'architecture', icon: 'i-lucide-network' },
  { key: 'dashboards', icon: 'i-lucide-layout-dashboard' },
  { key: 'advanced', icon: 'i-lucide-share-2' }
] as const
const PATTERNS = ['kpi', 'snapshot', 'change', 'conversion', 'adoption', 'bindings', 'sharing', 'embedding'] as const
</script>

<template>
  <section class="border-y border-(--line) bg-(--card)">
    <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <p class="eyebrow">
          {{ t('home.approach.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-3">
          {{ t('home.approach.title') }}
        </h2>
        <p class="bp-lead mt-4">
          {{ t('home.approach.lead') }}
        </p>
      </div>

      <ol class="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(s, i) in STEPS"
          :key="s.key"
          class="bp-card bp-card--hover relative p-6"
        >
          <div class="flex items-center gap-3">
            <span class="bp-iconbox">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <span class="mono-label">{{ t('home.approach.step', { n: i + 1 }) }}</span>
          </div>
          <h3 class="mt-4 text-lg font-bold text-(--ink)">
            {{ t(`home.approach.steps.${s.key}.title`) }}
          </h3>
          <p class="mt-2 text-(--ink2)">
            {{ t(`home.approach.steps.${s.key}.body`) }}
          </p>
        </li>
      </ol>

      <div class="mt-10 flex flex-wrap items-center gap-2">
        <span class="mono-label me-2">{{ t('home.approach.patterns') }}</span>
        <span
          v-for="p in PATTERNS"
          :key="p"
          class="rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-sm font-medium text-(--ink)"
        >{{ t(`home.approach.pattern.${p}`) }}</span>
      </div>

      <UButton
        :to="localePath('/start')"
        class="mt-10"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
      >
        {{ t('home.approach.cta') }}
      </UButton>
    </div>
  </section>
</template>
