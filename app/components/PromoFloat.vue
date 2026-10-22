<script setup lang="ts">
/**
 * A floating leaderboard pinned to the bottom of the viewport: 728×90 on
 * desktop, 300×50 on phones. The reader can close it; it then stays closed for
 * the rest of the browser session. A new unit is requested on each page.
 */
import { promoAllowed } from '~/utils/promo'

const route = useRoute()
const KEY = 'crma-float-closed'
const closed = ref(true)
const wide = ref(true)

onMounted(() => {
  wide.value = window.matchMedia('(min-width: 768px)').matches
  try {
    closed.value = sessionStorage.getItem(KEY) === '1'
  } catch {
    closed.value = false
  }
})

function close() {
  closed.value = true
  try {
    sessionStorage.setItem(KEY, '1')
  } catch { /* storage blocked: closed for this page only */ }
  useNuxtApp().$track?.('promo_close', route.path)
}

const show = computed(() => !closed.value && promoAllowed(route.path))
</script>

<template>
  <ClientOnly>
    <div
      v-if="show"
      class="fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-2 pointer-events-none"
    >
      <div class="pointer-events-auto relative border-[1.5px] border-(--ink) bg-(--card) shadow-[5px_5px_0_var(--ink)]">
        <div class="flex items-center justify-between gap-3 border-b border-(--line) px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-(--ink2)">
          <span>Advertisement</span>
          <button
            type="button"
            class="flex items-center gap-1 hover:text-(--ink)"
            aria-label="Close advertisement"
            @click="close"
          >
            Close
            <UIcon
              name="i-lucide-x"
              class="size-3.5"
            />
          </button>
        </div>
        <div class="p-1">
          <PromoSlot
            :key="route.path"
            :unit="wide ? 'leaderboard728x90' : 'mobileLeaderboard'"
            bare
          />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
