<script setup lang="ts">
/**
 * One lesson: a frontmatter form, the markdown body, and a live preview
 * rendered by the same ContentRenderer the site uses (so the course's MDC
 * blocks — ::field-table, ::youtube-embed … — preview as they will ship).
 *
 * The frontmatter is edited through yaml's Document model: the form only sets
 * or deletes the keys it owns, so quizzes, walkthroughs, interview questions
 * and comments in the file are carried through untouched. "Raw file" edits the
 * whole file as text for anything the form does not model.
 *
 * Saving sends the blob sha the file was loaded at; a stale editor gets a 409.
 */
import { parseDocument, type Document } from 'yaml'
import type { EditorPerson, PublishResult } from '~/types/content-editor'

const props = defineProps<{
  path: string
  role: 'admin' | 'instructor'
  personSlug: string | null
  people: EditorPerson[]
}>()
const emit = defineEmits<{ saved: [result: PublishResult], dirty: [value: boolean] }>()

interface CreditRow {
  kind: CreditKind
  title: string
  author: string
  authorUrl: string
  url: string
  license: string
  note: string
}

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const result = ref<PublishResult | null>(null)
const sha = ref('')
const canEdit = ref(false)
const reason = ref<string | null>(null)
const draft = ref<{ branch: string, prNumber: number | null, prUrl: string | null, status: string, reviewNote: string | null } | null>(null)
const loaded = ref('')
const mode = ref<'form' | 'raw'>('form')
const showPreview = ref(true)
const message = ref('')

let doc: Document = parseDocument('')
const body = ref('')
const raw = ref('')
const form = reactive({
  title: '',
  navTitle: '',
  description: '',
  access: 'free' as 'free' | 'pro',
  authors: [] as string[],
  credits: [] as CreditRow[],
  videoOn: false,
  video: { id: '', start: '', end: '', title: '', author: '', authorUrl: '' }
})

const peopleItems = computed(() => props.people.map(p => ({ label: `${p.name} · ${p.role}`, value: p.slug })))
const knownPeople = computed(() => new Set(props.people.map(p => p.slug)))

function split(text: string): { fm: string, body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  return m ? { fm: m[1]!, body: text.slice(m[0].length) } : { fm: '', body: text }
}

/** File text → document, body and form. */
function load(text: string) {
  const parts = split(text)
  doc = parseDocument(parts.fm)
  body.value = parts.body
  const d = (doc.toJS() ?? {}) as Record<string, unknown>
  const nav = d.navigation as { title?: string } | undefined
  form.title = String(d.title ?? '')
  form.navTitle = String(nav?.title ?? '')
  form.description = String(d.description ?? '')
  form.access = d.access === 'pro' ? 'pro' : 'free'
  form.authors = Array.isArray(d.authors) ? d.authors.map(String) : []
  form.credits = (Array.isArray(d.credits) ? d.credits : []).map((c: Record<string, unknown>) => ({
    kind: (CREDIT_KINDS as readonly string[]).includes(String(c.kind)) ? c.kind as CreditKind : 'video',
    title: String(c.title ?? ''),
    author: String(c.author ?? ''),
    authorUrl: String(c.authorUrl ?? ''),
    url: String(c.url ?? ''),
    license: String(c.license ?? ''),
    note: String(c.note ?? '')
  }))
  const v = d.video as Record<string, unknown> | undefined
  form.videoOn = Boolean(v?.id)
  form.video = {
    id: String(v?.id ?? ''),
    start: v?.start != null ? String(v.start) : '',
    end: v?.end != null ? String(v.end) : '',
    title: String(v?.title ?? ''),
    author: String(v?.author ?? ''),
    authorUrl: String(v?.authorUrl ?? '')
  }
}

