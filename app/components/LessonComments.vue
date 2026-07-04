<script setup lang="ts">
const props = defineProps<{ pagePath: string }>()

const client = useDb()
const user = useSupabaseUser()
const { profile, isAdmin, displayName } = useProfile()
const localePath = useLocalePath()
const route = useRoute()

interface CommentAuthor {
  username: string | null
  full_name: string | null
  avatar_url: string | null
}
interface CommentRow {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles: CommentAuthor | null
}

const { data: comments, refresh } = await useAsyncData(
  () => `comments-${props.pagePath}`,
  async () => {
    const { data } = await client
      .from('comments')
      .select('id, body, created_at, user_id, profiles(username, full_name, avatar_url)')
      .eq('page_path', props.pagePath)
      .order('created_at', { ascending: true })
      .returns<CommentRow[]>()
    return data ?? []
  },
  { watch: [() => props.pagePath] }
)

const body = ref('')
const posting = ref(false)
const error = ref('')

async function post() {
  const text = body.value.trim()
  if (!text || !user.value || posting.value) return
  if (text.length > 4000) {
    error.value = 'Comment is too long (max 4000 characters).'
    return
  }
  posting.value = true
  error.value = ''
  const { error: err } = await client.from('comments').insert({
    user_id: user.value.id,
    page_path: props.pagePath,
    body: text
  })
  if (err) {
    // Show the actual reason so silent failures (auth/RLS) are visible.
    error.value = err.message || 'Could not post your comment. Please try again.'
  } else {
    body.value = ''
    await refresh()
  }
  posting.value = false
}

async function remove(id: string) {
  await client.from('comments').delete().eq('id', id)
  await refresh()
}

function authorName(c: CommentRow) {
  return c.profiles?.full_name || c.profiles?.username || 'Member'
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section class="not-prose my-12">
    <h2 class="mb-5 flex items-center gap-2 text-lg font-semibold text-highlighted">
      <UIcon
        name="i-lucide-messages-square"
        class="size-5 text-primary"
      />
      Discussion
      <UBadge
        v-if="comments?.length"
        color="neutral"
        variant="subtle"
      >
        {{ comments.length }}
      </UBadge>
    </h2>

    <!-- Composer -->
    <div class="mb-8">
      <ClientOnly>
        <div
          v-if="user"
          class="flex gap-3"
        >
          <UAvatar
            :src="profile?.avatar_url || undefined"
            :alt="displayName"
            size="sm"
            icon="i-lucide-user"
            class="mt-1 shrink-0"
          />
          <div class="flex-1">
            <UTextarea
              v-model="body"
              :rows="3"
              autoresize
              placeholder="Share a tip, ask a question, or add context…"
              class="w-full"
              :maxlength="4000"
            />
            <div class="mt-2 flex items-center justify-between">
              <p
                v-if="error"
                class="text-xs text-error"
              >
                {{ error }}
              </p>
              <span v-else />
              <UButton
                color="primary"
                size="sm"
                :loading="posting"
                :disabled="!body.trim()"
                @click="post"
              >
                Post comment
              </UButton>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-xl border border-default bg-elevated/40 px-4 py-4 text-center text-sm text-muted"
        >
          <NuxtLink
            :to="localePath('/login') + `?redirect=${encodeURIComponent(route.fullPath)}`"
            class="font-medium text-primary hover:underline"
          >Sign in</NuxtLink>
          to join the discussion.
        </div>

        <template #fallback>
          <div class="h-24 rounded-xl border border-default bg-elevated/40" />
        </template>
      </ClientOnly>
    </div>

    <!-- Comments -->
    <ul
      v-if="comments?.length"
      class="space-y-6"
    >
      <li
        v-for="c in comments"
        :key="c.id"
        class="flex gap-3"
      >
        <UAvatar
          :src="c.profiles?.avatar_url || undefined"
          :alt="authorName(c)"
          size="sm"
          icon="i-lucide-user"
          class="mt-0.5 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-highlighted">{{ authorName(c) }}</span>
            <span class="text-xs text-dimmed">{{ formatDate(c.created_at) }}</span>
            <UButton
              v-if="user && (c.user_id === user.id || isAdmin)"
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="xs"
              class="ml-auto opacity-60 hover:opacity-100"
              aria-label="Delete comment"
              @click="remove(c.id)"
            />
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm text-default">
            {{ c.body }}
          </p>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="text-sm text-muted"
    >
      No comments yet — be the first to start the discussion.
    </p>
  </section>
</template>
