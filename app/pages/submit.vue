<script setup lang="ts">
definePageMeta({
  // Personal and auth-gated, like /dashboard: never prerendered, never
  // indexed. The real enforcement is server-side on /api/submissions.
  middleware: 'auth'
})

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: 'Contribute',
  robots: 'noindex, nofollow'
})

type Kind = 'resource' | 'showcase' | 'lesson-idea'

interface Photo {
  key: string
  url: string
}

interface Mine {
  id: number
  kind: string
  title: string
  url: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string | null
}

const kind = ref<Kind>('resource')
const form = reactive({ title: '', url: '', description: '', tags: [] as string[] })
const photos = ref<Photo[]>([])
const step = ref(0)
const error = ref('')
const sending = ref(false)
const sent = ref(false)

const { data: mine, refresh: refreshMine } = await useLazyAsyncData('my-submissions', () =>
  $fetch<{ submissions: Mine[] }>('/api/submissions'), {
  server: false,
  default: () => ({ submissions: [] as Mine[] })
})

const kinds = computed(() => [
  { value: 'resource' as Kind, label: t('submit.kindResource'), icon: 'i-lucide-link' },
  { value: 'showcase' as Kind, label: t('submit.kindShowcase'), icon: 'i-lucide-chart-column' },
  { value: 'lesson-idea' as Kind, label: t('submit.kindIdea'), icon: 'i-lucide-lightbulb' }
])

const kindLabel = computed(() => kinds.value.find(k => k.value === kind.value)?.label ?? '')

// The stepper is linear: steps ahead of the current one are disabled so the
// only way forward is the Continue button, which enforces validation. Going
// back through the header is always allowed.
const steps = computed(() => [
  { title: t('submit.stepKind'), icon: 'i-lucide-shapes' },
  { title: t('submit.stepDetails'), icon: 'i-lucide-pencil-line' },
  { title: t('submit.stepMedia'), icon: 'i-lucide-image' },
  { title: t('submit.stepReview'), icon: 'i-lucide-eye' }
].map((s, i) => ({ ...s, disabled: i > step.value })))

function urlOk(u: string) {
  try {
    const parsed = new URL(u)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Mirrors the server rules (title 3-160, description 20-2000, resource needs
// a link) so a person is stopped at the step, not at the end.
const detailsValid = computed(() => {
  const title = form.title.trim()
  const desc = form.description.trim()
  if (title.length < 3 || title.length > 160) return false
  if (desc.length < 20 || desc.length > 2000) return false
  if (kind.value === 'resource' && !urlOk(form.url.trim())) return false
  if (form.url.trim() && !urlOk(form.url.trim())) return false
  return true
})

const canContinue = computed(() => {
  if (step.value === 0) return Boolean(kind.value)
  if (step.value === 1) return detailsValid.value
  return true
})

// --- Tags: pick, don't type. Created entries join the option list so they
// can be re-selected; the server lowercases and dedupes on its side.
const suggestedTags = ['SAQL', 'bindings', 'dashboards', 'datasets', 'Einstein Discovery', 'recipes', 'admin', 'interview-prep']
const tagOptions = ref([...suggestedTags])

function onCreateTag(tag: string) {
  tagOptions.value.push(tag)
  form.tags.push(tag)
}

// --- Photos. /api/upload answers 503 in local dev (no R2 binding), so a
// failed upload is a warning, never a blocker — the form works without media.
const MAX_PHOTOS = 4
const MAX_BYTES = 4 * 1024 * 1024

const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  uploadError.value = ''
  for (const file of files) {
    if (photos.value.length >= MAX_PHOTOS) break
    if (file.size > MAX_BYTES) {
      uploadError.value = t('submit.photosHint')
      continue
    }
    const body = new FormData()
    body.append('file', file)
    uploading.value = true
    try {
      const res = await $fetch<Photo>('/api/upload', { method: 'POST', body })
      photos.value.push(res)
    } catch (err) {
      uploadError.value = (err as { statusMessage?: string })?.statusMessage
        || (err as { data?: { statusMessage?: string } })?.data?.statusMessage
        || 'Something went wrong.'
    } finally {
      uploading.value = false
    }
  }
}

function removePhoto(key: string) {
  photos.value = photos.value.filter(p => p.key !== key)
}

// The upload route returns a site-relative `/media/<key>` url, but the
// submissions API validates image/description urls with `new URL(...)`,
// which rejects relative paths — so absolutise against the current origin.
function toAbsolute(u: string) {
  return new URL(u, window.location.origin).toString()
}

// First photo rides the existing imageUrl field; the rest are appended to
// the description as markdown links, but only while the 2000-char server
// cap still holds.
function buildDescription() {
  let description = form.description.trim()
  for (const photo of photos.value.slice(1)) {
    const abs = toAbsolute(photo.url)
    const line = `\n[${abs}](${abs})`
    if (description.length + line.length > 2000) break
    description += line
  }
  return description
}

async function send() {
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/submissions', {
      method: 'POST',
      body: {
        kind: kind.value,
        title: form.title.trim(),
        url: form.url.trim() || undefined,
        imageUrl: photos.value[0] ? toAbsolute(photos.value[0].url) : undefined,
        description: buildDescription(),
        tags: form.tags
      }
    })
    sent.value = true
    Object.assign(form, { title: '', url: '', description: '', tags: [] })
    photos.value = []
    step.value = 0
    await refreshMine()
  } catch (e) {
    // The API's statusMessage is written to be read by a person (including
    // the 429 rate-limit message), so it is shown as-is.
    error.value = (e as { statusMessage?: string })?.statusMessage
      || (e as { data?: { statusMessage?: string } })?.data?.statusMessage
      || 'Something went wrong.'
  } finally {
    sending.value = false
  }
}