/** Form + body → file text, touching only the keys the form owns. */
function compose(): string {
  const d = doc.clone()
  const put = (keys: string[], value: unknown) => {
    const empty = value === '' || value == null || (Array.isArray(value) && !value.length)
    if (empty) {
      if (d.hasIn(keys)) d.deleteIn(keys)
      return
    }
    const node = d.getIn(keys, true) as { value?: unknown } | undefined
    // Keep an existing scalar node (and its quoting) when only its value changes.
    if (node && typeof node === 'object' && 'value' in node && typeof value !== 'object') node.value = value
    else d.setIn(keys, value)
  }
  put(['title'], form.title.trim())
  put(['description'], form.description.trim())
  put(['navigation', 'title'], form.navTitle.trim())
  if (d.hasIn(['navigation']) && !Object.keys((d.getIn(['navigation']) as { toJSON?: () => object })?.toJSON?.() ?? {}).length) d.delete('navigation')
  put(['access'], form.access === 'pro' ? 'pro' : '')
  put(['authors'], form.authors.length ? d.createNode([...form.authors]) : [])
  put(['credits'], form.credits.length
    ? d.createNode(form.credits.map(c => Object.fromEntries(Object.entries({
        kind: c.kind, title: c.title.trim(), author: c.author.trim(), authorUrl: c.authorUrl.trim(),
        url: c.url.trim(), license: c.license.trim(), note: c.note.trim()
      }).filter(([, v]) => v))))
    : [])
  if (form.videoOn && form.video.id.trim()) {
    const v = form.video
    put(['video'], d.createNode(Object.fromEntries(Object.entries({
      id: v.id.trim(),
      start: v.start.trim() ? Number(v.start) : undefined,
      end: v.end.trim() ? Number(v.end) : undefined,
      title: v.title.trim() || undefined,
      author: v.author.trim() || undefined,
      authorUrl: v.authorUrl.trim() || undefined
    }).filter(([, x]) => x !== undefined))))
  } else {
    put(['video'], '')
  }
  const fm = d.toString({ lineWidth: 0 }).trimEnd()
  return `---\n${fm === '{}' ? '' : fm}\n---\n${body.value.startsWith('\n') ? '' : '\n'}${body.value}`
}

const current = computed(() => (mode.value === 'raw' ? raw.value : compose()))
const dirty = computed(() => Boolean(loaded.value) && current.value !== loaded.value)
watch(dirty, v => emit('dirty', v))

const problems = computed(() => {
  if (mode.value === 'raw') {
    const parts = split(raw.value)
    try {
      return lessonProblems((parseDocument(parts.fm).toJS() ?? {}) as Record<string, unknown>, knownPeople.value)
    } catch {
      return ['The frontmatter is not valid YAML.']
    }
  }
  const out = lessonProblems((parseDocument(split(compose()).fm).toJS() ?? {}) as Record<string, unknown>, knownPeople.value)
  if (props.role === 'instructor' && props.personSlug && !form.authors.includes(props.personSlug)) {
    out.push('Keep yourself in authors - it is what lets you keep editing this lesson.')
  }
  return out
})

function setMode(next: 'form' | 'raw') {
  if (next === mode.value) return
  if (next === 'raw') {
    raw.value = compose()
  } else {
    try {
      load(raw.value)
    } catch {
      error.value = 'The frontmatter is not valid YAML - fix it in the raw file first.'
      return
    }
  }
  mode.value = next
}

async function fetchFile() {
  loading.value = true
  error.value = ''
  result.value = null
  try {
    const r = await $fetch<{ sha: string, content: string, canEdit: boolean, reason: string | null, draft: typeof draft.value }>('/api/admin/content/file', { query: { path: props.path } })
    sha.value = r.sha
    canEdit.value = r.canEdit
    reason.value = r.reason
    draft.value = r.draft
    load(r.content)
    mode.value = 'form'
    // Compare against our own serialisation, so an untouched lesson is not
    // "dirty" just because yaml would quote something differently.
    loaded.value = compose()
    raw.value = loaded.value
  } catch (e) {
    error.value = apiError(e) || 'Could not load the lesson.'
  } finally {
    loading.value = false
  }
}
watch(() => props.path, fetchFile, { immediate: true })

