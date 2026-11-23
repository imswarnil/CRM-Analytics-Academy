<script setup lang="ts">
/**
 * Sequences: steps of {subject, body, delay}, previewed per prospect.
 * Draft → (preview) → Reviewed → Start. Editing sends it back to draft;
 * nothing is sent until Start, and then only by the hourly run.
 */
interface Step { delayDays: number, subject: string, body: string }
interface Sequence { id: number, name: string, status: string, reviewedAt: string | null, startedAt: string | null, steps: Step[], enrollments: Record<string, number> }
interface Preview { to: string | null, emailStatus: string | null, sendable: boolean, blocked: string | null, timezone: string, steps: { day: number, subject: string, body: string, missing: string[] }[] }

const { data, refresh } = await useLazyAsyncData('prospect-sequences', () => $fetch<{ sequences: Sequence[] }>('/api/admin/prospecting/sequences'), { server: false })
const { data: lists } = await useLazyAsyncData('prospect-lists-seq', () => $fetch<{ lists: { id: number, name: string, count: number }[] }>('/api/admin/prospecting/lists'), { server: false })
const { data: prospects } = await useLazyAsyncData('prospects-seq', () => $fetch<{ prospects: { id: number, firstName: string | null, lastName: string | null, email: string | null, company: string | null }[] }>('/api/admin/prospecting/prospects'), { server: false })

const blank = (): { id: number | null, name: string, steps: Step[] } => ({
  id: null,
  name: '',
  steps: [
    { delayDays: 0, subject: 'CRM Analytics training for {{company|your team}}', body: 'Hi {{firstName|there}},\n\nI run CRM Analytics Academy, a course on Salesforce CRM Analytics. Teams use it to get admins and analysts building dashboards in weeks, not quarters.\n\nWould a few seats for {{company|your team}} be useful? Happy to send a sample lesson.\n\n{{senderName}}' },
    { delayDays: 4, subject: 'Re: CRM Analytics training', body: 'Hi {{firstName|there}}, just checking this reached you. If CRM Analytics is not on your plate, tell me who it belongs to and I will stop writing.\n\n{{senderName}}' }
  ]
})
const draft = ref(blank())
const message = ref<string | null>(null)
const err = (e: unknown) => (e as { statusMessage?: string }).statusMessage ?? String(e)
const VARS = ['firstName', 'lastName', 'company', 'title', 'domain', 'senderName']
const tok = (v: string) => `${'{'}{${v}}${'}'}`

function editSeq(s: Sequence) {
  draft.value = { id: s.id, name: s.name, steps: s.steps.map(x => ({ ...x })) }
}
async function save() {
  try {
    const r = await $fetch<{ id: number }>('/api/admin/prospecting/sequences', { method: 'POST', body: { action: 'save', ...draft.value } })
    draft.value.id = r.id
    message.value = 'Saved as draft — preview it, then mark it reviewed.'
    await refresh()
  } catch (e) {
    message.value = err(e)
  }
}
async function act(id: number, action: string, extra: Record<string, unknown> = {}) {
  try {
    const r = await $fetch<Record<string, unknown>>('/api/admin/prospecting/sequences', { method: 'POST', body: { action, id, ...extra } })
    if (action === 'enroll') message.value = `Enrolled ${r.enrolled}, already in ${r.already}, skipped ${(r.skipped as string[]).length}${(r.skipped as string[]).length ? `: ${(r.skipped as string[]).slice(0, 5).join('; ')}` : ''}`
    else message.value = `${action}: done`
    await refresh()
  } catch (e) {
    message.value = err(e)
  }
}
const previewFor = reactive({ seq: 0, prospect: 0 })
const preview = ref<Preview | null>(null)
async function loadPreview() {
  if (!previewFor.seq || !previewFor.prospect) return
  try {
    preview.value = await $fetch<Preview>('/api/admin/prospecting/sequences', { method: 'POST', body: { action: 'preview', id: previewFor.seq, prospectId: previewFor.prospect } })
  } catch (e) {
    message.value = err(e)
  }
}
const enrollList = ref<Record<number, number | ''>>({})
</script>

