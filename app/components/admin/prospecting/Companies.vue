<script setup lang="ts">
/** Company search (Apollo) and saved companies with their domain enrichment. */
const props = defineProps<{ enabled: boolean }>()
const emit = defineEmits<{ people: [domain: string] }>()

interface Hit { provider: string, providerId: string | null, name: string, domain: string | null, website: string | null, linkedin: string | null, industry: string | null, size: number | null, country: string | null, city: string | null, usesSalesforce: boolean | null, saved: boolean }
interface Saved { id: number, name: string, domain: string | null, industry: string | null, size: number | null, country: string | null, website: string | null, linkedin: string | null, usesSalesforce: boolean | null, prospects: number, enrichment: { company: string | null, description: string | null, logo: string | null, status: string } | null }

const SIZES = [['1,10', '1–10'], ['11,50', '11–50'], ['51,200', '51–200'], ['201,1000', '201–1,000'], ['1001,5000', '1,001–5,000'], ['5001,100000', '5,000+']]
const form = reactive({ keywords: 'salesforce, analytics', industry: '', country: '', sizes: [] as string[], usesSalesforce: true, page: 1 })
const hits = ref<Hit[]>([])
const searching = ref(false)
const message = ref<string | null>(null)
const { data: saved, refresh } = await useLazyAsyncData('prospect-companies', () => $fetch<{ companies: Saved[] }>('/api/admin/prospecting/companies'), { server: false })

