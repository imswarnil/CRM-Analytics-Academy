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
const route = useRoute()
const { isSignedIn, user } = useAuth()
const { demo } = useProgress()
const signInTo = computed(() => ({ path: localePath('/sign-in'), query: { redirect: `${route.path}#lesson-comments-title` } }))
const signUpTo = computed(() => ({ path: localePath('/sign-up'), query: { redirect: `${route.path}#lesson-comments-title` } }))

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
    const res = await $fetch<{ id: number, createdAt?: string }>('/api/comments', { method: 'POST', body: { path: props.lessonPath, body: text, parentId } })
    // Shown straight away from what was sent. Reloading the list instead could
    // land on an edge isolate that has not seen the write yet, and the comment
    // looked as though it had never been posted.
    comments.value = [...comments.value, {
      id: res.id,
      parentId,
      body: text,
      createdAt: res.createdAt ?? new Date().toISOString(),
      edited: false,
      name: user.value?.name?.trim() || 'You',
      image: user.value?.image ?? null,
      mine: true
    }]
    loaded.value = true
    if (parentId) {
      replyDraft.value = ''
      replyTo.value = null
    } else {
      draft.value = ''
    }
  } catch (e) {
    error.value = apiError(e) || 'Could not post that. Please try again.'
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
    class="mt-12 border-[1.5px] border-(--ink) bg-(--card)"
    aria-labelledby="lesson-comments-title"
  >
    <div class="flex items-center justify-between gap-3 border-b-[1.5px] border-(--ink) bg-(--ice) px-5 py-3">
      <h2
        id="lesson-comments-title"
        class="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[.12em] text-(--signal)"
      >
        <UIcon
          name="i-lucide-messages-square"
          class="size-4"
        />
        Questions and discussion
      </h2>
      <span
        v-if="loaded && comments.length"
        class="border-[1.5px] border-(--ink) bg-(--card) px-2 font-mono text-[11px] font-semibold"
      >{{ comments.length }}</span>
    </div>

    <div class="p-5 sm:p-6">
      <ClientOnly>
        <p
          v-if="isSignedIn && demo"
          class="text-sm text-(--ink2)"
        >
          The demo account is read-only.
          <NuxtLink
            :to="signUpTo"
            class="font-semibold text-(--signal) hover:underline"
          >Create a free account</NuxtLink>
          to ask a question or answer one.
        </p>
        <div
          v-else-if="isSignedIn"
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
            <p class="font-mono text-[10px] uppercase tracking-[.06em] text-(--ink2)">
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
          class="text-sm text-(--ink2)"
        >
          <NuxtLink
            :to="signInTo"
            class="font-semibold text-(--signal) hover:underline"
          >Sign in</NuxtLink>
          or
          <NuxtLink
            :to="signUpTo"
            class="font-semibold text-(--signal) hover:underline"
          >create a free account</NuxtLink>
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
        class="mt-6 border border-dashed border-(--line) px-4 py-6 text-center text-sm text-(--ink2)"
      >
        No questions yet. If something in this lesson was unclear, you are probably not the only one.
      </p>

      <ul
        v-else
        class="mt-6 divide-y divide-dashed divide-(--line) border-t border-dashed border-(--line)"
      >
        <li
          v-for="c in threads"
          :key="c.id"
          class="py-5"
        >
          <div class="flex gap-3">
            <UAvatar
              :src="c.image || undefined"
              :alt="c.name"
              size="sm"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm">
                <span class="font-semibold text-(--ink)">{{ c.name }}</span>
                <span class="ms-2 font-mono text-[10px] uppercase text-(--ink2)">{{ when(c.createdAt) }}</span>
              </p>
              <p class="mt-1 whitespace-pre-line break-words text-sm text-(--ink)">
                {{ c.body }}
              </p>
              <div class="mt-1 flex gap-3 text-xs">
                <button
                  v-if="isSignedIn"
                  type="button"
                  class="font-mono uppercase tracking-[.08em] text-(--ink2) hover:text-(--signal)"
                  @click="replyTo = replyTo === c.id ? null : c.id"
                >
                  Reply
                </button>
                <button
                  v-if="c.mine"
                  type="button"
                  class="font-mono uppercase tracking-[.08em] text-(--ink2) hover:text-error"
                  @click="remove(c.id)"
                >
                  Delete
                </button>
              </div>

              <ul
                v-if="c.replies.length"
                class="mt-4 space-y-3 border-s-[1.5px] border-(--signal) ps-4"
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
                      <span class="font-semibold text-(--ink)">{{ r.name }}</span>
                      <span class="ms-2 font-mono text-[10px] uppercase text-(--ink2)">{{ when(r.createdAt) }}</span>
                    </p>
                    <p class="mt-1 whitespace-pre-line break-words text-sm text-(--ink)">
                      {{ r.body }}
                    </p>
                    <button
                      v-if="r.mine"
                      type="button"
                      class="mt-1 font-mono text-xs uppercase tracking-[.08em] text-(--ink2) hover:text-error"
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
    </div>
  </section>
</template>
