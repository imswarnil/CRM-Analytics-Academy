<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const localePath = useLocalePath()

const title = 'Sign in — CRM Analytics Academy'
useSeoMeta({ title, robots: 'noindex' })

type Mode = 'signin' | 'signup' | 'forgot'

const mode = ref<Mode>('signin')
const loading = ref(false)
const googleLoading = ref(false)
const error = ref('')
const notice = ref('')

const email = ref('')
const password = ref('')
const fullName = ref('')

// Where to land after auth: honour ?redirect=, else the dashboard.
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : localePath('/dashboard')
})

const callbackUrl = () =>
  `${window.location.origin}/confirm?redirect=${encodeURIComponent(redirectTo.value)}`

// If already signed in, don't show the login screen.
watchEffect(() => {
  if (user.value) navigateTo(redirectTo.value, { replace: true })
})

function setMode(next: Mode) {
  mode.value = next
  error.value = ''
  notice.value = ''
}

const heading = computed(() => {
  if (mode.value === 'signup') return 'Create your account'
  if (mode.value === 'forgot') return 'Reset your password'
  return 'Sign in to CRM Analytics Academy'
})

const submitLabel = computed(() => {
  if (mode.value === 'signup') return 'Create account'
  if (mode.value === 'forgot') return 'Send reset link'
  return 'Sign in'
})

async function signInWithGoogle() {
  googleLoading.value = true
  error.value = ''
  notice.value = ''
  const { error: err } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl() }
  })
  if (err) {
    error.value = err.message
    googleLoading.value = false
  }
}

async function onSubmit() {
  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    if (mode.value === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.value.trim(),
        password: password.value
      })
      if (err) throw err
      // The watchEffect above forwards once the session lands.
      return
    }

    if (mode.value === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
          emailRedirectTo: callbackUrl(),
          data: { full_name: fullName.value.trim() || undefined }
        }
      })
      if (err) throw err

      // Supabase returns a user with no identities when the address is already
      // registered (it does not leak that fact via an error).
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        error.value = 'That email is already registered. Try signing in instead.'
        return
      }

      notice.value = data.session
        ? 'Account created — signing you in…'
        : 'Check your inbox for a confirmation link to finish signing up.'
      return
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (err) throw err
    notice.value = 'If that address has an account, a reset link is on its way.'
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-grid" />
    <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

    <UContainer class="relative flex min-h-[70vh] items-center justify-center py-16">
      <div class="w-full max-w-sm rounded-2xl border border-default bg-default/80 p-8 shadow-xl backdrop-blur">
        <div class="text-center">
          <div class="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UIcon
              name="i-lucide-graduation-cap"
              class="size-6 text-primary"
            />
          </div>
          <h1 class="text-xl font-bold text-highlighted">
            {{ heading }}
          </h1>
          <p class="mt-2 text-sm text-muted">
            Track your progress, take quizzes, comment on lessons, and submit resources.
          </p>
        </div>

        <UButton
          block
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-google"
          :loading="googleLoading"
          :disabled="loading"
          class="mt-6 rounded-full font-medium"
          @click="signInWithGoogle"
        >
          Continue with Google
        </UButton>

        <div class="my-5 flex items-center gap-3">
          <span class="h-px flex-1 bg-(--ui-border)" />
          <span class="text-xs uppercase tracking-wide text-dimmed">or</span>
          <span class="h-px flex-1 bg-(--ui-border)" />
        </div>

        <form
          class="space-y-3"
          @submit.prevent="onSubmit"
        >
          <UFormField
            v-if="mode === 'signup'"
            label="Name"
            name="name"
          >
            <UInput
              v-model="fullName"
              autocomplete="name"
              placeholder="Your name"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Email"
            name="email"
            required
          >
            <UInput
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="mode !== 'forgot'"
            label="Password"
            name="password"
            required
            :hint="mode === 'signup' ? 'At least 8 characters' : undefined"
          >
            <UInput
              v-model="password"
              type="password"
              required
              :minlength="mode === 'signup' ? 8 : undefined"
              :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
              placeholder="••••••••"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="googleLoading"
            class="rounded-full font-medium"
          >
            {{ submitLabel }}
          </UButton>
        </form>

        <p
          v-if="error"
          class="mt-4 text-center text-sm text-error"
        >
          {{ error }}
        </p>
        <p
          v-if="notice"
          class="mt-4 text-center text-sm text-primary"
        >
          {{ notice }}
        </p>

        <div class="mt-5 space-y-1 text-center text-sm">
          <p v-if="mode === 'signin'">
            <button
              type="button"
              class="text-muted underline hover:text-default"
              @click="setMode('forgot')"
            >
              Forgot your password?
            </button>
          </p>
          <p v-if="mode === 'signin'">
            <span class="text-muted">New here?</span>
            <button
              type="button"
              class="ml-1 font-medium text-primary hover:underline"
              @click="setMode('signup')"
            >
              Create an account
            </button>
          </p>
          <p v-else>
            <span class="text-muted">Already have an account?</span>
            <button
              type="button"
              class="ml-1 font-medium text-primary hover:underline"
              @click="setMode('signin')"
            >
              Sign in
            </button>
          </p>
        </div>

        <p class="mt-6 text-center text-xs text-dimmed">
          By continuing you agree to our
          <NuxtLink
            :to="localePath('/terms')"
            class="underline hover:text-default"
          >terms</NuxtLink>
          and
          <NuxtLink
            :to="localePath('/privacy')"
            class="underline hover:text-default"
          >privacy policy</NuxtLink>.
        </p>
      </div>
    </UContainer>
  </div>
</template>
