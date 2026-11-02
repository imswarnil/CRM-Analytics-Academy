<script setup lang="ts">
/**
 * The visitor wall: shown over a metered page when someone WITHOUT an account
 * has opened their ANON_SESSIONS free pages (charged with each page view). A free
 * account is unlimited on free content, so the only ask is to sign up. The
 * navbar stays usable.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { status, blocked } = useMeter()
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: { redirect: route.fullPath } }))
</script>

<template>
  <Transition name="meter-wall">
    <div
      v-if="blocked && status && !status.signedIn"
      class="fixed inset-x-0 bottom-0 top-(--ui-header-height) z-40 flex items-center justify-center bg-(--paper)/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      :aria-label="t('meter.wallTitleAnon', { n: ANON_SESSIONS })"
    >
      <div class="crosshair w-full max-w-lg border-[1.5px] border-(--ink) bg-(--card) shadow-[10px_10px_0_var(--ink)]">
        <div class="graph-paper-navy flex items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--navy) px-6 py-4 text-white">
          <UIcon
            name="i-lucide-book-open-check"
            class="size-6 text-(--glow)"
          />
          <p class="font-mono text-xs uppercase tracking-[.14em] text-(--glow)">
            {{ t('meter.eyebrow', { used: status.used, allowance: status.allowance }) }}
          </p>
        </div>
        <div class="space-y-4 p-6 sm:p-8">
          <h2 class="text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
            {{ t('meter.wallTitleAnon', { n: ANON_SESSIONS }) }}
          </h2>
          <p class="text-[17px] leading-relaxed text-(--ink2)">
            {{ t('meter.wallBodyAnon') }}
          </p>
          <UButton
            :to="signUpTo"
            size="xl"
            block
            icon="i-lucide-user-plus"
          >
            {{ t('meter.signUp') }}
          </UButton>
          <p class="text-center text-sm text-(--ink2)">
            <NuxtLink
              :to="{ path: localePath('/sign-in'), query: { redirect: route.fullPath } }"
              class="font-semibold text-(--signal) hover:underline"
            >{{ t('meter.signIn') }}</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.meter-wall-enter-active, .meter-wall-leave-active { transition: opacity 0.3s ease; }
.meter-wall-enter-from, .meter-wall-leave-to { opacity: 0; }
</style>
