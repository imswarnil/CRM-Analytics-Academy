<script setup lang="ts">
/**
 * Self-serve team purchase: a seat stepper (3–50) with a live total, a team
 * name, and checkout. Teams are bought on a company email — a personal
 * mailbox is caught here before the server refuses it.
 */
const props = withDefaults(defineProps<{ inverted?: boolean }>(), { inverted: false })

const PER_SEAT_YEAR = 180
const MIN = 3
const MAX = 50

const localePath = useLocalePath()
const { user, isSignedIn } = useAuth()

const seats = ref(5)
const teamName = ref('')
const busy = ref(false)
const error = ref('')

const PERSONAL = ['gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'zoho.com', 'yandex.com', 'rediffmail.com', 'qq.com']
const domain = computed(() => (user.value?.email ?? '').split('@')[1]?.toLowerCase() ?? '')
const personal = computed(() => Boolean(domain.value) && PERSONAL.includes(domain.value))

const total = computed(() => seats.value * PER_SEAT_YEAR)
const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

function clamp(n: number) {
  seats.value = Math.min(MAX, Math.max(MIN, Math.round(Number.isFinite(n) ? n : MIN)))
}

async function buy() {
  if (!isSignedIn.value) {
    await navigateTo({ path: localePath('/sign-in'), query: { redirect: useRouter().currentRoute.value.fullPath } })
    return
  }
  error.value = ''
  if (personal.value) {
    error.value = 'Teams are bought on a company email address. Sign in with your work email.'
    return
  }
  if (teamName.value.trim().length < 2) {
    error.value = 'Give the team a name.'
    return
  }
  busy.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: { plan: 'team', seats: seats.value, teamName: teamName.value.trim() }
    })
    window.location.href = url
  } catch (e) {
    error.value = apiError(e) || 'Checkout could not start. Please try again.'
    busy.value = false
  }
}
</script>

<template>
  <div :class="props.inverted ? 'text-white' : 'text-(--ink)'">
    <p
      class="mono-label"
      :class="props.inverted ? 'text-(--glow)!' : ''"
    >
      Seats
    </p>
    <div class="mt-2 flex items-center gap-3">
      <div
        class="flex items-stretch border-[1.5px]"
        :class="props.inverted ? 'border-white/70' : 'border-(--ink) bg-(--card)'"
      >
        <button
          type="button"
          class="px-3 text-lg font-bold disabled:opacity-30"
          :disabled="seats <= MIN"
          aria-label="One seat fewer"
          @click="clamp(seats - 1)"
        >
          −
        </button>
        <input
          :value="seats"
          type="number"
          :min="MIN"
          :max="MAX"
          aria-label="Seats"
          class="w-16 border-x-[1.5px] bg-transparent py-2 text-center font-mono text-lg font-bold outline-none"
          :class="props.inverted ? 'border-white/70' : 'border-(--ink)'"
          @change="clamp(Number(($event.target as HTMLInputElement).value))"
        >
        <button
          type="button"
          class="px-3 text-lg font-bold disabled:opacity-30"
          :disabled="seats >= MAX"
          aria-label="One seat more"
          @click="clamp(seats + 1)"
        >
          +
        </button>
      </div>
      <div class="leading-tight">
        <p class="text-3xl font-black tracking-[-0.03em]">
          {{ fmt(total) }}<span
            class="ms-1 font-mono text-xs font-normal uppercase"
            :class="props.inverted ? 'text-white/70' : 'text-(--ink2)'"
          >/ year</span>
        </p>
        <p
          class="font-mono text-[11px] uppercase tracking-[.06em]"
          :class="props.inverted ? 'text-white/70' : 'text-(--ink2)'"
        >
          {{ seats }} × $15 / seat / month, billed yearly
        </p>
      </div>
    </div>

    <label class="mt-5 block">
      <span
        class="mono-label"
        :class="props.inverted ? 'text-(--glow)!' : ''"
      >Team name</span>
      <input
        v-model="teamName"
        type="text"
        maxlength="80"
        placeholder="e.g. Revenue Operations"
        class="mt-2 w-full border-[1.5px] px-3 py-2 outline-none focus:border-(--signal)"
        :class="props.inverted ? 'border-white/70 bg-white/5 text-white placeholder:text-white/40' : 'border-(--ink) bg-(--card)'"
      >
    </label>

    <p
      class="mt-3 text-xs"
      :class="props.inverted ? 'text-white/70' : 'text-(--ink2)'"
    >
      <template v-if="isSignedIn && domain && !personal">
        Members will join with <strong>@{{ domain }}</strong> addresses — you can allow more domains later.
      </template>
      <template v-else>
        Buy on your company email. Personal mailboxes (Gmail, Outlook…) can't own a team.
      </template>
    </p>

    <UButton
      :loading="busy"
      :color="props.inverted ? 'secondary' : 'primary'"
      block
      size="lg"
      class="mt-5"
      icon="i-lucide-users"
      @click="buy"
    >
      {{ isSignedIn ? `Buy ${seats} seats` : 'Sign in to buy seats' }}
    </UButton>
    <p
      v-if="error"
      class="mt-3 text-sm"
      :class="props.inverted ? 'text-(--glow)' : 'text-error'"
    >
      {{ error }}
    </p>
  </div>
</template>
