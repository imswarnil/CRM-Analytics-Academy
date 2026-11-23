<script setup lang="ts">
/**
 * Prospects and lists: filter, group into lists, import/export CSV, and one
 * prospect's timeline with its actions (find/verify email, do-not-contact,
 * convert to lead, delete for GDPR).
 */
const props = defineProps<{ finder: boolean, verifier: boolean }>()

interface Prospect { id: number, firstName: string | null, lastName: string | null, title: string | null, email: string | null, emailStatus: string | null, emailDetail: string | null, linkedin: string | null, country: string | null, timezone: string | null, source: string, lawfulBasis: string, status: string, leadId: number | null, company: string | null, domain: string | null, createdAt: string }
interface Detail { prospect: Prospect, activity: { kind: string, detail: string | null, at: string }[], lists: { id: number, name: string }[], enrollments: { id: number, sequence: string, status: string, step: number, nextAt: string }[] }

const filter = reactive({ q: '', status: '', list: '' as number | '' })
const { data, refresh, status: loading } = await useLazyAsyncData('prospects', () => $fetch<{ prospects: Prospect[] }>('/api/admin/prospecting/prospects', { query: { q: filter.q || undefined, status: filter.status || undefined, list: filter.list || undefined } }), { server: false, watch: [() => filter.status, () => filter.list] })
const { data: lists, refresh: refreshLists } = await useLazyAsyncData('prospect-lists', () => $fetch<{ lists: { id: number, name: string, count: number }[] }>('/api/admin/prospecting/lists'), { server: false })

const selected = ref<Set<number>>(new Set())
function toggle(id: number) {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selected.value = s
}
const message = ref<string | null>(null)
const err = (e: unknown) => (e as { statusMessage?: string }).statusMessage ?? String(e)

// ---- lists ----
const newList = ref('')
async function createList() {
  if (!newList.value.trim()) return
  await $fetch('/api/admin/prospecting/lists', { method: 'POST', body: { action: 'create', name: newList.value } })
  newList.value = ''
  await refreshLists()
}
const addTo = ref<number | ''>('')
async function addSelected() {
  if (!addTo.value || !selected.value.size) return
  await $fetch('/api/admin/prospecting/lists', { method: 'POST', body: { action: 'add', id: addTo.value, prospectIds: [...selected.value] } })
  message.value = `Added ${selected.value.size} to the list`
  selected.value = new Set()
  await refreshLists()
}
async function deleteList(id: number) {
  if (!confirm('Delete this list? The prospects stay.')) return
  await $fetch('/api/admin/prospecting/lists', { method: 'POST', body: { action: 'delete', id } })
  if (filter.list === id) filter.list = ''
  await refreshLists()
}
const importSource = ref('')
const importList = ref<number | ''>('')
async function importCsv(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!importSource.value.trim()) {
    message.value = 'Say where the CSV came from first (source) — GDPR needs it.'
    return
  }
  try {
    const r = await $fetch<{ created: number, existing: number, skipped: number }>('/api/admin/prospecting/lists', { method: 'POST', body: { action: 'import', id: importList.value || undefined, csv: await file.text(), source: importSource.value } })
    message.value = `Imported: ${r.created} new, ${r.existing} already known, ${r.skipped} skipped`
    await Promise.all([refresh(), refreshLists()])
  } catch (x) {
    message.value = err(x)
  } finally {
    (e.target as HTMLInputElement).value = ''
  }
}

