<script setup lang="ts">
// Content Studio — authors real markdown files under content/ (docs lessons
// + blog posts). This only works locally (`pnpm dev`); the production
// filesystem is read-only, so writes are disabled there and this page shows
// a read-only notice instead. See server/utils/studio.ts and
// server/api/admin/studio/*.
import YAML from 'yaml'

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useProfile()
const toast = useToast()

useSeoMeta({ title: 'Content studio — CRM Analytics Academy', robots: 'noindex' })

interface TreeLesson {
  path: string
  file: string
  num: number
  slug: string
  title: string
  access: string | null
  hasVideo: boolean
  hasQuiz: boolean
}
interface TreeSection {
  path: string
  folder: string
  num: number
  slug: string
  title: string
  icon: string | null
  lessons: TreeLesson[]
}
interface TreeBlogPost {
  path: string
  file: string
  slug: string
  title: string
  status: string
  publishedAt: string | null
  isExternal: boolean
}
interface TreeResponse {
  readonly: boolean
  locale: string
  sections: TreeSection[]
  blog: TreeBlogPost[]
}

const { data: tree, refresh } = await useAsyncData<TreeResponse>(
  'studio-tree',
  () => $fetch('/api/admin/studio/tree'),
  { server: false, watch: [isAdmin], default: () => ({ readonly: true, locale: 'en', sections: [], blog: [] }) }
)

const readonly = computed(() => tree.value?.readonly ?? true)

function apiError(e: unknown) {
  const err = e as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
  return err?.data?.statusMessage || err?.statusMessage || err?.message || 'Something went wrong.'
}

/* ------------------------------------------------------------- tree state */

const collapsedSections = ref<Record<string, boolean>>({})
const blogCollapsed = ref(false)
function isSectionOpen(p: string) {
  return collapsedSections.value[p] !== true
}
function toggleSection(p: string) {
  collapsedSections.value[p] = isSectionOpen(p)
}

/* -------------------------------------------------------------- selection */

type Kind = 'section' | 'lesson' | 'blog'
interface Selection {
  kind: Kind
  path: string
  sectionPath?: string
  isNew: boolean
}

const selection = ref<Selection | null>(null)
const loadingNode = ref(false)
const saving = ref(false)
const nodeError = ref('')

const form = reactive({
  title: '',
  description: '',
  icon: 'i-lucide-book-open',
  access: 'public',
  videoId: '',
  videoStart: '',
  videoEnd: '',
  status: 'draft',
  tags: '',
  coverUrl: '',
  publishedAt: '',
  isExternal: false,
  sourceUrl: '',
  sourceName: '',
  authorName: '',
  authorUrl: '',
  excerptOnly: true,
  advancedYaml: '',
  body: '',
  newSlug: ''
})

const KNOWN_LESSON_KEYS = new Set(['title', 'description', 'access', 'video'])
const KNOWN_BLOG_KEYS = new Set([
  'title', 'description', 'status', 'tags', 'coverUrl', 'publishedAt',
  'isExternal', 'sourceUrl', 'sourceName', 'authorName', 'authorUrl', 'excerptOnly'
])

function resetForm() {
  Object.assign(form, {
    title: '',
    description: '',
    icon: 'i-lucide-book-open',
    access: 'public',
    videoId: '',
    videoStart: '',
    videoEnd: '',
    status: 'draft',
    tags: '',
    coverUrl: '',
    publishedAt: '',
    isExternal: false,
    sourceUrl: '',
    sourceName: '',
    authorName: '',
    authorUrl: '',
    excerptOnly: true,
    advancedYaml: '',
    body: '',
    newSlug: ''
  })
}

function toYamlBlock(obj: Record<string, unknown>): string {
  if (!Object.keys(obj).length) return ''
  return YAML.stringify(obj, { lineWidth: 0 }).trimEnd()
}

async function selectSection(section: TreeSection) {
  selection.value = { kind: 'section', path: section.path, isNew: false }
  nodeError.value = ''
  resetForm()
  loadingNode.value = true
  try {
    form.title = section.title
    form.icon = section.icon || 'i-lucide-book-open'
  } finally {
    loadingNode.value = false
  }
}

