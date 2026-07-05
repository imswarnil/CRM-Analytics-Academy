<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, profile, displayName, refresh } = useProfile()

useSeoMeta({ title: 'Your profile — CRM Analytics Academy', robots: 'noindex' })

const form = reactive({ full_name: '', username: '', bio: '' })
const saving = ref(false)
const savedAt = ref(0)
const error = ref('')

// Seed the form once the profile has loaded.
watch(profile, (p) => {
  if (p) {
    form.full_name = p.full_name ?? ''
    form.username = p.username ?? ''
    form.bio = p.bio ?? ''
  }
}, { immediate: true })

async function save() {
  if (!user.value) return
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/profile', {
      method: 'POST',
      body: { full_name: form.full_name, username: form.username, bio: form.bio }
    })
    await refresh()
    savedAt.value = Date.now()
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Could not save. Please try again.'
  }
  saving.value = false
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 sm:py-14">
    <div class="mb-8 flex items-center gap-4">
      <UAvatar
        :src="profile?.avatar_url || undefined"
        :alt="displayName"
        size="xl"
        icon="i-lucide-user"
      />
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ displayName }}
        </h1>
        <p class="text-sm text-muted">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="save"
    >
      <UFormField
        label="Full name"
        name="full_name"
      >
        <UInput
          v-model="form.full_name"
          placeholder="Your name"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Username"
        name="username"
        help="Shown on your comments, resources, and projects."
      >
        <UInput
          v-model="form.username"
          placeholder="username"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Bio"
        name="bio"
      >
        <UTextarea
          v-model="form.bio"
          :rows="3"
          autoresize
          placeholder="A little about you and your CRM Analytics journey…"
          class="w-full"
        />
      </UFormField>

      <div class="flex items-center gap-3">
        <UButton
          type="submit"
          :loading="saving"
          color="primary"
        >
          Save changes
        </UButton>
        <Transition
          enter-active-class="transition"
          enter-from-class="opacity-0"
          leave-active-class="transition"
          leave-to-class="opacity-0"
        >
          <span
            v-if="savedAt"
            :key="savedAt"
            class="text-sm text-success"
          >Saved ✓</span>
        </Transition>
      </div>

      <p
        v-if="error"
        class="text-sm text-error"
      >
        {{ error }}
      </p>
    </form>
  </UContainer>
</template>
