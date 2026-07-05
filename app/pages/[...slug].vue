<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
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
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
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

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    'inLanguage': 'en',
    'mainEntityOfPage': SITE.url + route.path,
    'author': { '@type': 'Person', 'name': SITE.author },
    'publisher': { '@type': 'Organization', 'name': SITE.name, 'logo': { '@type': 'ImageObject', 'url': `${SITE.url}/favicon.ico` } },
    'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.value
  }
])
</script>

<template>
  <UPage v-if="page">
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
        <ContentRenderer
          v-if="renderedPage"
          :value="renderedPage"
        />
      </MembersGate>

      <template v-if="!locked">
        <LessonProgress :lesson-path="lessonKey" />

        <LessonQuiz
          v-if="page.quiz?.length"
          :questions="page.quiz"
          :quiz-id="route.path"
        />
      </template>

      <AdUnit placement="endOfArticle" />

      <DocsChat
        :page-path="contentPath"
        :page-title="page.title"
      />

      <LessonComments :page-path="route.path" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />

      <AdUnit placement="relatedPosts" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <!-- UPage's #right slot is order-first on mobile: it renders as a sticky,
           collapsible "On this page" bar above the article. On lg+ it becomes
           the right rail. `highlight` draws the scrollspy indicator — a filled
           primary bar on the left border that tracks the active heading. The
           ad + community links live in the #bottom slot, which the theme hides
           on mobile so the mobile TOC stays clean. -->
      <div class="lg:sticky lg:top-(--ui-header-height) lg:max-h-[calc(100vh-var(--ui-header-height)-1rem)] lg:overflow-y-auto lg:pt-6">
        <UContentToc
          highlight
          highlight-color="primary"
          :title="toc?.title"
          :links="page.body?.toc?.links"
          :ui="{
            root: 'lg:static lg:max-h-none lg:overflow-y-visible lg:bg-transparent lg:backdrop-blur-none',
            container: 'lg:pt-0',
            title: 'text-xs font-semibold uppercase tracking-wide text-dimmed',
            link: 'text-sm py-1.5',
            indicator: 'w-0.5'
          }"
          class="w-full"
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
      </div>
    </template>
  </UPage>
</template>
