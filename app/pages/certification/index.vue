<script setup lang="ts">
/**
 * Certification practice: the exam's format and domains, and one full
 * practice paper in the real exam's shape. Prerendered;
 * a signed-in learner's best scores load in the browser.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

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
    <!-- Hero: what it is, one action -->
    <section class="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:pt-24">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-(--ice) px-3 py-1 text-xs font-medium text-(--ink2)">
        <UIcon
          name="i-lucide-badge-check"
          class="size-3.5 text-(--signal)"
        />{{ t('cert.eyebrow') }}
      </span>
      <h1 class="mt-5 text-4xl font-bold tracking-tight text-(--ink) sm:text-5xl">
        {{ t('cert.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-(--ink2)">
        {{ t('cert.lead') }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <UButton
          :to="localePath(`/certification/${paper.id}`)"
          size="xl"
          icon="i-lucide-play"
          class="px-7"
        >
          {{ t('cert.startFirst') }}
        </UButton>
        <ShareBar
          :title="t('cert.title')"
          :text="t('cert.shareText')"
          compact
        />
      </div>
      <ClientOnly>
        <p
          v-if="best[paper.id]"
          class="mt-4 text-sm text-(--ink2)"
        >
          <span :class="best[paper.id]!.best >= EXAM.passPct ? 'font-semibold text-(--signal)' : ''">{{ t('cert.best', { pct: best[paper.id]!.best }) }}</span>
          · {{ t('cert.attempts', { n: best[paper.id]!.attempts }) }}
        </p>
      </ClientOnly>
    </section>

    <div class="mx-auto max-w-5xl space-y-6 px-4 pb-20 sm:px-6">
      <!-- The format -->
      <dl class="grid grid-cols-2 overflow-hidden rounded-3xl border border-(--line) bg-(--card) sm:grid-cols-4">
        <div
          v-for="f in [
            { icon: 'i-lucide-list-checks', label: t('cert.facts.questions'), value: EXAM.questions },
            { icon: 'i-lucide-timer', label: t('cert.facts.minutes'), value: EXAM.minutes },
            { icon: 'i-lucide-target', label: t('cert.facts.pass'), value: `${EXAM.passPct}%` },
            { icon: 'i-lucide-library', label: t('cert.facts.bank'), value: 367 }
          ]"
          :key="f.label"
          class="flex flex-col items-center gap-1 border-(--line) px-4 py-7 not-last:border-e max-sm:nth-2:border-e-0 max-sm:[&:nth-child(-n+2)]:border-b"
        >
          <UIcon
            :name="f.icon"
            class="size-5 text-(--signal)"
          />
          <dd class="text-3xl font-semibold tabular-nums tracking-tight text-(--ink)">
            {{ f.value }}
          </dd>
          <dt class="text-xs font-medium text-(--ink2)">
            {{ f.label }}
          </dt>
        </div>
      </dl>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <!-- How it works -->
        <section class="rounded-3xl border border-(--line) bg-(--card) p-6 sm:p-8">
          <h2 class="text-lg font-semibold text-(--ink)">
            {{ t('cert.howTitle') }}
          </h2>
          <ul class="mt-5 space-y-3 text-[15px] leading-relaxed text-(--ink2)">
            <li
              v-for="i in 5"
              :key="i"
              class="flex gap-3"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-1 size-4 flex-none text-(--signal)"
              />{{ t(`cert.how.${i}`) }}
            </li>
          </ul>
          <p class="mt-6 rounded-2xl bg-(--ice) px-4 py-3 text-sm text-(--ink2)">
            {{ t('cert.disclaimer') }}
          </p>
        </section>

        <!-- Domain weights -->
        <aside class="space-y-6">
          <section class="rounded-3xl border border-(--line) bg-(--card) p-6">
            <h2 class="text-sm font-semibold text-(--ink)">
              {{ t('cert.domains') }}
            </h2>
            <ul class="mt-4 space-y-3">
              <li
                v-for="d in domainList"
                :key="d.key"
              >
                <div class="flex justify-between text-sm">
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
            class="group block rounded-3xl bg-(--navy) p-6 text-white transition-transform hover:-translate-y-0.5"
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
        </aside>
      </div>
    </div>
  </div>
</template>
