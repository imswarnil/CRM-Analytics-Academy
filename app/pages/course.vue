<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
/**
 * /course — the page to send people to: what the course is, what they will
 * be able to do, how it works, the whole path, the tools that come with it,
 * who it is for, what it costs, and one button to start. Prerendered and
 * static (navigation is already in the payload), so it costs the Worker
 * nothing. Every word is i18n (`course.*`).
 */
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation', ref([]))
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { total } = useCourse()

const sections = computed(() => (navigation.value ?? []).map((m, i) => ({
  n: String(i).padStart(2, '0'),
  title: String(m.title ?? ''),
  path: String(m.path ?? ''),
  icon: String((m as { icon?: string }).icon ?? 'i-lucide-book-open'),
  soon: Boolean((m as { comingSoon?: boolean }).comingSoon) || ((m.children ?? []) as ContentNavigationItem[]).every(c => (c as { comingSoon?: boolean }).comingSoon),
  lessons: ((m.children ?? []) as ContentNavigationItem[]).filter(c => c.path && !(c as { comingSoon?: boolean }).comingSoon).length
})))
const open = computed(() => sections.value.filter(s => !s.soon).length)

const OUTCOMES = ['prep', 'saql', 'dash', 'bind', 'discovery', 'deploy'] as const
const STEPS = [
  { k: 'watch', icon: 'i-lucide-play' },
  { k: 'build', icon: 'i-lucide-hammer' },
  { k: 'check', icon: 'i-lucide-list-checks' },
  { k: 'prove', icon: 'i-lucide-award' }
] as const
const TOOLS = [
  { k: 'visualiser', icon: 'i-lucide-workflow', to: '/visualiser' },
  { k: 'exams', icon: 'i-lucide-timer', to: '/certification' },
  { k: 'interview', icon: 'i-lucide-messages-square', to: '/interview-questions' },
  { k: 'datasets', icon: 'i-lucide-database', to: '/datasets' }
] as const
const WHO = ['admin', 'analyst', 'consultant', 'career'] as const
const start = computed(() => (isSignedIn.value ? localePath('/curriculum') : localePath('/sign-up')))

