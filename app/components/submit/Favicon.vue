<script setup lang="ts">
/** The favicon (or logo) of any link, square-framed. Blank until resolved. */
import { fetchUrlMeta, fallbackIcon, isHttpUrl } from './urlMeta'

const props = withDefaults(defineProps<{ url?: string | null, size?: number }>(), { size: 20 })

const icon = ref('')
const broken = ref(false)

watch(() => props.url, async (url) => {
  broken.value = false
  icon.value = isHttpUrl(url) ? fallbackIcon(url) : ''
  if (!isHttpUrl(url) || import.meta.server) return
  const meta = await fetchUrlMeta(url)
  if (props.url === url && meta.icon) icon.value = meta.icon
}, { immediate: true })
</script>

<template>
  <span
    class="inline-flex flex-none items-center justify-center overflow-hidden border border-(--line) bg-(--card)"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="icon && !broken"
      :src="icon"
      alt=""
      :width="size - 4"
      :height="size - 4"
      loading="lazy"
      referrerpolicy="no-referrer"
      class="object-contain"
      @error="broken = true"
    >
    <UIcon
      v-else
      name="i-lucide-link"
      class="size-3/5 text-(--ink2)"
    />
  </span>
</template>
