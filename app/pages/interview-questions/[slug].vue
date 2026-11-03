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

// Upvotes — from the shared, cached counts (useInterviewVotes): no request on open.
const { isSignedIn } = useAuth()
const { counts, mine, load, set } = useInterviewVotes()
const votes = computed(() => counts.value[slug] ?? 0)
const voted = computed(() => mine.value.includes(slug))
onMounted(load)
async function vote() {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: route.fullPath } })
    return
  }
  const res = await $fetch<{ voted: boolean, upvotes: number }>(`/api/interview/${slug}/vote`, { method: 'POST' }).catch(() => null)
  if (res) set(slug, res.voted, res.upvotes)
}

// Community answers: the comment thread of this question, loaded only when
// opened, so reading a question costs the Worker nothing.
const showAnswers = ref(false)
// The English source of the model answer, for "Edit on GitHub".
const editUrl = `${SITE.github}/edit/main/content/en/interview-questions/${slug}.md`

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

      <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          :href="editUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 font-semibold text-(--ink2) hover:text-(--signal)"
        ><UIcon
          name="i-simple-icons-github"
          class="size-4"
        />{{ t('interview.editOnGithub') }}</a>
        <NuxtLink
          :to="localePath('/interview-questions/new')"
          class="inline-flex items-center gap-1.5 font-semibold text-(--ink2) hover:text-(--signal)"
        ><UIcon
          name="i-lucide-square-pen"
          class="size-4"
        />{{ t('interview.submit') }}</NuxtLink>
      </div>

      <!-- Answers from the community -->
      <div class="mt-6 border-[1.5px] border-(--ink) bg-(--card)">
        <button
          v-if="!showAnswers"
          type="button"
          class="flex w-full items-center gap-3 px-5 py-4 text-start hover:bg-(--ice)"
          @click="showAnswers = true"
        >
          <UIcon
            name="i-lucide-messages-square"
            class="size-5 text-(--signal)"
          />
          <span class="flex-1">
            <span class="block font-bold text-(--ink)">{{ t('interview.answersTitle') }}</span>
            <span class="block text-sm text-(--ink2)">{{ t('interview.answersLead') }}</span>
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-5 text-(--ink2)"
          />
        </button>
        <div
          v-else
          class="px-5 py-2"
        >
          <CourseLessonComments :lesson-path="`/interview-questions/${slug}`" />
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
