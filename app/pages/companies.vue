<script setup lang="ts">
const { t, locale, locales } = useI18n()

const title = computed(() => t('companies.title'))
const description = computed(() => t('companies.subtitle'))

useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

type CompanyType = 'customer' | 'consultancy'
type Industry = 'finance' | 'insurance' | 'healthcare' | 'manufacturing' | 'retail' | 'technology' | 'energy' | 'telecom' | 'nonprofit' | 'consulting'

interface Company {
  name: string
  type: CompanyType
  industry: Industry
  note: string
  url?: string
}

// Hand-curated list — like the resources array, this is data, not UI copy, so it
// stays English. Every entry must trace back to something public (a Salesforce
// customer story, a Dreamforce talk, a press release); keep notes hedged and
// modest. To extend: add an entry here with one of the ten industry keys from
// `companies.industries.*` in i18n/locales/en.json — the filters, icon tile and
// JSON-LD pick it up automatically. Omit `url` unless you're sure of the domain.
const companies: Company[] = [
  // Customers with public Einstein Analytics / CRM Analytics stories
  { name: 'U.S. Bank', type: 'customer', industry: 'finance', note: 'Featured in Salesforce\'s Einstein Analytics customer stories for analytics across its banking teams.', url: 'https://www.usbank.com' },
  { name: 'Transamerica', type: 'customer', industry: 'insurance', note: 'Publicly shared an Einstein Analytics rollout for advisor and distribution insights.', url: 'https://www.transamerica.com' },
  { name: 'Schneider Electric', type: 'customer', industry: 'manufacturing', note: 'Publicly shared an Einstein Analytics rollout for global sales performance.', url: 'https://www.se.com' },
  { name: 'New Belgium Brewing', type: 'customer', industry: 'retail', note: 'An early, publicly told Einstein Analytics story for field sales and retail data.', url: 'https://www.newbelgium.com' },
  { name: 'RBC Wealth Management', type: 'customer', industry: 'finance', note: 'Featured by Salesforce for analytics in wealth-management workflows.' },
  { name: 'Certinia (FinancialForce)', type: 'customer', industry: 'technology', note: 'Embedded Einstein Analytics into its ERP and PSA apps as an OEM partner.', url: 'https://www.certinia.com' },
  { name: 'nCino', type: 'customer', industry: 'finance', note: 'Publicly described building its banking platform\'s analytics on the Einstein Analytics platform.', url: 'https://www.ncino.com' },
  { name: 'Salesforce', type: 'customer', industry: 'technology', note: 'Runs CRM Analytics on its own orgs and has demoed those internal dashboards at Dreamforce.', url: 'https://www.salesforce.com' },
  // Consultancies and SI partners with Salesforce analytics practices
  { name: 'Atrium', type: 'consultancy', industry: 'consulting', note: 'Consultancy focused on Salesforce analytics and AI, best known for CRM Analytics work.', url: 'https://www.atrium.ai' },
  { name: 'Accenture', type: 'consultancy', industry: 'consulting', note: 'Global Salesforce SI with a large data and analytics practice.', url: 'https://www.accenture.com' },
  { name: 'Deloitte Digital', type: 'consultancy', industry: 'consulting', note: 'Major Salesforce partner delivering analytics alongside broad CRM programs.', url: 'https://www.deloittedigital.com' },
  { name: 'Slalom', type: 'consultancy', industry: 'consulting', note: 'Salesforce consultancy with dedicated data and analytics teams.', url: 'https://www.slalom.com' },
  { name: 'Capgemini', type: 'consultancy', industry: 'consulting', note: 'Global SI whose Salesforce practice covers analytics and data work.', url: 'https://www.capgemini.com' },
  { name: 'PwC', type: 'consultancy', industry: 'consulting', note: 'Salesforce alliance partner with an analytics and insights practice.', url: 'https://www.pwc.com' },
  { name: 'IBM Consulting', type: 'consultancy', industry: 'consulting', note: 'Large Salesforce SI pairing CRM delivery with data and AI expertise.', url: 'https://www.ibm.com' },
  { name: 'Silverline', type: 'consultancy', industry: 'consulting', note: 'Salesforce consultancy for financial services and healthcare, including analytics work.' }
]

