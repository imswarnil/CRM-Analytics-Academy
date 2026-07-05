<script setup lang="ts">
interface ReplyAuthor {
  username: string | null
  full_name: string | null
  role?: 'member' | 'admin'
}
interface Reply {
  id: string
  body: string
  created_at: string
  user_id: string | null
  author: ReplyAuthor | null
}
export interface FeedbackThread {
  id: string
  subject: string | null
  message: string
  category: string
  status: 'open' | 'resolved'
  page_path: string | null
  created_at: string
  user_id: string | null
  author: { username: string | null, full_name: string | null, linkedin_url?: string | null } | null
  feedback_replies: Reply[]
}

defineProps<{ items: FeedbackThread[], admin?: boolean }>()
const emit = defineEmits<{ refresh: [] }>()

const drafts = reactive<Record<string, string>>({})
const busy = ref('')

const authorName = (a: { username: string | null, full_name: string | null } | null) =>
  a?.full_name || a?.username || 'Someone'

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const categoryColor = (c: string) =>
  c === 'bug' ? 'error' : c === 'idea' ? 'info' : c === 'content' ? 'secondary' : 'neutral'

async function sendReply(id: string) {
  const body = (drafts[id] || '').trim()
  if (!body) return
  busy.value = id
  try {
    await $fetch('/api/feedback/reply', { method: 'POST', body: { feedback_id: id, body } })
    drafts[id] = ''
    emit('refresh')
  } finally {
    busy.value = ''
  }
}

async function setStatus(id: string, status: 'open' | 'resolved') {
  busy.value = id
  try {
    await $fetch('/api/feedback/resolve', { method: 'POST', body: { id, status } })
    emit('refresh')
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div class="space-y-5">
    <article
      v-for="f in items"
      :key="f.id"
      class="rounded-2xl border border-default bg-default p-5"
    >
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          :color="categoryColor(f.category)"
          variant="subtle"
          size="sm"
          class="capitalize"
        >
          {{ f.category }}
        </UBadge>
        <UBadge
          :color="f.status === 'resolved' ? 'success' : 'warning'"
          variant="subtle"
          size="sm"
          class="capitalize"
        >
          {{ f.status }}
        </UBadge>
        <span class="text-xs text-dimmed">{{ fmt(f.created_at) }}</span>
        <span
          v-if="admin"
          class="text-xs text-dimmed"
        >· {{ authorName(f.author) }}</span>
        <a
          v-if="admin && f.author?.linkedin_url"
          :href="f.author.linkedin_url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          <UIcon
            name="i-simple-icons-linkedin"
            class="size-3"
          />LinkedIn
        </a>
        <div class="ml-auto flex gap-2">
          <UButton
            v-if="admin"
            :color="f.status === 'resolved' ? 'neutral' : 'success'"
            variant="soft"
            size="xs"
            :icon="f.status === 'resolved' ? 'i-lucide-rotate-ccw' : 'i-lucide-check'"
            :loading="busy === f.id"
            @click="setStatus(f.id, f.status === 'resolved' ? 'open' : 'resolved')"
          >
            {{ f.status === 'resolved' ? 'Reopen' : 'Resolve' }}
          </UButton>
        </div>
      </div>

      <h3
        v-if="f.subject"
        class="mt-3 font-semibold text-highlighted"
      >
        {{ f.subject }}
      </h3>
      <p class="mt-1.5 whitespace-pre-wrap text-sm text-default">
        {{ f.message }}
      </p>

      <!-- Replies -->
      <div
        v-if="f.feedback_replies.length"
        class="mt-4 space-y-3 border-l-2 border-default pl-4"
      >
        <div
          v-for="r in f.feedback_replies"
          :key="r.id"
        >
          <div class="flex items-center gap-2">
            <UBadge
              v-if="r.author?.role === 'admin'"
              color="primary"
              variant="subtle"
              size="sm"
            >
              <UIcon
                name="i-lucide-shield-check"
                class="mr-1 size-3"
              />
              Team
            </UBadge>
            <span
              v-else
              class="text-xs font-medium text-toned"
            >{{ authorName(r.author) }}</span>
            <span class="text-xs text-dimmed">{{ fmt(r.created_at) }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm text-muted">
            {{ r.body }}
          </p>
        </div>
      </div>

      <!-- Reply box -->
      <div class="mt-4 flex items-end gap-2">
        <UTextarea
          v-model="drafts[f.id]"
          :rows="1"
          autoresize
          :placeholder="admin ? 'Reply to this person…' : 'Add a reply…'"
          class="flex-1"
          :ui="{ base: 'resize-none' }"
        />
        <UButton
          icon="i-lucide-send"
          color="primary"
          variant="soft"
          :loading="busy === f.id"
          :disabled="!(drafts[f.id] || '').trim()"
          aria-label="Send reply"
          @click="sendReply(f.id)"
        />
      </div>
    </article>
  </div>
</template>
