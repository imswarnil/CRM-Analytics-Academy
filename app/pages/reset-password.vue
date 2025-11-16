<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Reset password',
  description: 'Choose a new password'
})

const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(false)

const fields = [{
  name: 'password',
  type: 'password' as const,
  label: 'New password',
  placeholder: 'Enter a new password',
  required: true
}, {
  name: 'confirmPassword',
  type: 'password' as const,
  label: 'Confirm password',
  placeholder: 'Confirm your new password',
  required: true
}]

const schema = z.object({
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { password } = event.data
  loading.value = true

  const { error } = await supabase.auth.updateUser({ password })

  loading.value = false

  if (error) {
    toast.add({ title: 'Reset failed', description: error.message, color: 'red' })
    return
  }

  toast.add({
    title: 'Password updated',
    description: 'You can now log in with your new password.',
    color: 'green'
  })

  await navigateTo('/dashboard')
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Set a new password"
    icon="i-lucide-shield-check"
    :submit="{ label: 'Update password' }"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Enter your new password below.
    </template>
  </UAuthForm>
</template>