const title = computed(() => t('course.seo.title'))
const description = computed(() => t('course.seo.description'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title: t('course.hero.title'), description: description.value, headline: t('course.hero.eyebrow') })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'WebPage',
  extra: [{
    '@type': 'Course',
    'name': 'CRM Analytics Academy',
    'description': description.value,
    'provider': { '@type': 'Organization', 'name': 'CRM Analytics Academy', 'sameAs': SITE.url },
    'isAccessibleForFree': true,
    'offers': [{ '@type': 'Offer', 'price': 0, 'priceCurrency': 'USD', 'category': 'Free' }, { '@type': 'Offer', 'price': PRICES.proMonthly.usd, 'priceCurrency': 'USD', 'category': 'Subscription' }],
    'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'online', 'courseWorkload': `PT${Math.max(1, Math.round(total.value / 2))}H` }
  }]
}))
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden border-b-[1.5px] border-(--ink) bg-(--navy) text-white">
      <div class="graph-paper-navy absolute inset-0 opacity-60" />
      <div class="relative mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-28">
        <div>
          <p class="font-mono text-xs uppercase tracking-[.18em] text-(--glow)">
            {{ t('course.hero.eyebrow') }}
          </p>
          <h1 class="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            {{ t('course.hero.title') }}
          </h1>
          <p class="mt-6 max-w-xl text-lg text-white/75">
            {{ t('course.hero.lead') }}
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <UButton
              :to="start"
              size="xl"
              icon="i-lucide-rocket"
            >
              {{ isSignedIn ? t('course.cta.continue') : t('course.cta.start') }}
            </UButton>
            <NuxtLink
              :to="localePath('/curriculum')"
              class="inline-flex items-center gap-2 border-[1.5px] border-white/50 px-5 py-3 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              {{ t('course.cta.curriculum') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-5"
              />
            </NuxtLink>
          </div>
          <p class="mt-4 text-sm text-white/55">
            {{ t('course.hero.note') }}
          </p>
        </div>
        <dl class="grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15">
          <div
            v-for="s in [{ v: sections.length, k: 'sections' }, { v: total, k: 'lessons' }, { v: 12, k: 'languages' }, { v: '0', k: 'cost' }]"
            :key="s.k"
            class="bg-(--navy) p-6"
          >
            <dd class="text-4xl font-black tabular-nums">
              {{ s.k === 'cost' ? '$0' : s.v }}
            </dd>
            <dt class="mt-1 font-mono text-[11px] uppercase tracking-[.14em] text-white/60">
              {{ t(`course.stats.${s.k}`) }}
            </dt>
          </div>
        </dl>
      </div>
    </section>

    <!-- OUTCOMES -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('course.outcomes.eyebrow') }}
      </p>
      <h2 class="bp-h2 mt-2 max-w-2xl">
        {{ t('course.outcomes.title') }}
      </h2>
      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(o, i) in OUTCOMES"
          :key="o"
          class="border-[1.5px] border-(--ink) bg-(--card) p-6 shadow-[4px_4px_0_var(--ink)]"
        >
          <span class="font-mono text-xs text-(--signal)">0{{ i + 1 }}</span>
          <h3 class="mt-2 text-lg font-bold text-(--ink)">
            {{ t(`course.outcomes.${o}.title`) }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-(--ink2)">
            {{ t(`course.outcomes.${o}.body`) }}
          </p>
        </li>
      </ul>
    </section>

    <!-- HOW IT WORKS -->
    <section class="border-y-[1.5px] border-(--ink) bg-(--ice)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <p class="eyebrow">
          {{ t('course.how.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-2">
          {{ t('course.how.title') }}
        </h2>
        <ol class="mt-10 grid gap-6 md:grid-cols-4">
          <li
            v-for="(s, i) in STEPS"
            :key="s.k"
            class="relative"
          >
            <span class="flex size-12 items-center justify-center bg-(--ink) text-(--paper)">
              <UIcon
                :name="s.icon"
                class="size-6"
              />
            </span>
            <span
              v-if="i < STEPS.length - 1"
              class="absolute left-14 right-2 top-6 hidden border-t-2 border-dashed border-(--ink2) md:block"
            />
            <h3 class="mt-4 font-bold text-(--ink)">
              {{ t(`course.how.${s.k}.title`) }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
              {{ t(`course.how.${s.k}.body`) }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- THE PATH -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">
            {{ t('course.path.eyebrow') }}
          </p>
          <h2 class="bp-h2 mt-2">
            {{ t('course.path.title') }}
          </h2>
          <p class="mt-2 text-(--ink2)">
            {{ t('course.path.lead', { open, total: sections.length }) }}
          </p>
        </div>
        <UButton
          :to="localePath('/curriculum')"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('course.cta.curriculum') }}
        </UButton>
      </div>
      <ol class="mt-8 grid gap-px border-[1.5px] border-(--ink) bg-(--ink) sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="s in sections"
          :key="s.path"
          class="bg-(--card)"
        >
          <NuxtLink
            :to="localePath(s.path)"
            class="flex h-full items-center gap-3 p-4 hover:bg-(--ice)"
            :class="s.soon ? 'opacity-60' : ''"
          >
            <span class="font-mono text-sm font-bold text-(--signal)">{{ s.n }}</span>
            <UIcon
              :name="s.icon"
              class="size-5 shrink-0 text-(--ink2)"
            />
            <span class="min-w-0 flex-1 truncate font-semibold text-(--ink)">{{ s.title }}</span>
            <span
              class="shrink-0 font-mono text-[10px] uppercase"
              :class="s.soon ? 'text-(--ink2)' : 'text-(--signal)'"
            >{{ s.soon ? t('course.path.soon') : t('course.path.lessons', { n: s.lessons }) }}</span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <!-- TOOLS -->
    <section class="border-y-[1.5px] border-(--ink) bg-(--navy) text-white">
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <p class="font-mono text-xs uppercase tracking-[.18em] text-(--glow)">
          {{ t('course.tools.eyebrow') }}
        </p>
        <h2 class="mt-2 text-3xl font-black tracking-[-0.03em]">
          {{ t('course.tools.title') }}
        </h2>
        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="tool in TOOLS"
            :key="tool.k"
            :to="localePath(tool.to)"
            class="group border border-white/15 bg-white/5 p-6 transition-colors hover:border-(--glow) hover:bg-white/10"
          >
            <UIcon
              :name="tool.icon"
              class="size-7 text-(--glow)"
            />
            <h3 class="mt-4 font-bold">
              {{ t(`course.tools.${tool.k}.title`) }}
            </h3>
            <p class="mt-1 text-sm text-white/65">
              {{ t(`course.tools.${tool.k}.body`) }}
            </p>
            <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-(--glow)">{{ t('course.tools.open') }}<UIcon
              name="i-lucide-arrow-right"
              class="size-4 transition-transform group-hover:translate-x-1"
            /></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- WHO -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
      <p class="eyebrow">
        {{ t('course.who.eyebrow') }}
      </p>
      <h2 class="bp-h2 mt-2">
        {{ t('course.who.title') }}
      </h2>
      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <div
          v-for="w in WHO"
          :key="w"
          class="flex gap-4 border-s-4 border-(--signal) ps-5"
        >
          <div>
            <h3 class="font-bold text-(--ink)">
              {{ t(`course.who.${w}.title`) }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-(--ink2)">
              {{ t(`course.who.${w}.body`) }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="border-y-[1.5px] border-(--ink) bg-(--ice)">
      <div class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
        <p class="eyebrow">
          {{ t('course.price.eyebrow') }}
        </p>
        <h2 class="bp-h2 mt-2">
          {{ t('course.price.title') }}
        </h2>
        <div class="mt-10 grid gap-6 lg:grid-cols-3">
          <div
            v-for="p in [{ k: 'free', price: '$0', unit: t('plans.forever'), to: start, icon: 'i-lucide-book-open' }, { k: 'pro', price: `$${PRICES.proMonthly.usd}`, unit: t('plans.perMonth'), to: localePath('/account'), icon: 'i-lucide-sparkles' }, { k: 'team', price: `$${PRICES.teamSeat.usd}`, unit: t('plans.perSeat'), to: localePath('/account'), icon: 'i-lucide-users' }]"
            :key="p.k"
            class="flex flex-col border-[1.5px] border-(--ink) bg-(--card) p-6"
            :class="p.k === 'pro' ? 'shadow-[6px_6px_0_var(--signal)]' : ''"
          >
            <p class="flex items-center gap-2 font-bold text-(--ink)">
              <UIcon
                :name="p.icon"
                class="size-5 text-(--signal)"
              />{{ t(`course.price.${p.k}.name`) }}
            </p>
            <p class="mt-4 text-4xl font-black tabular-nums text-(--ink)">
              {{ p.price }}<span class="text-base font-semibold text-(--ink2)"> {{ p.unit }}</span>
            </p>
            <p class="mt-3 flex-1 text-sm text-(--ink2)">
              {{ t(`course.price.${p.k}.body`) }}
            </p>
            <UButton
              :to="p.to"
              class="mt-6 self-start"
              :variant="p.k === 'pro' ? 'solid' : 'outline'"
              :color="p.k === 'pro' ? 'primary' : 'neutral'"
            >
              {{ t(`course.price.${p.k}.cta`) }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="mx-auto max-w-(--ui-container) px-4 py-24 text-center sm:px-6 lg:px-8">
      <h2 class="mx-auto max-w-2xl text-4xl font-black tracking-[-0.035em] text-(--ink)">
        {{ t('course.final.title') }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-lg text-(--ink2)">
        {{ t('course.final.lead') }}
      </p>
      <UButton
        :to="start"
        size="xl"
        icon="i-lucide-rocket"
        class="mt-8"
      >
        {{ isSignedIn ? t('course.cta.continue') : t('course.cta.start') }}
      </UButton>
    </section>
  </div>
</template>
