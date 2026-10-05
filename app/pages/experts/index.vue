<script setup lang="ts">
import type { PublicExpert } from '~/utils/experts'

/**
 * The experts network: freelance CRM Analytics specialists who deliver
 * projects together. Every project has a named lead and a second expert who
 * reviews the work — shared responsibility is the whole offer.
 *
 * Prerendered in every locale. The roster is the only live part: it is
 * fetched in the browser (server: false), so the build never needs the
 * database and the page still renders, with an empty state, if the API is
 * unreachable. The project form posts to the shared lead pipeline
 * (/api/leads, type `project`).
 */
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const title = computed(() => t('experts.seo.title'))
const description = computed(() => t('experts.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value })

const SERVICE_ICONS: Record<typeof PROJECT_SERVICES[number], string> = {
  dashboards: 'i-lucide-layout-dashboard',
  pipelines: 'i-lucide-workflow',
  saql: 'i-lucide-code-xml',
  security: 'i-lucide-shield-check',
  einstein: 'i-lucide-sparkles',
  rescue: 'i-lucide-life-buoy',
  training: 'i-lucide-graduation-cap'
}
const services = computed(() => PROJECT_SERVICES.map(key => ({
  key,
  icon: SERVICE_ICONS[key],
  title: t(`experts.services.${key}`),
  text: t(`experts.servicesDesc.${key}`)
})))

const STEP_ICONS = ['i-lucide-file-text', 'i-lucide-phone', 'i-lucide-users', 'i-lucide-flag', 'i-lucide-package-check']
const steps = computed(() => (tm('experts.how.steps') as { t: string, d: string }[]).map((s, i) => ({
  n: String(i + 1).padStart(2, '0'),
  icon: STEP_ICONS[i] ?? 'i-lucide-circle',
  title: rt(s.t),
  text: rt(s.d)
})))

const heroPoints = computed(() => (tm('experts.hero.points') as string[]).map(p => rt(p)))
const contactPoints = computed(() => (tm('experts.contact.points') as string[]).map(p => rt(p)))

const faqs = computed(() => (tm('experts.faq.items') as { q: string, a: string }[]).map(f => ({ q: rt(f.q), a: rt(f.a) })))
const faqItems = computed(() => faqs.value.map(f => ({ label: f.q, content: f.a, icon: 'i-lucide-circle-help' })))

// The roster — client-side only, see above.
const { data: roster, status: rosterStatus } = useLazyFetch<{ experts: PublicExpert[] }>('/api/experts', {
  server: false,
  default: () => ({ experts: [] })
})
const experts = computed(() => roster.value?.experts ?? [])
const rosterLoading = computed(() => rosterStatus.value === 'idle' || rosterStatus.value === 'pending')

const skillKeys = new Set<string>(EXPERT_SKILLS)
const skillLabel = (s: string) => (skillKeys.has(s) ? t(`experts.skills.${s}`) : s)
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
const brokenPhoto = reactive<Record<number, boolean>>({})

usePageSchema(() => ({
  name: title.value,
  description: description.value,
  extra: [
    {
      '@type': 'Service',
      'name': title.value,
      'description': description.value,
      'serviceType': 'Salesforce CRM Analytics consulting and implementation',
      'provider': { '@type': 'Organization', '@id': ORG_ID, 'name': SITE.name, 'url': SITE.url },
      'areaServed': 'Worldwide',
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': t('experts.deliver.title'),
        'itemListElement': services.value.map(s => ({
          '@type': 'Offer',
          'itemOffered': { '@type': 'Service', 'name': s.title, 'description': s.text }
        }))
      }
    },
    {
      '@type': 'FAQPage',
      'mainEntity': faqs.value.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } }))
    }
  ]
}))
</script>

