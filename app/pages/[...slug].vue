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
const { locale, locales } = useI18n()
const localeCodes = locales.value.map(l => l.code)
const contentPath = computed(() => routeToContentPath(route.path, localeCodes))

// The same path under the default locale, used whenever this one is untranslated.
const englishPath = computed(() =>
  contentPath.value.replace(new RegExp(`^/(${localeCodes.join('|')})(?=/|$)`), `/${DEFAULT_LOCALE}`)
)

// Videos are declared on the English lesson (translations are generated and
// may not carry the field), so a translated page borrows English's ids and
// MuxVideo then picks this reader's language from them.
const { data: englishMux } = await useAsyncData(`mux-${englishPath.value}`, async () => {
  if (contentPath.value === englishPath.value) return null
  const doc = await queryCollection('docs').path(englishPath.value).select('mux').first()
  return (doc?.mux as string | Record<string, string> | undefined) ?? null
})
const lessonMux = computed(() => page.value?.mux ?? englishMux.value ?? undefined)

const { normalise } = useProgress()
const lessonKey = computed(() => normalise(route.path))

// Set once a Pro lesson's full body has loaded; the full body starts with the
// teaser, so the teaser is hidden rather than shown twice.
const proUnlocked = ref(false)

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

// Search results cut a description near 160 characters, mid-word. Trim it at
// a word boundary instead; the full text stays on the page and in JSON-LD.
function metaDescription(text?: string, max = 158) {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 100)).replace(/[\s,;:—–-]+$/, '')}…`
}

useSeoMeta({
  title,
  ogTitle: title,
  description: metaDescription(description),
  ogDescription: metaDescription(description, 200)
})

// Render a copy of the page with in-article ads auto-injected between sections.
const renderedPage = computed(() => {
  const p = page.value
  if (!p?.body?.value) return p

  // Every lesson repeats its frontmatter title as a leading `# H1`, so the
  // page shipped two <h1> elements: the header's title and the body's copy of
  // it. That is a duplicate heading for a reader and an ambiguous document
  // outline for a crawler — one <h1> per page is the whole point of the
  // element. Dropped here rather than edited out of 49 lessons x 12 locales,
  // and only when it is genuinely the first node.
  const body = p.body.value[0]?.[0] === 'h1'
    ? p.body.value.slice(1)
    : p.body.value

  return {
    ...p,
    body: {
      ...p.body,
      value: injectInArticlePromos(body)
    }
  }
})

const headline = computed(() => findPageHeadline(navigation?.value, page.value?.path))

defineOgImage('Docs', { title, description, headline: headline.value })

// Crumb labels come from the navigation tree, so a section reads as its real
// title ("SAQL", "Setup, Profiles & Security") rather than a title-cased slug.
const sectionTitles = computed(() => {
  const map: Record<string, string> = {}
  for (const n of navigation?.value ?? []) {
    const seg = String(n.path ?? '').split('/').filter(Boolean).pop()
    if (seg) map[seg] = String(n.title ?? seg)
  }
  return map
})
const crumbLabel = (seg: string) => sectionTitles.value[seg]
  ?? seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// Structured data: the lesson as a learning article + a breadcrumb trail.
const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items = segments.map((seg, i) => ({
    '@type': 'ListItem',
    'position': i + 2,
    'name': crumbLabel(seg),
    'item': `${SITE.url}/${segments.slice(0, i + 1).join('/')}`
  }))
  return [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE.url }, ...items]
})

