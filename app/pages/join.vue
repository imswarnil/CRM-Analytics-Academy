<script setup lang="ts">
/**
 * Accept a team invite: /join?token=… . Requires sign-in with the invited
 * address; the auth middleware carries the token through the sign-in round
 * trip in its redirect.
 */
definePageMeta({ middleware: 'auth' })
defineI18nRoute({ locales: ['en'] })
useSeoMeta({ title: 'Join your team', robots: 'noindex, nofollow' })

const route = useRoute()
const { user } = useAuth()
const token = computed(() => String(route.query.token ?? ''))
const state = ref<'idle' | 'joining' | 'done' | 'error'>('idle')
const message = ref('')
const teamName = ref('')

async function join() {
  state.value = 'joining'
  try {
    const res = await $fetch<{ team: { name: string } }>('/api/team/join', { method: 'POST', body: { token: token.value } })
    teamName.value = res.team.name
    state.value = 'done'
    await useProgress().load()
  } catch (e) {
    message.value = (e as { statusMessage?: string }).statusMessage || 'This invite could not be accepted.'
    state.value = 'error'
  }
}
</script>

<template>
  <div class="graph-paper flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div class="crosshair w-full max-w-md border-[1.5px] border-(--ink) bg-(--card) p-8 text-center shadow-[10px_10px_0_var(--ice)]">
      <span class="bp-iconbox mx-auto size-12 text-(--signal)">
        <UIcon
          :name="state === 'done' ? 'i-lucide-badge-check' : 'i-lucide-users'"
          class="size-6"
        />
      </span>
      <p class="eyebrow mt-5">
        Team invite
      </p>

      <template v-if="!token">
        <h1 class="bp-h3 mt-2">
          This link is incomplete
        </h1>
        <p class="mt-3 text-sm text-(--ink2)">
          Ask your team owner to copy the invite link again.
        </p>
      </template>

      <template v-else-if="state === 'done'">
        <h1 class="bp-h3 mt-2">
          You're on {{ teamName }}
        </h1>
        <p class="mt-3 text-sm text-(--ink2)">
          Pro is unlocked on this account — every Pro lesson, video and quiz, no ads.
        </p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton
            to="/curriculum"
            icon="i-lucide-graduation-cap"
          >
            Open the curriculum
          </UButton>
          <UButton
            to="/team"
            color="neutral"
            variant="outline"
          >
            See the team
          </UButton>
        </div>
      </template>

      <template v-else>
        <h1 class="bp-h3 mt-2">
          Join your team on CRM Analytics Academy
        </h1>
        <p class="mt-3 text-sm text-(--ink2)">
          Signed in as <strong>{{ user?.email }}</strong>. The invite must be for this address.
        </p>
        <p
          v-if="state === 'error'"
          class="mt-4 border-[1.5px] border-dashed border-error p-3 text-sm text-error"
        >
          {{ message }}
        </p>
        <UButton
          class="mt-6"
          size="lg"
          :loading="state === 'joining'"
          icon="i-lucide-check"
          @click="join"
        >
          Accept and take a seat
        </UButton>
      </template>
    </div>
  </div>
</template>
