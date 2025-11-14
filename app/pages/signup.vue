<!-- <script setup lang="ts">
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

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template> -->



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
const router = useRouter()

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

async function onSubmit (event: FormSubmitEvent<Schema>) {
  const { email, password } = event.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback'
    }
  })

  if (error) {
    toast.add({
      title: 'Sign up failed',
      description: error.message,
      color: 'red'
    })
    return
  }

  // Behaviour depends on email confirmation setting in Supabase
  if (data.user && !data.session) {
    toast.add({
      title: 'Confirm your email',
      description: 'We sent you a confirmation link. Please check your inbox.',
      color: 'blue'
    })
    router.push('/login')
  } else {
    toast.add({
      title: 'Account created 🎉',
      description: `Welcome, ${data.user?.email}`,
      color: 'green'
    })
    router.push('/dashboard')
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Create your account"
    icon="i-lucide-user-plus"
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
      <!-- <ULink
        to="/terms"
        class="text-primary font-medium"
      >
        Terms of Service
      </ULink>. -->
    </template>
  </UAuthForm>
</template>
