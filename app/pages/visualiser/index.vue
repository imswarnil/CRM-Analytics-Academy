<script setup lang="ts">
/**
 * /visualiser — the three execution visualisers (SAQL, recipe, dataflow) and
 * the sample data they all run on. Prerendered; links into each.
 */
import { DATASETS } from '~/utils/vis/data'

const { t } = useI18n()
const localePath = useLocalePath()

const TOOLS = [
  { id: 'saql', icon: 'i-lucide-terminal', spec: 'V1' },
  { id: 'recipe', icon: 'i-lucide-workflow', spec: 'V2' },
  { id: 'dataflow', icon: 'i-lucide-git-fork', spec: 'V3' }
] as const

const title = computed(() => t('vis.seoTitle'))
const description = computed(() => t('vis.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('vis.title'), description: description.value, headline: t('vis.eyebrow'), spec: 'SAQL · RECIPES · DATAFLOWS' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  trail: [{ name: t('vis.eyebrow'), path: '/visualiser' }],
  extra: [{
    '@type': 'ItemList',
    'itemListElement': TOOLS.map((tool, i) => ({ '@type': 'ListItem', 'position': i + 1, 'url': `${SITE.url}${localePath(`/visualiser/${tool.id}`)}`, 'name': t(`vis.${tool.id}.title`) }))
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      sheet="FIG. V / VISUALISERS"
      :title="t('vis.title')"
      :lead="t('vis.lead')"
    />
    <div class="mx-auto max-w-(--ui-container) space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <ul class="grid gap-6 md:grid-cols-3">
        <li
          v-for="tool in TOOLS"
          :key="tool.id"
        >
          <NuxtLink
            :to="localePath(`/visualiser/${tool.id}`)"
            class="crosshair bp-card bp-card--hover group flex h-full flex-col p-6"
          >
            <span class="flex items-center justify-between">
              <UIcon
                :name="tool.icon"
                class="size-8 text-(--signal)"
              />
              <span class="font-mono text-xs text-(--ink2)">FIG. {{ tool.spec }}</span>
            </span>
            <span class="mt-4 text-2xl font-extrabold text-(--ink) group-hover:text-(--signal)">{{ t(`vis.${tool.id}.title`) }}</span>
            <span class="mt-2 flex-1 text-[15px] leading-relaxed text-(--ink2)">{{ t(`vis.${tool.id}.card`) }}</span>
            <span class="mt-4 font-mono text-xs font-semibold uppercase tracking-[.1em] text-(--signal)">{{ t('vis.open') }} →</span>
          </NuxtLink>
        </li>
      </ul>

      <section>
        <p class="eyebrow">
          {{ t('vis.dataEyebrow') }}
        </p>
        <h2 class="bp-h3 mt-2">
          {{ t('vis.dataTitle') }}
        </h2>
        <p class="bp-lead mt-2 max-w-3xl">
          {{ t('vis.dataLead') }}
        </p>
        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <VisTable
            v-for="(ds, name) in DATASETS"
            :key="name"
            :rows="ds.rows"
            :caption="`${name} · ${ds.label}`"
          />
        </div>
      </section>
    </div>
  </div>
</template>
