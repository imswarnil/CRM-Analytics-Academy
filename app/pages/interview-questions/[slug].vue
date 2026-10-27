<script setup lang="ts">
/**
 * One interview question and its model answer (markdown, rendered with MDC).
 * Server-rendered on the Worker; QAPage JSON-LD for the Q&A rich result.
 */
interface Question {
  slug: string
  question: string
  answer: string
  type: string
  topic: string
  level: string
  company: string | null
  role: string | null
  community: boolean
  upvotes: number
  createdAt: string
  updatedAt: string
  related: { slug: string, question: string, type: string, level: string }[]
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data, error } = await useFetch<Question>(() => `/api/interview/${slug.value}`, { key: `interview-${slug.value}` })
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found', fatal: true })
}
const q = data.value

const { isSignedIn } = useAuth()
const votes = ref(q.upvotes)
const voted = ref(false)
async function vote() {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: route.fullPath } })
    return
  }
  const res = await $fetch<{ voted: boolean, upvotes: number }>(`/api/interview/${q.slug}/vote`, { method: 'POST' }).catch(() => null)
  if (res) {
    voted.value = res.voted
    votes.value = res.upvotes
  }
}

const description = q.answer.replace(/[#*_`>[\]()]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)
useSeoMeta({ title: q.question, ogTitle: q.question, description, ogDescription: description, twitterTitle: q.question, twitterDescription: description, ogType: 'article' })
defineOgImage('Docs', { title: q.question, description, headline: `${t('interview.eyebrow')} · ${t(`interview.types.${q.type}`)}`, spec: q.company ? `ASKED AT ${q.company.toUpperCase()}` : 'INTERVIEW Q&A' })
usePageSchema({
  name: q.question,
  description,
  type: 'QAPage',
  trail: [{ name: t('interview.eyebrow'), path: '/interview-questions' }, { name: q.question, path: `/interview-questions/${q.slug}` }],
  extra: [{
    '@type': 'Question',
    'name': q.question,
    'text': q.question,
    'answerCount': 1,
    'upvoteCount': q.upvotes,
    'datePublished': q.createdAt,
    'author': { '@type': q.community ? 'Person' : 'Organization', 'name': q.community ? 'Community member' : SITE.name },
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': q.answer,
      'datePublished': q.updatedAt,
      'url': `${SITE.url}${localePath(`/interview-questions/${q.slug}`)}`,
      'author': { '@type': 'Organization', 'name': SITE.name },
      'upvoteCount': q.upvotes
    }
  }]
})
</script>

<template>
  <div>
    <div class="mx-auto grid max-w-(--ui-container) gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
      <article>
        <NuxtLink
          :to="localePath('/interview-questions')"
          class="mono-label hover:text-(--signal)"
        >← {{ t('interview.back') }}</NuxtLink>
        <div class="mt-6 flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.08em]">
          <span class="border-[1.5px] border-(--signal) px-1.5 py-0.5 text-(--signal)">{{ t(`interview.types.${q.type}`) }}</span>
          <span class="border-[1.5px] border-(--line) px-1.5 py-0.5 text-(--ink2)">{{ t(`interview.levels.${q.level}`) }}</span>
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
          {{ q.question }}
        </h1>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <UButton
            :icon="voted ? 'i-lucide-arrow-big-up-dash' : 'i-lucide-arrow-big-up'"
            :color="voted ? 'primary' : 'neutral'"
            :variant="voted ? 'solid' : 'outline'"
            size="sm"
            @click="vote"
          >
            {{ t('interview.upvote') }} · {{ votes }}
          </UButton>
          <ShareBar
            :title="q.question"
            :text="t('interview.shareQuestion', { q: q.question })"
          />
        </div>

        <section class="mt-8 border-[1.5px] border-(--ink) bg-(--card)">
          <p class="eyebrow border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
            {{ t('interview.modelAnswer') }}
          </p>
          <div class="bp-prose px-5 py-4">
            <MDC :value="q.answer" />
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
          v-if="q.related.length"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-4 py-3">
            {{ t('interview.related') }}
          </p>
          <ul>
            <li
              v-for="r in q.related"
              :key="r.slug"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(`/interview-questions/${r.slug}`)"
                class="block px-4 py-2.5 text-sm font-semibold text-(--ink) hover:bg-(--ice) hover:text-(--signal)"
              >{{ r.question }}</NuxtLink>
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
