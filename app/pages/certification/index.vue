<script setup lang="ts">
/**
 * Certification practice: the exam's format and domains, and one full
 * practice paper in the real exam's shape. Prerendered;
 * a signed-in learner's best scores load in the browser.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn, user } = useAuth()

const best = ref<Record<string, { best: number, attempts: number }>>({})
onMounted(async () => {
  if (!isSignedIn.value) return
  best.value = await $fetch<typeof best.value>('/api/exam-attempt').catch(() => ({}))
})
watch(isSignedIn, async (ok) => {
  if (ok) best.value = await $fetch<typeof best.value>('/api/exam-attempt').catch(() => ({}))
})
const paper = PAPERS[0]!
const domainList = Object.entries(DOMAINS).map(([key, d]) => ({ key, ...d }))
const facts = computed(() => [
  { label: t('cert.facts.questions'), value: EXAM.questions },
  { label: t('cert.facts.minutes'), value: EXAM.minutes },
  { label: t('cert.facts.pass'), value: `${EXAM.passPct}%` },
  { label: t('cert.facts.bank'), value: 367 }
])

const title = computed(() => t('cert.seoTitle'))
const description = computed(() => t('cert.seoDesc', { q: EXAM.questions, m: EXAM.minutes, p: EXAM.passPct }))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value, headline: t('cert.eyebrow'), spec: `${EXAM.questions} Q · ${EXAM.minutes} MIN · ${EXAM.passPct}% TO PASS` })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  trail: [{ name: t('cert.eyebrow'), path: '/certification' }],
  extra: [{
    '@type': 'Course',
    'name': `${EXAM.name} — practice exams`,
    'description': description.value,
    'provider': { '@type': 'Organization', 'name': SITE.name, 'url': SITE.url },
    'isAccessibleForFree': true,
    'offers': { '@type': 'Offer', 'category': 'Free', 'price': '0', 'priceCurrency': 'USD' },
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': `PT${EXAM.minutes}M` },
    'educationalCredentialAwarded': 'Practice for the Salesforce Certified CRM Analytics and Einstein Discovery Consultant exam',
    'hasPart': PAPERS.map(p => ({ '@type': 'Quiz', 'name': p.title, 'url': `${SITE.url}${localePath(`/certification/${p.id}`)}`, 'educationalLevel': p.kind === 'full' ? 'Full exam' : 'Domain drill', 'about': p.domain ? DOMAINS[p.domain].label : EXAM.name }))
  }]
}))
</script>

<template>
  <div class="bg-(--paper)">
    <!-- HERO: the exam on the left, the certificate you earn on the right -->
    <section class="relative overflow-hidden border-b border-(--line) bg-(--card)">
      <BpFloatCharts />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-8 lg:py-20">
        <div>
          <p class="eyebrow">
            {{ t('cert.eyebrow') }}
          </p>
          <h1 class="bp-h1 mt-3">
            {{ t('cert.title') }}
          </h1>
          <p class="bp-lead mt-4 max-w-xl">
            {{ t('cert.lead') }}
          </p>
          <dl class="mt-7 grid max-w-lg grid-cols-4 overflow-hidden rounded-[6px] border border-(--line) bg-(--paper)">
            <div
              v-for="f in facts"
              :key="f.label"
              class="border-(--line) px-3 py-3 text-center not-last:border-e"
            >
              <dd class="text-xl font-bold tabular-nums text-(--ink)">
                {{ f.value }}
              </dd>
              <dt class="mt-0.5 text-[11px] font-medium text-(--ink2)">
                {{ f.label }}
              </dt>
            </div>
          </dl>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              :to="localePath(`/certification/${paper.id}`)"
              size="xl"
              icon="i-lucide-play"
              class="px-7"
            >
              {{ t('cert.startFirst') }}
            </UButton>
            <ClientOnly>
              <span
                v-if="best[paper.id]"
                class="text-sm text-(--ink2)"
              >
                <span :class="best[paper.id]!.best >= EXAM.passPct ? 'font-semibold text-(--signal)' : ''">{{ t('cert.best', { pct: best[paper.id]!.best }) }}</span>
                · {{ t('cert.attempts', { n: best[paper.id]!.attempts }) }}
              </span>
            </ClientOnly>
          </div>
        </div>

        <div class="mx-auto w-full max-w-xl">
          <p class="mb-3 text-center text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">
            {{ t('cert.earn') }}
          </p>
          <ClientOnly>
            <CourseCertificate
              :name="user?.name || ''"
              :score="best[paper.id]?.best ?? null"
              sample
            />
            <template #fallback>
              <CourseCertificate sample />
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <div class="min-w-0 space-y-6">
        <!-- The papers -->
        <section>
          <h2 class="bp-h2">
            {{ t('cert.papersTitle') }}
          </h2>
          <ul class="mt-6 grid gap-4 sm:grid-cols-2">
            <li
              v-for="p in PAPERS"
              :key="p.id"
            >
              <NuxtLink
                :to="localePath(`/certification/${p.id}`)"
                class="bp-card bp-card--hover group flex h-full flex-col p-6"
              >
                <span class="flex items-center gap-3">
                  <span class="bp-iconbox">
                    <UIcon
                      name="i-lucide-file-check-2"
                      class="size-5"
                    />
                  </span>
                  <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em] text-success">{{ t('pro.freeLesson') }}</span>
                </span>
                <span class="mt-4 text-lg font-bold text-(--ink) group-hover:text-(--signal)">{{ p.title }}</span>
                <span class="mt-1 text-sm text-(--ink2)">{{ t('cert.paperLine', { q: p.questions, m: p.minutes, p: EXAM.passPct }) }}</span>
                <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-(--signal)">
                  {{ t('cert.startFirst') }}
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4"
                  />
                </span>
              </NuxtLink>
            </li>
            <li class="flex flex-col justify-center rounded-[6px] border border-dashed border-(--line) p-6 text-(--ink2)">
              <UIcon
                name="i-lucide-layers"
                class="size-5 text-(--label)"
              />
              <span class="mt-3 font-semibold text-(--ink)">{{ t('cert.morePapers') }}</span>
              <span class="mt-1 text-sm">{{ t('cert.morePapersBody') }}</span>
            </li>
          </ul>
        </section>

        <!-- How it works -->
        <section class="rounded-[6px] border border-(--line) bg-(--card) p-6 sm:p-8">
          <h2 class="text-lg font-bold text-(--ink)">
            {{ t('cert.howTitle') }}
          </h2>
          <ol class="mt-5 grid gap-4 sm:grid-cols-2">
            <li
              v-for="i in 5"
              :key="i"
              class="flex gap-3 text-[0.9375rem] leading-relaxed text-(--ink2)"
            >
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--ice) text-sm font-bold text-(--signal)">{{ i }}</span>
              {{ t(`cert.how.${i}`) }}
            </li>
          </ol>
          <p class="mt-6 rounded-[4px] bg-(--ice) px-4 py-3 text-sm text-(--ink2)">
            {{ t('cert.disclaimer') }}
          </p>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-[6px] border border-(--line) bg-(--card) p-6">
          <h2 class="mono-label">
            {{ t('cert.domains') }}
          </h2>
          <ul class="mt-4 space-y-3">
            <li
              v-for="d in domainList"
              :key="d.key"
            >
              <div class="flex justify-between gap-2 text-sm">
                <span class="text-(--ink)">{{ d.label }}</span><span class="tabular-nums text-(--ink2)">{{ d.weight }}%</span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--line)">
                <div
                  class="h-full rounded-full bg-(--signal)"
                  :style="{ width: `${d.weight * 4}%` }"
                />
              </div>
            </li>
          </ul>
        </section>
        <NuxtLink
          :to="localePath('/interview-questions')"
          class="group block rounded-[6px] bg-(--navy) p-6 text-white"
        >
          <UIcon
            name="i-lucide-messages-square"
            class="size-5 text-(--glow)"
          />
          <p class="mt-3 text-lg font-semibold">{{ t('interview.ctaTitle') }}</p>
          <p class="mt-1 text-sm text-white/70">{{ t('interview.ctaBody') }}</p>
          <span class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--glow)">{{ t('interview.eyebrow') }}<UIcon
            name="i-lucide-arrow-right"
            class="size-4 transition-transform group-hover:translate-x-0.5"
          /></span>
        </NuxtLink>
        <PromoSlot unit="square300x250" />
        <ShareBar
          :title="t('cert.title')"
          :text="t('cert.shareText')"
          compact
        />
      </aside>
    </div>
  </div>
</template>
