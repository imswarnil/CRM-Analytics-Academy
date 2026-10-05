<script setup lang="ts">
/**
 * The content editor: the course as main holds it, a lesson editor, the
 * review queue and the people registry.
 *
 *   admin       edits anything; saves are commits to main. Reorders sections
 *               and lessons (one atomic commit that also moves every
 *               translation and remaps the translation manifest), renames
 *               sections, reviews instructors' pull requests.
 *   instructor  edits lessons that list them as an author and creates lessons
 *               and sections; every save is a pull request an admin publishes.
 *
 * Every write re-checks the role and the ownership on the server; nothing
 * decided here is a permission.
 */
import type { EditorLesson, EditorSection, EditorTree, PublishResult } from '~/types/content-editor'

const props = defineProps<{ role: 'admin' | 'instructor' }>()

const view = ref<'course' | 'reviews' | 'people'>('course')
const tree = ref<EditorTree | null>(null)
const loading = ref(false)
const error = ref('')
const notice = ref<{ text: string, url?: string } | null>(null)
const activePath = ref('')
const editorDirty = ref(false)
const open = reactive<Record<string, boolean>>({})

const isAdmin = computed(() => props.role === 'admin')

async function load() {
  loading.value = true
  error.value = ''
  try {
    tree.value = await $fetch<EditorTree>('/api/admin/content/tree')
    resetOrder()
  } catch (e) {
    error.value = apiError(e) || 'Could not read the course from GitHub.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* --- Ordering ------------------------------------------------------------ */
// Staged locally; nothing moves on GitHub until "Save order".
const sectionOrder = ref<string[]>([])
const lessonOrder = reactive<Record<string, string[]>>({})
function resetOrder() {
  sectionOrder.value = tree.value?.sections.map(s => s.dir) ?? []
  for (const s of tree.value?.sections ?? []) lessonOrder[s.dir] = s.lessons.map(l => l.file)
}
const sectionsByDir = computed(() => new Map((tree.value?.sections ?? []).map(s => [s.dir, s])))
const orderedSections = computed(() => sectionOrder.value.map(d => sectionsByDir.value.get(d)).filter((s): s is EditorSection => Boolean(s)))
const lessonsOf = (s: EditorSection): EditorLesson[] => {
  const byFile = new Map(s.lessons.map(l => [l.file, l]))
  return (lessonOrder[s.dir] ?? []).map(f => byFile.get(f)).filter((l): l is EditorLesson => Boolean(l))
}
const sectionsDirty = computed(() => (tree.value?.sections.map(s => s.dir).join('|') ?? '') !== sectionOrder.value.join('|'))
const lessonsDirty = (s: EditorSection) => s.lessons.map(l => l.file).join('|') !== (lessonOrder[s.dir] ?? []).join('|')

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item!)
}

// Native drag and drop, scoped: a lesson only drops within its own section.
const drag = ref<{ kind: 'section' | 'lesson', dir: string, index: number } | null>(null)
function onDrop(kind: 'section' | 'lesson', dir: string, index: number) {
  const d = drag.value
  drag.value = null
  if (!d || d.kind !== kind || (kind === 'lesson' && d.dir !== dir)) return
  if (kind === 'section') move(sectionOrder.value, d.index, index)
  else move(lessonOrder[dir]!, d.index, index)
}

const saving = ref(false)
async function saveOrder(kind: 'sections' | 'lessons', s?: EditorSection) {
  if (!tree.value) return
  saving.value = true
  error.value = ''
  notice.value = null
  try {
    const r = await $fetch<PublishResult & { unchanged?: boolean, moved?: number, manifestKeys?: number }>('/api/admin/content/reorder', {
      method: 'POST',
      body: kind === 'sections'
        ? { kind, treeSha: tree.value.enTreeSha, order: sectionOrder.value }
        : { kind, section: s!.dir, treeSha: s!.treeSha, order: lessonOrder[s!.dir] }
    })
    notice.value = r.unchanged
      ? { text: 'Nothing to move.' }
      : { text: `Reordered in one commit: ${r.moved} paths moved across every language, ${r.manifestKeys} translation-manifest keys remapped.`, url: r.commitUrl }
    await load()
  } catch (e) {
    error.value = apiError(e) || 'Could not save the order.'
  } finally {
    saving.value = false
  }
}

