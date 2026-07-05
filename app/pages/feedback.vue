<script setup lang="ts">
import type { FeedbackThread } from '~/components/FeedbackThreadList.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const user = useSupabaseUser()

const title = 'Feedback — CRM Analytics Academy'
const description = 'Share feedback, report a problem, or suggest an idea. We read every message and reply — track the conversation right here.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const categories = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Something is broken' },
  { value: 'idea', label: 'Idea / suggestion' },
  { value: 'content', label: 'Lesson / content' },
  { value: 'other', label: 'Other' }
]

const form = reactive({ category: 'general', subject: '', message: '' })
const submitting = ref(false)
const error = ref('')
const toast = useToast()

const { data, refresh } = await useAsyncData<{ feedback: FeedbackThread[], isAdmin: boolean }>(
  'my-feedback',
  () => $fetch('/api/feedback/list'),
  { server: false, watch: [user], default: () => ({ feedback: [], isAdmin: false }) }
)
onMounted(() => refresh())

const threads = computed(() => data.value?.feedback ?? [])

async function submit() {
  if (!form.message.trim()) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: { category: form.category, subject: form.subject, message: form.message, page_path: '/feedback' }
    })
    form.subject = ''
    form.message = ''
    form.category = 'general'
    toast.add({ title: 'Thanks for the feedback!', description: 'We\'ll reply here when we\'ve read it.', color: 'success' })
    await refresh()
  } catch (err) {
    error.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-message-square-heart"
            class="mr-1 size-4"
          />
          {{ t('nav.feedback') }}
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Tell us what you <span class="text-gradient">think</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Found a bug, have an idea, or spotted something wrong in a lesson? Send it over — we read every message and reply right here.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="mx-auto max-w-2xl">
        <ClientOnly>
          <!-- Signed out -->
          <div
            v-if="!user"
            class="rounded-2xl border border-default bg-elevated/40 p-8 text-center"
          >
            <UIcon
              name="i-lucide-lock"
              class="mx-auto mb-3 size-8 text-muted"
            />
            <h2 class="text-lg font-semibold text-highlighted">
              Sign in to send feedback
            </h2>
            <p class="mt-1 text-sm text-muted">
              A quick sign-in lets us reply to you and keep your conversation in one place.
            </p>
            <UButton
              :to="localePath('/login')"
              icon="i-simple-icons-google"
              class="mt-5 rounded-full font-semibold"
            >
              Sign in
            </UButton>
          </div>

          <!-- Signed in -->
          <template v-else>
            <form
              class="space-y-4 rounded-2xl border border-default bg-default p-6"
              @submit.prevent="submit"
            >
              <UFormField
                label="Category"
                name="category"
              >
                <USelect
                  v-model="form.category"
                  :items="categories"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Subject"
                name="subject"
                hint="Optional"
              >
                <UInput
                  v-model="form.subject"
                  placeholder="A short summary"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="Message"
                name="message"
                required
              >
                <UTextarea
                  v-model="form.message"
                  :rows="5"
                  autoresize
                  placeholder="What's on your mind?"
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
                icon="i-lucide-send"
                :loading="submitting"
                :disabled="!form.message.trim()"
                class="rounded-full font-semibold"
              >
                Send feedback
              </UButton>
            </form>

            <!-- My threads -->
            <div
              v-if="threads.length"
              class="mt-12"
            >
              <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
                <UIcon
                  name="i-lucide-messages-square"
                  class="size-5 text-primary"
                />
                Your feedback
              </h2>
              <FeedbackThreadList
                :items="threads"
                @refresh="refresh"
              />
            </div>
          </template>
        </ClientOnly>

        <AdUnit
          placement="betweenSections"
          class="mx-auto mt-12 max-w-3xl"
        />
      </div>
    </UContainer>
  </div>
</template>