async function selectLesson(section: TreeSection, lesson: TreeLesson) {
  selection.value = { kind: 'lesson', path: lesson.path, sectionPath: section.path, isNew: false }
  nodeError.value = ''
  resetForm()
  loadingNode.value = true
  try {
    const res = await $fetch<{ frontmatter: Record<string, unknown>, body: string }>('/api/admin/studio/node', {
      query: { kind: 'lesson', path: lesson.path }
    })
    form.title = String(res.frontmatter.title ?? lesson.title)
    form.description = String(res.frontmatter.description ?? '')
    form.access = (res.frontmatter.access as string) || 'public'
    const video = res.frontmatter.video as { id?: string, start?: number, end?: number } | undefined
    form.videoId = video?.id ?? ''
    form.videoStart = video?.start !== undefined ? String(video.start) : ''
    form.videoEnd = video?.end !== undefined ? String(video.end) : ''
    form.body = res.body
    const rest = Object.fromEntries(Object.entries(res.frontmatter).filter(([k]) => !KNOWN_LESSON_KEYS.has(k)))
    form.advancedYaml = toYamlBlock(rest)
  } catch (e) {
    nodeError.value = apiError(e)
  } finally {
    loadingNode.value = false
  }
}

async function selectBlog(post: TreeBlogPost) {
  selection.value = { kind: 'blog', path: post.path, isNew: false }
  nodeError.value = ''
  resetForm()
  loadingNode.value = true
  try {
    const res = await $fetch<{ frontmatter: Record<string, unknown>, body: string }>('/api/admin/studio/node', {
      query: { kind: 'blog', path: post.path }
    })
    form.title = String(res.frontmatter.title ?? post.title)
    form.description = String(res.frontmatter.description ?? '')
    form.status = (res.frontmatter.status as string) || 'published'
    form.tags = Array.isArray(res.frontmatter.tags) ? (res.frontmatter.tags as string[]).join(', ') : ''
    form.coverUrl = String(res.frontmatter.coverUrl ?? '')
    form.publishedAt = String(res.frontmatter.publishedAt ?? '')
    form.isExternal = Boolean(res.frontmatter.isExternal)
    form.sourceUrl = String(res.frontmatter.sourceUrl ?? '')
    form.sourceName = String(res.frontmatter.sourceName ?? '')
    form.authorName = String(res.frontmatter.authorName ?? '')
    form.authorUrl = String(res.frontmatter.authorUrl ?? '')
    form.excerptOnly = res.frontmatter.excerptOnly !== false
    form.body = res.body
    const rest = Object.fromEntries(Object.entries(res.frontmatter).filter(([k]) => !KNOWN_BLOG_KEYS.has(k)))
    form.advancedYaml = toYamlBlock(rest)
  } catch (e) {
    nodeError.value = apiError(e)
  } finally {
    loadingNode.value = false
  }
}

const newLessonSection = ref<TreeSection | null>(null)

function startNewSection() {
  selection.value = { kind: 'section', path: '', isNew: true }
  nodeError.value = ''
  resetForm()
}
function startNewLesson(section: TreeSection) {
  newLessonSection.value = section
  selection.value = { kind: 'lesson', path: '', sectionPath: section.path, isNew: true }
  nodeError.value = ''
  resetForm()
  form.access = 'public'
}
function startNewBlog() {
  selection.value = { kind: 'blog', path: '', isNew: true }
  nodeError.value = ''
  resetForm()
  form.status = 'draft'
  form.excerptOnly = true
}

/* -------------------------------------------------------------------- YAML */

function parseAdvancedYaml(): Record<string, unknown> {
  const raw = form.advancedYaml.trim()
  if (!raw) return {}
  try {
    const parsed = YAML.parse(raw)
    return (parsed && typeof parsed === 'object') ? parsed as Record<string, unknown> : {}
  } catch (e) {
    throw new Error(`Advanced frontmatter is not valid YAML: ${e instanceof Error ? e.message : String(e)}`, { cause: e })
  }
}

/* -------------------------------------------------------------------- save */

function buildLessonFrontmatter(): Record<string, unknown> {
  const fm: Record<string, unknown> = { ...parseAdvancedYaml() }
  fm.access = form.access !== 'public' ? form.access : null
  if (form.videoId.trim()) {
    fm.video = {
      id: form.videoId.trim(),
      ...(form.videoStart.trim() ? { start: Number(form.videoStart) } : {}),
      ...(form.videoEnd.trim() ? { end: Number(form.videoEnd) } : {})
    }
  } else {
    fm.video = null
  }
  return fm
}