const statusLabel: Record<Mine['status'], string> = {
  pending: 'submit.pending',
  approved: 'submit.approved',
  rejected: 'submit.rejected'
}
</script>

<template>
  <div>
    <section class="flex min-h-[calc(100vh-var(--ui-header-height,4rem))] items-center justify-center px-4 py-6 sm:px-6">
      <UCard class="w-full max-w-2xl">
        <template #header>
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary">
              {{ t('submit.kicker') }}
            </p>
            <h1 class="text-lg font-bold text-highlighted">
              {{ t('submit.title') }}
            </h1>
          </div>
        </template>

        <div
          v-if="sent"
          class="space-y-3 py-4 text-center"
        >
          <UIcon
            name="i-lucide-circle-check"
            class="mx-auto size-10 text-success"
          />
          <p class="font-semibold text-highlighted">
            {{ t('submit.sentTitle') }}
          </p>
          <p class="text-sm text-muted">
            {{ t('submit.sentBody') }}
          </p>
          <UButton
            :label="t('submit.another')"
            color="neutral"
            variant="outline"
            size="sm"
            @click="sent = false"
          />
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <UStepper
            v-model="step"
            :items="steps"
            size="sm"
          />

          <!-- Step 1: what kind of thing is this? -->
          <fieldset
            v-if="step === 0"
            class="space-y-3"
          >
            <legend class="text-sm font-medium text-highlighted">
              {{ t('submit.kind') }}
            </legend>
            <div class="grid gap-3 sm:grid-cols-3">
              <UButton
                v-for="k in kinds"
                :key="k.value"
                :icon="k.icon"
                :label="k.label"
                :color="kind === k.value ? 'primary' : 'neutral'"
                :variant="kind === k.value ? 'soft' : 'outline'"
                size="lg"
                block
                class="h-24 flex-col justify-center gap-2 text-center"
                :aria-pressed="kind === k.value"
                @click="kind = k.value"
              />
            </div>
            <p class="text-sm text-muted">
              {{ t('submit.subtitle') }}
            </p>
          </fieldset>

          <!-- Step 2: title, link, description -->
          <div
            v-else-if="step === 1"
            class="space-y-4"
          >
            <UFormField :label="t('submit.titleLabel')">
              <UInput
                v-model="form.title"
                class="w-full"
                maxlength="160"
                autofocus
              />
            </UFormField>

            <UFormField
              v-if="kind !== 'lesson-idea'"
              :label="t('submit.urlLabel')"
              :hint="kind === 'showcase' ? t('submit.optional') : undefined"
            >
              <UInput
                v-model="form.url"
                class="w-full"
                type="url"
                placeholder="https://"
                icon="i-lucide-link"
              />
            </UFormField>

            <UFormField
              :label="t('submit.descLabel')"
              :help="t('submit.descHint')"
            >
              <UTextarea
                v-model="form.description"
                class="w-full"
                :rows="3"
                maxlength="2000"
              />
            </UFormField>
          </div>

          <!-- Step 3: screenshots + tags, both optional -->
          <div
            v-else-if="step === 2"
            class="space-y-4"
          >
            <UFormField
              :label="t('submit.photosLabel')"
              :hint="t('submit.optional')"
              :help="t('submit.photosHint')"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                class="hidden"
                @change="onFiles"
              >
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div
                  v-for="p in photos"
                  :key="p.key"
                  class="relative aspect-video overflow-hidden rounded-md border border-default"
                >
                  <img
                    :src="p.url"
                    alt=""
                    class="size-full object-cover"
                  >
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="solid"
                    size="xs"
                    class="absolute right-1 top-1"
                    :aria-label="t('submit.back')"
                    @click="removePhoto(p.key)"
                  />
                </div>
                <UButton
                  v-if="photos.length < MAX_PHOTOS"
                  icon="i-lucide-image-plus"
                  color="neutral"
                  variant="outline"
                  class="aspect-video h-auto flex-col justify-center border-dashed"
                  block
                  :loading="uploading"
                  :label="uploading ? t('submit.uploading') : undefined"
                  :aria-label="t('submit.photosLabel')"
                  @click="fileInput?.click()"
                />
              </div>
            </UFormField>

            <UAlert
              v-if="uploadError"
              color="warning"
              variant="subtle"
              icon="i-lucide-triangle-alert"
              :title="uploadError"
            />

            <UFormField
              :label="t('submit.tagsLabel')"
              :hint="t('submit.optional')"
            >
              <USelectMenu
                v-model="form.tags"
                :items="tagOptions"
                multiple
                create-item
                icon="i-lucide-tags"
                class="w-full"
                @create="onCreateTag"
              />
            </UFormField>
          </div>

          <!-- Step 4: review + send -->
          <div
            v-else
            class="space-y-4"
          >
            <p class="text-sm text-muted">
              {{ t('submit.reviewHint') }}
            </p>

            <dl class="space-y-3 text-sm">
              <div class="flex items-baseline justify-between gap-4">
                <dt class="shrink-0 text-muted">
                  {{ t('submit.kind') }}
                </dt>
                <dd class="font-medium text-highlighted">
                  {{ kindLabel }}
                </dd>
              </div>
              <USeparator />
              <div class="flex items-baseline justify-between gap-4">
                <dt class="shrink-0 text-muted">
                  {{ t('submit.titleLabel') }}
                </dt>
                <dd class="truncate font-medium text-highlighted">
                  {{ form.title }}
                </dd>
              </div>
              <template v-if="form.url">
                <USeparator />
                <div class="flex items-baseline justify-between gap-4">
                  <dt class="shrink-0 text-muted">
                    {{ t('submit.urlLabel') }}
                  </dt>
                  <dd class="truncate font-medium text-highlighted">
                    {{ form.url }}
                  </dd>
                </div>
              </template>
              <USeparator />
              <div class="space-y-1">
                <dt class="text-muted">
                  {{ t('submit.descLabel') }}
                </dt>
                <dd class="line-clamp-3 text-highlighted">
                  {{ form.description }}
                </dd>
              </div>
              <template v-if="form.tags.length">
                <USeparator />
                <div class="flex items-baseline justify-between gap-4">
                  <dt class="shrink-0 text-muted">
                    {{ t('submit.tagsLabel') }}
                  </dt>
                  <dd class="flex flex-wrap justify-end gap-1">
                    <UBadge
                      v-for="tag in form.tags"
                      :key="tag"
                      :label="tag"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    />
                  </dd>
                </div>
              </template>
            </dl>

            <div
              v-if="photos.length"
              class="flex gap-2"
            >
              <img
                v-for="p in photos"
                :key="p.key"
                :src="p.url"
                alt=""
                class="h-14 w-24 rounded-md border border-default object-cover"
              >
            </div>

            <UAlert
              v-if="error"
              color="error"
              variant="subtle"
              icon="i-lucide-alert-circle"
              :title="error"
            />
          </div>

          <div class="flex items-center justify-between pt-2">
            <UButton
              :label="t('submit.back')"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              :disabled="step === 0 || sending"
              @click="step -= 1"
            />
            <UButton
              v-if="step < 3"
              :label="t('submit.next')"
              trailing-icon="i-lucide-arrow-right"
              :disabled="!canContinue"
              @click="step += 1"
            />
            <UButton
              v-else
              :label="t('submit.submit')"
              icon="i-lucide-send"
              :loading="sending"
              @click="send"
            />
          </div>
        </div>
      </UCard>
    </section>

    <UContainer class="pb-16">
      <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-dimmed">
        {{ t('submit.mine') }}
      </p>

      <p
        v-if="!mine?.submissions?.length"
        class="text-sm text-muted"
      >
        {{ t('submit.none') }}
      </p>

      <ul
        v-else
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <li
          v-for="s in mine.submissions"
          :key="s.id"
          class="rounded-lg border border-default p-4"
        >
          <div class="space-y-2">
            <p class="text-sm font-semibold text-highlighted">
              {{ s.title }}
            </p>
            <UBadge
              :label="t(statusLabel[s.status])"
              :color="s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'error' : 'neutral'"
              variant="subtle"
              size="sm"
            />
            <p
              v-if="s.reviewNote"
              class="text-sm text-muted"
            >
              {{ s.reviewNote }}
            </p>
          </div>
        </li>
      </ul>

      <NuxtLink
        class="mt-6 inline-block text-sm text-primary"
        :to="localePath('/leaderboard')"
      >
        {{ t('nav.leaderboard') }} →
      </NuxtLink>
    </UContainer>
  </div>
</template>
