<script setup lang="ts">
/**
 * A showcase screenshot, and nothing else: the dashboard image in a fixed
 * 16:9 frame so cards line up whether or not the file has loaded. Entries
 * that still point at the shared placeholder show a plain labelled sheet
 * instead of a fake dashboard.
 *
 * `eager` is for the one image that is the point of a page (the detail
 * view); every card in a list loads lazily.
 */
const props = withDefaults(defineProps<{
  image?: string
  alt?: string
  eager?: boolean
  width?: number
}>(), { image: '', alt: '', eager: false, width: 640 })

const { t } = useI18n()

const shot = computed(() => (props.image && !props.image.includes('placeholder') ? props.image : ''))
const height = computed(() => Math.round(props.width * 9 / 16))
</script>

<template>
  <div class="relative aspect-video overflow-hidden bg-(--ice)">
    <NuxtImg
      v-if="shot"
      :src="shot"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      :width="width"
      :height="height"
      class="absolute inset-0 size-full object-cover object-top"
    />
    <div
      v-else
      class="graph-paper-fine absolute inset-0 flex items-center justify-center"
    >
      <span class="mono-label border-[1.5px] border-dashed border-(--ink2) bg-(--card) px-3 py-1.5">
        {{ t('showcase.noScreenshot') }}
      </span>
    </div>
  </div>
</template>
