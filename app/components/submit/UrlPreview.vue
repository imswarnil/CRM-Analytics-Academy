<script setup lang="ts">
/**
 * A live preview of a link: favicon, site, title and description, fetched
 * (debounced) as the contributor types. Emits the metadata so the form can
 * prefill empty fields from it.
 */
import { fetchUrlMeta, hostOf, isHttpUrl, type UrlMeta } from '~/utils/urlMeta'

const props = defineProps<{ url: string }>()
const emit = defineEmits<{ meta: [UrlMeta] }>()

const meta = ref<UrlMeta | null>(null)
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.url, (url) => {
  clearTimeout(timer)
  if (!isHttpUrl(url)) {
    meta.value = null
    return
  }
  loading.value = true
  timer = setTimeout(async () => {
    const result = await fetchUrlMeta(url)
    if (props.url !== url) return
    meta.value = result
    loading.value = false
    emit('meta', result)
  }, 450)
}, { immediate: true })

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    v-if="isHttpUrl(url)"
    class="flex gap-4 border-[1.5px] border-(--ink) bg-(--card) p-4"
    aria-live="polite"
  >
    <SubmitFavicon
      :url="url"
      :size="44"
    />
    <div class="min-w-0 flex-1">
      <p class="font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
        {{ meta?.siteName || hostOf(url) }}
      </p>
      <template v-if="loading">
        <USkeleton class="mt-2 h-4 w-2/3" />
        <USkeleton class="mt-2 h-3 w-full" />
      </template>
      <template v-else>
        <p class="mt-1 truncate font-bold text-(--ink)">
          {{ meta?.title || 'No title found — type one below' }}
        </p>
        <p
          v-if="meta?.description"
          class="mt-1 line-clamp-2 text-sm text-(--ink2)"
        >
          {{ meta.description }}
        </p>
      </template>
    </div>
    <img
      v-if="meta?.image && !loading"
      :src="meta.image"
      alt=""
      loading="lazy"
      referrerpolicy="no-referrer"
      class="hidden h-20 w-32 flex-none border border-(--line) object-cover sm:block"
    >
  </div>
</template>
