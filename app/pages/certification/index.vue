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
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:px-8">
        <div>
          <p class="eyebrow">
            {{ t('cert.eyebrow') }}
          </p>
          <h1 class="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-(--ink) sm:text-4xl">
            {{ t('cert.title') }}
          </h1>
          <p class="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-(--ink2)">
            {{ t('cert.lead') }}
          </p>
          <dl class="mt-5 grid max-w-lg grid-cols-4 overflow-hidden rounded-[6px] border border-(--line) bg-(--paper)">
            <div
              v-for="f in facts"
              :key="f.label"
              class="border-(--line) px-3 py-2.5 text-center not-last:border-e"
            >
              <dd class="text-xl font-bold tabular-nums text-(--ink)">
                {{ f.value }}
              </dd>
              <dt class="mt-0.5 text-[11px] font-medium text-(--ink2)">
                {{ f.label }}
              </dt>
            </div>
          </dl>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <UButton
              :to="localePath(`/certification/${paper.id}`)"
              size="lg"
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

        <div class="mx-auto w-full max-w-md">
          <p class="mb-3 text-center text-[11px] font-bold uppercase tracking-[.09em] text-(--label)">
            {{ t('cert.earn') }}
          </p>
          <ClientOnly>
            <CourseCertificate
              :name="user?.name || ''"
              :score="best[paper.id]?.best ?? null"
              sample
              animate
            />
            <template #fallback>
              <CourseCertificate
                sample
                animate
              />
            </template>
          </ClientOnly>
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <div class="min-w-0 space-y-6">
        <!-- The papers -->
        <section>
          <h2 class="bp-h3">
            {{ t('cert.papersTitle') }}
          </h2>
          <ul class="mt-4 grid gap-4 sm:grid-cols-2">
            <li
              v-for="p in PAPERS"
              :key="p.id"
            >
              <NuxtLink
                :to="localePath(`/certification/${p.id}`)"
                class="bp-card bp-card--hover group flex h-full flex-col overflow-hidden"
              >
                <!-- Thumbnail: an answer sheet, a timer and a score ring -->
                <svg
                  viewBox="0 0 320 150"
                  class="block w-full border-b border-(--line) bg-(--ice)"
                  aria-hidden="true"
                >
                  <rect
                    x="24"
                    y="18"
                    width="170"
                    height="150"
                    rx="4"
                    fill="var(--card)"
                    stroke="var(--line)"
                  />
                  <g
                    v-for="(q, k) in [0, 1, 2, 3]"
                    :key="q"
                  >
                    <rect
                      x="40"
                      :y="36 + k * 28"
                      width="70"
                      height="6"
                      rx="3"
                      fill="var(--ink2)"
                      opacity=".35"
                    />
                    <circle
                      v-for="c in 4"
                      :key="c"
                      :cx="112 + c * 16"
                      :cy="39 + k * 28"
                      r="5"
                      :fill="c === [2, 4, 1, 3][k] ? 'var(--signal)' : 'none'"
                      stroke="var(--signal)"
                      stroke-width="1.5"
                    />
                  </g>
                  <circle
                    cx="250"
                    cy="66"
                    r="34"
                    fill="none"
                    stroke="var(--line)"
                    stroke-width="8"
                  />
                  <circle
                    cx="250"
                    cy="66"
                    r="34"
                    fill="none"
                    stroke="var(--signal)"
                    stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray="145 214"
                    transform="rotate(-90 250 66)"
                  />
                  <text
                    x="250"
                    y="72"
                    text-anchor="middle"
                    font-size="17"
                    font-weight="700"
                    fill="var(--ink)"
                  >{{ EXAM.passPct }}%</text>
                  <g transform="translate(222 112)">
                    <rect
                      width="56"
                      height="22"
                      rx="11"
                      fill="var(--navy)"
                    />
                    <text
                      x="28"
                      y="15"
                      text-anchor="middle"
                      font-size="11"
                      font-weight="700"
                      fill="#fff"
                    >{{ p.minutes }}′</text>
                  </g>
                </svg>
                <span class="flex flex-1 flex-col p-6">
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
        <PromoSlot unit="square300x250" />
      </aside>
    </div>
  </div>
</template>
