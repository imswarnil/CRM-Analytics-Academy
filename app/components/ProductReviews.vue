<script setup lang="ts">
/**
 * Star reviews of one product (GET/POST /api/reviews). Loaded only when the
 * block scrolls into view, so readers who never reach it cost no request.
 * Signed-in learners leave or edit one review; text is rendered as text.
 * When there are reviews, an AggregateRating is added to the page's JSON-LD.
 */
const props = defineProps<{ product: string, name: string }>()

interface Review { rating: number, body: string, createdAt: string, name: string, image: string | null }
interface Data { count: number, avg: number, dist: number[], reviews: Review[] }

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn } = useAuth()
const { demo } = useProgress()

const data = ref<Data | null>(null)
const root = ref<HTMLElement | null>(null)
async function load() {
  try {
    data.value = await $fetch<Data>('/api/reviews', { query: { product: props.product } })
  } catch {
    data.value = { count: 0, avg: 0, dist: [0, 0, 0, 0, 0], reviews: [] }
  }
}
onMounted(() => {
  if (!root.value) return
  const io = new IntersectionObserver((e) => {
    if (e.some(x => x.isIntersecting)) {
      io.disconnect()
      load()
    }
  }, { rootMargin: '400px 0px' })
  io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})

useHead(() => data.value?.count
  ? {
      script: [{
        key: `rating-${props.product}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          'name': props.name,
          'aggregateRating': { '@type': 'AggregateRating', 'ratingValue': data.value.avg, 'reviewCount': data.value.count, 'bestRating': 5, 'worstRating': 1 }
        }).replace(/</g, '\\u003c')
      }]
    }
  : {})

const stars = ref(0)
const hover = ref(0)
const text = ref('')
const sending = ref(false)
const error = ref('')
const done = ref(false)
async function send() {
  error.value = ''
  if (!stars.value) return (error.value = t('reviews.errStars'))
  if (text.value.trim().length < 10) return (error.value = t('reviews.errText'))
  sending.value = true
  try {
    const res = await $fetch<{ review: Review }>('/api/reviews', { method: 'POST', body: { product: props.product, rating: stars.value, body: text.value } })
    done.value = true
    if (data.value) {
      data.value.reviews = [res.review, ...data.value.reviews.filter(r => r.name !== res.review.name)]
    }
  } catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err?.data?.statusMessage || t('reviews.errGeneric')
  } finally {
    sending.value = false
  }
}
const when = (d: string) => new Date(d).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<template>
  <section
    ref="root"
    class="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]"
    :aria-label="t('reviews.title')"
  >
    <!-- Summary + form -->
    <div class="space-y-5">
      <div class="rounded-[6px] border border-(--line) bg-(--card) p-5">
        <p class="mono-label">
          {{ t('reviews.title') }}
        </p>
        <template v-if="data?.count">
          <p class="mt-2 flex items-baseline gap-2">
            <span class="text-4xl font-bold tabular-nums text-(--ink)">{{ data.avg.toFixed(1) }}</span>
            <span class="text-(--ink2)">/ 5</span>
          </p>
          <p class="text-sm text-(--ink2)">
            {{ t('reviews.count', { n: data.count }) }}
          </p>
          <ul class="mt-4 space-y-1.5">
            <li
              v-for="s in [5, 4, 3, 2, 1]"
              :key="s"
              class="flex items-center gap-2 text-sm"
            >
              <span class="w-3 tabular-nums text-(--ink2)">{{ s }}</span>
              <UIcon
                name="i-lucide-star"
                class="size-3.5 text-amber-500"
              />
              <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-(--line)">
                <span
                  class="block h-full rounded-full bg-amber-500"
                  :style="{ width: `${(data.dist[s - 1]! / data.count) * 100}%` }"
                />
              </span>
            </li>
          </ul>
        </template>
        <p
          v-else-if="data"
          class="mt-2 text-sm text-(--ink2)"
        >
          {{ t('reviews.none') }}
        </p>
      </div>

      <div class="rounded-[6px] border border-(--line) bg-(--card) p-5">
        <p class="font-semibold text-(--ink)">
          {{ t('reviews.write') }}
        </p>
        <ClientOnly>
          <template v-if="isSignedIn && !demo">
            <p
              v-if="done"
              class="mt-3 flex items-center gap-2 text-sm text-success"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4"
              />{{ t('reviews.thanks') }}
            </p>
            <form
              v-else
              class="mt-3 space-y-3"
              @submit.prevent="send"
            >
              <div
                class="flex gap-1"
                role="radiogroup"
                :aria-label="t('reviews.stars')"
                @mouseleave="hover = 0"
              >
                <button
                  v-for="s in 5"
                  :key="s"
                  type="button"
                  role="radio"
                  :aria-checked="stars === s"
                  :aria-label="t('reviews.nStars', { n: s })"
                  class="p-0.5"
                  @mouseenter="hover = s"
                  @click="stars = s"
                >
                  <UIcon
                    name="i-lucide-star"
                    class="size-6 transition-colors"
                    :class="(hover || stars) >= s ? 'text-amber-500 [&>path]:fill-current' : 'text-(--line)'"
                  />
                </button>
              </div>
              <UTextarea
                v-model="text"
                :rows="3"
                :maxlength="1000"
                autoresize
                class="w-full"
                :placeholder="t('reviews.placeholder')"
              />
              <p
                v-if="error"
                class="text-sm text-error"
              >
                {{ error }}
              </p>
              <UButton
                type="submit"
                :loading="sending"
                block
              >
                {{ t('reviews.send') }}
              </UButton>
            </form>
          </template>
          <template v-else>
            <p class="mt-2 text-sm text-(--ink2)">
              {{ t('reviews.signIn') }}
            </p>
            <UButton
              :to="{ path: localePath('/sign-in'), query: { redirect: route.fullPath } }"
              class="mt-3"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-log-in"
            >
              {{ t('nav.signIn') }}
            </UButton>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- The reviews -->
    <div class="min-w-0">
      <div
        v-if="!data"
        class="flex h-32 items-center justify-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin text-(--ink2)"
        />
      </div>
      <p
        v-else-if="!data.reviews.length"
        class="rounded-[6px] border border-dashed border-(--line) p-8 text-center text-(--ink2)"
      >
        {{ t('reviews.beFirst') }}
      </p>
      <ul
        v-else
        class="grid gap-3 md:grid-cols-2"
      >
        <li
          v-for="(r, i) in data.reviews"
          :key="i"
          class="rounded-[6px] border border-(--line) bg-(--card) p-5"
        >
          <div class="flex items-center gap-3">
            <span class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--signal) text-sm font-semibold text-white">
              <img
                v-if="r.image"
                :src="r.image"
                alt=""
                class="size-full object-cover"
                loading="lazy"
              >
              <template v-else>{{ r.name.slice(0, 1).toUpperCase() }}</template>
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-(--ink)">
                {{ r.name }}
              </p>
              <p class="text-xs text-(--ink2)">
                {{ when(r.createdAt) }}
              </p>
            </div>
            <span
              class="flex"
              :aria-label="t('reviews.nStars', { n: r.rating })"
            >
              <UIcon
                v-for="s in 5"
                :key="s"
                name="i-lucide-star"
                class="size-4"
                :class="s <= r.rating ? 'text-amber-500 [&>path]:fill-current' : 'text-(--line)'"
              />
            </span>
          </div>
          <p class="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-(--ink)">
            {{ r.body }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
