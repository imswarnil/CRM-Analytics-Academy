<script setup lang="ts">
// Curriculum content builder — the only place the site owner manages database
// sections/lessons. Everything here talks to /api/admin/sections, /lessons and
// /reorder; the file-based markdown curriculum under content/ is untouched.
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useProfile()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({ title: 'Content builder — CRM Analytics Academy', robots: 'noindex' })

type Status = 'draft' | 'published'
type Access = 'public' | 'members'

interface LessonSummary {
  id: string
  section_id: string
  slug: string
  title: string
  description: string | null
  position: number
  status: Status
  access: Access
  video_id: string | null
  video_start: number | null
  video_end: number | null
  pass_score: number
  updated_at: string | null
}

interface Lesson extends LessonSummary {
  body: string | null
  quiz: unknown
}

interface Section {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  position: number
  status: Status
  created_at: string | null
  updated_at: string | null
  lessons: LessonSummary[]
}

const { data, pending, refresh } = await useAsyncData<{ sections: Section[] }>(
  'admin-content-tree',
  () => $fetch('/api/admin/sections'),
  { server: false, watch: [isAdmin], default: () => ({ sections: [] }) }
)

const sections = computed(() => data.value?.sections ?? [])

const busy = ref('')
const error = ref('')

const collapsed = ref<Record<string, boolean>>({})
const isOpen = (id: string) => collapsed.value[id] !== true
function toggleSection(id: string) {
  collapsed.value[id] = isOpen(id)
}

function apiError(e: unknown) {
  const err = e as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
  return err?.data?.statusMessage || err?.statusMessage || err?.message || 'Something went wrong.'
}

function fmtClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function clipLabel(lesson: LessonSummary) {
  if (lesson.video_start !== null && lesson.video_end !== null) {
    return `${fmtClock(lesson.video_start)}–${fmtClock(lesson.video_end)}`
  }
  if (lesson.video_start !== null) return `from ${fmtClock(lesson.video_start)}`
  if (lesson.video_end !== null) return `to ${fmtClock(lesson.video_end)}`
  return 'Video'
}

const statusItems = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' }
]
const accessItems = [
  { label: 'Public', value: 'public' },
  { label: 'Members only', value: 'members' }
]

/* -------------------------------------------------------------- reordering */

async function reorderSections(index: number, delta: number) {
  const ids = sections.value.map(s => s.id)
  const target = index + delta
  if (target < 0 || target >= ids.length) return
  const moved = ids[index]!
  ids.splice(index, 1)
  ids.splice(target, 0, moved)

  busy.value = `order-${moved}`
  error.value = ''
  try {
    await $fetch('/api/admin/reorder', { method: 'POST', body: { type: 'section', ids } })
    await refresh()
  } catch (e) {
    error.value = apiError(e)
  } finally {
    busy.value = ''
  }
}

async function reorderLessons(section: Section, index: number, delta: number) {
  const ids = section.lessons.map(l => l.id)
  const target = index + delta
  if (target < 0 || target >= ids.length) return
  const moved = ids[index]!
  ids.splice(index, 1)
  ids.splice(target, 0, moved)

  busy.value = `order-${moved}`
  error.value = ''
  try {
    await $fetch('/api/admin/reorder', {
      method: 'POST',
      body: { type: 'lesson', sectionId: section.id, ids }
    })
    await refresh()
  } catch (e) {
    error.value = apiError(e)
  } finally {
    busy.value = ''
  }
}

/* ------------------------------------------------------ publish / unpublish */

async function toggleSectionStatus(section: Section) {
  const status: Status = section.status === 'published' ? 'draft' : 'published'
  busy.value = section.id
  error.value = ''
  try {
    await $fetch(`/api/admin/sections/${section.id}`, { method: 'PATCH', body: { status } })
    await refresh()
    toast.add({ title: status === 'published' ? 'Section published' : 'Section unpublished', color: 'success' })
  } catch (e) {
    error.value = apiError(e)
  } finally {
    busy.value = ''
  }
}

