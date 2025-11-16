<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create your CRM Analytics Academy account'
})

const toast = useToast()
const supabase = useSupabaseClient()
const loading = ref(false)

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Create a password',
  required: true
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const getRedirectUrl = () => {
  if (process.client) {
    return `${window.location.origin}/auth/callback`
  }
  return '/auth/callback'
}

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const { email, password } = event.data
  loading.value = true

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl()
    }
  })

  loading.value = false

  if (error) {
    toast.add({
      title: 'Sign up failed',
      description: error.message,
      color: 'red'
    })
    return
  }

  // Behaviour depends on Supabase email confirmation settings
  if (data.user && !data.session) {
    toast.add({
      title: 'Confirm your email',
      description: 'We sent you a confirmation link. Please check your inbox.',
      color: 'blue'
    })
    await navigateTo('/login')
  } else {
    toast.add({
      title: 'Account created 🎉',
      description: `Welcome, ${data.user?.email}`,
      color: 'green'
    })
    await navigateTo('/dashboard')
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Create your account"
    icon="i-lucide-user-plus"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink
        to="/login"
        class="text-primary font-medium"
      >
        Log in
      </ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <!--
      <ULink
        to="/terms"
        class="text-primary font-medium"
      >
        Terms of Service
      </ULink>.
      -->
    </template>
  </UAuthForm>
</template>