async function save() {
  if (problems.value.length) return
  saving.value = true
  error.value = ''
  result.value = null
  const content = current.value
  try {
    const r = await $fetch<PublishResult & { sha: string }>('/api/admin/content/file', {
      method: 'PUT',
      body: { path: props.path, content, sha: sha.value, ...(message.value.trim() ? { message: message.value.trim() } : {}) }
    })
    result.value = r
    sha.value = r.sha
    loaded.value = content
    message.value = ''
    if (r.mode === 'pull' && r.prNumber) {
      draft.value = { branch: r.branch, prNumber: r.prNumber, prUrl: r.prUrl ?? null, status: 'open', reviewNote: null }
    }
    emit('saved', r)
  } catch (e) {
    error.value = apiError(e) || 'Could not save.'
  } finally {
    saving.value = false
  }
}

// Live preview, debounced; parsed the way LessonProGate renders Pro bodies.
const parsed = ref<{ body: unknown, toc?: unknown } | null>(null)
const previewBody = computed(() => (mode.value === 'raw' ? split(raw.value).body : body.value))
let timer: ReturnType<typeof setTimeout> | undefined
watch([previewBody, showPreview], () => {
  if (!showPreview.value || import.meta.server) return
  clearTimeout(timer)
  timer = setTimeout(async () => {
    try {
      const { parseMarkdown } = await import('@nuxtjs/mdc/runtime')
      parsed.value = await parseMarkdown(previewBody.value, { toc: { depth: 2, searchDepth: 1 } }) as { body: unknown, toc?: unknown }
    } catch {
      // Keep the last good preview while the author is mid-edit.
    }
  }, 350)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))

