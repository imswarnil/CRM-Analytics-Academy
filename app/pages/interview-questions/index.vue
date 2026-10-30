<script setup lang="ts">
/**
 * /interview-questions with no question open. The list itself is the parent
 * page (interview-questions.vue); this child only owns the collection's SEO —
 * an open question replaces it with its own.
 */
definePageMeta({ scrollToTop: false })

const { t } = useI18n()
const localePath = useLocalePath()
const { data: rows } = await useInterviewRows()

const title = computed(() => t('interview.seoTitle'))
const description = computed(() => t('interview.seoDesc', { n: rows.value?.length ?? 0 }))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Docs', { title: title.value, description: description.value, headline: t('interview.eyebrow'), spec: 'Q&A · FREE' })
usePageSchema(() => ({
  name: title.value,
  description: description.value,
  type: 'CollectionPage',
  trail: [{ name: t('interview.eyebrow'), path: '/interview-questions' }],
  extra: [{
    '@type': 'ItemList',
    'numberOfItems': rows.value?.length ?? 0,
    'itemListElement': (rows.value ?? []).map((r, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': `${SITE.url}${localePath(`/interview-questions/${r.path.split('/').pop()}`)}`,
      'name': r.title
    }))
  }]
}))
</script>

<template>
  <span class="hidden" />
</template>