const industryIcons: Record<Industry, string> = {
  finance: 'i-lucide-landmark',
  insurance: 'i-lucide-shield',
  healthcare: 'i-lucide-heart-pulse',
  manufacturing: 'i-lucide-factory',
  retail: 'i-lucide-shopping-bag',
  technology: 'i-lucide-cpu',
  energy: 'i-lucide-zap',
  telecom: 'i-lucide-radio-tower',
  nonprofit: 'i-lucide-hand-heart',
  consulting: 'i-lucide-briefcase'
}

const industryKeys = Object.keys(industryIcons) as Industry[]

const typeFilter = ref<'all' | CompanyType>('all')
const industryFilter = ref<'all' | Industry>('all')

const typeItems = computed(() => [
  { label: t('companies.allTypes'), value: 'all' },
  { label: t('companies.typeCustomer'), value: 'customer' },
  { label: t('companies.typeConsultancy'), value: 'consultancy' }
])

const industryItems = computed(() => [
  { label: t('companies.allIndustries'), value: 'all' },
  ...industryKeys.map(key => ({ label: t(`companies.industries.${key}`), value: key }))
])

const filtered = computed(() => companies.filter(c =>
  (typeFilter.value === 'all' || c.type === typeFilter.value)
  && (industryFilter.value === 'all' || c.industry === industryFilter.value)
))

const hasFilters = computed(() => typeFilter.value !== 'all' || industryFilter.value !== 'all')

function resetFilters() {
  typeFilter.value = 'all'
  industryFilter.value = 'all'
}

useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'name': title.value,
  'description': description.value,
  'url': `${SITE.url}/companies`,
  'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
  'itemListElement': companies.map((c, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'item': {
      '@type': 'Organization',
      'name': c.name,
      ...(c.url ? { url: c.url } : {})
    }
  }))
})
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <UPageHeader
      :headline="t('companies.eyebrow')"
      :title="t('companies.title')"
      :description="t('companies.subtitle')"
    />

    <div class="mt-8 flex flex-wrap items-center gap-3">
      <UTabs
        v-model="typeFilter"
        :items="typeItems"
        :content="false"
        color="primary"
        size="sm"
      />
      <USelect
        v-model="industryFilter"
        :items="industryItems"
        :placeholder="t('companies.filterIndustry')"
        icon="i-lucide-filter"
        size="sm"
        class="w-56"
      />
      <UButton
        v-if="hasFilters"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="resetFilters"
      >
        {{ t('companies.reset') }}
      </UButton>
    </div>

    <UPageGrid
      v-if="filtered.length"
      class="mt-8"
    >
      <UPageCard
        v-for="company in filtered"
        :key="company.name"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UIcon
              :name="industryIcons[company.industry]"
              class="size-5"
            />
          </div>
          <div class="flex flex-wrap justify-end gap-1.5">
            <UBadge
              :label="company.type === 'customer' ? t('companies.typeCustomer') : t('companies.typeConsultancy')"
              :color="company.type === 'customer' ? 'primary' : 'neutral'"
              variant="subtle"
              size="sm"
            />
            <UBadge
              :label="t(`companies.industries.${company.industry}`)"
              color="neutral"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
        <h3 class="mt-4 font-semibold text-highlighted">
          {{ company.name }}
        </h3>
        <p class="mt-1 text-sm text-muted">
          {{ company.note }}
        </p>
        <UButton
          v-if="company.url"
          :to="company.url"
          target="_blank"
          rel="noopener"
          :label="company.url.replace(/^https:\/\/(www\.)?/, '')"
          trailing-icon="i-lucide-arrow-up-right"
          color="neutral"
          variant="link"
          size="xs"
          class="mt-3 px-0"
        />
      </UPageCard>
    </UPageGrid>

    <div
      v-else
      class="mt-12 flex flex-col items-center gap-4 py-12 text-center"
    >
      <UIcon
        name="i-lucide-search-x"
        class="size-8 text-dimmed"
      />
      <p class="text-muted">
        {{ t('companies.empty') }}
      </p>
      <UButton
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="subtle"
        size="sm"
        @click="resetFilters"
      >
        {{ t('companies.reset') }}
      </UButton>
    </div>

    <p class="mt-12 text-xs text-dimmed">
      {{ t('companies.disclaimer') }}
    </p>
  </UContainer>
</template>
