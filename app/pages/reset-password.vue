<script setup lang="ts">
// Landing page for the Supabase password-recovery email. The client exchanges
// the link for a short-lived session (detectSessionInUrl), which is what lets
// updateUser() set a new password without the old one.
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const localePath = useLocalePath()

useSeoMeta({ title: 'Choose a new password', robots: 'noindex' })

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)

async function onSubmit() {
  error.value = ''

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Those passwords do not match.'
    return
  }

  loading.value = true
  const { error: err } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false

  if (err) {
    error.value = err.message
    return
  }

  done.value = true
  setTimeout(() => navigateTo(localePath('/dashboard'), { replace: true }), 1500)
}
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-16">
    <div class="w-full max-w-sm rounded-2xl border border-default bg-default/80 p-8 shadow-xl backdrop-blur">
      <h1 class="text-center text-xl font-bold text-highlighted">
        Choose a new password
      </h1>

      <div
        v-if="done"
        class="mt-6 text-center text-sm text-primary"
      >
        Password updated — taking you to your dashboard…
      </div>

      <div
        v-else-if="!user"
        class="mt-6 space-y-4 text-center"
      >
        <p class="text-sm text-muted">
          This reset link is invalid or has expired. Request a fresh one from the sign-in page.
        </p>
        <UButton
          :to="localePath('/login')"
          block
          class="rounded-full"
        >
          Back to sign in
        </UButton>
      </div>

      <form
        v-else
        class="mt-6 space-y-3"
        @submit.prevent="onSubmit"
      >
        <UFormField
          label="New password"
          name="password"
          hint="At least 8 characters"
          required
        >
          <UInput
            v-model="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Confirm password"
          name="confirm"
          required
        >
          <UInput
            v-model="confirm"
            type="password"
            required
            autocomplete="new-password"
            placeholder="••••••••"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          class="rounded-full font-medium"
        >
          Update password
        </UButton>
      </form>

      <p
        v-if="error"
        class="mt-4 text-center text-sm text-error"
      >
        {{ error }}
      </p>
    </div>
  </UContainer>
</template>
