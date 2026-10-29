<script setup lang="ts">
/**
 * The end of a Pro lesson's teaser for anyone without Pro. Signed out: the
 * free account comes first (and with it, no promos). Signed in: request Pro,
 * which files a lead the owner answers — there is no checkout.
 */
const props = defineProps<{
  lessonTitle: string
  loading?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { isSignedIn } = useAuth()
const proTo = computed(() => ({ path: localePath('/pro'), query: { product: 'pro', lesson: route.path } }))
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: { redirect: route.fullPath } }))
const PERKS = ['perkLessons', 'perkExams', 'perkNoPromos', 'perkCommunity'] as const
</script>

<template>
  <section
    class="crosshair relative my-10 border-[1.5px] border-(--ink) bg-(--card)"
    :aria-busy="props.loading"
  >
    <!-- The teaser above fades into the card, so the cut reads as deliberate. -->
    <div class="pointer-events-none absolute -top-24 inset-x-0 h-24 bg-gradient-to-b from-transparent to-(--paper)" />
    <div class="graph-paper-navy flex items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--navy) px-6 py-4 text-white">
      <UIcon
        name="i-lucide-lock-keyhole"
        class="size-6 text-(--glow)"
      />
      <p class="font-mono text-xs uppercase tracking-[.14em] text-(--glow)">
        {{ t('pro.eyebrow') }}
      </p>
    </div>
    <div class="p-6 sm:p-8">
      <h2 class="text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
        {{ t('pro.lockedTitle') }}
      </h2>
      <p class="mt-2 text-[17px] leading-relaxed text-(--ink2)">
        {{ t('pro.lockedBody', { title: props.lessonTitle }) }}
      </p>
      <ul class="mt-5 grid gap-3 sm:grid-cols-2">
        <li
          v-for="p in PERKS"
          :key="p"
          class="flex items-start gap-2 text-[15px] text-(--ink)"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-0.5 size-5 shrink-0 text-(--signal)"
          />{{ t(`pro.${p}`) }}
        </li>
      </ul>
      <div class="mt-7 flex flex-wrap items-center gap-3">
        <UButton
          v-if="!isSignedIn"
          :to="signUpTo"
          size="xl"
          icon="i-lucide-user-plus"
        >
          {{ t('pro.signUpFirst') }}
        </UButton>
        <UButton
          :to="proTo"
          size="xl"
          :color="isSignedIn ? 'primary' : 'neutral'"
          :variant="isSignedIn ? 'solid' : 'outline'"
          icon="i-lucide-sparkles"
        >
          {{ t('pro.getPro') }}
        </UButton>
        <p
          v-if="!isSignedIn"
          class="w-full text-sm text-(--ink2)"
        >
          {{ t('pro.signUpHint') }}
        </p>
      </div>
    </div>
  </section>
</template>
