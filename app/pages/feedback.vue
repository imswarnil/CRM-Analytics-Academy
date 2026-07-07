<script setup lang="ts">
import type { FeedbackThread } from '~/components/FeedbackThreadList.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
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
  if (!user.value || !form.message.trim()) return
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
      <div class="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-12">
        <!-- Left: details + form -->
        <aside class="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-2xl border border-default bg-elevated/30 p-6">
            <h2 class="flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-sparkles"
                class="size-5 text-primary"
              />
              How it works
            </h2>
            <ul class="mt-4 space-y-3 text-sm text-muted">
              <li class="flex gap-3">
                <UIcon
                  name="i-lucide-pencil-line"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>Pick a category and tell us what's on your mind.</span>
              </li>
              <li class="flex gap-3">
                <UIcon
                  name="i-lucide-eye"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>We read <span class="font-medium text-default">every</span> message — nothing is auto-filed.</span>
              </li>
              <li class="flex gap-3">
                <UIcon
                  name="i-lucide-message-circle-reply"
                  class="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>Our reply shows up right here in your thread.</span>
              </li>
            </ul>
          </div>

          <ClientOnly>
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
                v-if="user"
                type="submit"
                icon="i-lucide-send"
                :loading="submitting"
                :disabled="!form.message.trim()"
                block
                class="rounded-full font-semibold"
              >
                Send feedback
              </UButton>
              <UButton
                v-else
                :to="localePath('/login') + `?redirect=${encodeURIComponent(route.fullPath)}`"
                icon="i-lucide-lock"
                color="neutral"
                variant="outline"
                block
                class="rounded-full font-semibold"
              >
                Sign in required
              </UButton>
            </form>
            <template #fallback>
              <div class="h-96 rounded-2xl border border-default bg-elevated/40" />
            </template>
          </ClientOnly>
        </aside>

        <!-- Right: entries -->
        <div>
          <ClientOnly>
            <div v-if="threads.length">
              <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
                <UIcon
                  name="i-lucide-messages-square"
                  class="size-5 text-primary"
                />
                Your feedback
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ threads.length }}
                </UBadge>
              </h2>
              <FeedbackThreadList
                :items="threads"
                @refresh="refresh"
              />
            </div>
            <div
              v-else
              class="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-default p-10 text-center"
            >
              <UIcon
                name="i-lucide-inbox"
                class="size-8 text-dimmed"
              />
              <p class="mt-3 text-sm text-muted">
                Your conversations will appear here once you send your first message.
              </p>
            </div>
            <template #fallback>
              <div class="h-64 rounded-2xl border border-default bg-elevated/40" />
            </template>
          </ClientOnly>

          <AdUnit
            placement="betweenSections"
            class="mt-10"
          />
        </div>
      </div>
    </UContainer>
  </div>
</template>
