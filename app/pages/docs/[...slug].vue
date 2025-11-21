<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs'
})

const route = useRoute()
const { toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('docs').path(route.path).first()
)
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

const headline = computed(() =>
  findPageHeadline(navigation?.value, page.value?.path)
)

// Build "Edit this page" + community links from app.config
const links = computed(() => {
  const arr: any[] = []

  if (toc?.bottom?.edit && page.value) {
    arr.push({
      icon: 'i-lucide-external-link',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page.value.stem}.${page.value.extension}`,
      target: '_blank'
    })
  }

  if (toc?.bottom?.links?.length) {
    arr.push(...toc.bottom.links)
  }

  return arr
})

defineOgImageComponent('Docs', {
  headline: headline.value
})
</script>

<template>
<GoogleAd variant="leaderboard" />
<GoogleAd variant="large-leaderboard" />
<GoogleAd variant="small-leaderboard" />

<GoogleAd variant="wide-skyscraper" />
<GoogleAd variant="skyscraper" />
<GoogleAd variant="vertical" />

<GoogleAd variant="rectangle" />
<GoogleAd variant="square" />
<GoogleAd variant="square-fixed" />

<GoogleAd variant="in-article" />
<GoogleAd variant="in-feed" />
<GoogleAd variant="multiplex" />
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :headline="headline"
    />

    <UPageBody>
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />

      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <!-- RIGHT SIDEBAR: TOC + Community links + square ad -->
    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :title="toc?.title || 'On this page'"
        :links="page.body.toc.links"
      >
        <!-- Bottom area: community links + ad -->
        <template
          v-if="toc?.bottom"
          #bottom
        >
          <div
            class="hidden lg:block mt-6 space-y-6"
            :class="{ '!mt-6': page.body?.toc?.links?.length }"
          >
            <USeparator type="dashed" />

            <!-- Community / GitHub links -->
            <UPageLinks
              :title="toc.bottom.title"
              :links="links"
            />

            <!-- Square ad block using Tailwind only -->
            <div
              class="mt-2 w-full rounded-xl border border-slate-200/80 bg-slate-50/80
                     dark:border-slate-800/80 dark:bg-slate-900/70
                     flex items-center justify-center aspect-square"
            >
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
                Ad – 1:1 Square
              </span>
            </div>

            <!-- If you want to use your real ad component instead, swap this:
            <GoogleAd variant="square-fixed" />
            -->
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
