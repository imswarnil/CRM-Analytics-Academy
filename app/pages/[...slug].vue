<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const localePath = useLocalePath()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

// Content lives under content/<locale>/…; map the route to the content path.
const { locale, locales } = useI18n()
const localeCodes = locales.value.map(l => l.code)
const contentPath = computed(() => routeToContentPath(route.path, localeCodes))

// The same path under the default locale, used whenever this one is untranslated.
const englishPath = computed(() =>
  contentPath.value.replace(new RegExp(`^/(${localeCodes.join('|')})(?=/|$)`), `/${DEFAULT_LOCALE}`)
)

const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('docs').path(contentPath.value).first())
if (!page.value) {
  // Some newer modules only have English content so far. Rather than 404 a
  // reader whose locale (or the language switcher) points at a path that was
  // never translated, fall back to serving the English version of the page.
  if (englishPath.value !== contentPath.value) {
    page.value = await queryCollection('docs').path(englishPath.value).first()
  }
  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
  }
}

const { data: surroundRaw } = await useAsyncData(`${route.path}-surround`, async () => {
  const own = await queryCollectionItemSurroundings('docs', contentPath.value, {
    fields: ['description']
  })
  if (own?.some(Boolean)) return own

  // An untranslated locale has no surroundings of its own, which cost more than
  // the missing prev/next buttons: the prerenderer walks the curriculum through
  // this chain, so without it only the first module of that locale ever gets
  // built. Borrow the English chain and point it at this locale's URLs.
  if (englishPath.value === contentPath.value) return own
  return queryCollectionItemSurroundings('docs', englishPath.value, {
    fields: ['description']
  })
})

// Surroundings come back with *content* paths (/en/foundations/…), and rendering
// them directly produced a second, self-canonical copy of every English page at
// /en/… — real duplicate content, since the default locale is unprefixed. Map
// them to route paths the same way the navigation tree is mapped.
const surround = computed(() =>
  (surroundRaw.value ?? []).map(item =>
    item ? { ...item, path: localePath(contentToRoutePath(item.path)) } : item
  )
)

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

// The table of contents renders in the docs layout's right rail, which is a
// sibling of this page rather than a descendant, so it cannot be passed as a
// prop or provided. Shared state is the seam. Cleared on unmount so a page
// without headings does not inherit the previous lesson's list.
const pageToc = useState<unknown[]>('page-toc', () => [])
watchEffect(() => {
  pageToc.value = page.value?.body?.toc?.links ?? []
})
onBeforeUnmount(() => {
  pageToc.value = []
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonLd: any[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    // The locale this page was prerendered for, not a fixed 'en'.
    'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
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
  <article v-if="page">
    <DocsBreadcrumb
      :items="breadcrumbItems"
      class="lesson__crumbs"
    />

    <header class="lesson__head">
      <p
        v-if="headline"
        class="eyebrow"
      >
        {{ headline }}
      </p>
      <h1 class="lesson__title">
        {{ page.title }}
      </h1>
      <p
        v-if="page.description"
        class="lead lesson__desc"
      >
        {{ page.description }}
      </p>

      <div class="lesson__actions">
        <UiButton
          v-for="(link, index) in page.links"
          :key="index"
          :to="link.to"
          :target="link.target"
          :icon="link.icon"
          size="sm"
        >
          {{ link.label }}
        </UiButton>

        <PageHeaderLinks />
      </div>
    </header>

    <!-- The table of contents moves inline above the lesson below xl, where the
         right rail is gone. It is a jump list, so it has to stay reachable. -->
    <details
      v-if="page.body?.toc?.links?.length"
      class="lesson__toc-inline"
    >
      <summary>On this page</summary>
      <DocsToc :links="page.body.toc.links" />
    </details>

    <div class="lesson__body">
      <YoutubeEmbed
        v-if="page.video?.id"
        :id="page.video.id"
        :start="page.video.start"
        :end="page.video.end"
        :title="page.title"
        class="lesson__video"
      />

      <ContentRenderer
        v-if="renderedPage"
        :value="renderedPage"
        class="content"
      />

      <LessonInterview
        v-if="page.interview?.length"
        :items="page.interview"
      />

      <AdUnit placement="endOfArticle" />

      <DocsSurround :surround="surround" />

      <AdUnit placement="relatedPosts" />
    </div>
  </article>
</template>

<style scoped lang="scss">
.lesson__crumbs {
  margin-block-end: var(--s-4);
}

.lesson__head {
  padding-block-end: var(--s-5);
  border-block-end: 1px solid var(--c-line);
}

.lesson__title {
  font-size: var(--t-h1);
  text-wrap: balance;
}

.lesson__desc {
  margin-block-start: var(--s-3);
  max-width: 54ch;
}

.lesson__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin-block-start: var(--s-4);
}

.lesson__body {
  margin-block-start: var(--s-5);
}

.lesson__video {
  margin-block-end: var(--s-6);
}

.lesson__toc-inline {
  margin-block-start: var(--s-5);
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--c-line);
  border-radius: var(--r-md);
  background: var(--c-bg-sunken);

  summary {
    font-size: var(--t-tiny);
    font-weight: 700;
    letter-spacing: var(--tr-wide);
    text-transform: uppercase;
    color: var(--c-text-soft);
    cursor: pointer;
  }

  @media (min-width: 80rem) {
    display: none;
  }
}
</style>