// ---- one prospect ----
const openId = ref<number | null>(null)
const detail = ref<Detail | null>(null)
async function open(id: number) {
  openId.value = id
  detail.value = await $fetch<Detail>('/api/admin/prospecting/prospects', { query: { id } })
}
const acting = ref(false)
async function act(action: string, extra: Record<string, unknown> = {}) {
  if (!openId.value) return
  if (action === 'delete' && !confirm('Delete this prospect and all their activity (GDPR erasure)?')) return
  acting.value = true
  try {
    const r = await $fetch<Record<string, unknown>>('/api/admin/prospecting/prospects', { method: 'POST', body: { action, id: openId.value, ...extra } })
    message.value = action === 'verify' ? `Verified: ${r.status} (${r.detail})` : action === 'find_email' ? (r.email ? `Found ${r.email} (${r.status})` : 'No email found') : action === 'convert' ? `Lead #${r.leadId} created and sent to Salesforce` : 'Done'
    if (action === 'delete') {
      openId.value = null
      detail.value = null
    } else {
      await open(openId.value)
    }
    await refresh()
  } catch (x) {
    message.value = err(x)
  } finally {
    acting.value = false
  }
}
const note = ref('')
const edit = reactive({ email: '', timezone: '' })
watch(detail, (d) => {
  edit.email = d?.prospect.email ?? ''
  edit.timezone = d?.prospect.timezone ?? ''
})
const STATUS_CLASS: Record<string, string> = { valid: 'text-success', risky: 'text-warning', invalid: 'text-error', unknown: 'text-(--ink2)' }
const when = (d: string) => new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[1fr_20rem]">
    <div class="min-w-0 space-y-3">
      <form
        class="flex flex-wrap gap-2"
        @submit.prevent="refresh()"
      >
        <UInput
          v-model="filter.q"
          size="sm"
          placeholder="Search name, email, company"
        />
        <select
          v-model="filter.status"
          class="rounded-[4px] border border-(--line) bg-(--card) px-2 text-sm"
        >
          <option value="">
            any status
          </option>
          <option
            v-for="s in ['new', 'active', 'replied', 'bounced', 'unsubscribed', 'converted', 'do_not_contact']"
            :key="s"
            :value="s"
          >
            {{ s.replace(/_/g, ' ') }}
          </option>
        </select>
        <select
          v-model="filter.list"
          class="rounded-[4px] border border-(--line) bg-(--card) px-2 text-sm"
        >
          <option value="">
            all prospects
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
          type="submit"
          size="sm"
          variant="outline"
        >
          Filter
        </UButton>
      </form>
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span>{{ selected.size }} selected</span>
        <select
          v-model="addTo"
          class="rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
        >
          <option value="">
            add to list…
          </option>
          <option
            v-for="l in lists?.lists"
            :key="l.id"
            :value="l.id"
          >
            {{ l.name }}
          </option>
        </select>
        <UButton
          size="xs"
          :disabled="!addTo || !selected.size"
          @click="addSelected"
        >
          Add
        </UButton>
      </div>
      <p
        v-if="message"
        class="text-xs text-(--ink)"
      >
        {{ message }}
      </p>
      <p
        v-if="loading !== 'pending' && !data?.prospects.length"
        class="border border-dashed border-(--line) p-8 text-center text-sm text-(--ink2)"
      >
        No prospects yet. Find people at a saved company, or import a CSV.
      </p>
      <div
        v-else
        class="overflow-x-auto rounded-[6px] border border-(--line) bg-(--card)"
      >
        <table class="w-full text-sm">
          <tbody>
            <tr
              v-for="p in data?.prospects"
              :key="p.id"
              class="cursor-pointer border-t border-(--line) first:border-t-0 hover:bg-(--paper)"
              :class="openId === p.id ? 'bg-(--paper)' : ''"
              @click="open(p.id)"
            >
              <td
                class="p-2"
                @click.stop
              >
                <input
                  type="checkbox"
                  :checked="selected.has(p.id)"
                  @change="toggle(p.id)"
                >
              </td>
              <td class="p-2 font-semibold">
                {{ [p.firstName, p.lastName].filter(Boolean).join(' ') || '—' }}
              </td>
              <td class="p-2 text-(--ink2)">
                {{ p.title }}<template v-if="p.company">
                  · {{ p.company }}
                </template>
              </td>
              <td class="p-2">
                {{ p.email ?? '—' }} <span
                  v-if="p.emailStatus"
                  class="text-xs"
                  :class="STATUS_CLASS[p.emailStatus]"
                >{{ p.emailStatus }}</span>
              </td>
              <td class="p-2 text-xs text-(--ink2)">
                {{ p.status.replace(/_/g, ' ') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <aside class="space-y-4">
      <section
        v-if="detail"
        class="space-y-2 rounded-[6px] border border-(--line) bg-(--card) p-3 text-sm"
      >
        <div class="flex items-start gap-2">
          <p class="flex-1 font-semibold text-(--ink)">
            {{ [detail.prospect.firstName, detail.prospect.lastName].filter(Boolean).join(' ') || 'Prospect' }}
            <span class="block text-xs font-normal text-(--ink2)">{{ detail.prospect.title }}<template v-if="detail.prospect.company"> · {{ detail.prospect.company }}</template></span>
          </p>
          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            aria-label="Close"
            @click="detail = null; openId = null"
          />
        </div>
        <p class="text-xs">
          {{ detail.prospect.email ?? 'no email' }}
          <span
            v-if="detail.prospect.emailStatus"
            :class="STATUS_CLASS[detail.prospect.emailStatus]"
          >· {{ detail.prospect.emailStatus }}</span>
          <span
            v-if="detail.prospect.emailDetail"
            class="block text-(--ink2)"
          >{{ detail.prospect.emailDetail }}</span>
        </p>
        <p class="text-xs text-(--ink2)">
          Status {{ detail.prospect.status.replace(/_/g, ' ') }} · source: {{ detail.prospect.source }} · basis: {{ detail.prospect.lawfulBasis.replace(/_/g, ' ') }}
          <template v-if="detail.prospect.leadId">
            · lead #{{ detail.prospect.leadId }}
          </template>
        </p>
        <div class="flex flex-wrap gap-1.5">
          <UButton
            size="xs"
            variant="outline"
            :disabled="!props.finder || acting"
            @click="act('find_email')"
          >
            Find email
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            :disabled="!props.verifier || !detail.prospect.email || acting"
            @click="act('verify')"
          >
            Verify
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            :disabled="!!detail.prospect.leadId || !detail.prospect.email || acting"
            @click="act('convert')"
          >
            Convert to lead
          </UButton>
          <UButton
            v-if="detail.prospect.status !== 'do_not_contact'"
            size="xs"
            variant="outline"
            color="warning"
            :disabled="acting"
            @click="act('status', { status: 'do_not_contact' })"
          >
            Do not contact
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="error"
            :disabled="acting"
            @click="act('delete', { suppress: true })"
          >
            Delete (GDPR)
          </UButton>
        </div>
        <p
          v-if="!props.finder || !props.verifier"
          class="text-[11px] text-(--ink2)"
        >
          Finding and verifying emails needs a provider: set HUNTER_API_KEY.
        </p>
        <form
          class="flex gap-1.5"
          @submit.prevent="act('update', { email: edit.email || null, timezone: edit.timezone || null })"
        >
          <UInput
            v-model="edit.email"
            size="xs"
            placeholder="email"
            class="flex-1"
          />
          <UInput
            v-model="edit.timezone"
            size="xs"
            placeholder="Europe/London"
            class="w-28"
          />
          <UButton
            type="submit"
            size="xs"
            variant="ghost"
          >
            Save
          </UButton>
        </form>
        <p
          v-if="detail.lists.length || detail.enrollments.length"
          class="text-xs text-(--ink2)"
        >
          <template v-if="detail.lists.length">
            Lists: {{ detail.lists.map(l => l.name).join(', ') }}.
          </template>
          <template
            v-for="e in detail.enrollments"
            :key="e.id"
          >
            {{ e.sequence }}: {{ e.status }}, step {{ e.step + 1 }}<template v-if="e.status === 'active'">
              due {{ when(e.nextAt) }}
            </template>.
          </template>
        </p>
        <form
          class="flex gap-1.5"
          @submit.prevent="act('note', { text: note }).then(() => { note = '' })"
        >
          <UInput
            v-model="note"
            size="xs"
            placeholder="Add a note (call, LinkedIn message…)"
            class="flex-1"
          />
          <UButton
            type="submit"
            size="xs"
            variant="ghost"
          >
            Add
          </UButton>
        </form>
        <ol class="max-h-80 space-y-1.5 overflow-y-auto border-t border-(--line) pt-2">
          <li
            v-for="(a, i) in detail.activity"
            :key="i"
            class="text-xs"
          >
            <span class="font-semibold text-(--ink)">{{ a.kind.replace(/_/g, ' ') }}</span>
            <span class="text-(--ink2)"> · {{ when(a.at) }}</span>
            <span
              v-if="a.detail"
              class="block text-(--ink2)"
            >{{ a.detail }}</span>
          </li>
        </ol>
      </section>

      <section class="space-y-2 rounded-[6px] border border-(--line) bg-(--card) p-3 text-sm">
        <h3 class="font-semibold text-(--ink)">
          Lists
        </h3>
        <ul class="space-y-1 text-xs">
          <li
            v-for="l in lists?.lists"
            :key="l.id"
            class="flex items-center gap-2"
          >
            <button
              type="button"
              class="flex-1 text-left hover:underline"
              @click="filter.list = l.id"
            >
              {{ l.name }} ({{ l.count }})
            </button>
            <a
              :href="`/api/admin/prospecting/lists?export=${l.id}`"
              class="text-(--signal) hover:underline"
            >CSV</a>
            <button
              type="button"
              class="text-(--ink2) hover:text-error"
              @click="deleteList(l.id)"
            >
              delete
            </button>
          </li>
        </ul>
        <form
          class="flex gap-1.5"
          @submit.prevent="createList"
        >
          <UInput
            v-model="newList"
            size="xs"
            placeholder="New list name"
            class="flex-1"
          />
          <UButton
            type="submit"
            size="xs"
          >
            Create
          </UButton>
        </form>
        <a
          href="/api/admin/prospecting/lists?export=all"
          class="block text-xs text-(--signal) hover:underline"
        >Export all prospects (CSV)</a>
        <div class="space-y-1.5 border-t border-(--line) pt-2 text-xs">
          <p class="font-semibold text-(--ink)">
            Import CSV
          </p>
          <p class="text-(--ink2)">
            Columns: first_name, last_name (or name), email, title, company, domain, linkedin, country, timezone.
          </p>
          <UInput
            v-model="importSource"
            size="xs"
            placeholder="Source, e.g. Dreamforce 2026 attendee list"
          />
          <select
            v-model="importList"
            class="w-full rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
          >
            <option value="">
              (no list)
            </option>
            <option
              v-for="l in lists?.lists"
              :key="l.id"
              :value="l.id"
            >
              into: {{ l.name }}
            </option>
          </select>
          <input
            type="file"
            accept=".csv,text/csv"
            class="block w-full text-xs"
            @change="importCsv"
          >
        </div>
      </section>
    </aside>
  </div>
</template>
