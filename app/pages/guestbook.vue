<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const user = useSupabaseUser()
const toast = useToast()

const title = 'Guestbook — CRM Analytics Academy'
const description = 'Leave a note or a doodle for the community. Every entry is posted instantly unless it contains abusive language.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

interface Author {
  username: string | null
  full_name: string | null
  avatar_url: string | null
}
interface Entry {
  id: string
  name: string | null
  message: string | null
  drawing: string | null
  status: 'visible' | 'hidden'
  created_at: string
  user_id: string
  author: Author | null
}

const { data, refresh } = await useAsyncData<{ entries: Entry[], isAdmin: boolean, userId: string | null }>(
  'guestbook',
  () => $fetch('/api/guestbook/list'),
  { default: () => ({ entries: [], isAdmin: false, userId: null }) }
)

const canvasRef = ref<{ clear: () => void, toDataURL: () => string | null } | null>(null)
const form = reactive({ name: '', message: '' })
const submitting = ref(false)
const error = ref('')
const busyId = ref('')

async function submit() {
  const drawing = canvasRef.value?.toDataURL() ?? null
  if (!form.message.trim() && !drawing) {
    error.value = 'Add a message or draw something first.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/guestbook', {
      method: 'POST',
      body: { name: form.name, message: form.message, drawing }
    })
    form.name = ''
    form.message = ''
    canvasRef.value?.clear()
    toast.add({ title: 'Signed!', description: 'Your entry is live.', color: 'success' })
    await refresh()
  } catch (err) {
    error.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong.'
  } finally {
    submitting.value = false
  }
}

async function removeEntry(id: string) {
  busyId.value = id
  try {
    await $fetch('/api/guestbook/delete', { method: 'POST', body: { id } })
    await refresh()
  } finally {
    busyId.value = ''
  }
}

async function toggleHidden(entry: Entry) {
  busyId.value = entry.id
  try {
    await $fetch('/api/admin/mutate', {
      method: 'POST',
      body: { action: 'update', table: 'guestbook', id: entry.id, patch: { status: entry.status === 'hidden' ? 'visible' : 'hidden' } }
    })
    await refresh()
  } finally {
    busyId.value = ''
  }
}

const authorName = (a: Author | null) => a?.full_name || a?.username || 'A visitor'
const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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
            name="i-lucide-book-heart"
            class="mr-1 size-4"
          />
          {{ t('nav.guestbook') }}
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Leave your <span class="text-gradient">mark</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Say hi, share a tip, or doodle something fun. It posts instantly — just keep it friendly.
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
              Sign in to sign the guestbook
            </h2>
            <UButton
              :to="localePath('/login')"
              icon="i-simple-icons-google"
              class="mt-5 rounded-full font-semibold"
            >
              Sign in
            </UButton>
          </div>

          <!-- Signed in -->
          <form
            v-else
            class="space-y-4 rounded-2xl border border-default bg-default p-6"
            @submit.prevent="submit"
          >
            <UFormField
              label="Your name"
              hint="Optional"
            >
              <UInput
                v-model="form.name"
                placeholder="How should we sign you?"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Message">
              <UTextarea
                v-model="form.message"
                :rows="3"
                autoresize
                placeholder="Leave a note…"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Or draw something"
              hint="Optional"
            >
              <GuestbookCanvas ref="canvasRef" />
            </UFormField>
            <p
              v-if="error"
              class="text-sm text-error"
            >
              {{ error }}
            </p>
            <UButton
              type="submit"
              icon="i-lucide-pen-line"
              :loading="submitting"
              class="rounded-full font-semibold"
            >
              Sign the guestbook
            </UButton>
          </form>
        </ClientOnly>

        <AdUnit
          placement="betweenSections"
          class="mx-auto my-12 max-w-3xl"
        />

        <!-- Entries -->
        <div class="space-y-5">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-messages-square"
              class="size-5 text-primary"
            />
            {{ data.entries.length }} {{ data.entries.length === 1 ? 'entry' : 'entries' }}
          </h2>

          <div
            v-for="e in data.entries"
            :key="e.id"
            class="rounded-2xl border border-default bg-default p-5"
            :class="e.status === 'hidden' ? 'opacity-50' : ''"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-highlighted">{{ e.name || authorName(e.author) }}</span>
              <span class="text-xs text-dimmed">{{ fmt(e.created_at) }}</span>
              <UBadge
                v-if="e.status === 'hidden'"
                color="error"
                variant="subtle"
                size="sm"
              >
                Hidden
              </UBadge>
              <div class="ml-auto flex gap-1.5">
                <UButton
                  v-if="data.isAdmin"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :icon="e.status === 'hidden' ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                  :loading="busyId === e.id"
                  @click="toggleHidden(e)"
                />
                <UButton
                  v-if="data.isAdmin || e.user_id === data.userId"
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash-2"
                  :loading="busyId === e.id"
                  @click="removeEntry(e.id)"
                />
              </div>
            </div>
            <p
              v-if="e.message"
              class="mt-2 whitespace-pre-wrap text-sm text-default"
            >
              {{ e.message }}
            </p>
            <img
              v-if="e.drawing"
              :src="e.drawing"
              alt="A drawing left in the guestbook"
              class="mt-3 max-w-full rounded-lg border border-default"
              width="640"
              height="300"
            >
          </div>

          <p
            v-if="!data.entries.length"
            class="py-10 text-center text-sm text-muted"
          >
            No entries yet — be the first to sign!
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
