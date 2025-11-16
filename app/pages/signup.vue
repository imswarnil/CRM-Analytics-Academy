<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const toast = useToast()
const supabase = useSupabaseClient()
const loading = ref(false)

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name',
  required: true
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Create a strong password',
  required: true
}]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
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

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() }
    })

    if (error) {
      toast.add({
        title: 'Google signup failed',
        description: error.message,
        color: 'red'
      })
    }
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: getRedirectUrl() }
    })

    if (error) {
      toast.add({
        title: 'GitHub signup failed',
        description: error.message,
        color: 'red'
      })
    }
  }
}]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { name, email, password } = event.data
  loading.value = true

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      },
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

  toast.add({
    title: 'Verify your email',
    description: 'We have sent you a confirmation link. Please check your inbox.',
    color: 'green'
  })

  await navigateTo('/login')
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account?
      <ULink
        to="/login"
        class="text-primary font-medium"
      >
        Login
      </ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our
      <ULink
        to="/"
        class="text-primary font-medium"
      >
        Terms of Service
      </ULink>.
    </template>
  </UAuthForm>
</template>
