<script setup lang="ts">
// Nuxt UI's prose link, with internal hrefs pointed at the reader's locale —
// see localizeHref. Everything else (styling, external targets) is its own.
import UiProseA from '@nuxt/ui/runtime/components/prose/A.vue'

const props = defineProps<{
  href?: string
  target?: string
}>()

const { locale, localeCodes } = useI18n()
const href = computed(() => localizeHref(props.href, locale.value, localeCodes.value))
</script>

<template>
  <UiProseA
    :href="href"
    :target="target"
  >
    <slot />
  </UiProseA>
</template>
