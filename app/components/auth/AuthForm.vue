<script setup lang="ts">
/**
 * Sign in and sign up.
 *
 * One component because the two screens differ by one field and one verb, and
 * keeping them apart is how the error handling and the demo affordance drift
 * out of step.
 */
const props = defineProps<{
  mode: 'sign-in' | 'sign-up'
}>()

const { signIn, signUp, signInAsDemo, pending } = useAuth()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')

const isSignUp = computed(() => props.mode === 'sign-up')

/**
 * Where to land afterwards. Only same-origin paths are honoured: taking
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
    error.value = isSignUp.value ? t('auth.errSignUp') : t('auth.errSignIn')
  }
}

async function demo() {
  error.value = ''
  try {
    await signInAsDemo()
    await router.push(localePath('/dashboard'))
  } catch {
    error.value = t('auth.errDemo')
  }
}
</script>

<template>
  <div class="grid min-h-full lg:grid-cols-2">
    <!-- The brand panel. Hidden below lg, so nothing here may be the only
         place something is said. -->
    <aside class="relative hidden flex-col justify-end gap-3 bg-primary-950 p-12 text-white lg:flex">
      <div
        class="absolute inset-0 bg-grid opacity-20"
        aria-hidden="true"
      />
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary-300">
          {{ isSignUp ? t('auth.kickerSignUp') : t('auth.kickerSignIn') }}
        </p>
        <h2 class="mt-2 text-2xl font-bold">
          {{ t('auth.asideTitle') }}
        </h2>
        <p class="mt-3 max-w-md text-sm text-white/70">
          {{ t('auth.asideText') }}
        </p>
      </div>
    </aside>

    <div class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-sm space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-highlighted">
            {{ isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle') }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ isSignUp ? t('auth.signUpDesc') : t('auth.signInDesc') }}
          </p>
        </div>

        <!-- The demo sits above the form. Someone who wants to look around
             should not have to read past a form they have no intention of
             filling in. Outline, not solid: the submit button below is the
             one primary action on this screen. -->
        <UButton
          block
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-lucide-play"
          :loading="pending"
          :label="t('auth.demoCta')"
          @click="demo"
        />

        <USeparator :label="t('auth.or')" />

        <form
          class="space-y-4"
          @submit.prevent="submit"
        >
          <UFormField
            v-if="isSignUp"
            :label="t('auth.name')"
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
            :label="t('auth.email')"
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
            :label="t('auth.password')"
            name="password"
            :hint="isSignUp ? t('auth.passwordHint') : undefined"
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
            :label="isSignUp ? t('auth.submitSignUp') : t('auth.submitSignIn')"
          />
        </form>

        <p class="border-t border-default pt-4 text-center text-sm text-muted">
          <template v-if="isSignUp">
            {{ t('auth.haveAccount') }}
            <ULink :to="localePath('/sign-in')">{{ t('auth.signInLink') }}</ULink>
          </template>
          <template v-else>
            {{ t('auth.noAccount') }}
            <ULink :to="localePath('/sign-up')">{{ t('auth.signUpLink') }}</ULink>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
