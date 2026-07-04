<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const localePath = useLocalePath()

const title = 'Sign in — CRM Analytics Academy'
useSeoMeta({ title, robots: 'noindex' })

const loading = ref(false)
const error = ref('')

// Where to land after auth: honour ?redirect=, else the dashboard.
const redirectTo = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : localePath('/dashboard')
})

// If already signed in, don't show the login screen.
watchEffect(() => {
  if (user.value) navigateTo(redirectTo.value, { replace: true })
})

async function signInWithGoogle() {
  loading.value = true
  error.value = ''
  const callback = `${window.location.origin}/confirm?redirect=${encodeURIComponent(redirectTo.value)}`
  const { error: err } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callback }
  })
  if (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 bg-grid" />
    <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

    <UContainer class="relative flex min-h-[70vh] items-center justify-center py-16">
      <div class="w-full max-w-sm rounded-2xl border border-default bg-default/80 p-8 text-center shadow-xl backdrop-blur">
        <div class="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <UIcon
            name="i-lucide-graduation-cap"
            class="size-6 text-primary"
          />
        </div>
        <h1 class="text-xl font-bold text-highlighted">
          Sign in to CRM Analytics Academy
        </h1>
        <p class="mt-2 text-sm text-muted">
          Track your progress, take quizzes, comment on lessons, and submit resources & projects.
        </p>

        <UButton
          block
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-google"
          :loading="loading"
          class="mt-6 rounded-full font-medium"
          @click="signInWithGoogle"
        >
          Continue with Google
        </UButton>

        <p
          v-if="error"
          class="mt-4 text-sm text-error"
        >
          {{ error }}
        </p>

        <p class="mt-6 text-xs text-dimmed">
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
