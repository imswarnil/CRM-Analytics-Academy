<script setup lang="ts">
import type { ComputedRef } from 'vue'

/**
 * One interview question and its model answer, expanded in place under its
 * row in the question list (the parent page, interview-questions.vue) — its own permalink, its own
 * QAPage JSON-LD, prerendered in every locale from the `interview` collection
 * (translated by the build; falls back to English). Previous/next follow the
 * list's current filters; Esc and the arrow keys work. Upvotes load and post
 * in the browser.
 */
definePageMeta({ scrollToTop: false })

interface DrawerContext {
  neighbours: ComputedRef<{ prev: InterviewRow | null, next: InterviewRow | null, position: number, total: number }>
  linkTo: (r: InterviewRow) => { path: string, query: Record<string, string | undefined> }
  close: () => void
  sectionTitle: (key: string) => string
}
const drawer = inject<DrawerContext | null>('interview-drawer', null)
const role = computed(() => q.value?.role ?? '')
// Bring the opened question's row to the top of the screen.
const panel = ref<HTMLElement | null>(null)
// After Nuxt's own scroll-to-top on a first load, hence the short wait.
onMounted(() => setTimeout(() => {
  const row = panel.value?.parentElement
  if (!row) return
  window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
}, 250))

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
  <section
    v-if="q"
    ref="panel"
    class="vis-expand border-t-[1.5px] border-(--ink) bg-(--paper)"
    :aria-label="q.title"
  >
    <!-- Bar: position in the list, previous / next, close -->
    <div class="flex items-center gap-2 border-b border-dashed border-(--line) px-5 py-2">
      <span
        v-if="role"
        class="border-[1.5px] border-(--line) px-1.5 py-0.5 font-mono text-[11px] uppercase text-(--ink2)"
      >{{ role }}</span>
      <span
        v-if="drawer && drawer.neighbours.value.position"
        class="ms-auto font-mono text-xs tabular-nums text-(--ink2)"
      >{{ drawer.neighbours.value.position }} / {{ drawer.neighbours.value.total }}</span>
      <div
        class="flex items-center gap-1"
        :class="drawer?.neighbours.value.position ? '' : 'ms-auto'"
      >
        <UButton
          v-if="drawer"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :aria-label="t('interview.prev')"
          :disabled="!drawer.neighbours.value.prev"
          :to="drawer.neighbours.value.prev ? drawer.linkTo(drawer.neighbours.value.prev) : undefined"
        />
        <UButton
          v-if="drawer"
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :aria-label="t('interview.next')"
          :disabled="!drawer.neighbours.value.next"
          :to="drawer.neighbours.value.next ? drawer.linkTo(drawer.neighbours.value.next) : undefined"
        />
        <UButton
          icon="i-lucide-chevron-up"
          color="neutral"
          variant="outline"
          size="sm"
          square
          :aria-label="t('interview.close')"
          @click="drawer ? drawer.close() : navigateTo(localePath('/interview-questions'))"
        />
      </div>
    </div>

    <div class="px-5 py-5 sm:px-8">
      <h1 class="sr-only">
        {{ q.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-3">
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
          :title="q.title"
          :text="t('interview.shareQuestion', { q: q.title })"
        />
      </div>

      <div class="mt-5 border-[1.5px] border-(--ink) bg-(--card)">
        <p class="eyebrow border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-2.5">
          {{ t('interview.modelAnswer') }}
        </p>
        <div class="bp-prose px-5 py-4">
          <ContentRenderer :value="q" />
        </div>
      </div>

      <PromoSlot
        :key="slug"
        unit="horizontal"
      />

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          v-if="relatedList.length"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <p class="eyebrow border-b-[1.5px] border-(--ink) px-4 py-2.5">
            {{ t('interview.related') }}
          </p>
          <ul>
            <li
              v-for="r in relatedList.slice(0, 4)"
              :key="r.path"
              class="border-b border-dashed border-(--line) last:border-b-0"
            >
              <NuxtLink
                :to="localePath(`/interview-questions/${r.path.split('/').pop()}`)"
                class="block px-4 py-2.5 text-[15px] font-semibold leading-snug text-(--ink) hover:bg-(--ice) hover:text-(--signal)"
              >{{ r.title }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="flex flex-col justify-between gap-4 border-[1.5px] border-(--ink) bg-(--ice) p-5">
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
      </div>
    </div>
  </section>
</template>

<style scoped>
.vis-expand {
  animation: expand-in 0.28s ease-out;
}
@keyframes expand-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .vis-expand {
    animation: none;
  }
}
</style>
