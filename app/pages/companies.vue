<script setup lang="ts">
import data from '~/data/companies.json'

/**
 * Companies that use CRM Analytics, hire for it, or offer it as a consulting
 * practice — every entry backed by a public source, linked beside it. Nothing
 * here is a claim of our own: if a source disappears, the entry goes.
 * Suggestions arrive through /submit?type=company and are checked by hand.
 */
type Kind = 'uses' | 'hires' | 'partner'
interface Company {
  name: string
  kind: Kind
  industry: string
  evidence: { title: string, url: string, type: string, note: string }[]
}

const { t } = useI18n()
const localePath = useLocalePath()
const companies = data.companies as Company[]
const KINDS: Kind[] = ['uses', 'hires', 'partner']
const kind = ref<Kind | ''>('')
const shown = computed(() => companies.filter(c => !kind.value || c.kind === kind.value))
const count = (k: Kind) => companies.filter(c => c.kind === k).length
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u
  }
}

const title = computed(() => t('companies.seoTitle'))
const description = computed(() => t('companies.seoDesc', { n: companies.length }))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('companies.title'), description: description.value, headline: t('companies.eyebrow'), spec: `${companies.length} SOURCED` })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  trail: [{ name: t('companies.eyebrow'), path: '/companies' }],
  extra: [{
    '@type': 'ItemList',
    'numberOfItems': companies.length,
    'itemListElement': companies.map((c, i) => ({ '@type': 'ListItem', 'position': i + 1, 'item': { '@type': 'Organization', 'name': c.name } }))
  }]
}))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('companies.sheet', { n: companies.length })"
      :title="t('companies.title')"
      :lead="t('companies.lead')"
    >
      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UButton
          :to="localePath('/submit?type=company')"
          icon="i-lucide-building-2"
          size="lg"
        >
          {{ t('companies.suggest') }}
        </UButton>
        <UButton
          :to="localePath('/interview-questions')"
          color="neutral"
          variant="outline"
          size="lg"
          icon="i-lucide-messages-square"
        >
          {{ t('companies.prepare') }}
        </UButton>
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) px-4 py-12 sm:px-6 lg:px-8">
      <div
        class="flex flex-wrap gap-2"
        role="group"
        :aria-label="t('companies.filter')"
      >
        <button
          type="button"
          class="min-h-11 border-[1.5px] px-4 text-[15px] font-semibold"
          :class="!kind ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          @click="kind = ''"
        >
          {{ t('companies.all') }} <span class="font-mono text-xs opacity-60">{{ companies.length }}</span>
        </button>
        <button
          v-for="k in KINDS"
          :key="k"
          type="button"
          class="min-h-11 border-[1.5px] px-4 text-[15px] font-semibold"
          :class="kind === k ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--line) bg-(--card) hover:border-(--ink)'"
          @click="kind = k"
        >
          {{ t(`companies.kinds.${k}`) }} <span class="font-mono text-xs opacity-60">{{ count(k) }}</span>
        </button>
      </div>

      <ul class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="c in shown"
          :key="c.name"
          class="bp-card flex flex-col p-5"
        >
          <p class="font-mono text-[11px] uppercase tracking-[.08em] text-(--signal)">
            {{ t(`companies.kinds.${c.kind}`) }} · <span class="text-(--ink2)">{{ c.industry }}</span>
          </p>
          <h2 class="mt-2 text-xl font-bold text-(--ink)">
            {{ c.name }}
          </h2>
          <ul class="mt-3 space-y-3">
            <li
              v-for="e in c.evidence"
              :key="e.url"
            >
              <p class="text-[15px] leading-relaxed text-(--ink2)">
                {{ e.note }}
              </p>
              <a
                :href="e.url"
                target="_blank"
                rel="nofollow noopener"
                class="mt-1 inline-flex items-center gap-1 font-mono text-xs text-(--signal) hover:underline"
              >{{ t(`companies.sourceTypes.${e.type}`) }} · {{ host(e.url) }}<UIcon
                name="i-lucide-external-link"
                class="size-3"
              /></a>
            </li>
          </ul>
        </li>
      </ul>

      <PromoSlot unit="horizontal" />

      <p class="mt-8 max-w-3xl text-sm leading-relaxed text-(--ink2)">
        {{ t('companies.disclaimer', { date: data.checked }) }}
      </p>
    </div>
  </div>
</template>
