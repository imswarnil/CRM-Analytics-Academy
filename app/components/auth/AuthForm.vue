<script setup lang="ts">
/**
 * Shared body of the sign-in and sign-up screens. One component because the
 * two differ by one field and one verb, and keeping them apart is how the
 * error handling and the demo affordance drift out of step.
 */
const props = defineProps<{
  mode: 'sign-in' | 'sign-up'
}>()

const { signIn, signUp, signInAsDemo, pending } = useAuth()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')

const isSignUp = computed(() => props.mode === 'sign-up')

/**
 * Where to land after signing in. Only same-origin paths are honoured: taking
 * `?redirect=` at face value turns every sign-in link into an open redirect,
 * which is a phishing primitive — the attacker sends a genuine link to your
 * domain and the user arrives on theirs still trusting the address bar.
 */
const redirectTo = computed(() => {
  const raw = String(route.query.redirect ?? '')
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : localePath('/dashboard')
})

async function submit() {
  error.value = ''
  try {
    const user = isSignUp.value
      ? await signUp(email.value, password.value, name.value)
      : await signIn(email.value, password.value)

    if (!user) throw new Error('no session')
    await router.push(redirectTo.value)
  } catch {
    // Deliberately not "no account with that email" — telling an attacker
    // which addresses are registered is free account enumeration.
    error.value = isSignUp.value
      ? 'Could not create that account. The email may already be registered, or the password may be too short.'
      : 'Those details did not match an account.'
  }
}

async function demo() {
  error.value = ''
  try {
    await signInAsDemo()
    await router.push(localePath('/dashboard'))
  } catch {
    error.value = 'The demo account is unavailable right now.'
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-sm">
    <div class="mb-8 text-center">
      <h1 class="text-2xl font-bold text-highlighted">
        {{ isSignUp ? 'Create your account' : 'Welcome back' }}
      </h1>
      <p class="mt-2 text-sm text-muted">
        {{ isSignUp
          ? 'Track your progress through the curriculum.'
          : 'Pick up where you left off.' }}
      </p>
    </div>

    <!-- The demo sits above the form, not below it. Someone who wants to look
         around should not have to read past a form they have no intention of
         filling in. -->
    <UButton
      block
      size="lg"
      color="neutral"
      variant="outline"
      icon="i-lucide-play"
      :loading="pending"
      @click="demo"
    >
      Try the demo — no sign-up
    </UButton>

    <USeparator
      label="or"
      class="my-6"
    />

    <form
      class="space-y-4"
      @submit.prevent="submit"
    >
      <UFormField
        v-if="isSignUp"
        label="Name"
        name="name"
      >
        <UInput
          v-model="name"
          autocomplete="name"
          size="lg"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField
        label="Email"
        name="email"
      >
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          size="lg"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
        :hint="isSignUp ? 'At least 8 characters' : undefined"
      >
        <UInput
          v-model="password"
          type="password"
          :autocomplete="isSignUp ? 'new-password' : 'current-password'"
          size="lg"
          class="w-full"
          :minlength="isSignUp ? 8 : undefined"
          required
        />
      </UFormField>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :description="error"
      />

      <UButton
        type="submit"
        block
        size="lg"
        :loading="pending"
      >
        {{ isSignUp ? 'Create account' : 'Sign in' }}
      </UButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      <template v-if="isSignUp">
        Already have an account?
        <ULink :to="localePath('/sign-in')">Sign in</ULink>
      </template>
      <template v-else>
        New here?
        <ULink :to="localePath('/sign-up')">Create an account</ULink>
      </template>
    </p>
  </div>
</template>
