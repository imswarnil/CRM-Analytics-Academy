<script setup lang="ts">
/**
 * The site's own captcha (server/utils/pow.ts): fetches a proof-of-work
 * challenge and solves it in the background while the visitor fills in the
 * form — nothing to click, no third party. The solution is the v-model token
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
        // Re-solve shortly before it expires, for a form left open.
        setTimeout(() => mine === run && solve(), Math.max(30_000, c.expires - Date.now() - 30_000))
        return
      }
    }
    state.value = 'error'
  } catch {
    state.value = 'error'
  }
}

onMounted(solve)
onBeforeUnmount(() => {
  run++
})
defineExpose({ reset: solve })
</script>

<template>
  <p
    class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em]"
    :class="state === 'error' ? 'text-error' : 'text-(--ink2)'"
    role="status"
    aria-live="polite"
  >
    <UIcon
      :name="state === 'done' ? 'i-lucide-shield-check' : state === 'error' ? 'i-lucide-shield-alert' : 'i-lucide-loader-circle'"
      class="size-4"
      :class="[state === 'done' ? 'text-(--signal)' : '', state === 'working' || state === 'idle' ? 'animate-spin' : '']"
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