async function toggleLessonStatus(lesson: LessonSummary) {
  const status: Status = lesson.status === 'published' ? 'draft' : 'published'
  busy.value = lesson.id
  error.value = ''
  try {
    await $fetch(`/api/admin/lessons/${lesson.id}`, { method: 'PATCH', body: { status } })
    await refresh()
    toast.add({ title: status === 'published' ? 'Lesson published' : 'Lesson unpublished', color: 'success' })
  } catch (e) {
    error.value = apiError(e)
  } finally {
    busy.value = ''
  }
}

/* ------------------------------------------------------------ section modal */

const sectionModal = ref(false)
const sectionSaving = ref(false)
const sectionError = ref('')
const editingSectionId = ref('')
const sectionForm = reactive({
  title: '',
  slug: '',
  description: '',
  icon: 'i-lucide-book-open',
  status: 'draft' as Status
})

function openSectionCreate() {
  editingSectionId.value = ''
  sectionError.value = ''
  Object.assign(sectionForm, {
    title: '',
    slug: '',
    description: '',
    icon: 'i-lucide-book-open',
    status: 'draft' as Status
  })
  sectionModal.value = true
}

function openSectionEdit(section: Section) {
  editingSectionId.value = section.id
  sectionError.value = ''
  Object.assign(sectionForm, {
    title: section.title,
    slug: section.slug,
    description: section.description ?? '',
    icon: section.icon ?? 'i-lucide-book-open',
    status: section.status
  })
  sectionModal.value = true
}

