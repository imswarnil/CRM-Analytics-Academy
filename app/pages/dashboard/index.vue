<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: ['auth'],
  layout: 'default', // or whatever your main layout is
})

useSeoMeta({
  title: 'Dashboard',
  description: 'Your CRM Analytics Academy dashboard'
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(false)

const schema = z.object({
  fullName: z.string().min(1, 'Name is required').optional().or(z.literal('')),
})

type Schema = z.output<typeof schema>

const initialFullName = computed(() => {
  return (user.value?.user_metadata as any)?.full_name || ''
})

const fields = [{
  name: 'fullName',
  type: 'text' as const,
  label: 'Full name',
  placeholder: 'Update your name'
}]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { fullName } = event.data
  loading.value = true

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName
    }
  })

  loading.value = false

  if (error) {
    toast.add({ title: 'Update failed', description: error.message, color: 'red' })
    return
  }

  toast.add({ title: 'Profile updated', color: 'green' })
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col gap-8">
      <div>
        <h1 class="text-3xl font-semibold">
          Hey, {{ (user?.user_metadata as any)?.full_name || user?.email }}
        </h1>
        <p class="mt-2 text-neutral-500">
          Welcome to your dashboard.
        </p>
      </div>

      <UCard>
        <template #header>
          <div class="font-medium">
            Profile
          </div>
        </template>

        <UForm
          :schema="schema"
          :state="{ fullName: initialFullName }"
          @submit="onSubmit"
        >
          <UFormGroup
            label="Full name"
            name="fullName"
          >
            <UInput name="fullName" />
          </UFormGroup>

          <div class="mt-4 flex justify-end">
            <UButton
              type="submit"
              :loading="loading"
            >
              Save changes
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>
