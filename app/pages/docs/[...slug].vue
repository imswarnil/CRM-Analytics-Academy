<script setup lang="ts">
definePageMeta({
  layout: 'docs'
})

const route = useRoute()

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

defineOgImageComponent('Saas')
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
    />

    <UPageBody>
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />
      <USeparator v-if="surround?.length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

   <template v-if="page?.body?.toc?.links?.length" #right>
  <UContentToc :links="page.body.toc.links" class="z-[2]">
    <template #bottom>
      <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

      <UPageLinks title="Community" :links="communityLinks" />

      <USeparator type="dashed" />

      <!-- Inline dummy ad -->
      <div
        style="
          width: 100%;
          max-width: 260px;
          aspect-ratio: 1 / 1;
          margin: 0.75rem auto 0;
          border-radius: 16px;
          border: 1px dashed rgba(148, 163, 184, 0.7);
          background: linear-gradient(135deg, rgba(15,23,42,0.03), rgba(148,163,184,0.08));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.3;
          color: #6b7280;
          text-align: center;
        "
      >
       
      </div>
    </template>
  </UContentToc>
</template>

  </UPage>
</template>
