<script setup lang="ts">
// Generic admin CRUD grid: pick a table, edit allowlisted fields inline, or
// delete a row. Backed by /api/admin/records (read) + /api/admin/mutate
// (write) — both admin-only and field-allowlisted server-side, so this UI
// can stay dumb: it just renders whatever columns the table config lists.
interface Column {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  readonly?: boolean
}
interface TableConfig {
  label: string
  icon: string
  columns: Column[]
}

const TABLES: Record<string, TableConfig> = {
  resources: {
    label: 'Resources',
    icon: 'i-lucide-library-big',
    columns: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] }
    ]
  },
  comments: {
    label: 'Comments',
    icon: 'i-lucide-message-circle',
    columns: [
      { key: 'page_path', label: 'Page', type: 'text', readonly: true },
      { key: 'body', label: 'Comment', type: 'textarea' }
    ]
  },
  feedback: {
    label: 'Feedback',
    icon: 'i-lucide-message-square-heart',
    columns: [
      { key: 'subject', label: 'Subject', type: 'text', readonly: true },
      { key: 'message', label: 'Message', type: 'textarea', readonly: true },
      { key: 'category', label: 'Category', type: 'text', readonly: true },
      { key: 'status', label: 'Status', type: 'select', options: ['open', 'resolved'] }
    ]
  },
  guestbook: {
    label: 'Guestbook',
    icon: 'i-lucide-book-heart',
    columns: [
      { key: 'name', label: 'Name', type: 'text', readonly: true },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['visible', 'hidden'] }
    ]
  },
  profiles: {
    label: 'Profiles',
    icon: 'i-lucide-users',
    columns: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'full_name', label: 'Full name', type: 'text' },
      { key: 'role', label: 'Role', type: 'select', options: ['member', 'admin'] }
    ]
  }
}

type Row = Record<string, unknown> & { id: string, created_at?: string, author?: { username: string | null, full_name: string | null } | null }

const tableNames = Object.keys(TABLES)
const active = ref(tableNames[0] as string)
const config = computed(() => TABLES[active.value]!)

const { data, pending, refresh } = await useAsyncData<{ rows: Row[] }>(
  () => `admin-records-${active.value}`,
  () => $fetch('/api/admin/records', { query: { table: active.value } }),
  { watch: [active], default: () => ({ rows: [] }) }
)

const editingId = ref('')
const drafts = reactive<Record<string, unknown>>({})
const busy = ref('')
const toast = useToast()

function startEdit(row: Row) {
  editingId.value = row.id
  for (const col of config.value.columns) drafts[col.key] = row[col.key]
}

function cancelEdit() {
  editingId.value = ''
}

async function save(id: string) {
  busy.value = id
  try {
    const patch: Record<string, unknown> = {}
    for (const col of config.value.columns) {
      if (!col.readonly) patch[col.key] = drafts[col.key]
    }
    await $fetch('/api/admin/mutate', { method: 'POST', body: { action: 'update', table: active.value, id, patch } })
    editingId.value = ''
    await refresh()
    toast.add({ title: 'Saved', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Save failed', description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage, color: 'error' })
  } finally {
    busy.value = ''
  }
}

async function remove(id: string) {
  busy.value = id
  try {
    await $fetch('/api/admin/mutate', { method: 'POST', body: { action: 'delete', table: active.value, id } })
    await refresh()
  } finally {
    busy.value = ''
  }
}

const authorName = (r: Row) => r.author?.full_name || r.author?.username || null
const preview = (v: unknown) => (typeof v === 'string' && v.length > 80 ? `${v.slice(0, 80)}…` : v)
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-2">
      <UButton
        v-for="name in tableNames"
        :key="name"
        :color="active === name ? 'primary' : 'neutral'"
        :variant="active === name ? 'solid' : 'soft'"
        size="sm"
        :icon="TABLES[name]!.icon"
        @click="active = name"
      >
        {{ TABLES[name]!.label }}
      </UButton>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-10"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-6 animate-spin text-primary"
      />
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="row in data?.rows"
        :key="row.id"
        class="rounded-xl border border-default p-4"
      >
        <template v-if="editingId === row.id">
          <div class="space-y-3">
            <UFormField
              v-for="col in config.columns"
              :key="col.key"
              :label="col.label"
            >
              <USelect
                v-if="col.type === 'select'"
                v-model="drafts[col.key] as string"
                :items="col.options"
                :disabled="col.readonly"
                class="w-full"
              />
              <UTextarea
                v-else-if="col.type === 'textarea'"
                v-model="drafts[col.key] as string"
                :rows="3"
                autoresize
                :disabled="col.readonly"
                class="w-full"
              />
              <UInput
                v-else
                v-model="drafts[col.key] as string"
                :disabled="col.readonly"
                class="w-full"
              />
            </UFormField>
            <div class="flex gap-2">
              <UButton
                size="sm"
                icon="i-lucide-check"
                :loading="busy === row.id"
                @click="save(row.id)"
              >
                Save
              </UButton>
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                @click="cancelEdit"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-0.5">
              <div
                v-for="col in config.columns"
                :key="col.key"
                class="truncate text-sm"
              >
                <span class="text-dimmed">{{ col.label }}:</span>
                <span class="ml-1 text-default">{{ preview(row[col.key]) ?? '—' }}</span>
              </div>
              <p class="pt-1 text-xs text-dimmed">
                <span v-if="authorName(row)">by {{ authorName(row) }} · </span>{{ row.created_at ? new Date(row.created_at as string).toLocaleDateString() : '' }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-pencil"
                @click="startEdit(row)"
              >
                Edit
              </UButton>
              <UButton
                size="sm"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :loading="busy === row.id"
                @click="remove(row.id)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </template>
      </div>

      <p
        v-if="!data?.rows.length"
        class="py-8 text-center text-sm text-muted"
      >
        No rows in {{ config.label.toLowerCase() }}.
      </p>
    </div>
  </div>
</template>
