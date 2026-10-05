<script setup lang="ts">
/**
 * Which lessons are Pro, and which videos each lesson plays.
 *
 * Saving commits the change to the lesson's English file on GitHub; the
 * deploy that follows applies it to all twelve languages. So a change shows
 * here immediately but reaches the site a few minutes later — the view says
 * so rather than pretending the edit is live.
 */
interface Lesson {
  file: string
  route: string
  section: string
  title: string
  access: 'free' | 'pro'
  mux: string | Record<string, string> | null
}

const lessons = ref<Lesson[]>([])
const loading = ref(true)
const error = ref('')
const filter = ref<'all' | 'pro' | 'free' | 'video'>('all')
const search = ref('')
const editing = ref<Lesson | null>(null)
const form = reactive<{ access: 'free' | 'pro', mux: string }>({ access: 'free', mux: '' })
const saving = ref(false)
const saved = ref<Record<string, string>>({})

async function load() {
  loading.value = true
  try {
    lessons.value = (await $fetch<{ lessons: Lesson[] }>('/api/admin/lessons')).lessons
  } catch (e) {
    error.value = apiError(e) || 'Could not load lessons.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

// One video per lesson. An old per-language map still reads as its English id.
const muxOf = (l: Lesson): string =>
  typeof l.mux === 'string' ? l.mux : (l.mux?.en ?? '')

const shown = computed(() => lessons.value.filter((l) => {
  if (filter.value === 'pro' && l.access !== 'pro') return false
  if (filter.value === 'free' && l.access !== 'free') return false
  if (filter.value === 'video' && !muxOf(l)) return false
  const q = search.value.trim().toLowerCase()
  return !q || l.title.toLowerCase().includes(q) || l.route.includes(q)
}))

const counts = computed(() => ({
  pro: lessons.value.filter(l => l.access === 'pro').length,
  video: lessons.value.filter(l => muxOf(l)).length
}))

function edit(l: Lesson) {
  editing.value = l
  form.access = l.access
  form.mux = muxOf(l)
}

async function save() {
  if (!editing.value) return
  saving.value = true
  error.value = ''
  try {
    const res = await $fetch<{ commitUrl: string | null }>('/api/admin/lessons', {
      method: 'PATCH',
      body: { file: editing.value.file, access: form.access, mux: form.mux }
    })
    editing.value.access = form.access
    editing.value.mux = form.mux.trim() || null
    saved.value[editing.value.file] = res.commitUrl ?? ''
    editing.value = null
  } catch (e) {
    error.value = apiError(e) || 'Could not save.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <UCard>
        <p class="im-meta text-(--ink2)">
          Lessons
        </p>
        <p class="im-figure mt-1 text-3xl font-black text-(--signal)">
          {{ lessons.length }}
        </p>
      </UCard>
      <UCard>
        <p class="im-meta text-(--ink2)">
          Pro
        </p>
        <p class="im-figure mt-1 text-2xl font-semibold text-primary">
          {{ counts.pro }}
        </p>
      </UCard>
      <UCard>
        <p class="im-meta text-(--ink2)">
          With video
        </p>
        <p class="im-figure mt-1 text-3xl font-black text-(--signal)">
          {{ counts.video }}
        </p>
      </UCard>
    </div>

    <UAlert
      class="mb-4"
      color="info"
      variant="subtle"
      icon="i-lucide-git-commit-horizontal"
      title="Changes are commits"
      description="Saving commits the lesson's English file on GitHub. The site picks it up on the next deploy, in every language."
    />

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <UButton
        v-for="f in (['all', 'pro', 'free', 'video'] as const)"
        :key="f"
        size="sm"
        class="capitalize"
        :color="filter === f ? 'primary' : 'neutral'"
        :variant="filter === f ? 'soft' : 'ghost'"
        @click="filter = f"
      >
        {{ f }}
      </UButton>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search lessons"
        size="sm"
        class="ms-auto w-60"
      />
    </div>

    <p
      v-if="error"
      class="mb-3 text-sm text-error"
    >
      {{ error }}
    </p>

    <div class="overflow-hidden border-[1.5px] border-(--ink) bg-(--card)">
      <div
        v-if="loading"
        class="space-y-2 p-4"
      >
        <USkeleton
          v-for="i in 6"
          :key="i"
          class="h-8 w-full"
        />
      </div>
      <div
        v-for="l in shown"
        v-else
        :key="l.file"
        class="flex flex-wrap items-center gap-3 border-b border-(--line) px-4 py-2.5 last:border-b-0"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-(--ink)">
            {{ l.title }}
          </p>
          <p class="truncate font-mono text-xs text-(--ink2)">
            {{ l.route }}
          </p>
        </div>
        <UBadge
          v-if="muxOf(l)"
          color="neutral"
          variant="soft"
          icon="i-lucide-video"
          size="sm"
        >
          Video
        </UBadge>
        <UBadge
          :color="l.access === 'pro' ? 'primary' : 'neutral'"
          :variant="l.access === 'pro' ? 'solid' : 'outline'"
          size="sm"
        >
          {{ l.access === 'pro' ? 'Pro' : 'Free' }}
        </UBadge>
        <a
          v-if="saved[l.file]"
          :href="saved[l.file]"
          target="_blank"
          class="text-xs text-primary hover:underline"
        >committed</a>
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-pencil"
          @click="edit(l)"
        />
      </div>
    </div>

    <UModal
      :open="Boolean(editing)"
      :title="editing?.title"
      description="Access tier and lesson videos"
      @update:open="v => { if (!v) editing = null }"
    >
      <template #body>
        <div class="space-y-5">
          <UFormField label="Access">
            <div class="flex gap-2">
              <UButton
                v-for="a in (['free', 'pro'] as const)"
                :key="a"
                :color="form.access === a ? 'primary' : 'neutral'"
                :variant="form.access === a ? 'solid' : 'outline'"
                class="capitalize"
                @click="form.access = a"
              >
                {{ a }}
              </UButton>
            </div>
          </UFormField>
          <UFormField
            label="Mux playback id"
            help="One video for every language — captions and the transcript follow the reader's language. Use a signed id for a Pro lesson and a public one for a free lesson."
          >
            <UInput
              v-model="form.mux"
              class="w-full"
              placeholder="e.g. a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M"
              icon="i-lucide-video"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="editing = null"
          >
            Cancel
          </UButton>
          <UButton
            :loading="saving"
            icon="i-lucide-git-commit-horizontal"
            @click="save"
          >
            Commit
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>
