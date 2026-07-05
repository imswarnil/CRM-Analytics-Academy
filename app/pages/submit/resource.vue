<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const user = useSupabaseUser()
const localePath = useLocalePath()

useSeoMeta({ title: 'Submit a resource — CRM Analytics Academy', robots: 'noindex' })

const categories = ['Docs', 'Learning', 'Books', 'Blogs', 'Tools', 'Community']
const icons = RESOURCE_ICONS
const form = reactive({ title: '', url: '', description: '', category: '', icon: DEFAULT_RESOURCE_ICON })
const submitting = ref(false)
const done = ref(false)
const error = ref('')

const valid = computed(() => form.title.trim() && /^https?:\/\//.test(form.url.trim()))

async function submit() {
  if (!user.value || !valid.value || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/submit', {
      method: 'POST',
      body: { type: 'resource', title: form.title, url: form.url, description: form.description, category: form.category, icon: form.icon }
    })
    done.value = true
  } catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Could not submit. Please try again.'
  }
  submitting.value = false
}
</script>

<template>
  <UContainer class="max-w-xl py-10 sm:py-14">
    <UButton
      :to="localePath('/dashboard')"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      size="sm"
      class="mb-4 -ms-2"
    >
      Back to dashboard
    </UButton>

    <div
      v-if="done"
      class="rounded-2xl border border-default bg-elevated/40 p-8 text-center"
    >
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success/10">
        <UIcon
          name="i-lucide-check"
          class="size-6 text-success"
        />
      </div>
      <h1 class="text-xl font-bold text-highlighted">
        Thanks — submitted for review!
      </h1>
      <p class="mt-2 text-sm text-muted">
        We'll review your resource and publish it on the Resources page once approved.
      </p>
      <div class="mt-6 flex justify-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="done = false; form.title = ''; form.url = ''; form.description = ''; form.category = ''"
        >
          Submit another
        </UButton>
        <UButton :to="localePath('/dashboard')">
          Go to dashboard
        </UButton>
      </div>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-highlighted">
        Submit a resource
      </h1>
      <p class="mt-2 text-sm text-muted">
        Share a helpful CRM Analytics link — docs, a tutorial, a tool, a community. An admin reviews every submission before it goes live.
      </p>

      <form
        class="mt-8 space-y-5"
        @submit.prevent="submit"
      >
        <UFormField
          label="Title"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="e.g. SAQL Reference"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="URL"
          required
        >
          <UInput
            v-model="form.url"
            type="url"
            placeholder="https://…"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Category">
          <USelect
            v-model="form.category"
            :items="categories"
            placeholder="Choose a category"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Icon"
          help="Pick an icon shown next to your resource."
        >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ic in icons"
              :key="ic"
              type="button"
              class="flex size-10 items-center justify-center rounded-lg border transition"
              :class="form.icon === ic
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                : 'border-default text-muted hover:bg-elevated hover:text-default'"
              :aria-label="ic"
              @click="form.icon = ic"
            >
              <UIcon
                :name="ic"
                class="size-5"
              />
            </button>
          </div>
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            :rows="3"
            autoresize
            placeholder="What is it and why is it useful?"
            class="w-full"
          />
        </UFormField>

        <p
          v-if="error"
          class="text-sm text-error"
        >
          {{ error }}
        </p>

        <UButton
          type="submit"
          color="primary"
          :loading="submitting"
          :disabled="!valid"
        >
          Submit for review
        </UButton>
      </form>
    </template>
  </UContainer>
</template>