/* --- Opening lessons ------------------------------------------------------- */
function openLesson(l: EditorLesson) {
  if (l.path === activePath.value) return
  if (editorDirty.value && !confirm('Discard unsaved changes to the open lesson?')) return
  editorDirty.value = false
  activePath.value = l.path
}
const mayEdit = (l: EditorLesson) => isAdmin.value || (tree.value?.personSlug ? l.authors.includes(tree.value.personSlug) : false)
const draftPaths = computed(() => new Set((tree.value?.drafts ?? []).filter(d => d.status === 'open' || d.status === 'changes_requested').flatMap(d => d.paths)))

function onSaved(r: PublishResult) {
  if (r.mode === 'commit') notice.value = { text: 'Committed to main.', url: r.commitUrl }
  else notice.value = { text: `Saved to pull request #${r.prNumber}.`, url: r.prUrl }
  load()
}

/* --- Create / rename ---------------------------------------------------------- */
const modal = ref<null | 'lesson' | 'section' | 'renameSection' | 'renameLesson'>(null)
const mform = reactive({ section: '', title: '', slug: '', description: '', icon: '', navTitle: '', target: '', sha: '' })
const slugTouched = ref(false)
const busy = ref(false)
const modalError = ref('')
watch(() => mform.title, (t) => {
  if ((modal.value === 'lesson' || modal.value === 'section') && !slugTouched.value) mform.slug = slugify(t)
})

function openModal(kind: NonNullable<typeof modal.value>, s?: EditorSection, l?: EditorLesson) {
  modalError.value = ''
  slugTouched.value = false
  Object.assign(mform, { section: s?.dir ?? orderedSections.value.at(-1)?.dir ?? '', title: '', slug: '', description: '', icon: '', navTitle: '', target: '', sha: '' })
  if (kind === 'renameSection' && s) Object.assign(mform, { title: s.title, icon: s.icon ?? '', target: s.dir, sha: s.navSha ?? '' })
  if (kind === 'renameLesson' && l) Object.assign(mform, { title: l.title, navTitle: l.navTitle ?? '', target: l.path, sha: l.sha })
  modal.value = kind
}

async function submitModal() {
  busy.value = true
  modalError.value = ''
  try {
    let r: PublishResult & { path?: string, note?: string }
    if (modal.value === 'lesson') {
      r = await $fetch('/api/admin/content/lesson', { method: 'POST', body: { section: mform.section, title: mform.title, slug: mform.slug, description: mform.description } })
    } else if (modal.value === 'section') {
      r = await $fetch('/api/admin/content/section', { method: 'POST', body: { title: mform.title, slug: mform.slug, icon: mform.icon, description: mform.description } })
    } else if (modal.value === 'renameSection') {
      r = await $fetch('/api/admin/content/section', { method: 'PATCH', body: { dir: mform.target, title: mform.title, icon: mform.icon, sha: mform.sha || null } })
    } else {
      r = await $fetch('/api/admin/content/lesson', { method: 'PATCH', body: { path: mform.target, sha: mform.sha, title: mform.title, navTitle: mform.navTitle } })
    }
    const where = r.mode === 'pull' ? `pull request #${r.prNumber}` : 'main'
    notice.value = { text: `Saved to ${where}.${r.note ? ` ${r.note}` : ''}`, url: r.mode === 'pull' ? r.prUrl : r.commitUrl }
    const created = modal.value === 'lesson' ? r.path : undefined
    modal.value = null
    await load()
    if (created) activePath.value = created
  } catch (e) {
    modalError.value = apiError(e) || 'GitHub refused the change.'
  } finally {
    busy.value = false
  }
}

const modalTitle = computed(() => ({
  lesson: 'New lesson',
  section: 'New section',
  renameSection: 'Rename section',
  renameLesson: 'Rename lesson'
})[modal.value ?? 'lesson'])

