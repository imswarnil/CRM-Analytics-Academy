<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
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

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page?.value?.stem}.${page?.value?.extension}`,
      target: '_blank'
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})
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

      <AdUnit placement="afterArticle" />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />

      <AdUnit placement="relatedPosts" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title"
        :links="page.body?.toc?.links"
      >
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block space-y-6"
            :class="{ 'mt-6!': page.body?.toc?.links?.length }"
          >
            <USeparator
              v-if="page.body?.toc?.links?.length"
              type="dashed"
            />

            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />
          </div>
        </template>
      </UContentToc>

      <AdUnit
        placement="sidebarSquare"
        class="mt-6"
      />
    </template>
  </UPage>
</template>
