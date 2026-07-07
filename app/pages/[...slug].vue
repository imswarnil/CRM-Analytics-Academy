<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
const localePath = useLocalePath()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

// Content lives under content/<locale>/…; map the route to the content path.
const { locales } = useI18n()
const localeCodes = locales.value.map(l => l.code)
const contentPath = computed(() => routeToContentPath(route.path, localeCodes))

// Locale-independent lesson key so progress is shared across languages
// (/en/saql and /hi/saql → /saql). Used for completion tracking.
const lessonKey = computed(() => {
  const stripped = contentPath.value.replace(new RegExp(`^/(${localeCodes.join('|')})(?=/|$)`), '')
  return stripped || '/'
})

const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('docs').path(contentPath.value).first())
if (!page.value) {
  // Some newer modules only have English content so far. Rather than 404 a
  // reader whose locale (or the language switcher) points at a path that was
  // never translated, fall back to serving the English version of the page.
  const englishPath = contentPath.value.replace(new RegExp(`^/(${localeCodes.join('|')})(?=/|$)`), `/${DEFAULT_LOCALE}`)
  if (englishPath !== contentPath.value) {
    page.value = await queryCollection('docs').path(englishPath).first()
  }
  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', contentPath.value, {
    fields: ['description']
  })
})

// Soft members-gate: logged-out readers of an `access: members` lesson see a
// teaser + sign-in prompt (content is still rendered, just visually gated).
const user = useSupabaseUser()
const locked = computed(() => page.value?.access === 'members' && !user.value)

// Quiz gates completion: a lesson/section with a quiz can't be marked complete
// until it's passed. No quiz → always completable.
const quizPassed = ref(!page.value?.quiz?.length)
const canComplete = computed(() => quizPassed.value)

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// Render a copy of the page with in-article ads auto-injected between sections.
const renderedPage = computed(() => {
  const p = page.value
  if (!p?.body?.value) return p
  return {
    ...p,
    body: {
      ...p.body,
      value: injectInArticleAds(p.body.value)
    }
  }
})

const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))

defineOgImage('Docs', { title, description, headline: headline.value })

// Structured data: the lesson as a learning article + a breadcrumb trail.
const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items = segments.map((seg, i) => ({
    '@type': 'ListItem',
    'position': i + 2,
    'name': seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    'item': `${SITE.url}/${segments.slice(0, i + 1).join('/')}`
  }))
  return [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE.url }, ...items]
})

// Visible breadcrumb trail (locale segment stripped; last crumb = page title).
const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean).filter(s => !(localeCodes as string[]).includes(s))
  const items = segments.map((seg, i) => ({
    label: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    to: localePath(`/${segments.slice(0, i + 1).join('/')}`)
  }))
  const last = items[items.length - 1]
  if (last) last.label = page.value?.title || last.label
  return [{ label: 'Home', icon: 'i-lucide-house', to: localePath('/') }, ...items]
})

// Edit-this-page + community links shown under the TOC ad.
const tocBottomLinks = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page.value?.stem}.${page.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonLd: any[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    'inLanguage': 'en',
    'mainEntityOfPage': SITE.url + route.path,
    'author': { '@type': 'Person', 'name': SITE.author },
    'publisher': { '@type': 'Organization', 'name': SITE.name, 'logo': { '@type': 'ImageObject', 'url': `${SITE.url}/icon-512.png` } },
    'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.value
  }
]

// VideoObject for the lesson clip (helps this lesson surface as a video result).
const video = page.value?.video
if (video?.id) {
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': title,
    'description': description,
    'thumbnailUrl': [`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`],
    'uploadDate': '2021-04-01',
    'contentUrl': `https://www.youtube.com/watch?v=${video.id}`,
    'embedUrl': `https://www.youtube.com/embed/${video.id}`,
    ...(video.start != null && video.end != null
      ? {
          hasPart: {
            '@type': 'Clip',
            'name': title,
            'startOffset': video.start,
            'endOffset': video.end,
            'url': `https://www.youtube.com/watch?v=${video.id}&t=${video.start}s`
          }
        }
      : {})
  })
}

// FAQPage from the interview questions (rich-result eligible Q&A).
const interview = page.value?.interview
if (interview?.length) {
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': interview.map(i => ({
      '@type': 'Question',
      'name': i.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': i.a }
    }))
  })
}

useJsonLd(jsonLd)
</script>

<template>
  <UPage v-if="page">
    <UBreadcrumb
      :items="breadcrumbItems"
      class="mb-4"
    />

    <UPageHeader
      :title="page.title"
      :description="page.description"
      :headline="headline"
    >
      <template #links>
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />

        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <MembersGate :locked="locked">
        <YoutubeEmbed
          v-if="page.video?.id"
          :id="page.video.id"
          :start="page.video.start"
          :end="page.video.end"
          class="mb-8"
        />

        <ContentRenderer
          v-if="renderedPage"
          :value="renderedPage"
        />
      </MembersGate>

      <template v-if="!locked">
        <!-- End of section: interview prep first, then the graded quiz. -->
        <LessonInterview
          v-if="page.interview?.length"
          :items="page.interview"
        />

        <LessonQuiz
          v-if="page.quiz?.length"
          :path="contentPath"
          :quiz-id="lessonKey"
          @passed="v => quizPassed = v"
        />

        <LessonProgress
          :lesson-path="lessonKey"
          :can-complete="canComplete"
        />
      </template>

      <AdUnit placement="endOfArticle" />

      <LessonComments :page-path="route.path" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />

      <AdUnit placement="relatedPosts" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <!-- Default Nuxt UI TOC. The ad + community links live in the #bottom
           slot, which the theme hides on mobile so the mobile TOC stays clean. -->
      <UContentToc
        highlight
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template #bottom>
          <AdUnit
            placement="sidebarSquare"
            class="w-full"
          />

          <div
            v-if="tocBottomLinks.length"
            class="space-y-4"
          >
            <USeparator type="dashed" />

            <UPageLinks
              :title="toc?.bottom?.title"
              :links="tocBottomLinks"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
