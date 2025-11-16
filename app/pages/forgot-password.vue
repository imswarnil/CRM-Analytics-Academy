<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Forgot password',
  description: 'Reset your password'
})

const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(false)

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your account email',
  required: true
}]

const schema = z.object({
  email: z.string().email('Invalid email')
})

type Schema = z.output<typeof schema>

const getRedirectUrl = () => {
  if (process.client) {
    return `${window.location.origin}/reset-password`
  }
  return '/reset-password'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { email } = event.data
  loading.value = true

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl()
  })

  loading.value = false

  if (error) {
    toast.add({ title: 'Reset failed', description: error.message, color: 'red' })
    return
  }

  toast.add({
    title: 'Check your email',
    description: 'We sent you a password reset link.',
    color: 'green'
  })

  await navigateTo('/login')
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Forgot password?"
    icon="i-lucide-key-round"
    :submit="{ label: 'Send reset link' }"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Enter the email associated with your account and we'll send you a reset link.
    </template>

    <template #footer>
      <ULink
        to="/login"
        class="text-primary font-medium"
      >
        Back to login
      </ULink>
    </template>
  </UAuthForm>
</template>
