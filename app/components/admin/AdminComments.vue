<script setup lang="ts">
/** Comment moderation: recent comments across all lessons, hide or restore. */
interface Row {
  id: number
  path: string
  isReply: boolean
  body: string
  status: string
  createdAt: string
  name: string | null
  email: string | null
}

const status = ref<'visible' | 'hidden'>('visible')
const rows = ref<Row[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    rows.value = (await $fetch<{ comments: Row[] }>('/api/admin/comments', { query: { status: status.value } })).comments
  } finally {
    loading.value = false
  }
}
watch(status, load)
onMounted(load)

async function setStatus(r: Row, s: 'visible' | 'hidden') {
  await $fetch('/api/admin/comments', { method: 'PATCH', body: { id: r.id, status: s } })
  await load()
}
</script>

<template>
  <section>
    <div class="mb-4 flex items-center gap-2">
      <UButton
        v-for="s in (['visible', 'hidden'] as const)"
        :key="s"
        size="sm"
        class="capitalize"
        :color="status === s ? 'primary' : 'neutral'"
        :variant="status === s ? 'soft' : 'ghost'"
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
    <UEmpty
      v-if="!loading && !rows.length"
      icon="i-lucide-messages-square"
      :title="`No ${status} comments`"
    />
    <div class="space-y-3">
      <UCard
        v-for="r in rows"
        :key="r.id"
      >
        <div class="flex flex-wrap items-start gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm">
              <span class="font-semibold text-(--ink)">{{ r.name || 'Anonymous' }}</span>
              <span class="ms-2 text-xs text-(--ink2)">{{ r.email }} · {{ new Date(r.createdAt).toLocaleString() }}</span>
            </p>
            <NuxtLink
              :to="r.path"
              class="font-mono text-xs text-primary hover:underline"
            >{{ r.path }}{{ r.isReply ? ' · reply' : '' }}</NuxtLink>
            <p class="mt-2 whitespace-pre-line break-words text-sm text-(--ink)">
              {{ r.body }}
            </p>
          </div>
          <UButton
            v-if="r.status === 'visible'"
            size="xs"
            color="error"
            variant="soft"
            icon="i-lucide-eye-off"
            @click="setStatus(r, 'hidden')"
          >
            Hide
          </UButton>
          <UButton
            v-else
            size="xs"
            variant="soft"
            icon="i-lucide-eye"
            @click="setStatus(r, 'visible')"
          >
            Restore
          </UButton>
        </div>
      </UCard>
    </div>
  </section>
</template>
