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

const kind = ref<Kind>('resource')
const form = reactive({ title: '', url: '', imageUrl: '', description: '', tags: '' })
const error = ref('')
const sending = ref(false)
const sent = ref(false)

interface Mine {
  id: number
  kind: string
  title: string
  url: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewNote: string | null
}

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

async function send() {
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/submissions', {
      method: 'POST',
      body: {
        kind: kind.value,
        title: form.title,
        url: form.url || undefined,
        imageUrl: form.imageUrl || undefined,
        description: form.description,
        // Split here rather than asking the person to type an array.
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean)
      }
    })
    sent.value = true
    Object.assign(form, { title: '', url: '', imageUrl: '', description: '', tags: '' })
    await refreshMine()
  } catch (e) {
    // The API's statusMessage is written to be read by a person, so it is
    // shown as-is rather than replaced with a generic failure.
    error.value = (e as { statusMessage?: string })?.statusMessage || 'Something went wrong.'
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
  <UContainer>
    <UPageHeader
      :headline="t('submit.kicker')"
      :title="t('submit.title')"
      :description="t('submit.subtitle')"
    />

    <UPageBody>
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div
            v-if="sent"
            class="space-y-3 rounded-lg border border-default p-4"
          >
            <p class="flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-circle-check"
                class="size-5 text-success"
              />
              {{ t('submit.sentTitle') }}
            </p>
            <p class="text-muted">
              {{ t('submit.sentBody') }}
            </p>
            <UButton
              :label="t('submit.another')"
              color="neutral"
              variant="outline"
              size="sm"
              class="w-fit"
              @click="sent = false"
            />
          </div>

          <form
            v-else
            class="max-w-xl space-y-5 rounded-lg border border-default p-6 sm:p-8"
            @submit.prevent="send"
          >
            <fieldset class="space-y-2">
              <legend class="text-sm font-medium text-highlighted">
                {{ t('submit.kind') }}
              </legend>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="k in kinds"
                  :key="k.value"
                  :icon="k.icon"
                  :label="k.label"
                  :color="kind === k.value ? 'primary' : 'neutral'"
                  :variant="kind === k.value ? 'solid' : 'outline'"
                  size="sm"
                  :aria-pressed="kind === k.value"
                  @click="kind = k.value"
                />
              </div>
            </fieldset>

            <div class="space-y-1.5">
              <label
                class="block text-sm font-medium text-highlighted"
                for="s-title"
              >{{ t('submit.titleLabel') }}</label>
              <input
                id="s-title"
                v-model="form.title"
                class="w-full rounded-md border border-default bg-default px-3.5 py-2.5 text-sm text-highlighted focus:border-primary focus:outline-none"
                type="text"
                maxlength="160"
                required
              >
            </div>

            <div
              v-if="kind !== 'lesson-idea'"
              class="space-y-1.5"
            >
              <label
                class="block text-sm font-medium text-highlighted"
                for="s-url"
              >{{ t('submit.urlLabel') }}</label>
              <input
                id="s-url"
                v-model="form.url"
                class="w-full rounded-md border border-default bg-default px-3.5 py-2.5 text-sm text-highlighted focus:border-primary focus:outline-none"
                type="url"
                placeholder="https://"
                :required="kind === 'resource'"
              >
            </div>

            <div
              v-if="kind === 'showcase'"
              class="space-y-1.5"
            >
              <label
                class="block text-sm font-medium text-highlighted"
                for="s-img"
              >{{ t('submit.imageLabel') }}</label>
              <input
                id="s-img"
                v-model="form.imageUrl"
                class="w-full rounded-md border border-default bg-default px-3.5 py-2.5 text-sm text-highlighted focus:border-primary focus:outline-none"
                type="url"
                placeholder="https://"
              >
            </div>

            <div class="space-y-1.5">
              <label
                class="block text-sm font-medium text-highlighted"
                for="s-desc"
              >{{ t('submit.descLabel') }}</label>
              <textarea
                id="s-desc"
                v-model="form.description"
                class="w-full rounded-md border border-default bg-default px-3.5 py-2.5 text-sm text-highlighted focus:border-primary focus:outline-none"
                rows="5"
                minlength="20"
                maxlength="2000"
                required
              />
              <p class="text-xs text-muted">
                {{ t('submit.descHint') }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label
                class="block text-sm font-medium text-highlighted"
                for="s-tags"
              >{{ t('submit.tagsLabel') }}</label>
              <input
                id="s-tags"
                v-model="form.tags"
                class="w-full rounded-md border border-default bg-default px-3.5 py-2.5 text-sm text-highlighted focus:border-primary focus:outline-none"
                type="text"
                placeholder="saql, dashboards"
              >
              <p class="text-xs text-muted">
                {{ t('submit.tagsHint') }}
              </p>
            </div>

            <p
              v-if="error"
              class="flex items-center gap-2 text-sm text-error"
              role="alert"
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="size-4 shrink-0"
              />
              {{ error }}
            </p>

            <UButton
              type="submit"
              :label="t('submit.submit')"
              size="lg"
              :loading="sending"
              class="w-fit"
            />
          </form>
        </div>

        <aside>
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-dimmed">
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
            class="space-y-3"
          >
            <li
              v-for="s in mine.submissions"
              :key="s.id"
              class="rounded-lg border border-default"
            >
              <div class="p-4 space-y-2">
                <p class="text-sm font-semibold text-highlighted">
                  {{ s.title }}
                </p>
                <p class="text-sm text-muted">
                  <UBadge
                    :label="t(statusLabel[s.status])"
                    :color="s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'error' : 'neutral'"
                    variant="subtle"
                    size="sm"
                  />
                </p>
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
        </aside>
      </div>
    </UPageBody>
  </UContainer>
</template>
