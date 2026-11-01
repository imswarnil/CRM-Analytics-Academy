<script setup lang="ts">
/**
 * A sponsor's banner as the reader sees it — used live (SponsorBanner) and as
 * the preview in the sponsor's studio, so what they design is exactly what
 * runs. Colours, logo and copy are the sponsor's; the frame is the Academy's.
 */
const props = defineProps<{
  company: string
  creative: { logo?: string, headline?: string, body?: string, cta?: string, url?: string, bg?: string, fg?: string, accent?: string }
  preview?: boolean
}>()
const emit = defineEmits<{ click: [] }>()
const { t } = useI18n()
const style = computed(() => ({ background: props.creative.bg || '#0c1b33', color: props.creative.fg || '#ffffff' }))
</script>

<template>
  <div
    class="flex min-h-12 items-center gap-3 border-b-[1.5px] border-(--ink) px-4 py-2 sm:px-6"
    :style="style"
  >
    <span class="shrink-0 border border-current px-1.5 font-mono text-[9px] uppercase tracking-[.14em] opacity-70">{{ t('sponsor.label') }}</span>
    <img
      v-if="props.creative.logo"
      :src="props.creative.logo"
      :alt="props.company"
      class="h-7 w-auto max-w-28 shrink-0 object-contain"
      loading="lazy"
    >
    <p class="min-w-0 flex-1 truncate text-sm">
      <span class="font-bold">{{ props.creative.headline || props.company }}</span>
      <span
        v-if="props.creative.body"
        class="opacity-80 max-sm:hidden"
      > — {{ props.creative.body }}</span>
    </p>
    <a
      v-if="props.creative.cta && props.creative.url"
      :href="props.preview ? undefined : props.creative.url"
      target="_blank"
      rel="sponsored noopener"
      class="shrink-0 px-3 py-1.5 text-sm font-bold text-white"
      :style="{ background: props.creative.accent || '#2f5bea' }"
      @click="emit('click')"
    >{{ props.creative.cta }}</a>
  </div>
</template>