function buildBlogFrontmatter(): Record<string, unknown> {
  if (form.isExternal && (!form.sourceUrl.trim() || !form.authorName.trim())) {
    throw new Error('External posts need a source URL and an author name.')
  }
  const fm: Record<string, unknown> = { ...parseAdvancedYaml() }
  fm.status = form.status
  fm.tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
  fm.coverUrl = form.coverUrl.trim() || null
  fm.publishedAt = form.publishedAt.trim() || (form.status === 'published' ? new Date().toISOString() : null)
  fm.isExternal = form.isExternal
  fm.sourceUrl = form.sourceUrl.trim() || null
  fm.sourceName = form.sourceName.trim() || null
  fm.authorName = form.authorName.trim() || null
  fm.authorUrl = form.authorUrl.trim() || null
  fm.excerptOnly = form.excerptOnly
  return fm
}

async function save() {
  if (!selection.value || saving.value || readonly.value) return
  if (!form.title.trim()) {
    nodeError.value = 'Title is required.'
    return
  }
  saving.value = true
  nodeError.value = ''
  try {
    const sel = selection.value
    if (sel.kind === 'section') {
      const body = { kind: 'section', title: form.title, icon: form.icon, ...(sel.isNew ? {} : { path: sel.path, newSlug: form.newSlug || undefined }) }
      if (sel.isNew) {
        await $fetch('/api/admin/studio/node', { method: 'POST', body })
      } else {
        await $fetch('/api/admin/studio/node', { method: 'PATCH', body })
      }
    } else if (sel.kind === 'lesson') {
      const frontmatter = buildLessonFrontmatter()
      if (sel.isNew) {
        await $fetch('/api/admin/studio/node', {
          method: 'POST',
          body: { kind: 'lesson', sectionPath: sel.sectionPath, title: form.title, description: form.description, body: form.body, frontmatter }
        })
      } else {
        await $fetch('/api/admin/studio/node', {
          method: 'PATCH',
          body: { kind: 'lesson', path: sel.path, title: form.title, description: form.description, body: form.body, frontmatter, newSlug: form.newSlug || undefined }
        })
      }
    } else {
      const frontmatter = buildBlogFrontmatter()
      if (sel.isNew) {
        await $fetch('/api/admin/studio/node', {
          method: 'POST',
          body: { kind: 'blog', title: form.title, description: form.description, body: form.body, frontmatter }
        })
      } else {
        await $fetch('/api/admin/studio/node', {
          method: 'PATCH',
          body: { kind: 'blog', path: sel.path, title: form.title, description: form.description, body: form.body, frontmatter, newSlug: form.newSlug || undefined }
        })
      }
    }
    toast.add({ title: 'Saved', color: 'success' })
    selection.value = null
    await refresh()
  } catch (e) {
    nodeError.value = e instanceof Error && !('data' in e) ? e.message : apiError(e)
  } finally {
    saving.value = false
  }
}

/* ------------------------------------------------------------------ delete */

const deleteModal = ref(false)
const deleteBusy = ref(false)
const deleteError = ref('')
const deleteTarget = ref<{ kind: Kind, path: string, label: string } | null>(null)

function askDelete(kind: Kind, p: string, label: string) {
  deleteTarget.value = { kind, path: p, label }
  deleteError.value = ''
  deleteModal.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target || deleteBusy.value) return
  deleteBusy.value = true
  deleteError.value = ''
  try {
    await $fetch('/api/admin/studio/node', { method: 'DELETE', body: { kind: target.kind, path: target.path } })
    toast.add({ title: 'Deleted', color: 'success' })
    deleteModal.value = false
    deleteTarget.value = null
    if (selection.value?.path === target.path) selection.value = null
    await refresh()
  } catch (e) {
    deleteError.value = apiError(e)
  } finally {
    deleteBusy.value = false
  }
}

/* ----------------------------------------------------------------- reorder */

const reorderBusy = ref('')

async function reorderSection(section: TreeSection, direction: 'up' | 'down') {
  reorderBusy.value = section.path
  try {
    await $fetch('/api/admin/studio/reorder', { method: 'POST', body: { kind: 'section', path: section.path, direction } })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Could not reorder', description: apiError(e), color: 'error' })
  } finally {
    reorderBusy.value = ''
  }
}

async function reorderLesson(section: TreeSection, lesson: TreeLesson, direction: 'up' | 'down') {
  reorderBusy.value = lesson.path
  try {
    await $fetch('/api/admin/studio/reorder', {
      method: 'POST',
      body: { kind: 'lesson', sectionPath: section.path, path: lesson.path, direction }
    })
    await refresh()
  } catch (e) {
    toast.add({ title: 'Could not reorder', description: apiError(e), color: 'error' })
  } finally {
    reorderBusy.value = ''
  }
}

