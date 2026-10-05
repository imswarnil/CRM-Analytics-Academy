<script setup lang="ts">
/**
 * The ONE "this is locked" card, for a whole Pro lesson (LessonProGate) and
 * for an inline `::pro` block (content/ProLocked). Same look, same copy, same
 * calls to action everywhere a reader meets the paywall.
 *
 * It is presentation only. What keeps the content locked is that the build
 * moved it into the Worker (scripts/gate-content.mjs) and the API checks
 * hasPro() before returning it; this card is what stands where it was.
 *
 * `.bp-paywalled` is the selector the lesson's paywall JSON-LD points at.
 */
export interface LockedInside {
  paragraphs?: number
  videos?: number
  code?: number
  tables?: number
  minutes?: number
}

const props = withDefaults(defineProps<{
  kind?: 'lesson' | 'block'
  teaser?: string
  inside?: LockedInside
  error?: string
}>(), {
  kind: 'lesson',
  teaser: '',
  inside: undefined,
  error: ''
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn } = useAuth()

// Back to this lesson after paying or signing in, and to this block on it.
const back = computed(() => route.fullPath)

const insideText = computed(() => {
  const i = props.inside
  if (!i) return ''
  const parts: string[] = []
  if (i.paragraphs) parts.push(t('pro.paragraphs', i.paragraphs))
  if (i.videos) parts.push(t('pro.videos', i.videos))
  if (i.code) parts.push(t('pro.code', i.code))
  if (i.tables) parts.push(t('pro.tables', i.tables))
  if (i.minutes && i.paragraphs) parts.push(t('pro.minutes', { count: i.minutes }))
  return parts.join(' · ')
})

const block = computed(() => props.kind === 'block')
</script>

<template>
  <div
    class="bp-paywalled not-prose relative"
    :class="block ? 'my-8' : 'my-10'"
  >
    <!-- A whole lesson fades its teaser into the lock so it reads as "there is more". -->
    <div
      v-if="!block"
      class="pointer-events-none absolute inset-x-0 -top-24 h-24"
      style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
    />
    <div class="crosshair hatch border-[1.5px] border-(--ink) p-2">
      <div
        class="bg-(--card) text-center"
        :class="block ? 'p-5 sm:p-7' : 'p-6 sm:p-10'"
      >
        <span
          class="mx-auto flex items-center justify-center border-[1.5px] border-(--ink) bg-(--ink) text-(--paper)"
          :class="block ? 'size-10' : 'size-12'"
        >
          <UIcon
            name="i-lucide-lock"
            class="size-5"
          />
        </span>
        <p
          class="eyebrow"
          :class="block ? 'mt-4' : 'mt-5'"
        >
          {{ block ? t('pro.blockEyebrow') : t('pro.lessonEyebrow') }}
        </p>
        <h3 class="bp-h3 mt-2 text-(--ink)">
          {{ teaser || (block ? t('pro.blockTitle') : t('pro.lessonTitle')) }}
        </h3>
        <p
          v-if="insideText"
          class="mx-auto mt-3 inline-flex flex-wrap items-center justify-center gap-x-2 border border-dashed border-(--ink2) px-3 py-1 font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)"
        >
          <span class="text-(--ink)">{{ t('pro.inside') }}:</span> {{ insideText }}
        </p>
        <p class="mx-auto mt-3 max-w-md text-(--ink2)">
          {{ block ? t('pro.blockBody') : t('pro.lessonBody') }}
        </p>
        <p
          v-if="error"
          class="mt-3 text-sm text-error"
        >
          {{ error }}
        </p>
        <div
          class="flex flex-wrap justify-center gap-3"
          :class="block ? 'mt-5' : 'mt-7'"
        >
          <UButton
            :to="{ path: localePath('/pricing'), query: { redirect: back } }"
            :size="block ? 'md' : 'lg'"
            icon="i-lucide-sparkles"
          >
            {{ t('pro.seePlans') }}
          </UButton>
          <UButton
            v-if="!isSignedIn"
            :to="{ path: localePath('/sign-in'), query: { redirect: back } }"
            :size="block ? 'md' : 'lg'"
            color="neutral"
            variant="outline"
          >
            {{ t('pro.haveIt') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
