<script setup lang="ts">
/**
 * The fair-use wall: shown over a metered page when the reader has no
 * sessions left (plugins/meter.client.ts). The navbar stays usable. What it
 * offers depends on who is reading:
 *
 *   anonymous            a free account — ACCOUNT_SESSIONS − ANON_SESSIONS more
 *   signed in, points    a pack: PACK_SESSIONS sessions for PACK_POINTS points
 *   signed in, no points how to earn points without spending sessions
 *   anyone               unlimited access through their organisation
 */
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { status, blocked, buy } = useMeter()
const { balance, load } = useProgress()
const buying = ref(false)
const error = ref('')

const canBuy = computed(() => (status.value?.signedIn ?? false) && balance.value >= PACK_POINTS)
async function buyOne() {
  buying.value = true
  error.value = ''
  try {
    await buy(1)
    await load()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    buying.value = false
  }
}
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: { redirect: route.fullPath } }))
</script>

<template>
  <Transition name="meter-wall">
    <div
      v-if="blocked && status"
      class="fixed inset-x-0 bottom-0 top-(--ui-header-height) z-40 flex items-center justify-center bg-(--paper)/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      :aria-label="t('meter.wallTitle')"
    >
      <div class="crosshair w-full max-w-xl border-[1.5px] border-(--ink) bg-(--card) shadow-[10px_10px_0_var(--ink)]">
        <div class="graph-paper-navy flex items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--navy) px-6 py-4 text-white">
          <UIcon
            name="i-lucide-ticket"
            class="size-6 text-(--glow)"
          />
          <p class="font-mono text-xs uppercase tracking-[.14em] text-(--glow)">
            {{ t('meter.eyebrow', { used: status.used, allowance: status.allowance }) }}
          </p>
        </div>
        <div class="space-y-4 p-6 sm:p-8">
          <h2 class="text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
            {{ status.signedIn ? t('meter.wallTitle') : t('meter.wallTitleAnon', { n: ANON_SESSIONS }) }}
          </h2>
          <p class="text-[17px] leading-relaxed text-(--ink2)">
            {{ status.signedIn ? t('meter.wallBody', { sessions: PACK_SESSIONS, points: PACK_POINTS }) : t('meter.wallBodyAnon', { more: ACCOUNT_SESSIONS - ANON_SESSIONS, days: status.windowDays ?? ANON_WINDOW_DAYS }) }}
          </p>

          <!-- Anonymous: the free account -->
          <UButton
            v-if="!status.signedIn"
            :to="signUpTo"
            size="xl"
            block
            icon="i-lucide-user-plus"
          >
            {{ t('meter.signUp', { more: ACCOUNT_SESSIONS - ANON_SESSIONS }) }}
          </UButton>

          <!-- Signed in: a pack, or how to earn one -->
          <template v-else>
            <UButton
              size="xl"
              block
              icon="i-lucide-coins"
              :loading="buying"
              :disabled="!canBuy"
              @click="buyOne"
            >
              {{ t('meter.buy', { sessions: PACK_SESSIONS, points: PACK_POINTS }) }}
            </UButton>
            <p class="text-sm text-(--ink2)">
              {{ t('meter.balance', { n: balance.toLocaleString(locale) }) }}
              <template v-if="!canBuy">
                · <NuxtLink
                  :to="localePath('/submit')"
                  class="font-semibold text-(--signal) hover:underline"
                >{{ t('meter.earn') }}</NuxtLink>
              </template>
            </p>
            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              :description="error"
            />
          </template>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed border-(--line) pt-4 text-sm">
            <NuxtLink
              :to="`${localePath('/pro')}?product=seats#request`"
              class="flex items-center gap-1.5 font-semibold text-(--ink) hover:text-(--signal)"
            >
              <UIcon
                name="i-lucide-building-2"
                class="size-4"
              />{{ t('meter.org') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/')"
              class="ms-auto text-(--ink2) hover:text-(--ink)"
            >{{ t('meter.home') }}</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.meter-wall-enter-active, .meter-wall-leave-active { transition: opacity 0.3s ease; }
.meter-wall-enter-from, .meter-wall-leave-to { opacity: 0; }
</style>