/* ------------------------------------------------------------- MDC toolbar */

const bodyTextarea = ref<{ textareaRef?: HTMLTextAreaElement } | HTMLTextAreaElement | null>(null)

const snippets: { label: string, icon: string, template: string }[] = [
  {
    label: 'Note',
    icon: 'i-lucide-info',
    template: '::note{icon="i-lucide-info"}\nYour note text here.\n::\n'
  },
  {
    label: 'Tip',
    icon: 'i-lucide-lightbulb',
    template: '::tip{icon="i-lucide-lightbulb"}\nYour tip text here.\n::\n'
  },
  {
    label: 'Cards',
    icon: 'i-lucide-layout-grid',
    template: '::lesson-cards\n---\ncolumns: 3\nitems:\n  - title: "Card title"\n    icon: "i-lucide-circle"\n    description: "Card description."\n---\n::\n'
  },
  {
    label: 'Links',
    icon: 'i-lucide-link',
    template: '::lesson-links\n---\nitems:\n  - label: "Link label"\n    to: "https://example.com"\n    icon: "i-lucide-external-link"\n    description: "Link description."\n---\n::\n'
  },
  {
    label: 'Steps',
    icon: 'i-lucide-list-ordered',
    template: '::lesson-steps\n---\nitems:\n  - title: "Step title"\n    description: "Step description."\n---\n::\n'
  }
]