async function saveSection() {
  if (!sectionForm.title.trim() || sectionSaving.value) return
  sectionSaving.value = true
  sectionError.value = ''
  const body = {
    title: sectionForm.title,
    slug: sectionForm.slug,
    description: sectionForm.description,
    icon: sectionForm.icon,
    status: sectionForm.status
  }
  try {
    if (editingSectionId.value) {
      await $fetch<{ section: Section }>(`/api/admin/sections/${editingSectionId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch<{ section: Section }>('/api/admin/sections', { method: 'POST', body })
    }
    sectionModal.value = false
    await refresh()
    toast.add({ title: editingSectionId.value ? 'Section updated' : 'Section created', color: 'success' })
  } catch (e) {
    sectionError.value = apiError(e)
  } finally {
    sectionSaving.value = false
  }
}

/* ------------------------------------------------------------- lesson modal */

const lessonModal = ref(false)
const lessonSaving = ref(false)
const lessonLoading = ref(false)
const lessonError = ref('')
const editingLessonId = ref('')
const lessonSectionId = ref('')
const lessonForm = reactive({
  title: '',
  slug: '',
  description: '',
  body: '',
  status: 'draft' as Status,
  access: 'public' as Access,
  videoId: '',
  videoStart: '',
  videoEnd: '',
  passScore: '85'
})

function resetLessonForm() {
  Object.assign(lessonForm, {
    title: '',
    slug: '',
    description: '',
    body: '',
    status: 'draft' as Status,
    access: 'public' as Access,
    videoId: '',
    videoStart: '',
    videoEnd: '',
    passScore: '85'
  })
}

function openLessonCreate(section: Section) {
  editingLessonId.value = ''
  lessonSectionId.value = section.id
  lessonError.value = ''
  resetLessonForm()
  lessonModal.value = true
}

async function openLessonEdit(lesson: LessonSummary) {
  editingLessonId.value = lesson.id
  lessonSectionId.value = lesson.section_id
  lessonError.value = ''
  resetLessonForm()
  lessonModal.value = true
  lessonLoading.value = true
  try {
    // The tree omits bodies, so pull the full row before editing.
    const res = await $fetch<{ lesson: Lesson }>(`/api/admin/lessons/${lesson.id}`)
    const full = res.lesson
    Object.assign(lessonForm, {
      title: full.title,
      slug: full.slug,
      description: full.description ?? '',
      body: full.body ?? '',
      status: full.status,
      access: full.access,
      videoId: full.video_id ?? '',
      videoStart: full.video_start === null ? '' : String(full.video_start),
      videoEnd: full.video_end === null ? '' : String(full.video_end),
      passScore: String(full.pass_score ?? 85)
    })
  } catch (e) {
    lessonError.value = apiError(e)
  } finally {
    lessonLoading.value = false
  }
}

function numOrNull(value: string) {
  if (value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

async function saveLesson() {
  if (!lessonForm.title.trim() || lessonSaving.value) return
  lessonSaving.value = true
  lessonError.value = ''
  const body = {
    sectionId: lessonSectionId.value,
    title: lessonForm.title,
    slug: lessonForm.slug,
    description: lessonForm.description,
    body: lessonForm.body,
    status: lessonForm.status,
    access: lessonForm.access,
    videoId: lessonForm.videoId,
    videoStart: numOrNull(lessonForm.videoStart),
    videoEnd: numOrNull(lessonForm.videoEnd),
    passScore: numOrNull(lessonForm.passScore) ?? 85
  }
  try {
    if (editingLessonId.value) {
      await $fetch<{ lesson: Lesson }>(`/api/admin/lessons/${editingLessonId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch<{ lesson: Lesson }>('/api/admin/lessons', { method: 'POST', body })
    }
    lessonModal.value = false
    await refresh()
    toast.add({ title: editingLessonId.value ? 'Lesson updated' : 'Lesson created', color: 'success' })
  } catch (e) {
    lessonError.value = apiError(e)
  } finally {
    lessonSaving.value = false
  }
}

/* ---------------------------------------------------------------- deleting */

const deleteModal = ref(false)
const deleteBusy = ref(false)
const deleteError = ref('')
const deleteTarget = ref<{ kind: 'section', section: Section } | { kind: 'lesson', lesson: LessonSummary } | null>(null)

function askDeleteSection(section: Section) {
  deleteTarget.value = { kind: 'section', section }
  deleteError.value = ''
  deleteModal.value = true
}

function askDeleteLesson(lesson: LessonSummary) {
  deleteTarget.value = { kind: 'lesson', lesson }
  deleteError.value = ''
  deleteModal.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target || deleteBusy.value) return
  deleteBusy.value = true
  deleteError.value = ''
  try {
    if (target.kind === 'section') {
      const res = await $fetch<{ ok: true, deletedLessons: number }>(`/api/admin/sections/${target.section.id}`, { method: 'DELETE' })
      toast.add({
        title: 'Section deleted',
        description: res.deletedLessons
          ? `${res.deletedLessons} lesson${res.deletedLessons === 1 ? '' : 's'} deleted with it.`
          : undefined,
        color: 'success'
      })
    } else {
      await $fetch<{ ok: true }>(`/api/admin/lessons/${target.lesson.id}`, { method: 'DELETE' })
      toast.add({ title: 'Lesson deleted', color: 'success' })
    }
    deleteModal.value = false
    deleteTarget.value = null
    await refresh()
  } catch (e) {
    deleteError.value = apiError(e)
  } finally {
    deleteBusy.value = false
  }
}
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <ClientOnly>
      <div
        v-if="!isAdmin"
        class="mx-auto max-w-md rounded-2xl border border-default bg-elevated/40 p-8 text-center"
      >
        <UIcon
          name="i-lucide-shield-x"
          class="mx-auto mb-3 size-8 text-muted"
        />
        <h1 class="text-lg font-semibold text-highlighted">
          Admins only
        </h1>
        <p class="mt-1 text-sm text-muted">
          You don't have access to this page.
        </p>
      </div>

      <div v-else>
        <UButton
          :to="localePath('/admin')"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="link"
          size="sm"
          class="mb-4 -ms-2"
        >
          Back to admin
        </UButton>

        <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-layout-list"
              class="size-6 text-primary"
            />
            <h1 class="text-2xl font-bold text-highlighted">
              Content builder
            </h1>
          </div>
          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-refresh-cw"
              :loading="pending"
              @click="refresh()"
            >
              Refresh
            </UButton>
            <UButton
              color="primary"
              size="sm"
              icon="i-lucide-plus"
              @click="openSectionCreate()"
            >
              New section
            </UButton>
          </div>
        </div>

        <p class="max-w-3xl text-sm text-muted">
          Sections and lessons created here publish to
          <code class="rounded bg-elevated px-1.5 py-0.5 text-xs">/learn/&lt;section-slug&gt;/&lt;lesson-slug&gt;</code>.
          Only <strong>published</strong> items are visible to visitors — drafts stay hidden.
          The file-based markdown curriculum under <code class="rounded bg-elevated px-1.5 py-0.5 text-xs">content/</code>
          is a separate system and is not affected by anything on this page.
        </p>

        <p
          v-if="error"
          class="mt-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error"
        >
          {{ error }}
        </p>

        <div
          v-if="pending"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-8 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!sections.length"
          class="mt-8 rounded-2xl border border-dashed border-default p-10 text-center"
        >
          <p class="text-sm text-muted">
            No sections yet. Create your first one to start building the curriculum.
          </p>
          <UButton
            class="mt-4"
            icon="i-lucide-plus"
            @click="openSectionCreate()"
          >
            New section
          </UButton>
        </div>

        <div
          v-else
          class="mt-8 space-y-4"
        >
          <div
            v-for="(section, si) in sections"
            :key="section.id"
            class="rounded-2xl border border-default bg-default"
          >
            <!-- Section header -->
            <div class="flex flex-wrap items-start gap-3 p-4">
              <div class="flex flex-col gap-1 pt-0.5">
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-chevron-up"
                  aria-label="Move section up"
                  :disabled="si === 0 || busy === `order-${section.id}`"
                  @click="reorderSections(si, -1)"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-chevron-down"
                  aria-label="Move section down"
                  :disabled="si === sections.length - 1 || busy === `order-${section.id}`"
                  @click="reorderSections(si, 1)"
                />
              </div>

              <button
                type="button"
                class="min-w-0 flex-1 text-left"
                @click="toggleSection(section.id)"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UIcon
                    :name="section.icon || 'i-lucide-book-open'"
                    class="size-5 text-primary"
                  />
                  <span class="font-semibold text-highlighted">{{ section.title }}</span>
                  <UBadge
                    :color="section.status === 'published' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ section.status }}
                  </UBadge>
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="sm"
                  >
                    {{ section.lessons.length }} lesson{{ section.lessons.length === 1 ? '' : 's' }}
                  </UBadge>
                  <UIcon
                    :name="isOpen(section.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                    class="size-4 text-dimmed"
                  />
                </div>
                <p class="mt-1 truncate text-xs text-dimmed">
                  /learn/{{ section.slug }}
                  <span v-if="section.description"> · {{ section.description }}</span>
                </p>
              </button>

              <div class="flex flex-wrap gap-2">
                <UButton
                  :color="section.status === 'published' ? 'neutral' : 'success'"
                  variant="soft"
                  size="xs"
                  :icon="section.status === 'published' ? 'i-lucide-eye-off' : 'i-lucide-check'"
                  :loading="busy === section.id"
                  @click="toggleSectionStatus(section)"
                >
                  {{ section.status === 'published' ? 'Unpublish' : 'Publish' }}
                </UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-pencil"
                  @click="openSectionEdit(section)"
                >
                  Edit
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-trash-2"
                  @click="askDeleteSection(section)"
                >
                  Delete
                </UButton>
              </div>
            </div>

            <!-- Lessons -->
            <div
              v-if="isOpen(section.id)"
              class="border-t border-default p-4"
            >
              <div
                v-if="section.lessons.length"
                class="space-y-2"
              >
                <div
                  v-for="(lesson, li) in section.lessons"
                  :key="lesson.id"
                  class="flex flex-wrap items-start gap-3 rounded-xl border border-default p-3"
                >
                  <div class="flex flex-col gap-1 pt-0.5">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-chevron-up"
                      aria-label="Move lesson up"
                      :disabled="li === 0 || busy === `order-${lesson.id}`"
                      @click="reorderLessons(section, li, -1)"
                    />
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-chevron-down"
                      aria-label="Move lesson down"
                      :disabled="li === section.lessons.length - 1 || busy === `order-${lesson.id}`"
                      @click="reorderLessons(section, li, 1)"
                    />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-medium text-default">{{ lesson.title }}</span>
                      <UBadge
                        :color="lesson.status === 'published' ? 'success' : 'neutral'"
                        variant="subtle"
                        size="sm"
                      >
                        {{ lesson.status }}
                      </UBadge>
                      <UBadge
                        v-if="lesson.access === 'members'"
                        color="warning"
                        variant="subtle"
                        size="sm"
                      >
                        Members
                      </UBadge>
                      <UBadge
                        v-if="lesson.video_id"
                        color="primary"
                        variant="subtle"
                        size="sm"
                      >
                        <UIcon
                          name="i-lucide-play"
                          class="mr-1 size-3"
                        />{{ clipLabel(lesson) }}
                      </UBadge>
                    </div>
                    <p class="mt-1 truncate text-xs text-dimmed">
                      /learn/{{ section.slug }}/{{ lesson.slug }}
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <UButton
                      :color="lesson.status === 'published' ? 'neutral' : 'success'"
                      variant="soft"
                      size="xs"
                      :icon="lesson.status === 'published' ? 'i-lucide-eye-off' : 'i-lucide-check'"
                      :loading="busy === lesson.id"
                      @click="toggleLessonStatus(lesson)"
                    >
                      {{ lesson.status === 'published' ? 'Unpublish' : 'Publish' }}
                    </UButton>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-pencil"
                      @click="openLessonEdit(lesson)"
                    >
                      Edit
                    </UButton>
                    <UButton
                      color="error"
                      variant="ghost"
                      size="xs"
                      icon="i-lucide-trash-2"
                      @click="askDeleteLesson(lesson)"
                    >
                      Delete
                    </UButton>
                  </div>
                </div>
              </div>
              <p
                v-else
                class="text-sm text-muted"
              >
                No lessons in this section yet.
              </p>

              <UButton
                class="mt-3"
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-lucide-plus"
                @click="openLessonCreate(section)"
              >
                Add lesson
              </UButton>
            </div>
          </div>
        </div>

        <!-- Section create/edit -->
        <UModal
          v-model:open="sectionModal"
          :title="editingSectionId ? 'Edit section' : 'New section'"
          description="Sections group lessons and set the first part of the lesson URL."
        >
          <template #body>
            <div class="space-y-4">
              <UFormField
                label="Title"
                required
              >
                <UInput
                  v-model="sectionForm.title"
                  placeholder="e.g. Creating Datasets"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Slug"
                help="Leave blank to derive it from the title. Must be unique across sections."
              >
                <UInput
                  v-model="sectionForm.slug"
                  placeholder="creating-datasets"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Description">
                <UTextarea
                  v-model="sectionForm.description"
                  :rows="3"
                  autoresize
                  placeholder="What this section covers."
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Icon"
                help="A Lucide icon name, e.g. i-lucide-book-open, i-lucide-database, i-lucide-chart-line."
              >
                <UInput
                  v-model="sectionForm.icon"
                  placeholder="i-lucide-book-open"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Status">
                <USelect
                  v-model="sectionForm.status"
                  :items="statusItems"
                  class="w-full"
                />
              </UFormField>

              <p
                v-if="sectionError"
                class="text-sm text-error"
              >
                {{ sectionError }}
              </p>
            </div>
          </template>

          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="sectionModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="sectionSaving"
                :disabled="!sectionForm.title.trim()"
                @click="saveSection()"
              >
                {{ editingSectionId ? 'Save changes' : 'Create section' }}
              </UButton>
            </div>
          </template>
        </UModal>

        <!-- Lesson create/edit -->
        <UModal
          v-model:open="lessonModal"
          :title="editingLessonId ? 'Edit lesson' : 'New lesson'"
          description="Lessons publish at /learn/<section-slug>/<lesson-slug>."
          :ui="{ content: 'max-w-3xl' }"
        >
          <template #body>
            <div
              v-if="lessonLoading"
              class="flex justify-center py-10"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-6 animate-spin text-primary"
              />
            </div>

            <div
              v-else
              class="space-y-4"
            >
              <UFormField
                label="Title"
                required
              >
                <UInput
                  v-model="lessonForm.title"
                  placeholder="e.g. Load Data from a CSV File"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Slug"
                help="Leave blank to derive it from the title. Must be unique within this section."
              >
                <UInput
                  v-model="lessonForm.slug"
                  placeholder="load-data-from-csv"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Description">
                <UTextarea
                  v-model="lessonForm.description"
                  :rows="2"
                  autoresize
                  placeholder="A one-line summary shown in listings and search."
                  class="w-full"
                />
              </UFormField>

              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField label="Status">
                  <USelect
                    v-model="lessonForm.status"
                    :items="statusItems"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  label="Access"
                  help="Members-only lessons are soft-gated behind sign-in."
                >
                  <USelect
                    v-model="lessonForm.access"
                    :items="accessItems"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <!-- Video block -->
              <fieldset class="rounded-xl border border-default p-4">
                <legend class="flex items-center gap-1.5 px-1 text-sm font-medium text-highlighted">
                  <UIcon
                    name="i-lucide-play"
                    class="size-4 text-primary"
                  />
                  Video
                </legend>

                <div class="space-y-4">
                  <UFormField
                    label="YouTube URL or video ID"
                    help="Paste a full YouTube link (watch, youtu.be, embed or shorts) or a bare 11-character id — the server extracts the id."
                  >
                    <UInput
                      v-model="lessonForm.videoId"
                      placeholder="https://www.youtube.com/watch?v=-0mp2mUjyVI"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <UFormField
                      label="Start (seconds)"
                      help="Optional. e.g. 369 for 6:09."
                    >
                      <UInput
                        v-model="lessonForm.videoStart"
                        type="number"
                        min="0"
                        placeholder="369"
                        class="w-full"
                      />
                    </UFormField>

                    <UFormField
                      label="End (seconds)"
                      help="Optional, but must be greater than the start when both are set."
                    >
                      <UInput
                        v-model="lessonForm.videoEnd"
                        type="number"
                        min="0"
                        placeholder="702"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </div>
              </fieldset>

              <UFormField
                label="Pass score"
                help="Percentage needed to pass this lesson's quiz (1–100). Default 85."
              >
                <UInput
                  v-model="lessonForm.passScore"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full sm:w-40"
                />
              </UFormField>

              <UFormField
                label="Body (Markdown)"
                help="The lesson content. Standard markdown."
              >
                <UTextarea
                  v-model="lessonForm.body"
                  :rows="16"
                  placeholder="## The upload flow&#10;&#10;Write the lesson here…"
                  class="w-full font-mono text-sm"
                />
              </UFormField>

              <p
                v-if="lessonError"
                class="text-sm text-error"
              >
                {{ lessonError }}
              </p>
            </div>
          </template>

          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="lessonModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="lessonSaving"
                :disabled="lessonLoading || !lessonForm.title.trim()"
                @click="saveLesson()"
              >
                {{ editingLessonId ? 'Save changes' : 'Create lesson' }}
              </UButton>
            </div>
          </template>
        </UModal>

        <!-- Delete confirmation -->
        <UModal
          v-model:open="deleteModal"
          title="Delete permanently?"
          description="This cannot be undone."
        >
          <template #body>
            <div class="space-y-3">
              <p
                v-if="deleteTarget?.kind === 'section'"
                class="text-sm text-default"
              >
                Deleting <strong>{{ deleteTarget.section.title }}</strong> also deletes
                <strong>{{ deleteTarget.section.lessons.length }}</strong>
                lesson{{ deleteTarget.section.lessons.length === 1 ? '' : 's' }} inside it, along with
                any learner progress tied to them. This cannot be undone.
              </p>
              <p
                v-else-if="deleteTarget?.kind === 'lesson'"
                class="text-sm text-default"
              >
                Delete the lesson <strong>{{ deleteTarget.lesson.title }}</strong>? This cannot be undone.
              </p>

              <p
                v-if="deleteError"
                class="text-sm text-error"
              >
                {{ deleteError }}
              </p>
            </div>
          </template>

          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="deleteModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                icon="i-lucide-trash-2"
                :loading="deleteBusy"
                @click="confirmDelete()"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UModal>
      </div>
    </ClientOnly>
  </UContainer>
</template>
