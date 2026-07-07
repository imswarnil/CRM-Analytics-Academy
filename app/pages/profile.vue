<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, profile, displayName, refresh } = useProfile()
const localePath = useLocalePath()

useSeoMeta({ title: 'Your profile — CRM Analytics Academy', robots: 'noindex' })

interface Progress {
  avgScore: number | null
  quizzesPassed: number
  quizzesTaken: number
  sections: { slug: string, title: string, total: number, completed: number, pct: number }[]
  skills: { skill: string, correct: number, total: number, pct: number }[]
  certificateEligible: boolean
  certMinScore: number
}
const { data: dash } = await useAsyncData<Progress | null>(
  'profile-progress',
  () => $fetch('/api/dashboard'),
  { server: false, watch: [user] }
)
onMounted(() => refreshNuxtData('profile-progress'))

function skillClass(pct: number) {
  return pct >= 85 ? 'bg-success' : pct >= 60 ? 'bg-primary' : 'bg-warning'
}

const form = reactive({ full_name: '', username: '', bio: '', linkedin_url: '' })
const saving = ref(false)
const savedAt = ref(0)
const error = ref('')

// Seed the form once the profile has loaded.
watch(profile, (p) => {
  if (p) {
    form.full_name = p.full_name ?? ''
    form.username = p.username ?? ''
    form.bio = p.bio ?? ''
    form.linkedin_url = p.linkedin_url ?? ''
  }
}, { immediate: true })

async function save() {
  if (!user.value) return
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/profile', {
      method: 'POST',
      body: { full_name: form.full_name, username: form.username, bio: form.bio, linkedin_url: form.linkedin_url }
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

    <!-- Progress + certificate -->
    <div
      v-if="dash"
      class="mb-10 space-y-5"
    >
      <!-- Certificate -->
      <div
        v-if="dash.certificateEligible"
        class="overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10 p-5"
      >
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-xl bg-primary text-inverted shadow">
            <UIcon
              name="i-lucide-award"
              class="size-7"
            />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-bold text-highlighted">
              Your certificate is ready 🎉
            </h2>
            <p class="text-sm text-muted">
              You completed every section and scored {{ dash.avgScore }}/100.
            </p>
          </div>
          <UButton
            :to="localePath('/certificate')"
            color="primary"
            icon="i-lucide-download"
          >
            Get certificate
          </UButton>
        </div>
      </div>

      <!-- Section progress -->
      <div class="rounded-2xl border border-default bg-default p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-semibold text-highlighted">
            <UIcon
              name="i-lucide-milestone"
              class="size-5 text-primary"
            />
            Progress by section
          </h2>
          <UBadge
            v-if="dash.avgScore != null"
            :color="dash.avgScore >= 85 ? 'success' : 'primary'"
            variant="subtle"
          >
            Avg {{ dash.avgScore }}/100
          </UBadge>
        </div>
        <div class="space-y-4">
          <div
            v-for="s in dash.sections"
            :key="s.slug"
          >
            <div class="mb-1 flex items-center justify-between text-sm">
              <NuxtLink
                :to="localePath(`/${s.slug}`)"
                class="font-medium text-default hover:text-primary"
              >
                {{ s.title }}
              </NuxtLink>
              <span class="tabular-nums text-muted">{{ s.completed }}/{{ s.total }} · {{ s.pct }}%</span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-elevated">
              <div
                class="h-full rounded-full bg-primary transition-all duration-700"
                :style="{ width: `${s.pct}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div
        v-if="dash.skills.length"
        class="rounded-2xl border border-default bg-default p-5"
      >
        <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
          <UIcon
            name="i-lucide-radar"
            class="size-5 text-primary"
          />
          CRM Analytics skills
        </h2>
        <div class="space-y-3.5">
          <div
            v-for="sk in dash.skills"
            :key="sk.skill"
          >
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="font-medium text-default">{{ sk.skill }}</span>
              <span class="tabular-nums text-muted">{{ sk.pct }}%</span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-elevated">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="skillClass(sk.pct)"
                :style="{ width: `${sk.pct}%` }"
              />
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs text-muted">
          Based on your best graded-quiz attempt in each section.
        </p>
      </div>

      <!-- Not yet eligible hint -->
      <div
        v-if="!dash.certificateEligible"
        class="flex items-start gap-3 rounded-xl border border-dashed border-default px-4 py-3 text-sm text-muted"
      >
        <UIcon
          name="i-lucide-award"
          class="mt-0.5 size-4 shrink-0"
        />
        <p>Complete every lesson and score {{ dash.certMinScore }}%+ on the graded quizzes to unlock your shareable certificate.</p>
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

      <UFormField
        label="LinkedIn profile"
        name="linkedin_url"
        help="Optional — shown next to your name on resources, feedback, and guestbook entries you submit."
      >
        <UInput
          v-model="form.linkedin_url"
          icon="i-simple-icons-linkedin"
          placeholder="https://www.linkedin.com/in/your-name"
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