<template>
  <div>
    <BpPageHeader
      :sheet="t('experts.sheet')"
      :title="t('experts.hero.title')"
      :lead="t('experts.hero.lead')"
    >
      <div class="mt-8 flex flex-wrap gap-3">
        <UButton
          to="#contact"
          size="lg"
          icon="i-lucide-send"
        >
          {{ t('experts.hero.hire') }}
        </UButton>
        <UButton
          :to="localePath('/experts/join')"
          size="lg"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('experts.hero.join') }}
        </UButton>
      </div>
      <ul class="mt-8 grid max-w-3xl gap-2 sm:grid-cols-3">
        <li
          v-for="p in heroPoints"
          :key="p"
          class="flex items-start gap-2 text-sm text-(--ink2)"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-0.5 size-4 flex-none text-(--signal)"
          />
          {{ p }}
        </li>
      </ul>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-24 px-4 py-16 sm:px-6 lg:px-8">
      <!-- What the network delivers -->
      <section>
        <p class="eyebrow">
          {{ t('experts.deliver.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-4">
          {{ t('experts.deliver.title') }}
        </h2>
        <p class="bp-lead mt-4 max-w-2xl">
          {{ t('experts.deliver.lead') }}
        </p>
        <div class="mt-10 grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))]">
          <div
            v-for="s in services"
            :key="s.key"
            class="bp-card bp-card--hover p-5"
          >
            <span class="bp-iconbox size-10">
              <UIcon
                :name="s.icon"
                class="size-5"
              />
            </span>
            <h3 class="mt-4 text-lg font-extrabold tracking-[-0.01em] text-(--ink)">
              {{ s.title }}
            </h3>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ s.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- How delivery works -->
      <section>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p class="eyebrow">
              {{ t('experts.how.eyebrow') }}
            </p>
            <h2 class="bp-h2 mt-4">
              {{ t('experts.how.title') }}
            </h2>
          </div>
          <p class="bp-lead">
            {{ t('experts.how.lead') }}
          </p>
        </div>
        <ol class="mt-10 grid border-[1.5px] border-(--ink) bg-(--card) sm:grid-cols-2 lg:grid-cols-5">
          <li
            v-for="(s, i) in steps"
            :key="s.n"
            class="relative p-5"
            :class="[
              i < steps.length - 1 ? 'border-b-[1.5px] border-(--ink) lg:border-b-0 lg:border-e-[1.5px]' : '',
              i % 2 === 0 && i < steps.length - 1 ? 'sm:border-e-[1.5px]' : '',
              i === 2 ? 'bg-(--ice)' : ''
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs text-(--signal)">{{ s.n }}</span>
              <UIcon
                :name="s.icon"
                class="size-5 text-(--signal)"
              />
            </div>
            <h3 class="mt-4 font-extrabold text-(--ink)">
              {{ s.title }}
            </h3>
            <p class="mt-1.5 text-sm text-(--ink2)">
              {{ s.text }}
            </p>
          </li>
        </ol>
      </section>

      <!-- The roster -->
      <section>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow">
              {{ t('experts.roster.eyebrow') }}
            </p>
            <h2 class="bp-h2 mt-4">
              {{ t('experts.roster.title') }}
            </h2>
            <p class="bp-lead mt-4">
              {{ t('experts.roster.lead') }}
            </p>
          </div>
          <UButton
            :to="localePath('/experts/join')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('experts.hero.join') }}
          </UButton>
        </div>

        <div
          v-if="rosterLoading"
          class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          :aria-label="t('experts.roster.loading')"
          aria-busy="true"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="h-56 animate-pulse border-[1.5px] border-(--line) bg-(--ice)/60 motion-reduce:animate-none"
          />
        </div>

        <div
          v-else-if="experts.length"
          class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="e in experts"
            :key="e.id"
            class="bp-card flex flex-col p-5"
          >
            <div class="flex items-start gap-4">
              <div class="size-16 flex-none overflow-hidden border-[1.5px] border-(--ink) bg-(--signal)">
                <img
                  v-if="e.photoUrl && !brokenPhoto[e.id]"
                  :src="e.photoUrl"
                  :alt="e.name"
                  width="64"
                  height="64"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  class="size-full object-cover"
                  @error="brokenPhoto[e.id] = true"
                >
                <span
                  v-else
                  class="flex size-full items-center justify-center text-xl font-black text-white"
                >{{ initials(e.name) }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg font-extrabold leading-tight text-(--ink)">
                  {{ e.name }}
                </h3>
                <p
                  v-if="e.headline"
                  class="mt-1 text-sm text-(--ink2)"
                >
                  {{ e.headline }}
                </p>
                <p class="mono-label mt-2">
                  <span v-if="e.years != null">{{ t('experts.roster.years', { n: e.years }) }}</span>
                  <span v-if="e.years != null && e.country"> · </span>
                  <span v-if="e.country">{{ e.country }}</span>
                </p>
              </div>
            </div>
            <ul
              v-if="e.skills.length"
              class="mt-4 flex flex-wrap gap-1.5"
            >
              <li
                v-for="s in e.skills"
                :key="s"
                class="border-[1.5px] border-(--line) px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-(--ink)"
              >
                {{ skillLabel(s) }}
              </li>
            </ul>
            <div
              v-if="e.linkedinUrl || e.portfolioUrl"
              class="mt-auto flex flex-wrap gap-2 pt-5"
            >
              <UButton
                v-if="e.linkedinUrl"
                :to="e.linkedinUrl"
                target="_blank"
                rel="noopener"
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-simple-icons-linkedin"
              >
                {{ t('experts.roster.linkedin') }}
              </UButton>
              <UButton
                v-if="e.portfolioUrl"
                :to="e.portfolioUrl"
                target="_blank"
                rel="noopener"
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-external-link"
              >
                {{ t('experts.roster.portfolio') }}
              </UButton>
            </div>
          </article>
        </div>

        <div
          v-else
          class="graph-paper-fine mt-10 border-[1.5px] border-dashed border-(--ink2) bg-(--card) p-10 text-center"
        >
          <UIcon
            name="i-lucide-users-round"
            class="mx-auto size-8 text-(--signal)"
          />
          <p class="mt-3 text-lg font-extrabold text-(--ink)">
            {{ t('experts.roster.emptyTitle') }}
          </p>
          <p class="mx-auto mt-2 max-w-lg text-sm text-(--ink2)">
            {{ t('experts.roster.emptyBody') }}
          </p>
          <UButton
            :to="localePath('/experts/join')"
            class="mt-5"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('experts.roster.emptyCta') }}
          </UButton>
        </div>
      </section>

      <!-- FAQ -->
      <section
        v-if="faqItems.length"
        class="mx-auto max-w-3xl"
      >
        <div class="border-[1.5px] border-(--ink) bg-(--card)">
          <div class="flex items-center justify-between border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-4">
            <h2 class="text-xl font-extrabold text-(--ink)">
              {{ t('experts.faq.title') }}
            </h2>
            <UIcon
              name="i-lucide-message-circle-question"
              class="size-5 text-(--signal)"
            />
          </div>
          <UAccordion
            :items="faqItems"
            :ui="{ root: 'px-5' }"
          />
        </div>
      </section>

      <!-- Project request -->
      <section
        id="contact"
        class="grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
      >
        <div>
          <p class="eyebrow">
            {{ t('experts.contact.eyebrow') }}
          </p>
          <h2 class="bp-h2 mt-4">
            {{ t('experts.contact.title') }}
          </h2>
          <p class="bp-lead mt-4">
            {{ t('experts.contact.lead') }}
          </p>
          <ul class="mt-6 space-y-2">
            <li
              v-for="p in contactPoints"
              :key="p"
              class="flex items-start gap-2 text-sm text-(--ink2)"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 flex-none text-(--signal)"
              />
              {{ p }}
            </li>
          </ul>
        </div>
        <LeadForm type="project" />
      </section>
    </div>
  </div>
</template>
