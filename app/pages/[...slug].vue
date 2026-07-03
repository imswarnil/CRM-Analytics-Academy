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

const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('docs').path(contentPath.value).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', contentPath.value, {
    fields: ['description']
  })
})

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
      <ContentRenderer
        v-if="renderedPage"
        :value="renderedPage"
      />

      <AdUnit placement="endOfArticle" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />

      <AdUnit placement="relatedPosts" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <!-- UPage's #right slot is order-first on mobile (TOC-before-content is
           intentional there). No top padding below lg so the TOC sits flush
           against the navbar with nothing in between. Sticky/scroll merging
           (so the ad rides along with the TOC and stops once you scroll past
           this block) only kicks in at lg, where the slot sits beside the
           article as a right rail. -->
      <div class="lg:sticky lg:top-(--ui-header-height) lg:max-h-[calc(100vh-var(--ui-header-height)-1rem)] lg:overflow-y-auto lg:pt-6">
        <UContentToc
          :title="toc?.title"
          :links="page.body?.toc?.links"
          :ui="{ root: 'lg:static lg:max-h-none lg:overflow-y-visible' }"
          class="w-full"
        />

        <!-- Comes after the TOC (not before it) on every breakpoint. -->
        <AdUnit
          placement="sidebarSquare"
          class="mt-6 w-full"
        />

        <div
          v-if="tocBottomLinks.length"
          class="mt-6 hidden space-y-4 lg:block"
        >
          <USeparator type="dashed" />

          <UPageLinks
            :title="toc?.bottom?.title"
            :links="tocBottomLinks"
          />
        </div>
      </div>
    </template>
  </UPage>
</template>