function insertSnippet(template: string) {
  const el = (bodyTextarea.value as { textareaRef?: HTMLTextAreaElement })?.textareaRef ?? (bodyTextarea.value as HTMLTextAreaElement | null)
  if (!el) {
    form.body += `\n${template}`
    return
  }
  const start = el.selectionStart ?? form.body.length
  const end = el.selectionEnd ?? form.body.length
  form.body = form.body.slice(0, start) + template + form.body.slice(end)
  nextTick(() => {
    el.focus()
    const pos = start + template.length
    el.setSelectionRange(pos, pos)
  })
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
      </div>

      <div v-else>
        <div class="mb-6 flex items-center gap-2.5">
          <UIcon
            name="i-lucide-file-pen-line"
            class="size-6 text-primary"
          />
          <h1 class="text-2xl font-bold text-highlighted">
            Content studio
          </h1>
        </div>

        <div
          v-if="readonly"
          class="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm"
        >
          <UIcon
            name="i-lucide-triangle-alert"
            class="mt-0.5 size-5 shrink-0 text-warning"
          />
          <div>
            <p class="font-medium text-highlighted">
              Read-only here
            </p>
            <p class="mt-1 text-muted">
              This is a production deployment and its filesystem is read-only. Run <code>pnpm dev</code>
              locally to create or edit lessons and blog posts, then commit and push the result.
            </p>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
          <!-- Tree -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-highlighted">
                Docs ({{ tree?.locale }})
              </h2>
              <UButton
                size="xs"
                icon="i-lucide-plus"
                variant="soft"
                :disabled="readonly"
                @click="startNewSection"
              >
                Section
              </UButton>
            </div>

            <div
              v-for="(section, sIndex) in tree?.sections"
              :key="section.path"
              class="rounded-xl border border-default"
            >
              <div class="flex items-center gap-1 p-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  :icon="isSectionOpen(section.path) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                  @click="toggleSection(section.path)"
                />
                <button
                  type="button"
                  class="flex flex-1 items-center gap-2 truncate text-left text-sm font-medium text-default hover:text-primary"
                  @click="selectSection(section)"
                >
                  <UIcon
                    :name="section.icon || 'i-lucide-book-open'"
                    class="size-4 shrink-0"
                  />
                  <span class="truncate">{{ section.title }}</span>
                </button>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-chevron-up"
                  :disabled="readonly || sIndex === 0 || reorderBusy === section.path"
                  @click="reorderSection(section, 'up')"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-chevron-down"
                  :disabled="readonly || sIndex === (tree?.sections.length ?? 1) - 1 || reorderBusy === section.path"
                  @click="reorderSection(section, 'down')"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-trash-2"
                  :disabled="readonly"
                  @click="askDelete('section', section.path, section.title)"
                />
              </div>

              <div
                v-if="isSectionOpen(section.path)"
                class="space-y-1 border-t border-default p-2"
              >
                <div
                  v-for="(lesson, lIndex) in section.lessons"
                  :key="lesson.path"
                  class="flex items-center gap-1 rounded-lg pl-4 hover:bg-elevated/40"
                >
                  <button
                    type="button"
                    class="flex flex-1 items-center gap-2 truncate py-1 text-left text-sm text-muted hover:text-primary"
                    @click="selectLesson(section, lesson)"
                  >
                    <span class="truncate">{{ lesson.title }}</span>
                    <UBadge
                      v-if="lesson.access === 'members'"
                      size="sm"
                      color="warning"
                      variant="subtle"
                    >
                      members
                    </UBadge>
                    <UIcon
                      v-if="lesson.hasVideo"
                      name="i-lucide-video"
                      class="size-3 text-dimmed"
                    />
                    <UIcon
                      v-if="lesson.hasQuiz"
                      name="i-lucide-list-checks"
                      class="size-3 text-dimmed"
                    />
                  </button>
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-chevron-up"
                    :disabled="readonly || lIndex === 0 || reorderBusy === lesson.path"
                    @click="reorderLesson(section, lesson, 'up')"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-chevron-down"
                    :disabled="readonly || lIndex === section.lessons.length - 1 || reorderBusy === lesson.path"
                    @click="reorderLesson(section, lesson, 'down')"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    :disabled="readonly"
                    @click="askDelete('lesson', lesson.path, lesson.title)"
                  />
                </div>

                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-plus"
                  :disabled="readonly"
                  @click="startNewLesson(section)"
                >
                  New lesson
                </UButton>
              </div>
            </div>

            <!-- Blog -->
            <div class="rounded-xl border border-default">
              <div class="flex items-center gap-1 p-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  :icon="blogCollapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
                  @click="blogCollapsed = !blogCollapsed"
                />
                <span class="flex flex-1 items-center gap-2 text-sm font-medium text-default">
                  <UIcon
                    name="i-lucide-newspaper"
                    class="size-4"
                  />
                  Blog
                </span>
                <UButton
                  size="xs"
                  variant="soft"
                  icon="i-lucide-plus"
                  :disabled="readonly"
                  @click="startNewBlog"
                >
                  Post
                </UButton>
              </div>

              <div
                v-if="!blogCollapsed"
                class="space-y-1 border-t border-default p-2"
              >
                <div
                  v-for="post in tree?.blog"
                  :key="post.path"
                  class="flex items-center gap-1 rounded-lg pl-4 hover:bg-elevated/40"
                >
                  <button
                    type="button"
                    class="flex flex-1 items-center gap-2 truncate py-1 text-left text-sm text-muted hover:text-primary"
                    @click="selectBlog(post)"
                  >
                    <span class="truncate">{{ post.title }}</span>
                    <UBadge
                      size="sm"
                      :color="post.status === 'published' ? 'success' : 'neutral'"
                      variant="subtle"
                    >
                      {{ post.status }}
                    </UBadge>
                  </button>
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    :disabled="readonly"
                    @click="askDelete('blog', post.path, post.title)"
                  />
                </div>
                <p
                  v-if="!tree?.blog.length"
                  class="px-2 py-1 text-xs text-dimmed"
                >
                  No posts yet.
                </p>
              </div>
            </div>
          </div>

          <!-- Editor -->
          <div>
            <div
              v-if="!selection"
              class="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-default text-sm text-muted"
            >
              Select a section, lesson, or post to edit — or create a new one.
            </div>

            <div
              v-else
              class="space-y-5 rounded-2xl border border-default bg-default p-6"
            >
              <div
                v-if="loadingNode"
                class="flex justify-center py-10"
              >
                <UIcon
                  name="i-lucide-loader-circle"
                  class="size-6 animate-spin text-primary"
                />
              </div>

              <template v-else>
                <UAlert
                  v-if="nodeError"
                  color="error"
                  variant="subtle"
                  :description="nodeError"
                />

                <UFormField label="Title">
                  <UInput
                    v-model="form.title"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  v-if="selection.kind !== 'section'"
                  label="Description"
                >
                  <UTextarea
                    v-model="form.description"
                    :rows="2"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  v-if="selection.kind === 'section'"
                  label="Icon"
                  hint="Lucide icon name, e.g. i-lucide-compass"
                >
                  <UInput
                    v-model="form.icon"
                    class="w-full"
                  />
                </UFormField>

                <template v-if="selection.kind === 'lesson'">
                  <UFormField label="Access">
                    <USelect
                      v-model="form.access"
                      :items="[{ label: 'Public', value: 'public' }, { label: 'Members only', value: 'members' }]"
                      value-key="value"
                      class="w-full"
                    />
                  </UFormField>
                  <div class="grid gap-3 sm:grid-cols-3">
                    <UFormField label="YouTube video id">
                      <UInput
                        v-model="form.videoId"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Clip start (s)">
                      <UInput
                        v-model="form.videoStart"
                        type="number"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Clip end (s)">
                      <UInput
                        v-model="form.videoEnd"
                        type="number"
                        class="w-full"
                      />
                    </UFormField>
                  </div>
                </template>

                <template v-if="selection.kind === 'blog'">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <UFormField label="Status">
                      <USelect
                        v-model="form.status"
                        :items="[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }]"
                        value-key="value"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Tags (comma separated)">
                      <UInput
                        v-model="form.tags"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Cover image URL">
                      <UInput
                        v-model="form.coverUrl"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Published at (ISO date, optional)">
                      <UInput
                        v-model="form.publishedAt"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <UCheckbox
                    v-model="form.isExternal"
                    label="Curated post (written elsewhere — requires source + author credit)"
                  />

                  <div
                    v-if="form.isExternal"
                    class="grid gap-3 rounded-xl border border-default p-4 sm:grid-cols-2"
                  >
                    <UFormField
                      label="Source URL"
                      required
                    >
                      <UInput
                        v-model="form.sourceUrl"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Source name">
                      <UInput
                        v-model="form.sourceName"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Author name"
                      required
                    >
                      <UInput
                        v-model="form.authorName"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField label="Author URL">
                      <UInput
                        v-model="form.authorUrl"
                        class="w-full"
                      />
                    </UFormField>
                    <UCheckbox
                      v-model="form.excerptOnly"
                      label="Host an excerpt only (link out for the full article)"
                      class="sm:col-span-2"
                    />
                  </div>
                </template>

                <UFormField
                  :label="`Slug${selection.isNew ? '' : ' (rename)'}`"
                  hint="Leave blank to keep the current slug."
                >
                  <UInput
                    v-model="form.newSlug"
                    class="w-full"
                  />
                </UFormField>

                <UFormField
                  v-if="selection.kind !== 'section'"
                  label="Advanced frontmatter (YAML)"
                  hint="Real YAML — e.g. quiz, interview, passScore, links, navigation. See existing lessons under content/en for examples."
                >
                  <UTextarea
                    v-model="form.advancedYaml"
                    :rows="4"
                    class="w-full font-mono text-xs"
                  />
                </UFormField>

                <UFormField
                  v-if="selection.kind !== 'section'"
                  label="Body"
                >
                  <div class="mb-2 flex flex-wrap gap-1.5">
                    <UButton
                      v-for="s in snippets"
                      :key="s.label"
                      size="xs"
                      variant="soft"
                      color="neutral"
                      :icon="s.icon"
                      @click="insertSnippet(s.template)"
                    >
                      {{ s.label }}
                    </UButton>
                  </div>
                  <UTextarea
                    ref="bodyTextarea"
                    v-model="form.body"
                    :rows="16"
                    class="w-full font-mono text-xs"
                  />
                </UFormField>

                <div class="flex items-center gap-3">
                  <UButton
                    :loading="saving"
                    :disabled="readonly"
                    @click="save"
                  >
                    Save
                  </UButton>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    @click="selection = null"
                  >
                    Cancel
                  </UButton>
                </div>
              </template>
            </div>
          </div>
        </div>

        <UModal v-model:open="deleteModal">
          <template #content>
            <div class="p-6">
              <h3 class="font-semibold text-highlighted">
                Delete "{{ deleteTarget?.label }}"?
              </h3>
              <p class="mt-1 text-sm text-muted">
                This permanently removes the file from disk. You'll still need to commit and push the change.
              </p>
              <UAlert
                v-if="deleteError"
                class="mt-3"
                color="error"
                variant="subtle"
                :description="deleteError"
              />
              <div class="mt-5 flex justify-end gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  @click="deleteModal = false"
                >
                  Cancel
                </UButton>
                <UButton
                  color="error"
                  :loading="deleteBusy"
                  @click="confirmDelete"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </ClientOnly>
  </UContainer>
</template>