<template>
  <div class="space-y-6">
    <p
      v-if="message"
      class="text-xs text-(--ink)"
    >
      {{ message }}
    </p>

    <section class="space-y-3 rounded-[6px] border border-(--line) bg-(--card) p-4">
      <div class="flex items-center gap-2">
        <h3 class="flex-1 font-semibold text-(--ink)">
          {{ draft.id ? `Edit sequence #${draft.id}` : 'New sequence' }}
        </h3>
        <UButton
          v-if="draft.id"
          size="xs"
          variant="ghost"
          @click="draft = blank()"
        >
          New
        </UButton>
      </div>
      <UInput
        v-model="draft.name"
        placeholder="Sequence name, e.g. Salesforce partners — India"
      />
      <p class="text-xs text-(--ink2)">
        Variables: <code
          v-for="v in VARS"
          :key="v"
          class="me-1"
          v-text="tok(v)"
        /> · a fallback: <code v-text="tok('firstName|there')" />. The footer and the unsubscribe link are added to every email.
      </p>
      <div
        v-for="(s, i) in draft.steps"
        :key="i"
        class="space-y-2 border-t border-(--line) pt-3"
      >
        <div class="flex items-center gap-2 text-xs">
          <span class="font-semibold">Step {{ i + 1 }}</span>
          <span>wait</span>
          <input
            v-model.number="s.delayDays"
            type="number"
            min="0"
            max="60"
            class="w-14 rounded-[4px] border border-(--line) bg-(--card) px-1"
          >
          <span>day(s) {{ i === 0 ? 'after enrolment' : 'after the previous step' }} (business hours only)</span>
          <UButton
            v-if="draft.steps.length > 1"
            size="xs"
            variant="ghost"
            color="error"
            class="ms-auto"
            @click="draft.steps.splice(i, 1)"
          >
            Remove
          </UButton>
        </div>
        <UInput
          v-model="s.subject"
          size="sm"
          placeholder="Subject (follow-ups in the same thread are sent as Re: the first subject)"
        />
        <UTextarea
          v-model="s.body"
          :rows="6"
          class="w-full"
        />
      </div>
      <div class="flex gap-2">
        <UButton
          size="sm"
          variant="outline"
          :disabled="draft.steps.length >= 10"
          @click="draft.steps.push({ delayDays: 3, subject: '', body: '' })"
        >
          Add step
        </UButton>
        <UButton
          size="sm"
          @click="save"
        >
          Save draft
        </UButton>
      </div>
    </section>

    <section
      v-for="s in data?.sequences"
      :key="s.id"
      class="space-y-3 rounded-[6px] border border-(--line) bg-(--card) p-4 text-sm"
    >
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="font-semibold text-(--ink)">
          {{ s.name }}
        </h3>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
          :class="s.status === 'running' ? 'bg-success/10 text-success' : s.status === 'reviewed' ? 'bg-(--ice) text-(--signal)' : 'bg-(--paper) text-(--ink2)'"
        >{{ s.status }}</span>
        <span class="text-xs text-(--ink2)">{{ s.steps.length }} step(s) · {{ Object.entries(s.enrollments).map(([k, v]) => `${v} ${k}`).join(' · ') || 'nobody enrolled' }}</span>
        <div class="ms-auto flex flex-wrap gap-1.5">
          <UButton
            size="xs"
            variant="ghost"
            :disabled="s.status === 'running'"
            @click="editSeq(s)"
          >
            Edit
          </UButton>
          <UButton
            v-if="s.status === 'draft' || s.status === 'paused'"
            size="xs"
            variant="outline"
            :disabled="previewFor.seq !== s.id || !preview"
            title="Preview it for a prospect first"
            @click="act(s.id, 'review')"
          >
            Mark reviewed
          </UButton>
          <UButton
            v-if="s.status === 'reviewed' || (s.status === 'paused' && s.reviewedAt)"
            size="xs"
            icon="i-lucide-play"
            @click="act(s.id, 'start')"
          >
            Start
          </UButton>
          <UButton
            v-if="s.status === 'running'"
            size="xs"
            color="warning"
            icon="i-lucide-pause"
            @click="act(s.id, 'pause')"
          >
            Pause
          </UButton>
          <UButton
            v-if="s.status !== 'running'"
            size="xs"
            variant="ghost"
            color="error"
            @click="act(s.id, 'delete')"
          >
            Delete
          </UButton>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span>Enroll list</span>
        <select
          v-model="enrollList[s.id]"
          class="rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
        >
          <option value="">
            choose…
          </option>
          <option
            v-for="l in lists?.lists"
            :key="l.id"
            :value="l.id"
          >
            {{ l.name }} ({{ l.count }})
          </option>
        </select>
        <UButton
          size="xs"
          variant="outline"
          :disabled="!enrollList[s.id]"
          @click="act(s.id, 'enroll', { listId: enrollList[s.id] })"
        >
          Enroll
        </UButton>
        <span class="text-(--ink2)">Only verified (valid/risky), unsuppressed prospects are enrolled.</span>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span>Preview for</span>
        <select
          class="max-w-xs rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          @change="previewFor.seq = s.id; previewFor.prospect = Number(($event.target as HTMLSelectElement).value); loadPreview()"
        >
          <option value="">
            choose a prospect…
          </option>
          <option
            v-for="p in prospects?.prospects"
            :key="p.id"
            :value="p.id"
          >
            {{ [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email }}{{ p.company ? ` · ${p.company}` : '' }}
          </option>
        </select>
      </div>
      <div
        v-if="preview && previewFor.seq === s.id"
        class="space-y-3 rounded-[6px] bg-(--paper) p-3"
      >
        <p class="text-xs">
          To {{ preview.to ?? '—' }} · {{ preview.timezone }} ·
          <span :class="preview.sendable ? 'text-success' : 'text-error'">{{ preview.sendable ? 'sendable' : `not sendable: ${preview.blocked ?? 'status'}` }}</span>
        </p>
        <div
          v-for="(st, i) in preview.steps"
          :key="i"
          class="rounded-[4px] border border-(--line) bg-(--card) p-3"
        >
          <p class="text-xs text-(--ink2)">
            Day {{ st.day }} · Step {{ i + 1 }}
            <span
              v-if="st.missing.length"
              class="text-error"
            >· missing: {{ st.missing.join(', ') }}</span>
          </p>
          <p class="mt-1 font-semibold">
            {{ st.subject }}
          </p>
          <pre class="mt-1 whitespace-pre-wrap font-sans text-sm text-(--ink)">{{ st.body }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>
