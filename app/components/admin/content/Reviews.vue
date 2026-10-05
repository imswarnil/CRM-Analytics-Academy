<script setup lang="ts">
/**
 * The review queue. Admins see every open instructor pull request with a
 * per-file diff, and Publish (squash-merge to main), Request changes (a note
 * the instructor sees in their studio) or Close. Instructors see their own
 * submissions and where each stands.
 */
import type { EditorDraft } from '~/types/content-editor'

const props = defineProps<{ role: 'admin' | 'instructor' }>()
const emit = defineEmits<{ published: [] }>()

interface ReviewFile {
  filename: string
  previous: string | null
  status: string
  additions: number
  deletions: number
  patch: string | null
}
interface ReviewPull {
  number: number
  url: string
  title: string
  branch: string
  headSha: string
  createdAt: string
  updatedAt: string
  instructor: { name: string | null, email: string | null } | null
  status: string
  reviewNote: string | null
  outsideContent: boolean
  files: ReviewFile[]
}

const pulls = ref<ReviewPull[]>([])
const drafts = ref<EditorDraft[]>([])
const loading = ref(false)
const error = ref('')
const busy = ref<number | null>(null)
const notes = reactive<Record<number, string>>({})
const openPatch = reactive<Record<string, boolean>>({})
const done = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const r = await $fetch<{ pulls: ReviewPull[], drafts: EditorDraft[] }>('/api/admin/content/reviews')
    pulls.value = r.pulls
    drafts.value = r.drafts
  } catch (e) {
    error.value = apiError(e) || 'Could not load the review queue.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
defineExpose({ load, count: computed(() => pulls.value.length) })

async function act(p: ReviewPull, action: 'publish' | 'request-changes' | 'close') {
  if (action === 'publish' && !confirm(`Publish "${p.title}" to main? Translation and deploy follow automatically.`)) return
  if (action === 'close' && !confirm(`Close "${p.title}" without publishing?`)) return
  busy.value = p.number
  error.value = ''
  done.value = ''
  try {
    await $fetch('/api/admin/content/reviews', {
      method: 'POST',
      body: { number: p.number, action, headSha: p.headSha, note: notes[p.number] ?? '' }
    })
    done.value = action === 'publish' ? `Published #${p.number}.` : action === 'close' ? `Closed #${p.number}.` : `Sent #${p.number} back with your note.`
    if (action === 'publish') emit('published')
    await load()
  } catch (e) {
    error.value = apiError(e) || 'GitHub refused the action.'
  } finally {
    busy.value = null
  }
}

const STATUS: Record<string, { label: string, color: 'info' | 'warning' | 'success' | 'neutral' }> = {
  open: { label: 'In review', color: 'info' },
  changes_requested: { label: 'Changes requested', color: 'warning' },
  published: { label: 'Published', color: 'success' },
  closed: { label: 'Closed', color: 'neutral' }
}
const day = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const fileLine = (line: string) => line.startsWith('+') ? 'text-success' : line.startsWith('-') ? 'text-error' : line.startsWith('@@') ? 'text-(--signal)' : ''
</script>

<template>
  <section>
    <div class="mb-4 flex items-center gap-2">
      <p class="text-sm text-(--ink2)">
        {{ props.role === 'admin'
          ? 'Instructors\' submissions — every save is a pull request against main. Publishing merges it; the translate and deploy workflows run on that push.'
          : 'Your submissions. An admin publishes them, or sends them back with a note — edit the lesson again to update the same pull request.' }}
      </p>
      <UButton
        class="ms-auto"
        size="xs"
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="loading"
        label="Reload"
        @click="load"
      />
    </div>

    <p
      v-if="error"
      class="mb-3 text-sm text-error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="done"
      class="mb-3 text-sm text-success"
    >
      {{ done }}
    </p>

    <!-- Admin: open pull requests -->
    <template v-if="props.role === 'admin'">
      <p
        v-if="!loading && !pulls.length"
        class="border-[1.5px] border-(--ink) bg-(--card) p-10 text-center text-sm text-(--ink2)"
      >
        Nothing to review.
      </p>
      <article
        v-for="p in pulls"
        :key="p.number"
        class="mb-6 border-[1.5px] border-(--ink) bg-(--card)"
      >
        <header class="flex flex-wrap items-center gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2.5">
          <a
            :href="p.url"
            target="_blank"
            rel="noopener"
            class="font-mono text-xs text-primary"
          >#{{ p.number }}</a>
          <span class="font-semibold text-(--ink)">{{ p.title }}</span>
          <UBadge
            :label="STATUS[p.status]?.label ?? p.status"
            :color="STATUS[p.status]?.color ?? 'neutral'"
            variant="subtle"
            size="sm"
          />
          <span class="ms-auto font-mono text-[11px] text-(--ink2)">
            {{ p.instructor?.name || p.instructor?.email || 'unknown author' }} · {{ day(p.updatedAt) }}
          </span>
        </header>

        <div class="space-y-1 px-4 py-3">
          <UAlert
            v-if="p.outsideContent"
            color="error"
            variant="subtle"
            icon="i-lucide-shield-alert"
            title="Touches files outside content/"
            description="This did not come from the studio. Publish is refused here — review it on GitHub."
            class="mb-2"
          />
          <div
            v-for="f in p.files"
            :key="f.filename"
          >
            <button
              type="button"
              class="flex w-full items-center gap-2 py-1 text-start text-sm hover:text-(--signal)"
              @click="openPatch[`${p.number}:${f.filename}`] = !openPatch[`${p.number}:${f.filename}`]"
            >
              <UIcon
                :name="openPatch[`${p.number}:${f.filename}`] ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="size-4 flex-none"
              />
              <span class="font-mono text-[10px] uppercase text-(--ink2)">{{ f.status }}</span>
              <code class="min-w-0 truncate">{{ f.filename }}</code>
              <span class="ms-auto font-mono text-xs"><span class="text-success">+{{ f.additions }}</span> <span class="text-error">−{{ f.deletions }}</span></span>
            </button>
            <pre
              v-if="openPatch[`${p.number}:${f.filename}`] && f.patch"
              class="max-h-96 overflow-auto border border-(--line) bg-(--paper) p-2 font-mono text-xs leading-5"
            ><span
              v-for="(line, i) in f.patch.split('\n')"
              :key="i"
              class="block whitespace-pre-wrap"
              :class="fileLine(line)"
            >{{ line }}</span></pre>
          </div>
        </div>

        <footer class="flex flex-wrap items-start gap-2 border-t border-dashed border-(--line) px-4 py-3">
          <UTextarea
            v-model="notes[p.number]"
            :rows="1"
            autoresize
            placeholder="Note for the instructor (required to request changes)"
            class="min-w-64 grow"
          />
          <UButton
            icon="i-lucide-rocket"
            label="Publish"
            :loading="busy === p.number"
            :disabled="busy !== null || p.outsideContent"
            @click="act(p, 'publish')"
          />
          <UButton
            icon="i-lucide-message-square-warning"
            label="Request changes"
            color="warning"
            variant="soft"
            :disabled="busy !== null || !(notes[p.number] ?? '').trim()"
            @click="act(p, 'request-changes')"
          />
          <UButton
            icon="i-lucide-x"
            label="Close"
            color="neutral"
            variant="ghost"
            :disabled="busy !== null"
            @click="act(p, 'close')"
          />
        </footer>
      </article>
    </template>

    <!-- Instructor: own drafts -->
    <template v-else>
      <p
        v-if="!loading && !drafts.length"
        class="border-[1.5px] border-(--ink) bg-(--card) p-10 text-center text-sm text-(--ink2)"
      >
        No submissions yet. Edit a lesson you author, or create one, and it lands here.
      </p>
      <ul class="space-y-3">
        <li
          v-for="d in drafts"
          :key="d.id"
          class="border-[1.5px] border-(--ink) bg-(--card) p-4"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-(--ink)">{{ d.title }}</span>
            <UBadge
              :label="STATUS[d.status]?.label ?? d.status"
              :color="STATUS[d.status]?.color ?? 'neutral'"
              variant="subtle"
              size="sm"
            />
            <a
              v-if="d.prUrl"
              :href="d.prUrl"
              target="_blank"
              rel="noopener"
              class="ms-auto font-mono text-xs text-primary"
            >PR #{{ d.prNumber }} ↗</a>
          </div>
          <p class="mt-1 font-mono text-[11px] text-(--ink2)">
            {{ d.paths.join(' · ') }}
          </p>
          <p
            v-if="d.reviewNote && d.status === 'changes_requested'"
            class="mt-2 border-s-[3px] border-(--signal) ps-3 text-sm text-(--ink)"
          >
            {{ d.reviewNote }}
          </p>
        </li>
      </ul>
    </template>
  </section>
</template>