// Visible breadcrumb trail (locale segment stripped; last crumb = page title).
const breadcrumbItems = computed(() => {
  const segments = route.path.split('/').filter(Boolean).filter(s => !(localeCodes as string[]).includes(s))
  const items = segments.map((seg, i) => ({
    label: crumbLabel(seg),
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

// A Pro lesson's body is behind a paywall. Google's rule for that is to say
// so in structured data — isAccessibleForFree false plus the element that is
// gated — or the difference between what it crawls and what a reader sees
// can be treated as cloaking. `.bp-paywalled` is the gate in LessonProGate.
const lessonMeta = useLessonMeta().of(route.path)
const isPro = page.value?.access === 'pro'
const paywall = isPro
  ? { isAccessibleForFree: false, hasPart: { '@type': 'WebPageElement', 'isAccessibleForFree': false, 'cssSelector': '.bp-paywalled' } }
  : { isAccessibleForFree: true }

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
    'publisher': { '@id': ORG_ID },
    'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url },
    'timeRequired': `PT${lessonMeta.minutes}M`,
    ...paywall
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': crumbs.value
  }
]

/**
 * LearningResource, so this reads as coursework rather than as a blog post.
 * Search and answer engines use it to decide what a page TEACHES, which is the
 * question being asked when somebody types "how do I build a pipeline
 * dashboard in CRM Analytics" into an assistant rather than into a search box.
 */
jsonLd.push({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  'name': title,
  'description': description,
  'url': SITE.url + route.path,
  'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
  'learningResourceType': page.value?.walkthrough?.shots?.length ? 'Hands-on exercise' : 'Lesson',
  'educationalLevel': 'Professional',
  'teaches': 'Salesforce CRM Analytics',
  'timeRequired': `PT${lessonMeta.minutes}M`,
  ...paywall,
  'isPartOf': { '@type': 'Course', 'name': SITE.name, 'url': SITE.url }
})

/**
 * HowTo, built from the walkthrough script.
 *
 * This is the most valuable structured data on the site and it costs nothing to
 * emit: the walkthrough already IS an ordered list of steps with a click path
 * and an explanation, which is exactly the shape schema.org's HowTo describes.
 * A build lesson can therefore answer "how do I build X" directly, with its
 * steps, rather than being summarised second-hand.
 */
const shots = page.value?.walkthrough?.shots
if (shots?.length) {
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': title,
    'description': description,
    'inLanguage': locales.value.find(l => l.code === locale.value)?.language || locale.value,
    'totalTime': `PT${Math.max(1, Math.round(shots.reduce((n, sh) => n + (sh.seconds ?? 0), 0) / 60))}M`,
    ...(page.value?.walkthrough?.org
      ? { supply: [{ '@type': 'HowToSupply', 'name': page.value.walkthrough.org }] }
      : {}),
    'tool': [{ '@type': 'HowToTool', 'name': 'Salesforce CRM Analytics' }],
    'step': shots.map((sh, i) => ({
      '@type': 'HowToStep',
      'position': i + 1,
      'name': sh.shot,
      'text': sh.say,
      ...(sh.screen ? { tool: [{ '@type': 'HowToTool', 'name': sh.screen }] } : {}),
      'url': `${SITE.url}${route.path}#step-${i + 1}`
    }))
  })
}

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

// Player chrome: position in the course, prev / next, completion and the
// course timeline (one bar per lesson, current signal, done tide, open ice,
// locked Pro hatched).
const { lessons: courseLessons, current, previous, next, position, total: courseTotal } = useCourse()
const { isDone, setDone, pro } = useProgress()
const { isSignedIn } = useAuth()
const { of: metaOf } = useLessonMeta()
const meta = computed(() => metaOf(route.path))
const done = computed(() => isDone(route.path))
const mobileContents = useState('bp-contents-mobile', () => false)
const tocOpen = useCookie<boolean>('bp-toc-open', { default: () => true, sameSite: 'lax' })

async function toggleDone() {
  if (!isSignedIn.value) {
    await navigateTo(localePath('/sign-in'))
    return
  }
  await setDone(route.path, !done.value)
}

const timeline = computed(() => courseLessons.value.map((l) => {
  const m = metaOf(l.path)
  const here = normalise(l.path) === lessonKey.value
  const tone = here
    ? 'signal' as const
    : isDone(l.path)
      ? 'tide' as const
      : m.access === 'pro' && !pro.value ? 'hatch' as const : 'ice' as const
  return { value: m.minutes, tone, title: l.title, to: localePath(l.path) }
}))

const hasMedia = computed(() => Boolean(page.value?.clip?.src || page.value?.video?.id || (lessonMux.value && page.value?.access !== 'pro')))
const lessonNo = computed(() => String(position.value).padStart(3, '0'))
</script>

<template>
  <article
    v-if="page"
    class="min-w-0"
  >
    <!-- Lesson header: crumbs, drawing number, title -->
    <header class="graph-paper border-b-[1.5px] border-(--ink) px-4 pb-8 pt-6 sm:px-8">
      <div class="flex items-center justify-between gap-3">
        <nav
          aria-label="Breadcrumb"
          class="min-w-0"
        >
          <ol class="flex min-w-0 flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">
            <li
              v-for="(c, i) in breadcrumbItems"
              :key="c.to"
              class="flex items-center gap-2"
            >
              <span v-if="i">/</span>
              <NuxtLink
                :to="c.to"
                class="truncate hover:text-(--signal)"
                :class="i === breadcrumbItems.length - 1 ? 'text-(--ink)' : ''"
              >{{ c.label }}</NuxtLink>
            </li>
          </ol>
        </nav>
        <UButton
          class="lg:hidden"
          icon="i-lucide-list"
          color="neutral"
          variant="outline"
          size="sm"
          label="Contents"
          @click="mobileContents = true"
        />
      </div>

      <p class="eyebrow mt-6">
        Lesson {{ lessonNo }} / {{ courseTotal }} — {{ current?.moduleTitle || headline }}
      </p>
      <h1 class="bp-h2 mt-3 max-w-4xl text-(--ink)">
        {{ page.title }}
      </h1>
      <p
        v-if="page.description"
        class="bp-lead mt-4 max-w-3xl"
      >
        {{ page.description }}
      </p>
      <div class="mt-5 flex flex-wrap items-center gap-2">
        <span class="border-[1.5px] border-(--ink) bg-(--card) px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]">
          {{ meta.type }} · {{ meta.minutes }} min
        </span>
        <span
          class="border-[1.5px] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[.08em]"
          :class="page.access === 'pro' ? 'border-(--ink) bg-(--ink) text-(--paper)' : 'border-(--signal) text-(--signal)'"
        >{{ page.access === 'pro' ? 'Pro' : 'Free' }}</span>
        <UButton
          v-for="(link, index) in page.links"
          :key="index"
          v-bind="link"
          size="xs"
          color="neutral"
          variant="outline"
        />
        <PageHeaderLinks />
      </div>
    </header>

    <div class="mx-auto max-w-[68rem] px-4 py-8 sm:px-8">
      <!-- The media, framed as a figure -->
      <BpFigure
        v-if="hasMedia"
        :caption="`Fig. ${lessonNo} — ${page.title}`"
        :spec="`${meta.minutes} min`"
        ruler
        class="mb-8"
      >
        <video
          v-if="page.clip?.src"
          :src="page.clip.src"
          :poster="page.clip.poster"
          controls
          playsinline
          preload="metadata"
          class="aspect-video w-full bg-(--ink)"
        />
        <YoutubeEmbed
          v-else-if="page.video?.id"
          :id="page.video.id"
          :start="page.video.start"
          :end="page.video.end"
          :title="page.title"
        />
        <MuxVideo
          v-else-if="lessonMux && page.access !== 'pro'"
          :ids="lessonMux"
          :title="page.title"
        />
      </BpFigure>

      <!-- Prev / mark complete / next -->
      <div
        class="mb-8 grid items-stretch border-[1.5px] border-(--ink) bg-(--card)"
        style="grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)"
      >
        <NuxtLink
          v-if="previous"
          :to="localePath(previous.path)"
          class="group flex min-w-0 items-center gap-2 px-3 py-2.5 hover:bg-(--ice)"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-4 flex-none transition-transform group-hover:-translate-x-0.5"
          />
          <span class="min-w-0">
            <span class="block font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">Previous</span>
            <span class="block truncate text-sm font-semibold">{{ previous.title }}</span>
          </span>
        </NuxtLink>
        <span v-else />
        <ClientOnly>
          <button
            type="button"
            class="flex items-center gap-2 border-x-[1.5px] border-(--ink) px-4 font-mono text-[11px] font-semibold uppercase tracking-[.1em] transition-colors"
            :class="done ? 'bg-(--glow) text-(--ink)' : 'hover:bg-(--ice)'"
            @click="toggleDone"
          >
            <UIcon
              :name="done ? 'i-lucide-check-check' : 'i-lucide-check'"
              class="size-4"
            />
            <span class="hidden sm:inline">{{ done ? 'Completed' : 'Mark complete' }}</span>
          </button>
          <template #fallback>
            <span class="border-x-[1.5px] border-(--ink) px-4" />
          </template>
        </ClientOnly>
        <NuxtLink
          v-if="next"
          :to="localePath(next.path)"
          class="group flex min-w-0 items-center justify-end gap-2 px-3 py-2.5 text-end hover:bg-(--ice)"
        >
          <span class="min-w-0">
            <span class="block font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">Next</span>
            <span class="block truncate text-sm font-semibold">{{ next.title }}</span>
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 flex-none transition-transform group-hover:translate-x-0.5"
          />
        </NuxtLink>
        <span v-else />
      </div>

      <!-- Course timeline -->
      <div class="mb-10 border-[1.5px] border-(--ink) bg-(--card) p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p class="mono-label">
            Course timeline — lesson {{ position }} of {{ courseTotal }}
          </p>
          <div class="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 border border-(--ink) bg-(--signal)" />Here</span>
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 border border-(--ink) bg-(--tide)" />Done</span>
            <span class="flex items-center gap-1"><i class="inline-block size-2.5 border border-(--ink) bg-(--ice)" />Open</span>
            <span class="flex items-center gap-1"><i class="hatch inline-block size-2.5 border border-(--ink)" />Pro</span>
          </div>
        </div>
        <ClientOnly>
          <BpTimeline
            :bars="timeline"
            :height="64"
          />
          <template #fallback>
            <div class="h-16" />
          </template>
        </ClientOnly>
      </div>

      <LessonWalkthrough
        v-if="page.walkthrough?.shots?.length"
        :shots="page.walkthrough.shots"
        :org="page.walkthrough.org"
        :has-video="Boolean(page.clip?.src || page.video?.id)"
      />

      <details
        v-if="page?.body?.toc?.links?.length"
        class="group mb-8 border-[1.5px] border-(--ink) bg-(--card) xl:hidden"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-[11px] uppercase tracking-[.1em]">
          {{ toc?.title || 'On this page' }}
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 transition-transform group-open:rotate-180"
          />
        </summary>
        <ul class="border-t border-dashed border-(--line) px-4 py-3 text-sm">
          <li
            v-for="l in page.body.toc.links"
            :key="l.id"
            class="py-1"
          >
            <a
              :href="`#${l.id}`"
              class="hover:text-(--signal)"
            >{{ l.text }}</a>
          </li>
        </ul>
      </details>

      <div
        class="relative xl:grid xl:gap-10"
        :class="tocOpen ? 'xl:grid-cols-[minmax(0,1fr)_12rem]' : 'xl:grid-cols-[minmax(0,1fr)_2.25rem]'"
      >
        <div class="bp-prose min-w-0">
          <ContentRenderer
            v-if="renderedPage && !proUnlocked"
            :value="renderedPage"
          />

          <!-- For a Pro lesson the rendered body above is only the public teaser.
               The gate shows the paywall, or fetches and renders the full lesson
               for a reader whose entitlement the server confirms. -->
          <CourseLessonProGate
            v-if="page.access === 'pro'"
            :content-path="contentPath"
            :title="page.title"
            :mux="page.mux"
            @unlocked="proUnlocked = true"
          />
        </div>

        <aside
          v-if="page?.body?.toc?.links?.length"
          class="hidden xl:block"
        >
          <!-- Collapsed: a narrow rail with the reopen button, and the prose
               takes the width back. Remembered per reader in a cookie. -->
          <div
            v-if="!tocOpen"
            class="sticky top-24 flex flex-col items-center gap-3"
          >
            <UButton
              icon="i-lucide-panel-right-open"
              color="neutral"
              variant="outline"
              size="xs"
              square
              aria-label="Show table of contents"
              @click="tocOpen = true"
            />
            <span class="font-mono text-[10px] uppercase tracking-[.15em] text-(--ink2) [writing-mode:vertical-rl]">{{ toc?.title || 'On this page' }}</span>
          </div>
          <div
            v-else
            class="sticky top-24"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <p class="mono-label">
                {{ toc?.title || 'On this page' }}
              </p>
              <UButton
                icon="i-lucide-panel-right-close"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                aria-label="Collapse table of contents"
                @click="tocOpen = false"
              />
            </div>
            <ul class="space-y-2 border-s-[1.5px] border-(--ink) text-[13px]">
              <li
                v-for="l in page.body.toc.links"
                :key="l.id"
              >
                <a
                  :href="`#${l.id}`"
                  class="-ms-[1.5px] block border-s-[3px] border-transparent ps-3 text-(--ink2) hover:border-(--signal) hover:text-(--ink)"
                >{{ l.text }}</a>
              </li>
            </ul>
            <div
              v-if="tocBottomLinks.length"
              class="mt-6 space-y-2 border-t border-dashed border-(--line) pt-4"
            >
              <NuxtLink
                v-for="l in tocBottomLinks"
                :key="l.label"
                :to="l.to"
                :target="l.target"
                class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2) hover:text-(--signal)"
              >
                <UIcon
                  :name="l.icon"
                  class="size-3.5"
                />{{ l.label }}
              </NuxtLink>
            </div>
            <PromoSlot
              placement="sidebarSquare"
              class="mt-6 w-full"
            />
          </div>
        </aside>
      </div>

      <CourseQuizCard
        v-if="page.quiz?.length"
        :questions="page.quiz"
      />

      <LessonInterview
        v-if="page.interview?.length"
        :items="page.interview"
      />

      <CourseLessonComplete />

      <!-- One discussion per lesson across all languages: the path is
           locale-stripped, so a question asked on the Spanish page is there
           for English readers too. -->
      <CourseLessonComments :lesson-path="lessonKey" />

      <PromoSlot placement="endOfArticle" />

      <UContentSurround
        :surround="surround"
        class="mt-10"
      />

      <PromoSlot placement="relatedPosts" />
    </div>
  </article>
</template>