const sectionItems = computed(() => orderedSections.value.map(s => ({ label: `${s.dir} — ${s.title}`, value: s.dir })))
const peopleBySlug = computed(() => new Map((tree.value?.people ?? []).map(p => [p.slug, p])))
const authorNames = (l: EditorLesson) => (l.authors.length ? l.authors : [OWNER_SLUG]).map(a => peopleBySlug.value.get(a)?.name ?? a).join(', ')
</script>

<template>
  <section>
    <!-- Sub-tabs -->
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <div class="flex border-[1.5px] border-(--ink) bg-(--card)">
        <button
          v-for="v in (isAdmin ? ['course', 'reviews', 'people'] as const : ['course', 'reviews'] as const)"
          :key="v"
          type="button"
          class="border-e-[1.5px] border-(--ink) px-4 py-1.5 font-mono text-[11px] uppercase tracking-[.1em] last:border-e-0"
          :class="view === v ? 'bg-(--ink) text-(--paper)' : 'hover:bg-(--ice)'"
          @click="view = v"
        >
          {{ v === 'course' ? 'Course' : v === 'reviews' ? (isAdmin ? 'Review queue' : 'My submissions') : 'People' }}
        </button>
      </div>
      <span
        v-if="tree"
        class="font-mono text-[11px] text-(--ink2)"
      >{{ tree.repo }} @ {{ tree.branch }} · {{ tree.head.slice(0, 7) }}</span>
      <UButton
        class="ms-auto"
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        label="Reload"
        :loading="loading"
        @click="load"
      />
    </div>

    <UAlert
      v-if="tree?.linkError"
      color="warning"
      variant="subtle"
      icon="i-lucide-link-2-off"
      title="Not linked yet"
      :description="tree.linkError"
      class="mb-4"
    />
    <p
      v-if="error"
      class="mb-4 text-sm text-error"
      role="alert"
    >
      {{ error }}
    </p>
    <div
      v-if="notice"
      class="mb-4 flex items-center gap-2 border-[1.5px] border-(--ink) bg-(--ice) px-3 py-2 text-sm text-(--ink)"
    >
      <UIcon
        name="i-lucide-git-commit-horizontal"
        class="size-4 flex-none"
      />
      <span>{{ notice.text }}</span>
      <a
        v-if="notice.url"
        :href="notice.url"
        target="_blank"
        rel="noopener"
        class="font-mono text-xs text-primary"
      >view on GitHub ↗</a>
      <UButton
        class="ms-auto"
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        aria-label="Dismiss"
        @click="notice = null"
      />
    </div>

    <AdminContentReviews
      v-if="view === 'reviews'"
      :role="role"
      @published="load"
    />
    <AdminContentPeople
      v-else-if="view === 'people' && isAdmin"
      :people="tree?.people ?? []"
      @saved="load"
    />

    <!-- Course -->
    <div
      v-else
      class="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]"
    >
      <div>
        <div class="mb-3 grid grid-cols-2 gap-2">
          <UButton
            label="New lesson"
            icon="i-lucide-file-plus-2"
            size="sm"
            variant="soft"
            block
            :disabled="!tree || Boolean(tree.linkError)"
            @click="openModal('lesson')"
          />
          <UButton
            label="New section"
            icon="i-lucide-folder-plus"
            size="sm"
            variant="soft"
            block
            :disabled="!tree || Boolean(tree.linkError)"
            @click="openModal('section')"
          />
        </div>
        <div
          v-if="isAdmin && sectionsDirty"
          class="mb-3 flex items-center gap-2 border-[1.5px] border-(--signal) bg-(--card) p-2"
        >
          <span class="text-xs text-(--ink)">Section order changed</span>
          <UButton
            class="ms-auto"
            size="xs"
            label="Save order"
            icon="i-lucide-arrow-up-down"
            :loading="saving"
            @click="saveOrder('sections')"
          />
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            label="Undo"
            @click="resetOrder"
          />
        </div>

        <div
          v-if="loading && !tree"
          class="space-y-2"
        >
          <USkeleton
            v-for="i in 10"
            :key="i"
            class="h-8 w-full"
          />
        </div>

        <ol class="space-y-2">
          <li
            v-for="(s, si) in orderedSections"
            :key="s.dir"
            class="border-[1.5px] border-(--ink) bg-(--card)"
            :draggable="isAdmin"
            @dragstart.self="drag = { kind: 'section', dir: s.dir, index: si }"
            @dragover.prevent
            @drop.prevent="onDrop('section', s.dir, si)"
          >
            <div class="flex items-center gap-1 px-2 py-1.5">
              <UIcon
                v-if="isAdmin"
                name="i-lucide-grip-vertical"
                class="size-4 flex-none cursor-grab text-(--ink2)"
              />
              <button
                type="button"
                class="flex min-w-0 flex-1 items-center gap-2 text-start"
                @click="open[s.dir] = !open[s.dir]"
              >
                <UIcon
                  :name="s.icon || 'i-lucide-folder'"
                  class="size-4 flex-none text-(--signal)"
                />
                <span class="font-mono text-[10px] text-(--ink2)">{{ String(si).padStart(2, '0') }}</span>
                <span class="truncate text-sm font-semibold text-(--ink)">{{ s.title }}</span>
                <span class="ms-auto font-mono text-[10px] text-(--ink2)">{{ s.lessons.length }}</span>
              </button>
              <template v-if="isAdmin">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-up"
                  aria-label="Move section up"
                  :disabled="si === 0"
                  @click="move(sectionOrder, si, si - 1)"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-down"
                  aria-label="Move section down"
                  :disabled="si === orderedSections.length - 1"
                  @click="move(sectionOrder, si, si + 1)"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  aria-label="Rename section"
                  @click="openModal('renameSection', s)"
                />
              </template>
            </div>

            <div
              v-if="open[s.dir]"
              class="border-t border-dashed border-(--line)"
            >
              <div
                v-if="isAdmin && lessonsDirty(s)"
                class="flex items-center gap-2 bg-(--ice) px-2 py-1.5"
              >
                <span class="text-xs text-(--ink)">Lesson order changed</span>
                <UButton
                  class="ms-auto"
                  size="xs"
                  label="Save order"
                  :loading="saving"
                  @click="saveOrder('lessons', s)"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  label="Undo"
                  @click="lessonOrder[s.dir] = s.lessons.map(l => l.file)"
                />
              </div>
              <ol>
                <li
                  v-for="(l, li) in lessonsOf(s)"
                  :key="l.file"
                  class="group flex items-center gap-1 border-b border-(--line) px-2 py-1 last:border-b-0"
                  :class="l.path === activePath ? 'bg-(--ice)' : 'hover:bg-(--ice)/50'"
                  :draggable="isAdmin"
                  @dragstart.stop="drag = { kind: 'lesson', dir: s.dir, index: li }"
                  @dragover.prevent
                  @drop.prevent.stop="onDrop('lesson', s.dir, li)"
                >
                  <span class="w-6 flex-none font-mono text-[10px] text-(--ink2)">{{ String(li + 1).padStart(2, '0') }}</span>
                  <button
                    type="button"
                    class="min-w-0 flex-1 text-start"
                    :title="`${l.path}\nAuthors: ${authorNames(l)}`"
                    @click="openLesson(l)"
                  >
                    <span
                      class="block truncate text-sm"
                      :class="mayEdit(l) ? 'text-(--ink)' : 'text-(--ink2)'"
                    >{{ l.title }}</span>
                    <span class="block truncate font-mono text-[10px] text-(--ink2)">{{ authorNames(l) }}</span>
                  </button>
                  <UIcon
                    v-if="draftPaths.has(l.path)"
                    name="i-lucide-git-pull-request"
                    class="size-3.5 flex-none text-(--signal)"
                    title="In an open pull request"
                  />
                  <UIcon
                    v-if="!mayEdit(l)"
                    name="i-lucide-lock"
                    class="size-3.5 flex-none text-(--ink2)"
                    title="Read only — you are not an author"
                  />
                  <span
                    v-if="l.access === 'pro'"
                    class="border border-(--ink) bg-(--ink) px-1 font-mono text-[9px] uppercase text-(--paper)"
                  >Pro</span>
                  <template v-if="isAdmin">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-arrow-up"
                      aria-label="Move lesson up"
                      class="opacity-0 group-hover:opacity-100 focus:opacity-100"
                      :disabled="li === 0"
                      @click="move(lessonOrder[s.dir]!, li, li - 1)"
                    />
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-arrow-down"
                      aria-label="Move lesson down"
                      class="opacity-0 group-hover:opacity-100 focus:opacity-100"
                      :disabled="li === s.lessons.length - 1"
                      @click="move(lessonOrder[s.dir]!, li, li + 1)"
                    />
                  </template>
                  <UButton
                    v-if="mayEdit(l)"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-text-cursor-input"
                    aria-label="Rename lesson"
                    class="opacity-0 group-hover:opacity-100 focus:opacity-100"
                    @click="openModal('renameLesson', s, l)"
                  />
                </li>
              </ol>
            </div>
          </li>
        </ol>
      </div>

      <div>
        <p
          v-if="!activePath"
          class="border-[1.5px] border-(--ink) bg-(--card) p-10 text-center text-sm text-(--ink2)"
        >
          {{ isAdmin
            ? 'Pick a lesson to edit, drag sections and lessons (or use the arrows) to reorder, or create a lesson or section.'
            : 'Pick a lesson you author to edit it, or create a lesson or section. Your saves go to a pull request an admin reviews.' }}
        </p>
        <AdminContentLessonEditor
          v-else-if="tree"
          :key="activePath"
          :path="activePath"
          :role="role"
          :person-slug="tree.personSlug"
          :people="tree.people"
          @saved="onSaved"
          @dirty="v => editorDirty = v"
        />
      </div>
    </div>

    <UModal
      :open="modal !== null"
      :title="modalTitle"
      @update:open="v => { if (!v) modal = null }"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField
            v-if="modal === 'lesson'"
            label="Section"
            help="The lesson is added at the end of the section; reorder it afterwards."
          >
            <USelect
              v-model="mform.section"
              :items="sectionItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Title">
            <UInput
              v-model="mform.title"
              class="w-full"
              autofocus
            />
          </UFormField>
          <UFormField
            v-if="modal === 'lesson' || modal === 'section'"
            label="Slug"
            help="Becomes the URL. Lowercase letters, digits and dashes; the two-digit order prefix is added for you."
          >
            <UInput
              v-model="mform.slug"
              class="w-full font-mono"
              @input="slugTouched = true"
            />
          </UFormField>
          <UFormField
            v-if="modal === 'lesson' || modal === 'section'"
            label="Description"
          >
            <UTextarea
              v-model="mform.description"
              :rows="2"
              autoresize
              class="w-full"
            />
          </UFormField>
          <UFormField
            v-if="modal === 'section' || modal === 'renameSection'"
            label="Icon"
            help="Any i-lucide-* name."
          >
            <UInput
              v-model="mform.icon"
              placeholder="i-lucide-book-open"
              class="w-full font-mono"
            />
          </UFormField>
          <UFormField
            v-if="modal === 'renameLesson'"
            label="Sidebar title"
            help="Optional short title in the course contents. The URL does not change."
          >
            <UInput
              v-model="mform.navTitle"
              class="w-full"
            />
          </UFormField>
          <p
            v-if="!isAdmin"
            class="text-xs text-(--ink2)"
          >
            This opens a pull request; an admin publishes it.
          </p>
          <p
            v-if="modalError"
            class="text-sm text-error"
          >
            {{ modalError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancel"
            @click="modal = null"
          />
          <UButton
            :label="isAdmin ? 'Commit' : 'Submit for review'"
            :icon="isAdmin ? 'i-lucide-git-commit-horizontal' : 'i-lucide-git-pull-request'"
            :loading="busy"
            :disabled="!mform.title.trim() || (modal === 'lesson' && !mform.section)"
            @click="submitModal"
          />
        </div>
      </template>
    </UModal>
  </section>
</template>
