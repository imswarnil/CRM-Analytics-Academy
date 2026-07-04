<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const client = useDb()
const user = useSupabaseUser()
const localePath = useLocalePath()

useSeoMeta({ title: 'Submit a project — CRM Analytics Academy', robots: 'noindex' })

const form = reactive({ title: '', description: '', link: '', image_url: '', tags: '' })
const submitting = ref(false)
const done = ref(false)
const error = ref('')

const valid = computed(() => form.title.trim().length > 2)

async function submit() {
  if (!user.value || !valid.value || submitting.value) return
  submitting.value = true
  error.value = ''
  const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
  const { error: err } = await client.from('projects').insert({
    user_id: user.value.id,
    title: form.title.trim(),
    description: form.description.trim() || null,
    link: form.link.trim() || null,
    image_url: form.image_url.trim() || null,
    tags: tags.length ? tags : null
  })
  if (err) error.value = err.message
  else done.value = true
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
        Submitted for review!
      </h1>
      <p class="mt-2 text-sm text-muted">
        Once approved, your dashboard will appear in the community Showcase.
      </p>
      <div class="mt-6 flex justify-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="done = false"
        >
          Submit another
        </UButton>
        <UButton :to="localePath('/showcase')">
          View showcase
        </UButton>
      </div>
    </div>

    <template v-else>
      <h1 class="text-2xl font-bold text-highlighted">
        Submit your project
      </h1>
      <p class="mt-2 text-sm text-muted">
        Built a great CRM Analytics dashboard or app? Share it with the community. An admin reviews every submission before it's published.
      </p>

      <form
        class="mt-8 space-y-5"
        @submit.prevent="submit"
      >
        <UFormField
          label="Project title"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="e.g. Sales Pipeline Command Center"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Description"
          help="What does it do? What data and techniques did you use?"
        >
          <UTextarea
            v-model="form.description"
            :rows="4"
            autoresize
            placeholder="Describe your project…"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Link"
          help="A live demo, video walkthrough, blog post, or repo."
        >
          <UInput
            v-model="form.link"
            type="url"
            placeholder="https://…"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Screenshot URL"
          help="A link to an image of your dashboard (optional)."
        >
          <UInput
            v-model="form.image_url"
            type="url"
            placeholder="https://…"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Tags"
          help="Comma-separated, e.g. Sales, SAQL, Einstein"
        >
          <UInput
            v-model="form.tags"
            placeholder="Sales, SAQL, Einstein"
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
