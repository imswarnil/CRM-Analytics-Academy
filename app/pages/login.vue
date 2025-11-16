<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
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
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  remember: z.boolean().optional()
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
      options: {
        redirectTo: getRedirectUrl()
      }
    })
    if (error) {
      toast.add({
        title: 'Google login failed',
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
      options: {
        redirectTo: getRedirectUrl()
      }
    })
    if (error) {
      toast.add({
        title: 'GitHub login failed',
        description: error.message,
        color: 'red'
      })
    }
  }
}]

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const { email, password } = event.data
  loading.value = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  loading.value = false

  if (error) {
    toast.add({
      title: 'Login failed',
      description: error.message,
      color: 'red'
    })
    return
  }

  toast.add({
    title: 'Welcome back 👋',
    description: `Logged in as ${data.user?.email}`,
    color: 'green'
  })

  await navigateTo('/dashboard')
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink
        to="/signup"
        class="text-primary font-medium"
      >
        Sign up
      </ULink>.
    </template>

    <template #password-hint>
      <!--
      <ULink
        to="/forgot-password"
        class="text-primary font-medium"
        tabindex="-1"
      >
        Forgot password?
      </ULink>
      -->
    </template>

    <template #footer>
      By signing in, you agree to our
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