const addCredit = () => void form.credits.push({ kind: 'video', title: '', author: '', authorUrl: '', url: '', license: '', note: '' })
const moveCredit = (i: number, d: -1 | 1) => {
  const j = i + d
  if (j < 0 || j >= form.credits.length) return
  const [c] = form.credits.splice(i, 1)
  form.credits.splice(j, 0, c!)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <code class="min-w-0 truncate text-sm text-(--ink)">{{ path }}</code>
      <UBadge
        v-if="dirty"
        label="Unsaved changes"
        color="warning"
        variant="subtle"
        size="sm"
      />
      <UBadge
        v-if="draft"
        :label="draft.status === 'changes_requested' ? 'Changes requested' : `Draft · PR #${draft.prNumber}`"
        :color="draft.status === 'changes_requested' ? 'warning' : 'info'"
        variant="subtle"
        size="sm"
      />
      <div class="ms-auto flex border-[1.5px] border-(--ink)">
        <button
          v-for="m in (['form', 'raw'] as const)"
          :key="m"
          type="button"
          class="px-3 py-1 font-mono text-[10px] uppercase tracking-[.1em]"
          :class="mode === m ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="setMode(m)"
        >
          {{ m === 'form' ? 'Form' : 'Raw file' }}
        </button>
      </div>
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        :icon="showPreview ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :label="showPreview ? 'Hide preview' : 'Preview'"
        @click="showPreview = !showPreview"
      />
    </div>

    <UAlert
      v-if="reason"
      color="warning"
      variant="subtle"
      icon="i-lucide-lock"
      title="Read only"
      :description="reason"
    />
    <UAlert
      v-if="draft?.status === 'changes_requested' && draft.reviewNote"
      color="warning"
      variant="subtle"
      icon="i-lucide-message-square-warning"
      title="An admin asked for changes"
      :description="draft.reviewNote"
    />
    <p
      v-if="error"
      class="text-sm text-error"
      role="alert"
    >
      {{ error }}
    </p>

    <div
      v-if="loading"
      class="space-y-2"
    >
      <USkeleton
        v-for="i in 6"
        :key="i"
        class="h-8 w-full"
      />
    </div>

    <template v-else>
      <!-- Frontmatter form -->
      <div
        v-if="mode === 'form'"
        class="grid gap-4 border-[1.5px] border-(--ink) bg-(--card) p-4 sm:grid-cols-2"
      >
        <UFormField
          label="Title"
          required
          class="sm:col-span-2"
        >
          <UInput
            v-model="form.title"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
        <UFormField
          label="Sidebar title"
          help="Optional short title for the course contents."
        >
          <UInput
            v-model="form.navTitle"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
        <UFormField label="Access">
          <div class="flex gap-2">
            <UButton
              v-for="a in (['free', 'pro'] as const)"
              :key="a"
              size="sm"
              class="capitalize"
              :color="form.access === a ? 'primary' : 'neutral'"
              :variant="form.access === a ? 'solid' : 'outline'"
              :disabled="!canEdit"
              @click="form.access = a"
            >
              {{ a }}
            </UButton>
          </div>
        </UFormField>
        <UFormField
          label="Description"
          required
          class="sm:col-span-2"
          help="One sentence — meta description, OG image and navigation."
        >
          <UTextarea
            v-model="form.description"
            :rows="2"
            autoresize
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>
        <UFormField
          label="Authors"
          class="sm:col-span-2"
          help="From content/people. None means the site owner."
        >
          <USelectMenu
            v-model="form.authors"
            :items="peopleItems"
            value-key="value"
            multiple
            placeholder="Pick authors"
            class="w-full"
            :disabled="!canEdit"
          />
        </UFormField>

        <!-- Lesson video -->
        <div class="sm:col-span-2">
          <label class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.1em] text-(--ink)">
            <input
              v-model="form.videoOn"
              type="checkbox"
              :disabled="!canEdit"
            >
            YouTube video at the top
          </label>
          <div
            v-if="form.videoOn"
            class="mt-3 grid gap-3 sm:grid-cols-3"
          >
            <UFormField label="Video id">
              <UInput
                v-model="form.video.id"
                placeholder="dQw4w9WgXcQ"
                :disabled="!canEdit"
              />
            </UFormField>
            <UFormField label="Start (s)">
              <UInput
                v-model="form.video.start"
                inputmode="numeric"
                :disabled="!canEdit"
              />
            </UFormField>
            <UFormField label="End (s)">
              <UInput
                v-model="form.video.end"
                inputmode="numeric"
                :disabled="!canEdit"
              />
            </UFormField>
            <UFormField
              label="Credit: channel / author"
              help="Fill in when the video is someone else's."
            >
              <UInput
                v-model="form.video.author"
                :disabled="!canEdit"
              />
            </UFormField>
            <UFormField label="Channel URL">
              <UInput
                v-model="form.video.authorUrl"
                placeholder="https://www.youtube.com/@…"
                :disabled="!canEdit"
              />
            </UFormField>
            <UFormField label="Video title">
              <UInput
                v-model="form.video.title"
                :disabled="!canEdit"
              />
            </UFormField>
          </div>
        </div>

        <!-- Credits -->
        <div class="sm:col-span-2">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[11px] uppercase tracking-[.1em] text-(--ink)">
              Credits & sources
            </p>
            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-plus"
              label="Add credit"
              :disabled="!canEdit"
              @click="addCredit"
            />
          </div>
          <p class="mt-1 text-xs text-(--ink2)">
            Every third-party video, post, article, image or dataset the lesson uses — listed at the end of the lesson and on /instructors.
          </p>
          <div
            v-for="(c, i) in form.credits"
            :key="i"
            class="mt-3 grid gap-2 border border-dashed border-(--line) p-3 sm:grid-cols-6"
          >
            <USelect
              v-model="c.kind"
              :items="[...CREDIT_KINDS]"
              class="sm:col-span-1"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.title"
              placeholder="Title"
              class="sm:col-span-3"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.author"
              placeholder="Author"
              class="sm:col-span-2"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.url"
              placeholder="https://… (the work)"
              class="sm:col-span-3"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.authorUrl"
              placeholder="https://… (author, optional)"
              class="sm:col-span-3"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.license"
              placeholder="Licence (optional)"
              class="sm:col-span-2"
              :disabled="!canEdit"
            />
            <UInput
              v-model="c.note"
              placeholder="Note (optional)"
              class="sm:col-span-3"
              :disabled="!canEdit"
            />
            <div class="flex justify-end gap-1 sm:col-span-1">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-up"
                aria-label="Move up"
                :disabled="!canEdit || i === 0"
                @click="moveCredit(i, -1)"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-down"
                aria-label="Move down"
                :disabled="!canEdit || i === form.credits.length - 1"
                @click="moveCredit(i, 1)"
              />
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                aria-label="Remove credit"
                :disabled="!canEdit"
                @click="form.credits.splice(i, 1)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Body / raw + preview -->
      <div
        class="grid gap-4"
        :class="showPreview ? 'xl:grid-cols-2' : ''"
      >
        <textarea
          v-if="mode === 'form'"
          v-model="body"
          class="h-[60vh] w-full resize-y border-[1.5px] border-(--ink) bg-(--card) p-3 font-mono text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--signal)"
          spellcheck="false"
          aria-label="Lesson body (markdown)"
          :readonly="!canEdit"
        />
        <textarea
          v-else
          v-model="raw"
          class="h-[70vh] w-full resize-y border-[1.5px] border-(--ink) bg-(--card) p-3 font-mono text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--signal)"
          spellcheck="false"
          aria-label="Lesson file"
          :readonly="!canEdit"
        />
        <div
          v-if="showPreview"
          class="h-[60vh] overflow-auto border-[1.5px] border-(--ink) bg-(--paper) p-5"
        >
          <p class="mono-label mb-3">
            Preview
          </p>
          <div class="bp-prose">
            <ContentRenderer
              v-if="parsed"
              :value="parsed"
            />
          </div>
        </div>
      </div>

      <ul
        v-if="problems.length"
        class="space-y-1 border-[1.5px] border-(--signal) bg-(--card) p-3 text-sm text-(--ink)"
      >
        <li
          v-for="p in problems"
          :key="p"
          class="flex gap-2"
        >
          <UIcon
            name="i-lucide-triangle-alert"
            class="mt-0.5 size-4 flex-none text-warning"
          />{{ p }}
        </li>
      </ul>

      <div
        v-if="canEdit"
        class="flex flex-wrap items-center gap-2"
      >
        <UInput
          v-model="message"
          class="min-w-64 grow"
          size="sm"
          :placeholder="`content: update ${path.replace('content/en/', '')}`"
          aria-label="Commit message"
        />
        <UButton
          :label="role === 'admin' ? 'Commit to main' : (draft ? 'Update pull request' : 'Submit for review')"
          :icon="role === 'admin' ? 'i-lucide-git-commit-horizontal' : 'i-lucide-git-pull-request'"
          :loading="saving"
          :disabled="!dirty || problems.length > 0"
          @click="save"
        />
      </div>

      <div
        v-if="result"
        class="border-[1.5px] border-(--ink) bg-(--ice) p-4 text-sm"
      >
        <p
          v-if="result.mode === 'commit'"
          class="text-(--ink)"
        >
          Committed
          <a
            :href="result.commitUrl"
            target="_blank"
            rel="noopener"
            class="font-mono text-primary"
          >{{ result.commitSha.slice(0, 7) }}</a>
          to main — translation and deploy run on their own; the site shows it in a few minutes.
        </p>
        <p
          v-else
          class="text-(--ink)"
        >
          Saved to
          <a
            :href="result.prUrl"
            target="_blank"
            rel="noopener"
            class="font-semibold text-primary"
          >pull request #{{ result.prNumber }}</a>
          — an admin reviews and publishes it.
        </p>
      </div>
    </template>
  </div>
</template>
