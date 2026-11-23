<script setup lang="ts">
/** People at a company by title and seniority (Apollo or Hunter), saved as prospects. */
const props = defineProps<{ enabled: boolean, domain: string }>()

interface Person { provider: string, providerId: string | null, firstName: string | null, lastName: string | null, title: string | null, seniority: string | null, email: string | null, emailStatus: string | null, linkedin: string | null, country: string | null, city: string | null, company: string | null, domain: string | null, saved: boolean }

const DEFAULT_TITLES = ['CRM Analytics', 'Tableau CRM', 'Einstein Analytics', 'Salesforce Admin', 'Salesforce Administrator', 'Salesforce Architect', 'Salesforce Developer', 'RevOps', 'Revenue Operations', 'BI Lead', 'Analytics Lead', 'Head of Analytics', 'Sales Operations', 'Sales Ops', 'Learning and Development', 'L&D', 'Training Manager']
const SENIORITIES = ['owner', 'founder', 'c_suite', 'vp', 'head', 'director', 'manager', 'senior', 'entry']
const form = reactive({ domain: props.domain, titles: DEFAULT_TITLES.join(', '), seniorities: [] as string[], page: 1 })
watch(() => props.domain, (d) => {
  form.domain = d
})
const people = ref<Person[]>([])
const provider = ref('')
const busy = ref(false)
const message = ref<string | null>(null)
const selected = ref<Set<number>>(new Set())
const { data: lists } = await useLazyAsyncData('prospect-lists-people', () => $fetch<{ lists: { id: number, name: string }[] }>('/api/admin/prospecting/lists'), { server: false })
const listId = ref<number | ''>('')

async function search(page = 1) {
  busy.value = true
  message.value = null
  form.page = page
  try {
    const r = await $fetch<{ provider: string, people: Person[] }>('/api/admin/prospecting/people', {
      method: 'POST',
      body: { domain: form.domain, titles: form.titles.split(',').map(t => t.trim()).filter(Boolean), seniorities: form.seniorities, page }
    })
    people.value = r.people
    provider.value = r.provider
    selected.value = new Set(r.people.map((p, i) => (p.saved ? -1 : i)).filter(i => i >= 0))
    message.value = `${r.people.length} from ${r.provider}`
  } catch (e) {
    message.value = (e as { statusMessage?: string }).statusMessage ?? String(e)
  } finally {
    busy.value = false
  }
}
function toggle(i: number) {
  const s = new Set(selected.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
  selected.value = s
}
async function save() {
  const chosen = people.value.filter((_, i) => selected.value.has(i))
  if (!chosen.length) return
  const r = await $fetch<{ created: number, existing: number, skipped: number }>('/api/admin/prospecting/prospects', {
    method: 'POST',
    body: { action: 'save', people: chosen, source: `${provider.value} people search (${form.domain})`, listId: listId.value || null }
  })
  message.value = `Saved: ${r.created} new, ${r.existing} already prospects, ${r.skipped} skipped (no email and no name + domain)`
  for (const p of chosen) p.saved = true
  selected.value = new Set()
}
</script>

<template>
  <div class="space-y-4">
    <form
      class="grid gap-3 rounded-[6px] border border-(--line) bg-(--card) p-4 md:grid-cols-4"
      @submit.prevent="search(1)"
    >
      <p
        v-if="!props.enabled"
        class="text-sm text-(--ink2) md:col-span-4"
      >
        Connect a provider for people search: set <code>APOLLO_API_KEY</code> or <code>HUNTER_API_KEY</code>.
      </p>
      <UInput
        v-model="form.domain"
        placeholder="company.com"
      />
      <UTextarea
        v-model="form.titles"
        :rows="2"
        class="md:col-span-3"
        placeholder="Titles, comma separated"
      />
      <div class="flex flex-wrap gap-3 text-xs md:col-span-3">
        <label
          v-for="s in SENIORITIES"
          :key="s"
          class="flex items-center gap-1"
        ><input
          v-model="form.seniorities"
          type="checkbox"
          :value="s"
        > {{ s.replace('_', '-') }}</label>
      </div>
      <UButton
        type="submit"
        icon="i-lucide-search"
        :loading="busy"
        :disabled="!props.enabled || !form.domain"
      >
        Find people
      </UButton>
    </form>
    <p
      v-if="message"
      class="text-xs text-(--ink2)"
    >
      {{ message }}
    </p>

    <div
      v-if="people.length"
      class="rounded-[6px] border border-(--line) bg-(--card)"
    >
      <div class="flex flex-wrap items-center gap-2 border-b border-(--line) p-2 text-xs">
        <UButton
          size="xs"
          :disabled="!selected.size"
          @click="save"
        >
          Save {{ selected.size }} as prospects
        </UButton>
        <select
          v-model="listId"
          class="rounded-[4px] border border-(--line) bg-(--card) px-2 py-1"
        >
          <option value="">
            (no list)
          </option>
          <option
            v-for="l in lists?.lists"
            :key="l.id"
            :value="l.id"
          >
            add to: {{ l.name }}
          </option>
        </select>
        <span class="text-(--ink2)">Source and lawful basis (legitimate interest, B2B) are recorded on each prospect.</span>
        <UButton
          size="xs"
          variant="ghost"
          class="ms-auto"
          @click="search(form.page + 1)"
        >
          Next page
        </UButton>
      </div>
      <table class="w-full text-sm">
        <tbody>
          <tr
            v-for="(p, i) in people"
            :key="i"
            class="border-t border-(--line)"
          >
            <td class="p-2">
              <input
                type="checkbox"
                :checked="selected.has(i)"
                :disabled="p.saved"
                @change="toggle(i)"
              >
            </td>
            <td class="p-2 font-semibold">
              {{ [p.firstName, p.lastName].filter(Boolean).join(' ') || '—' }}
            </td>
            <td class="p-2 text-(--ink2)">
              {{ p.title }}
            </td>
            <td class="p-2 text-(--ink2)">
              {{ p.seniority }}
            </td>
            <td class="p-2">
              {{ p.email ?? 'no email yet' }}<span
                v-if="p.emailStatus"
                class="ms-1 text-xs text-(--ink2)"
              >({{ p.emailStatus }})</span>
            </td>
            <td class="p-2 text-xs text-(--ink2)">
              {{ p.saved ? 'saved' : '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
