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
const sets = PAPERS.filter(p => p.kind === 'full')
const drills = PAPERS.filter(p => p.kind === 'drill')
const DRILL_ICONS: Record<string, string> = {
  'data-layer': 'i-lucide-workflow',
  'security': 'i-lucide-shield-check',
  'admin': 'i-lucide-settings-2',
  'dashboard-design': 'i-lucide-layout-dashboard',
  'dashboard-implementation': 'i-lucide-link-2',
  'einstein-discovery': 'i-lucide-sparkles'
}
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
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:px-8">
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

        <div class="mx-auto w-full max-w-sm lg:max-w-none">
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
        <!-- Full exam sets, as sealed packs -->
        <section>
          <h2 class="bp-h3">
            {{ t('cert.setsTitle') }}
          </h2>
          <ul class="mt-4 grid gap-4 sm:grid-cols-3">
            <li
              v-for="(p, i) in sets"
              :key="p.id"
            >
              <UTooltip :text="t('cert.paperLine', { q: p.questions, m: p.minutes, p: EXAM.passPct })">
                <NuxtLink
                  :to="localePath(`/certification/${p.id}`)"
                  class="pack group relative flex h-56 w-full flex-col justify-between overflow-hidden rounded-[10px] bg-(--navy) p-5 text-white"
                >
                  <span
                    class="pack-foil"
                    aria-hidden="true"
                  />
                  <span class="relative flex items-center justify-between">
                    <span class="text-[11px] font-bold uppercase tracking-[.12em] text-blueprint-200">{{ t('cert.eyebrow') }}</span>
                    <ClientOnly>
                      <span
                        v-if="best[p.id]"
                        class="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.08em]"
                      >{{ t('cert.best', { pct: best[p.id]!.best }) }}</span>
                      <span
                        v-else
                        class="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.08em]"
                      ><UIcon
                        name="i-lucide-lock-keyhole"
                        class="size-3"
                      />{{ t('cert.sealed') }}</span>
                    </ClientOnly>
                  </span>
                  <span class="relative">
                    <span class="block text-5xl font-bold tracking-tight">{{ String(i + 1).padStart(2, '0') }}</span>
                    <span class="mt-1 block font-semibold">{{ p.title }}</span>
                  </span>
                  <span class="relative flex items-center justify-between text-sm text-white/70">
                    <span class="flex items-center gap-3">
                      <span class="flex items-center gap-1"><UIcon
                        name="i-lucide-list-checks"
                        class="size-4"
                      />{{ p.questions }}</span>
                      <span class="flex items-center gap-1"><UIcon
                        name="i-lucide-timer"
                        class="size-4"
                      />{{ p.minutes }}′</span>
                    </span>
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="size-5 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                  <span
                    class="pack-seal"
                    aria-hidden="true"
                  >{{ EXAM.passPct }}%</span>
                </NuxtLink>
              </UTooltip>
            </li>
          </ul>
        </section>

        <!-- Domain drills -->
        <section>
          <h2 class="bp-h3">
            {{ t('cert.drillsTitle') }}
          </h2>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li
              v-for="p in drills"
              :key="p.id"
            >
              <NuxtLink
                :to="localePath(`/certification/${p.id}`)"
                class="group flex items-center gap-3 rounded-[8px] border border-(--line) bg-(--card) p-4 transition-colors hover:border-(--signal)"
              >
                <span class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-(--ice) text-(--signal) transition-colors group-hover:bg-(--signal) group-hover:text-white">
                  <UIcon
                    :name="DRILL_ICONS[p.domain!] ?? 'i-lucide-target'"
                    class="size-5"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold text-(--ink)">{{ DOMAINS[p.domain!].label }}</span>
                  <span class="block text-xs text-(--ink2)">{{ p.questions }} Q · {{ p.minutes }} min<ClientOnly><template v-if="best[p.id]"> · {{ t('cert.best', { pct: best[p.id]!.best }) }}</template></ClientOnly></span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <NuxtLink
          :to="localePath('/capstone')"
          class="group flex items-center gap-4 rounded-[8px] bg-(--navy) p-5 text-white"
        >
          <span class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-blueprint-200">
            <UIcon
              name="i-lucide-award"
              class="size-6"
            />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-bold">{{ t('capstone.title') }}</span>
            <span class="block text-sm text-white/70">{{ t('capstone.lead') }}</span>
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>

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

<style scoped>
.pack { transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s }
.pack:hover { transform: translateY(-4px) rotate(-.5deg); box-shadow: 0 18px 36px -18px rgb(3 45 96 / .6) }
.pack-foil {
  position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgb(124 190 255 / .18) 45%, rgb(255 255 255 / .08) 50%, transparent 65%);
  background-size: 250% 100%; background-position: 100% 0;
  transition: background-position .8s ease
}
.pack:hover .pack-foil { background-position: 0 0 }
.pack::before { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(135deg, rgb(255 255 255 / .03) 0 2px, transparent 2px 10px) }
.pack-seal {
  position: absolute; right: 18px; top: 46px;
  display: flex; width: 64px; height: 64px; align-items: center; justify-content: center;
  border-radius: 9999px; border: 2px dashed rgb(124 190 255 / .6); color: #9fd0ff;
  font-size: 13px; font-weight: 800; transform: rotate(-12deg);
  transition: transform .4s cubic-bezier(.2, .8, .2, 1)
}
.pack:hover .pack-seal { transform: rotate(8deg) scale(1.06) }
@media (prefers-reduced-motion: reduce) { .pack, .pack-foil, .pack-seal { transition: none } }
</style>
