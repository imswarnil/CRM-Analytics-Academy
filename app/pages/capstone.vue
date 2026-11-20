<script setup lang="ts">
/**
 * /capstone — the course's final challenge and its certificate of completion.
 *
 * The brief is static and prerendered. A signed-in learner submits a demo
 * link as a `showcase` submission with `details.type = 'capstone'`
 * (server/api/submissions.post.ts); the owner reviews it in /admin →
 * Submissions. Once approved, this page shows the learner's certificate,
 * with the submission id as the credential number.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn, user } = useAuth()

const title = computed(() => t('capstone.seoTitle'))
const description = computed(() => t('capstone.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })

const reqs = [
  { key: 'r1', icon: 'i-lucide-workflow' },
  { key: 'r2', icon: 'i-lucide-history' },
  { key: 'r3', icon: 'i-lucide-link-2' },
  { key: 'r4', icon: 'i-lucide-shield-check' },
  { key: 'r5', icon: 'i-lucide-sparkles' }
]
const how = [
  { key: 'h1', icon: 'i-lucide-hammer' },
  { key: 'h2', icon: 'i-lucide-video' },
  { key: 'h3', icon: 'i-lucide-send' },
  { key: 'h4', icon: 'i-lucide-award' }
]

interface Mine { id: number, type: string | null, status: 'pending' | 'approved' | 'rejected', reviewNote: string | null, createdAt: string }
const mine = ref<Mine | null>(null)
async function load() {
  if (!isSignedIn.value) return
  const res = await $fetch<{ submissions: Mine[] }>('/api/submissions').catch(() => ({ submissions: [] }))
  mine.value = res.submissions.find(s => s.type === 'capstone') ?? null
}
onMounted(load)
watch(isSignedIn, load)

const form = reactive({ title: '', video: '', shot: '', notes: '' })
const sending = ref(false)
const error = ref('')
async function send() {
  sending.value = true
  error.value = ''
  try {
    await $fetch('/api/submissions', {
      method: 'POST',
      body: {
        kind: 'showcase',
        title: form.title,
        url: form.video,
        imageUrl: form.shot || undefined,
        description: form.notes,
        tags: ['capstone'],
        details: { type: 'capstone' }
      }
    })
    await load()
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? String(e)
  } finally {
    sending.value = false
  }
}
const printPage = () => window.print()
const credential = computed(() => mine.value ? `CRMA-CAP-${String(mine.value.id).padStart(5, '0')}` : '')
</script>

<template>
  <div class="bg-(--paper)">
    <section class="relative overflow-hidden bg-(--navy) text-white">
      <div class="mx-auto grid max-w-(--ui-container) items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[.12em] text-blueprint-200">
            {{ t('capstone.eyebrow') }}
          </p>
          <h1 class="mt-2 text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            {{ t('capstone.title') }}
          </h1>
          <p class="mt-4 max-w-lg text-lg text-white/75">
            {{ t('capstone.lead') }}
          </p>
          <ol class="mt-8 grid max-w-lg grid-cols-4 gap-2">
            <li
              v-for="(h, i) in how"
              :key="h.key"
            >
              <UTooltip :text="t(`capstone.${h.key}`)">
                <span class="flex flex-col items-center gap-2 text-center">
                  <span class="flex size-11 items-center justify-center rounded-full bg-white/10 text-blueprint-200">
                    <UIcon
                      :name="h.icon"
                      class="size-5"
                    />
                  </span>
                  <span class="text-[11px] font-semibold text-white/70">{{ i + 1 }}</span>
                </span>
              </UTooltip>
            </li>
          </ol>
        </div>
        <div class="mx-auto w-full max-w-md">
          <CourseCertificate
            :name="user?.name || ''"
            sample
            animate
          />
        </div>
      </div>
    </section>

    <div class="mx-auto grid max-w-(--ui-container) gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <section>
        <h2 class="bp-h3">
          {{ t('capstone.briefTitle') }}
        </h2>
        <p class="mt-2 text-(--ink2)">
          {{ t('capstone.brief') }}
        </p>
        <ul class="mt-6 space-y-3">
          <li
            v-for="r in reqs"
            :key="r.key"
            class="flex items-center gap-3 rounded-[8px] border border-(--line) bg-(--card) p-4"
          >
            <span class="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-(--ice) text-(--signal)">
              <UIcon
                :name="r.icon"
                class="size-5"
              />
            </span>
            <span class="text-[0.9375rem] font-medium text-(--ink)">{{ t(`capstone.${r.key}`) }}</span>
          </li>
        </ul>
      </section>

      <section class="rounded-[8px] border border-(--line) bg-(--card) p-6 sm:p-8">
        <ClientOnly>
          <!-- Approved: the certificate -->
          <div v-if="mine?.status === 'approved'">
            <p class="flex items-center gap-2 font-semibold text-success">
              <UIcon
                name="i-lucide-badge-check"
                class="size-5"
              />{{ t('capstone.approved') }}
            </p>
            <div class="cert-print mt-5">
              <CourseCertificate
                :name="user?.name || ''"
                :date="mine.createdAt"
                :credential="credential"
              />
            </div>
            <UButton
              class="no-print mt-5"
              icon="i-lucide-download"
              @click="printPage"
            >
              {{ t('capstone.print') }}
            </UButton>
          </div>
          <!-- Pending -->
          <p
            v-else-if="mine?.status === 'pending'"
            class="flex items-center gap-2 text-(--ink)"
          >
            <UIcon
              name="i-lucide-hourglass"
              class="size-5 text-(--signal)"
            />{{ t('capstone.pending') }}
          </p>
          <!-- The form (also after "changes requested") -->
          <template v-else>
            <h2 class="bp-h3">
              {{ t('capstone.formTitle') }}
            </h2>
            <UAlert
              v-if="mine?.status === 'rejected'"
              class="mt-4"
              color="warning"
              variant="subtle"
              :title="t('capstone.rejected')"
              :description="mine.reviewNote ?? undefined"
            />
            <form
              v-if="isSignedIn"
              class="mt-5 grid gap-4"
              @submit.prevent="send"
            >
              <UFormField :label="t('capstone.fTitle')">
                <UInput
                  v-model="form.title"
                  :placeholder="t('capstone.fTitlePh')"
                  required
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('capstone.fVideo')">
                <UInput
                  v-model="form.video"
                  type="url"
                  :placeholder="t('capstone.fVideoPh')"
                  required
                  icon="i-lucide-video"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('capstone.fShot')">
                <UInput
                  v-model="form.shot"
                  type="url"
                  icon="i-lucide-image"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('capstone.fNotes')">
                <UTextarea
                  v-model="form.notes"
                  :placeholder="t('capstone.fNotesPh')"
                  :rows="5"
                  required
                  class="w-full"
                />
              </UFormField>
              <UAlert
                v-if="error"
                color="error"
                variant="subtle"
                :description="error"
              />
              <UButton
                type="submit"
                size="lg"
                :loading="sending"
                icon="i-lucide-send"
                block
              >
                {{ t('capstone.submit') }}
              </UButton>
            </form>
            <UButton
              v-else
              :to="{ path: localePath('/sign-in'), query: { redirect: localePath('/capstone') } }"
              size="lg"
              class="mt-5"
              block
            >
              {{ t('capstone.signIn') }}
            </UButton>
          </template>
        </ClientOnly>
      </section>
    </div>
  </div>
</template>
