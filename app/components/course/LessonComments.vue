<script setup lang="ts">
/**
 * Questions and answers under a lesson.
 *
 * Loads nothing until the reader scrolls near it — most readers never reach
 * the bottom of a lesson, and they should not pay for a database round trip
 * they will not see. Comment text is rendered as text, so anything that looks
 * like markup in a comment is shown, never run.
 */
interface CommentItem {
  id: number
  parentId: number | null
  body: string
  createdAt: string
  edited: boolean
  name: string
  image: string | null
  mine: boolean
}

const props = defineProps<{ lessonPath: string }>()

const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const root = ref<HTMLElement | null>(null)
const comments = ref<CommentItem[]>([])
const loaded = ref(false)
const loading = ref(false)
const error = ref('')

const draft = ref('')
const replyTo = ref<number | null>(null)
const replyDraft = ref('')
const posting = ref(false)

const threads = computed(() => {
  const top = comments.value.filter(c => !c.parentId)
  return top.map(c => ({ ...c, replies: comments.value.filter(r => r.parentId === c.id) }))
})

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ comments: CommentItem[] }>('/api/comments', { query: { path: props.lessonPath } })
    comments.value = res.comments
    loaded.value = true
  } catch {
    error.value = 'Comments could not be loaded.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!root.value) return
  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      io.disconnect()
      load()
    }
  }, { rootMargin: '400px' })
  io.observe(root.value)
})

async function post(parentId: number | null) {
  const text = (parentId ? replyDraft.value : draft.value).trim()
  if (text.length < 2) return
  posting.value = true
  error.value = ''
  try {
    await $fetch('/api/comments', { method: 'POST', body: { path: props.lessonPath, body: text, parentId } })
    if (parentId) {
      replyDraft.value = ''
      replyTo.value = null
    } else {
      draft.value = ''
    }
    await load()
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage || 'Could not post that.'
  } finally {
    posting.value = false
  }
}

async function remove(id: number) {
  try {
    await $fetch(`/api/comments/${id}`, { method: 'DELETE' })
    await load()
  } catch {
    error.value = 'Could not delete that comment.'
  }
}

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <section
    ref="root"
    class="rounded-2xl border border-default bg-default p-5 sm:p-6"
    aria-labelledby="lesson-comments-title"
  >
    <div class="flex items-center justify-between gap-3">
      <h2
        id="lesson-comments-title"
        class="flex items-center gap-2 text-lg font-semibold tracking-tight text-highlighted"
      >
        <UIcon
          name="i-lucide-messages-square"
          class="size-5 text-primary"
        />
        Questions and discussion
        <UBadge
          v-if="loaded && comments.length"
          color="neutral"
          variant="soft"
          size="sm"
        >
          {{ comments.length }}
        </UBadge>
      </h2>
    </div>

    <ClientOnly>
      <div
        v-if="isSignedIn"
        class="mt-4"
      >
        <UTextarea
          v-model="draft"
          :rows="3"
          autoresize
          :maxlength="2000"
          placeholder="Ask a question or share how you solved it…"
          class="w-full"
        />
        <div class="mt-2 flex items-center justify-between gap-3">
          <p class="text-xs text-muted">
            Plain text. Be kind — other learners are working through this too.
          </p>
          <UButton
            :loading="posting && !replyTo"
            :disabled="draft.trim().length < 2"
            icon="i-lucide-send"
            size="sm"
            @click="post(null)"
          >
            Post
          </UButton>
        </div>
      </div>
      <p
        v-else
        class="mt-4 text-sm text-muted"
      >
        <NuxtLink
          :to="localePath('/sign-in')"
          class="font-medium text-primary hover:underline"
        >Sign in</NuxtLink>
        to ask a question or answer one.
      </p>
    </ClientOnly>

    <p
      v-if="error"
      class="mt-3 text-sm text-error"
    >
      {{ error }}
    </p>

    <div
      v-if="loading && !loaded"
      class="mt-6 space-y-3"
    >
      <USkeleton class="h-4 w-1/3" />
      <USkeleton class="h-4 w-2/3" />
    </div>

    <p
      v-else-if="loaded && !comments.length"
      class="mt-6 text-sm text-muted"
    >
      No questions yet. If something in this lesson was unclear, you are probably not the only one.
    </p>

    <ul
      v-else
      class="mt-6 space-y-5"
    >
      <li
        v-for="c in threads"
        :key="c.id"
      >
        <div class="flex gap-3">
          <UAvatar
            :src="c.image || undefined"
            :alt="c.name"
            size="sm"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm">
              <span class="font-semibold text-highlighted">{{ c.name }}</span>
              <span class="ms-2 text-xs text-muted">{{ when(c.createdAt) }}</span>
            </p>
            <p class="mt-1 whitespace-pre-line break-words text-sm text-toned">
              {{ c.body }}
            </p>
            <div class="mt-1 flex gap-3 text-xs">
              <button
                v-if="isSignedIn"
                type="button"
                class="text-muted hover:text-primary"
                @click="replyTo = replyTo === c.id ? null : c.id"
              >
                Reply
              </button>
              <button
                v-if="c.mine"
                type="button"
                class="text-muted hover:text-error"
                @click="remove(c.id)"
              >
                Delete
              </button>
            </div>

            <ul
              v-if="c.replies.length"
              class="mt-3 space-y-3 border-s border-default ps-4"
            >
              <li
                v-for="r in c.replies"
                :key="r.id"
                class="flex gap-3"
              >
                <UAvatar
                  :src="r.image || undefined"
                  :alt="r.name"
                  size="xs"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm">
                    <span class="font-semibold text-highlighted">{{ r.name }}</span>
                    <span class="ms-2 text-xs text-muted">{{ when(r.createdAt) }}</span>
                  </p>
                  <p class="mt-1 whitespace-pre-line break-words text-sm text-toned">
                    {{ r.body }}
                  </p>
                  <button
                    v-if="r.mine"
                    type="button"
                    class="mt-1 text-xs text-muted hover:text-error"
                    @click="remove(r.id)"
                  >
                    Delete
                  </button>
                </div>
              </li>
            </ul>

            <div
              v-if="replyTo === c.id"
              class="mt-3"
            >
              <UTextarea
                v-model="replyDraft"
                :rows="2"
                autoresize
                :maxlength="2000"
                placeholder="Write a reply…"
                class="w-full"
              />
              <div class="mt-2 flex justify-end gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click="replyTo = null"
                >
                  Cancel
                </UButton>
                <UButton
                  size="xs"
                  :loading="posting"
                  :disabled="replyDraft.trim().length < 2"
                  @click="post(c.id)"
                >
                  Reply
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
