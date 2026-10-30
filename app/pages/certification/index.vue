<script setup lang="ts">
/**
 * Certification practice: the exam's format and domains, five full practice
 * papers in the real exam's shape, and a timed drill per domain. Prerendered;
 * a signed-in learner's best scores load in the browser.
 *
 * A paper opens in its own window (`?w=1`, focus mode, a ✕ to close) so the
 * course stays where the learner left it; best scores refresh when they come
 * back to this tab. Modified clicks and blocked pop-ups fall back to a link.
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
const refreshBest = async () => {
  if (isSignedIn.value) best.value = await $fetch<typeof best.value>('/api/exam-attempt').catch(() => best.value)
}
onMounted(() => window.addEventListener('focus', refreshBest))
onBeforeUnmount(() => window.removeEventListener('focus', refreshBest))

function openPaper(e: MouseEvent, id: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  const url = `${localePath(`/certification/${id}`)}?w=1`
  const w = Math.min(1400, screen.availWidth)
  const h = Math.min(900, screen.availHeight)
  const win = window.open(url, 'crma-exam', `popup,width=${w},height=${h},left=${(screen.availWidth - w) / 2},top=${(screen.availHeight - h) / 2}`)
  useNuxtApp().$track?.('exam_open', id)
  if (win) win.focus()
  else navigateTo(url)
}

const full = PAPERS.filter(p => p.kind === 'full')
const drills = PAPERS.filter(p => p.kind === 'drill')
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
  <div>
    <BpPageHeader
      :sheet="t('cert.eyebrow')"
      :title="t('cert.title')"
      :lead="t('cert.lead')"
    >
      <div class="mt-6 flex flex-wrap gap-3">
        <UButton
          :to="localePath('/certification/paper-1')"
          icon="i-lucide-external-link"
          size="lg"
          @click="openPaper($event, 'paper-1')"
        >
          {{ t('cert.startFirst') }}
        </UButton>
        <ShareBar
          :title="t('cert.title')"
          :text="t('cert.shareText')"
        />
      </div>
    </BpPageHeader>

    <div class="mx-auto max-w-(--ui-container) space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <!-- The format -->
      <dl class="grid grid-cols-2 border-s-[1.5px] border-t-[1.5px] border-(--ink) lg:grid-cols-4">
        <div
          v-for="(f, n) in [
            { label: t('cert.facts.questions'), value: EXAM.questions },
            { label: t('cert.facts.minutes'), value: EXAM.minutes },
            { label: t('cert.facts.pass'), value: `${EXAM.passPct}%` },
            { label: t('cert.facts.bank'), value: 367 }
          ]"
          :key="f.label"
          class="flex flex-col-reverse border-e-[1.5px] border-b-[1.5px] border-(--ink) bg-(--card) p-5"
        >
          <dd class="mt-2 text-4xl font-black tabular-nums tracking-[-0.03em] text-(--signal)">
            {{ f.value }}
          </dd>
          <dt class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)">
            K.0{{ n + 1 }} — {{ f.label }}
          </dt>
        </div>
      </dl>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="space-y-10">
          <!-- Full papers -->
          <section>
            <p class="eyebrow">
              {{ t('cert.fullEyebrow') }}
            </p>
            <h2 class="bp-h3 mt-2">
              {{ t('cert.fullTitle') }}
            </h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <NuxtLink
                v-for="p in full"
                :key="p.id"
                :to="localePath(`/certification/${p.id}`)"
                class="bp-card bp-card--hover group flex flex-col p-5"
                @click="openPaper($event, p.id)"
              >
                <span class="mono-label">{{ p.questions }} Q · {{ p.minutes }} min</span>
                <span class="mt-2 text-xl font-extrabold text-(--ink) group-hover:text-(--signal)">{{ p.title }}</span>
                <span class="mt-auto pt-4 font-mono text-xs">
                  <template v-if="best[p.id]">
                    <span :class="best[p.id]!.best >= EXAM.passPct ? 'text-(--signal)' : 'text-(--ink2)'">{{ t('cert.best', { pct: best[p.id]!.best }) }}</span>
                    · {{ t('cert.attempts', { n: best[p.id]!.attempts }) }}
                  </template>
                  <template v-else>{{ t('cert.notTaken') }} →</template>
                </span>
              </NuxtLink>
            </div>
          </section>

          <!-- Domain drills -->
          <section>
            <p class="eyebrow">
              {{ t('cert.drillEyebrow') }}
            </p>
            <h2 class="bp-h3 mt-2">
              {{ t('cert.drillTitle') }}
            </h2>
            <ul class="mt-5 border-[1.5px] border-(--ink) bg-(--card)">
              <li
                v-for="p in drills"
                :key="p.id"
                class="border-b border-dashed border-(--line) last:border-b-0"
              >
                <NuxtLink
                  :to="localePath(`/certification/${p.id}`)"
                  class="flex items-center gap-4 px-5 py-3 hover:bg-(--ice)"
                  @click="openPaper($event, p.id)"
                >
                  <span class="w-12 font-mono text-xs font-semibold text-(--signal)">{{ DOMAINS[p.domain!].weight }}%</span>
                  <span class="min-w-0 flex-1 font-semibold text-(--ink)">{{ p.title }}</span>
                  <span class="font-mono text-[11px] text-(--ink2)">{{ best[p.id] ? t('cert.best', { pct: best[p.id]!.best }) : `${p.questions} Q · ${p.minutes} min` }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <!-- How it works -->
          <section class="border-[1.5px] border-(--ink) bg-(--card) p-6">
            <h2 class="bp-h3">
              {{ t('cert.howTitle') }}
            </h2>
            <ul class="mt-4 space-y-2 text-(--ink2)">
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
            <p class="mt-4 text-sm text-(--ink2)">
              {{ t('cert.disclaimer') }}
            </p>
          </section>
        </div>

        <!-- Sidebar: domain weights -->
        <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div class="border-[1.5px] border-(--ink) bg-(--card)">
            <p class="eyebrow border-b-[1.5px] border-(--ink) px-4 py-3">
              {{ t('cert.domains') }}
            </p>
            <ul class="p-4">
              <li
                v-for="d in domainList"
                :key="d.key"
                class="py-1.5"
              >
                <div class="flex justify-between text-sm">
                  <span class="font-semibold text-(--ink)">{{ d.label }}</span><span class="font-mono text-xs text-(--ink2)">{{ d.weight }}%</span>
                </div>
                <div class="mt-1 h-2 border border-(--ink) bg-(--paper)">
                  <div
                    class="h-full bg-(--signal)"
                    :style="{ width: `${d.weight * 4}%` }"
                  />
                </div>
              </li>
            </ul>
          </div>
          <NuxtLink
            :to="localePath('/interview-questions')"
            class="graph-paper-navy block border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white shadow-[6px_6px_0_var(--signal)]"
          >
            <p class="font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">{{ t('interview.eyebrow') }}</p>
            <p class="mt-2 text-lg font-extrabold">{{ t('interview.ctaTitle') }}</p>
            <p class="mt-1 text-sm text-white/75">{{ t('interview.ctaBody') }}</p>
          </NuxtLink>
          <PromoSlot unit="square300x250" />
        </aside>
      </div>
    </div>
  </div>
</template>