async function search(page = 1) {
  searching.value = true
  message.value = null
  form.page = page
  try {
    const r = await $fetch<{ provider: string, companies: Hit[] }>('/api/admin/prospecting/companies', { method: 'POST', body: { action: 'search', ...form } })
    hits.value = r.companies
    message.value = `${r.companies.length} from ${r.provider} (page ${page}; repeated searches come from the cache)`
  } catch (e) {
    message.value = (e as { statusMessage?: string }).statusMessage ?? String(e)
  } finally {
    searching.value = false
  }
}
async function save(list: Partial<Hit>[]) {
  await $fetch('/api/admin/prospecting/companies', { method: 'POST', body: { action: 'save', companies: list } })
  for (const h of hits.value) if (list.some(l => l.domain && l.domain === h.domain)) h.saved = true
  await refresh()
}
const manual = reactive({ name: '', domain: '' })
async function addManual() {
  if (!manual.name) return
  await save([{ name: manual.name, domain: manual.domain, provider: 'manual' }])
  manual.name = ''
  manual.domain = ''
}
async function remove(id: number) {
  if (!confirm('Remove this company? Its prospects stay.')) return
  await $fetch('/api/admin/prospecting/companies', { method: 'POST', body: { action: 'delete', id } })
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <form
      class="grid gap-3 rounded-[6px] border border-(--line) bg-(--card) p-4 md:grid-cols-4"
      @submit.prevent="search(1)"
    >
      <p
        v-if="!props.enabled"
        class="text-sm text-(--ink2) md:col-span-4"
      >
        Connect a provider for company search: set <code>APOLLO_API_KEY</code> on the Worker. You can still add companies by hand below.
      </p>
      <UInput
        v-model="form.keywords"
        placeholder="Keywords (comma separated)"
        class="md:col-span-2"
      />
      <UInput
        v-model="form.industry"
        placeholder="Industry"
      />
      <UInput
        v-model="form.country"
        placeholder="Country (e.g. India)"
      />
      <div class="flex flex-wrap gap-3 text-xs md:col-span-3">
        <label
          v-for="[v, l] in SIZES"
          :key="v"
          class="flex items-center gap-1"
        ><input
          v-model="form.sizes"
          type="checkbox"
          :value="v"
        > {{ l }}</label>
        <label class="flex items-center gap-1 font-semibold"><input
          v-model="form.usesSalesforce"
          type="checkbox"
        > Uses Salesforce</label>
      </div>
      <UButton
        type="submit"
        icon="i-lucide-search"
        :loading="searching"
        :disabled="!props.enabled"
      >
        Search companies
      </UButton>
    </form>
    <p
      v-if="message"
      class="text-xs text-(--ink2)"
    >
      {{ message }}
    </p>

    <div
      v-if="hits.length"
      class="overflow-x-auto rounded-[6px] border border-(--line) bg-(--card)"
    >
      <div class="flex items-center gap-2 border-b border-(--line) p-2">
        <UButton
          size="xs"
          @click="save(hits.filter(h => !h.saved))"
        >
          Save all on this page
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          :disabled="form.page <= 1"
          @click="search(form.page - 1)"
        >
          Previous
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          @click="search(form.page + 1)"
        >
          Next page
        </UButton>
      </div>
      <table class="w-full text-sm">
        <tbody>
          <tr
            v-for="h in hits"
            :key="`${h.providerId}${h.domain}`"
            class="border-t border-(--line)"
          >
            <td class="p-2 font-semibold">
              {{ h.name }}
            </td>
            <td class="p-2 text-(--ink2)">
              {{ h.domain ?? '—' }}
            </td>
            <td class="p-2 text-(--ink2)">
              {{ h.industry ?? '' }}
            </td>
            <td class="p-2 text-(--ink2) tabular-nums">
              {{ h.size ?? '' }}
            </td>
            <td class="p-2 text-(--ink2)">
              {{ [h.city, h.country].filter(Boolean).join(', ') }}
            </td>
            <td class="p-2 text-right">
              <UButton
                size="xs"
                :variant="h.saved ? 'ghost' : 'outline'"
                :disabled="h.saved"
                @click="save([h])"
              >
                {{ h.saved ? 'Saved' : 'Save' }}
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3 class="mb-2 font-semibold text-(--ink)">
        Saved companies ({{ saved?.companies.length ?? 0 }})
      </h3>
      <form
        class="mb-3 flex flex-wrap gap-2"
        @submit.prevent="addManual"
      >
        <UInput
          v-model="manual.name"
          size="sm"
          placeholder="Company name"
        />
        <UInput
          v-model="manual.domain"
          size="sm"
          placeholder="domain.com"
        />
        <UButton
          type="submit"
          size="sm"
          variant="outline"
        >
          Add by hand
        </UButton>
      </form>
      <ul class="space-y-2">
        <li
          v-for="c in saved?.companies"
          :key="c.id"
          class="flex flex-wrap items-start gap-3 rounded-[6px] border border-(--line) bg-(--card) p-3 text-sm"
        >
          <img
            v-if="c.enrichment?.logo"
            :src="c.enrichment.logo"
            alt=""
            class="mt-0.5 size-5 rounded-[2px]"
            referrerpolicy="no-referrer"
            loading="lazy"
          >
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-(--ink)">
              {{ c.name }}
              <span class="font-normal text-(--ink2)">· {{ c.domain ?? 'no domain' }}<template v-if="c.industry"> · {{ c.industry }}</template><template v-if="c.size"> · {{ c.size }} people</template><template v-if="c.country"> · {{ c.country }}</template></span>
              <span
                v-if="c.usesSalesforce"
                class="ms-1 rounded-[4px] bg-(--ice) px-1.5 text-[11px] text-(--signal)"
              >Salesforce</span>
            </p>
            <p
              v-if="c.enrichment?.description"
              class="mt-0.5 line-clamp-2 text-xs text-(--ink2)"
            >
              {{ c.enrichment.description }}
            </p>
            <p class="mt-0.5 text-xs text-(--ink2)">
              {{ c.prospects }} prospect(s)
              <a
                v-if="c.website"
                :href="c.website"
                target="_blank"
                rel="noopener noreferrer"
                class="ms-2 text-(--signal) hover:underline"
              >website</a>
              <a
                v-if="c.linkedin"
                :href="c.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="ms-2 text-(--signal) hover:underline"
              >LinkedIn</a>
            </p>
          </div>
          <UButton
            v-if="c.domain"
            size="xs"
            icon="i-lucide-user-search"
            @click="emit('people', c.domain)"
          >
            Find people
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            aria-label="Remove"
            @click="remove(c.id)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
