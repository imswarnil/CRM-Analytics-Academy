<script setup lang="ts">
/**
 * The enquiries inbox: classroom enrollments, team quotations and
 * implementation requests sent from /training, /teams and /implementation.
 */
interface Inquiry {
  id: number
  kind: 'enrollment' | 'quotation' | 'implementation'
  name: string
  email: string
  company: string | null
  phone: string | null
  message: string | null
  details: Record<string, string>
  status: string
  note: string | null
  createdAt: string
}

const STATUSES = ['new', 'contacted', 'won', 'closed'] as const
const KIND_META = {
  enrollment: { label: 'Enrollment', icon: 'i-lucide-ticket', color: 'primary' },
  quotation: { label: 'Quotation', icon: 'i-lucide-file-text', color: 'secondary' },
  implementation: { label: 'Implementation', icon: 'i-lucide-wrench', color: 'warning' }
} as const

const status = ref<typeof STATUSES[number]>('new')
const items = ref<Inquiry[]>([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ inquiries: Inquiry[] }>('/api/admin/inquiries', { query: { status: status.value } })
    items.value = res.inquiries
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage || 'Could not load enquiries.'
  } finally {
    loading.value = false
  }
}

async function move(item: Inquiry, next: string) {
  try {
    await $fetch('/api/admin/inquiries', { method: 'PATCH', body: { id: item.id, status: next } })
    await load()
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage || 'Could not update.'
  }
}

watch(status, load)
onMounted(load)
</script>

<template>
  <section>
    <div class="mb-5 flex flex-wrap items-center gap-2">
      <UButton
        v-for="s in STATUSES"
        :key="s"
        size="sm"
        :color="status === s ? 'primary' : 'neutral'"
        :variant="status === s ? 'soft' : 'ghost'"
        class="capitalize"
        @click="status = s"
      >
        {{ s }}
      </UButton>
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="loading"
        class="ms-auto"
        @click="load"
      />
    </div>

    <p
      v-if="error"
      class="mb-4 text-sm text-error"
      role="alert"
    >
      {{ error }}
    </p>

    <UEmpty
      v-if="!loading && !items.length"
      icon="i-lucide-inbox"
      :title="`No ${status} enquiries`"
      description="Requests from the training, teams and implementation pages land here."
    />

    <div class="space-y-3">
      <UCard
        v-for="item in items"
        :key="item.id"
      >
        <div class="flex flex-wrap items-start gap-3">
          <UBadge
            :color="KIND_META[item.kind].color"
            variant="soft"
            :icon="KIND_META[item.kind].icon"
          >
            {{ KIND_META[item.kind].label }}
          </UBadge>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-(--ink)">
              {{ item.name }}
              <span
                v-if="item.company"
                class="font-normal text-(--ink2)"
              >· {{ item.company }}</span>
            </p>
            <p class="text-sm text-(--ink2)">
              <a
                :href="`mailto:${item.email}`"
                class="text-primary hover:underline"
              >{{ item.email }}</a>
              <span v-if="item.phone"> · {{ item.phone }}</span>
              · {{ new Date(item.createdAt).toLocaleString() }}
            </p>
          </div>
          <USelect
            :model-value="(item.status as typeof STATUSES[number])"
            :items="[...STATUSES]"
            size="sm"
            class="w-32"
            @update:model-value="(v: string) => move(item, v)"
          />
        </div>

        <dl
          v-if="Object.keys(item.details).length"
          class="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2"
        >
          <div
            v-for="(v, k) in item.details"
            :key="k"
            class="flex gap-2"
          >
            <dt class="im-meta shrink-0 pt-0.5 text-(--ink2)">
              {{ k }}
            </dt>
            <dd class="text-(--ink)">
              {{ v }}
            </dd>
          </div>
        </dl>

        <p
          v-if="item.message"
          class="mt-4 whitespace-pre-line border border-dashed border-(--line) bg-(--ice) px-4 py-3 text-sm text-(--ink)"
        >
          {{ item.message }}
        </p>
      </UCard>
    </div>
  </section>
</template>
