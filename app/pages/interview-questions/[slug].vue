<script setup lang="ts">
/**
 * One interview question and its model answer. Prerendered in every locale
 * from the `interview` collection (translated by the build); falls back to the
 * English file when a locale has no translation yet. QAPage JSON-LD for the
 * Q&A rich result; upvotes load and post in the browser.
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = String(route.params.slug)
// Every question is prerendered; on the Worker this is an unknown slug, and the
// Worker has no content database to query (see app.vue).
if (import.meta.server && !import.meta.prerender && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found', fatal: true })
}

const { data: q } = await useAsyncData(`interview-${locale.value}-${slug}`, async () =>
  (await queryCollection('interview').path(`/${locale.value}/interview-questions/${slug}`).first())
  ?? (locale.value === DEFAULT_LOCALE ? null : await queryCollection('interview').path(`/${DEFAULT_LOCALE}/interview-questions/${slug}`).first()))
if (!q.value) throw createError({ statusCode: 404, statusMessage: 'Question not found', fatal: true })

const { data: related } = await useAsyncData(`interview-related-${locale.value}-${slug}`, () =>
  queryCollection('interview')
    .where('path', 'LIKE', `/${locale.value}/interview-questions/%`)
    .where('topic', '=', q.value!.topic)
    .select('path', 'title')
    .limit(7)
    .all(), { default: () => [] })
const relatedList = computed(() => (related.value ?? []).filter(r => !r.path.endsWith(`/${slug}`)).slice(0, 6))

// Upvotes — public counts, the reader's own vote once signed in.
const { isSignedIn } = useAuth()
const votes = ref(0)
const voted = ref(false)
onMounted(async () => {
  const res = await $fetch<{ counts: Record<string, number>, mine: string[] }>('/api/interview/votes').catch(() => null)
  if (res) {
    votes.value = res.counts[slug] ?? 0
    voted.value = res.mine.includes(slug)
  }
})
async function vote() {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: route.fullPath } })
    return
  }
  const res = await $fetch<{ voted: boolean, upvotes: number }>(`/api/interview/${slug}/vote`, { method: 'POST' }).catch(() => null)
  if (res) {
    voted.value = res.voted
    votes.value = res.upvotes
  }
}

const title = q.value.title
const description = q.value.description ?? ''
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description, ogType: 'article' })
// One share card per question in English; translations reuse the site card,
// so the build does not render 1,800 images.
if (locale.value === DEFAULT_LOCALE) {
  defineOgImage('Docs', { title, description, headline: `${t('interview.eyebrow')} · ${t(`interview.types.${q.value.type}`)}`, spec: q.value.company ? `ASKED AT ${q.value.company.toUpperCase()}` : 'INTERVIEW Q&A' })
}
usePageSchema({
  name: title,
  description,
  type: 'QAPage',
  trail: [{ name: t('interview.eyebrow'), path: '/interview-questions' }, { name: title, path: `/interview-questions/${slug}` }],
  extra: [{
    '@type': 'Question',
    'name': title,
    'text': title,
    'answerCount': 1,
    'author': { '@type': q.value.source === 'community' ? 'Person' : 'Organization', 'name': q.value.source === 'community' ? 'Community member' : SITE.name },
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': description,
      'url': `${SITE.url}${localePath(`/interview-questions/${slug}`)}`,
      'author': { '@type': 'Organization', 'name': SITE.name }
    }
  }]
})
</script>

<template>
  <div v-if="q">
    <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <article class="min-w-0">
        <NuxtLink
          :to="localePath('/interview-questions')"
          class="mono-label hover:text-(--signal)"
        >← {{ t('interview.back') }}</NuxtLink>
        <div class="mt-6 flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.08em]">
          <span class="border-[1.5px] border-(--signal) px-1.5 py-0.5 text-(--signal)">{{ t(`interview.types.${q.type}`) }}</span>
          <span class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ t(`interview.levels.${q.level}`) }}</span>
          <NuxtLink
            :to="localePath(`/interview-questions#topic-${q.topic}`)"
            class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2) hover:border-(--ink)"
          >{{ q.topic.replace(/-/g, ' ') }}</NuxtLink>
          <span
            v-if="q.company"
            class="border-[1.5px] border-(--ink) bg-(--ink) px-1.5 py-0.5 text-(--paper)"
          >{{ t('interview.askedAt', { company: q.company }) }}</span>
          <span
            v-if="q.role"
            class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)"
          >{{ q.role }}</span>
        </div>
        <h1 class="bp-h2 mt-4">
          {{ q.title }}
        </h1>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <UButton
            :icon="voted ? 'i-lucide-arrow-big-up-dash' : 'i-lucide-arrow-big-up'"
            :color="voted ? 'primary' : 'neutral'"
            :variant="voted ? 'solid' : 'outline'"
            @click="vote"
          >
            {{ t('interview.upvote') }} · {{ votes }}
          </UButton>
          <ShareBar
            :title="q.title"
            :text="t('interview.shareQuestion', { q: q.title })"
          />
        </div>

        <section class="mt-8 border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-3">
            {{ t('interview.modelAnswer') }}
          </p>
          <div class="bp-prose px-6 py-5">
            <ContentRenderer :value="q" />
          </div>
        </section>

        <PromoSlot unit="horizontal" />

        <div class="flex flex-wrap items-center justify-between gap-4 border-[1.5px] border-(--ink) bg-(--ice) p-5">
          <p class="font-bold text-(--ink)">
            {{ t('interview.betterAnswer') }}
          </p>
          <UButton
            :to="localePath('/interview-questions/new')"
            icon="i-lucide-square-pen"
          >
            {{ t('interview.submit') }}
          </UButton>
        </div>
      </article>

      <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div
          v-if="relatedList.length"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-4 py-3">
            {{ t('interview.related') }}
          </p>
          <ul>
            <li
              v-for="r in relatedList"
              :key="r.path"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(`/interview-questions/${r.path.split('/').pop()}`)"
                class="block px-4 py-3 text-[15px] font-semibold leading-snug text-(--ink) hover:bg-(--ice) hover:text-(--signal)"
              >{{ r.title }}</NuxtLink>
            </li>
          </ul>
        </div>
        <NuxtLink
          :to="localePath('/certification')"
          class="graph-paper-navy block border-[1.5px] border-(--ink) bg-(--navy) p-5 text-white shadow-[6px_6px_0_var(--signal)]"
        >
          <p class="font-mono text-[10px] uppercase tracking-[.14em] text-(--glow)">{{ t('cert.eyebrow') }}</p>
          <p class="mt-2 text-lg font-extrabold">{{ t('cert.ctaTitle') }}</p>
          <p class="mt-1 text-sm text-white/75">{{ t('cert.ctaBody') }}</p>
        </NuxtLink>
        <PromoSlot unit="square300x250" />
      </aside>
    </div>
  </div>
</template>
