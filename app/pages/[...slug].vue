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
const { t, locale, locales } = useI18n()
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

  // Every lesson repeats its frontmatter title as a leading `# H1`, so the
  // page shipped two <h1> elements: the player's own title and the body's
  // copy of it. That is a duplicate heading for a reader and an ambiguous
  // document outline for a crawler — one <h1> per page is the whole point of
  // the element. Dropped here rather than edited out of 49 lessons x 12
  // locales, and only when it is genuinely the first node.
  const body = p.body.value[0]?.[0] === 'h1'
    ? p.body.value.slice(1)
    : p.body.value

  return {
    ...p,
    body: {
      ...p.body,
      value: injectInArticleAds(body)
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
  <div v-if="page">
    <header class="mx-auto max-w-5xl pt-6">
      <p
        v-if="headline"
        class="text-xs font-semibold uppercase tracking-wide text-primary"
      >
        {{ headline }}
      </p>
      <h1 class="mt-1 text-3xl font-bold text-highlighted sm:text-4xl">
        {{ page.title }}
      </h1>
      <!-- The design system's underline accent: a short blue rule under
           every lesson title. -->
      <div
        class="mt-3 h-[3px] w-12 rounded-full bg-primary"
        aria-hidden="true"
      />
      <p
        v-if="page.description"
        class="mt-2 text-muted"
      >
        {{ page.description }}
      </p>

      <div
        v-if="page.links?.length"
        class="mt-4 flex flex-wrap gap-2"
      >
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
        />
        <PageHeaderLinks />
      </div>
    </header>

    <!-- Reading column plus the page outline. The outline is navigation
         WITHIN this lesson, on the trailing edge, opposite the curriculum
         rail which is navigation OUT of it. -->
    <div class="mx-auto mt-6 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <article class="min-w-0">
        <YoutubeEmbed
          v-if="page.video?.id"
          :id="page.video.id"
          :start="page.video.start"
          :end="page.video.end"
          :title="page.title"
          class="mb-8"
        />

        <ContentRenderer
          v-if="renderedPage"
          :value="renderedPage"
          class="prose-lesson"
        />

        <LessonInterview
          v-if="page.interview?.length"
          :items="page.interview"
        />

        <CourseLessonComplete />

        <AdUnit placement="endOfArticle" />
      </article>

      <aside
        v-if="page?.body?.toc?.links?.length"
        class="max-lg:hidden"
      >
        <nav
          class="sticky top-16"
          :aria-label="toc?.title"
        >
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-dimmed">
            {{ toc?.title }}
          </p>
          <ul class="space-y-1 border-s border-default">
            <template
              v-for="link in page.body.toc.links"
              :key="link.id"
            >
              <li>
                <a
                  class="-ms-px block border-s border-transparent ps-3 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
                  :href="`#${link.id}`"
                >{{ link.text }}</a>
              </li>
              <li
                v-for="child in link.children || []"
                :key="child.id"
              >
                <a
                  class="-ms-px block border-s border-transparent ps-6 text-sm text-dimmed transition-colors hover:border-primary hover:text-primary"
                  :href="`#${child.id}`"
                >{{ child.text }}</a>
              </li>
            </template>
          </ul>

          <div
            v-if="tocBottomLinks.length"
            class="mt-6 space-y-2 border-t border-default pt-4"
          >
            <UButton
              v-for="link in tocBottomLinks"
              :key="link.label"
              v-bind="link"
              color="neutral"
              variant="link"
              size="xs"
              class="justify-start p-0"
            />
          </div>
        </nav>
      </aside>
    </div>

    <!-- The docked prev/next. This is where a lesson is finished, which is
         why the transport bar above carries no primary action of its own. -->
    <nav
      class="mx-auto mt-10 grid max-w-5xl gap-3 border-t border-default pt-6 sm:grid-cols-2"
      :aria-label="t('course.curriculum')"
    >
      <UButton
        v-if="surround?.[0]"
        :to="surround[0].path"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="outline"
        size="lg"
        class="justify-start"
      >
        <span class="flex min-w-0 flex-col items-start">
          <span class="text-xs text-dimmed">{{ t('course.previous') }}</span>
          <span class="min-w-0 truncate">{{ surround[0].title }}</span>
        </span>
      </UButton>
      <span v-else />

      <UButton
        v-if="surround?.[1]"
        :to="surround[1].path"
        trailing-icon="i-lucide-arrow-right"
        size="lg"
        class="justify-end sm:col-start-2"
      >
        <span class="flex min-w-0 flex-col items-end">
          <span class="text-xs text-dimmed">{{ t('course.next') }}</span>
          <span class="min-w-0 truncate">{{ surround[1].title }}</span>
        </span>
      </UButton>
    </nav>

    <div class="mx-auto max-w-5xl">
      <AdUnit placement="relatedPosts" />
      <AdUnit placement="afterArticle" />
    </div>
  </div>
</template>
