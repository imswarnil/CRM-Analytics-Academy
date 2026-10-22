<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const toast = useToast()
const { copy, copied } = useClipboard()
const site = useSiteConfig()

// Raw markdown is a static file per lesson, written at build time by
// scripts/build-search-index.mjs: /raw/<route>.md for English (no locale
// segment, like the page URL) and /raw/<locale>/<route>.md for translations.
const { t, locales } = useI18n()
const localeCodes = locales.value.map(l => l.code)
const contentPath = computed(() => routeToContentPath(route.path, localeCodes))
const rawPath = computed(() => `/raw${contentPath.value.replace(/^\/en(?=\/|$)/, '')}.md`)
const mdPath = computed(() => `${site.url}${rawPath.value}`)

const items = computed(() => [
  {
    label: t('lesson.copy.markdownLink'),
    icon: 'i-lucide-link',
    onSelect() {
      copy(mdPath.value)
      toast.add({
        title: t('lesson.copy.copied'),
        icon: 'i-lucide-check-circle'
      })
    }
  },
  {
    label: t('lesson.copy.viewMarkdown'),
    icon: 'i-simple-icons:markdown',
    target: '_blank',
    to: rawPath.value
  },
  {
    label: t('lesson.copy.openChatgpt'),
    icon: 'i-simple-icons:openai',
    target: '_blank',
    to: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`
  },
  {
    label: t('lesson.copy.openClaude'),
    icon: 'i-simple-icons:anthropic',
    target: '_blank',
    to: `https://claude.ai/new?q=${encodeURIComponent(`Read ${mdPath.value} so I can ask questions about it.`)}`
  }
])

async function copyPage() {
  try {
    copy(await $fetch<string>(rawPath.value))
    toast.add({
      title: t('lesson.copy.copied'),
      icon: 'i-lucide-check-circle'
    })
  } catch {
    toast.add({
      title: t('lesson.copy.failed'),
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}
</script>

<template>
  <UFieldGroup>
    <UButton
      :label="t('lesson.copy.page')"
      size="xs"
      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
      color="neutral"
      variant="outline"
      :ui="{
        leadingIcon: [copied ? 'text-(--signal)' : 'text-(--ink)', 'size-3.5']
      }"
      @click="copyPage"
    />
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'end',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-48'
      }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        size="xs"
        color="neutral"
        variant="outline"
        :aria-label="t('lesson.copy.menu')"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
