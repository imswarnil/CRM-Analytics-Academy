<script setup lang="ts">
/**
 * The site's own captcha (server/utils/pow.ts): fetches a proof-of-work
 * challenge and solves it in the background while the visitor fills in the
 * form — nothing to click, no third party. Nothing is fetched until someone
 * actually starts on the form (its first focus): a page with a form nobody
 * touches costs the Worker nothing, and an expired solution is renewed on
 * the next focus rather than on a timer. The solution is the v-model token
 * the form sends with its request; `reset()` fetches a new one after a
 * failed submit, because each solution is accepted once.
 */
const token = defineModel<string>({ default: '' })
const { t } = useI18n()
const state = ref<'idle' | 'working' | 'done' | 'error'>('idle')

interface Challenge {
  salt: string
  challenge: string
  max: number
  expires: number
  signature: string
}

const enc = new TextEncoder()
async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

let run = 0
let expires = 0
async function solve() {
  const mine = ++run
  token.value = ''
  state.value = 'working'
  try {
    const c = await $fetch<Challenge>('/api/challenge')
    for (let n = 0; n <= c.max; n++) {
      if (mine !== run) return
      if (await sha256(c.salt + n) === c.challenge) {
        token.value = btoa(JSON.stringify({ salt: c.salt, number: n, challenge: c.challenge, expires: c.expires, signature: c.signature }))
        state.value = 'done'
        expires = c.expires
        return
      }
    }
    state.value = 'error'
  } catch {
    state.value = 'error'
  }
}

const root = ref<HTMLElement | null>(null)
let form: HTMLElement | null = null
// Start (or renew) on the first focus inside the form.
const wake = () => {
  if (state.value === 'working') return
  if (!token.value || Date.now() > expires - 30_000) solve()
}
onMounted(() => {
  form = root.value?.closest('form') ?? null
  if (form) form.addEventListener('focusin', wake)
  else solve()
})
onBeforeUnmount(() => {
  run++
  form?.removeEventListener('focusin', wake)
})
defineExpose({ reset: solve })
</script>

<template>
  <p
    ref="root"
    class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em]"
    :class="state === 'error' ? 'text-error' : 'text-(--ink2)'"
    role="status"
    aria-live="polite"
  >
    <UIcon
      :name="state === 'done' ? 'i-lucide-shield-check' : state === 'error' ? 'i-lucide-shield-alert' : state === 'idle' ? 'i-lucide-shield' : 'i-lucide-loader-circle'"
      class="size-4"
      :class="[state === 'done' ? 'text-(--signal)' : '', state === 'working' ? 'animate-spin' : '']"
    />
    <template v-if="state === 'done'">
      {{ t('human.done') }}
    </template>
    <button
      v-else-if="state === 'error'"
      type="button"
      class="underline"
      @click="solve"
    >
      {{ t('human.retry') }}
    </button>
    <template v-else>
      {{ t('human.working') }}
    </template>
  </p>
</template>
