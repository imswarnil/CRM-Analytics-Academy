<script setup lang="ts">
// Blog manager. This is the only place posts are created/edited — the owner
// should never need the Supabase dashboard. Backed by /api/admin/posts.
definePageMeta({ middleware: 'auth' })

const { isAdmin } = useProfile()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({ title: 'Blog posts — CRM Analytics Academy', robots: 'noindex' })

interface Post {
  id: string
  slug: string
  title: string
  description: string | null
  body: string | null
  cover_url: string | null
  tags: string[] | null
  status: 'draft' | 'published'
  published_at: string | null
  is_external: boolean | null
  source_url: string | null
  source_name: string | null
  author_name: string | null
  author_url: string | null
  excerpt_only: boolean | null
  created_at: string | null
  updated_at: string | null
}

interface PostInput {
  slug?: string
  title?: string
  description?: string | null
  body?: string | null
  coverUrl?: string | null
  tags?: string[]
  status?: 'draft' | 'published'
  isExternal?: boolean
  sourceUrl?: string | null
  sourceName?: string | null
  authorName?: string | null
  authorUrl?: string | null
  excerptOnly?: boolean
}

const { data, pending, refresh } = await useAsyncData<{ posts: Post[] }>(
  'admin-posts',
  () => $fetch('/api/admin/posts'),
  { server: false, watch: [isAdmin], default: () => ({ posts: [] }) }
)

const posts = computed(() => data.value?.posts ?? [])

const busy = ref('')
const saving = ref(false)
const formError = ref('')
const modalOpen = ref(false)
const editingId = ref('')
const confirmDeleteId = ref('')

const statusItems = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' }
]

function emptyForm() {
  return {
    slug: '',
    title: '',
    description: '',
    body: '',
    coverUrl: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    isExternal: false,
    sourceUrl: '',
    sourceName: '',
    authorName: '',
    authorUrl: '',
    excerptOnly: true
  }
}

const form = reactive(emptyForm())

function resetForm() {
  Object.assign(form, emptyForm())
}

function errMessage(e: unknown, fallback: string) {
  const err = e as { data?: { statusMessage?: string }, statusMessage?: string, message?: string }
  return err?.data?.statusMessage || err?.statusMessage || err?.message || fallback
}

function openCreate() {
  editingId.value = ''
  formError.value = ''
  resetForm()
  modalOpen.value = true
}

function openEdit(post: Post) {
  editingId.value = post.id
  formError.value = ''
  Object.assign(form, {
    slug: post.slug || '',
    title: post.title || '',
    description: post.description || '',
    body: post.body || '',
    coverUrl: post.cover_url || '',
    tags: (post.tags || []).join(', '),
    status: post.status,
    isExternal: Boolean(post.is_external),
    sourceUrl: post.source_url || '',
    sourceName: post.source_name || '',
    authorName: post.author_name || '',
    authorUrl: post.author_url || '',
    excerptOnly: post.excerpt_only ?? true
  })
  modalOpen.value = true
}

const canSave = computed(() => {
  if (!form.title.trim()) return false
  if (form.isExternal && (!form.sourceUrl.trim() || !form.authorName.trim())) return false
  return true
})

function buildPayload(): PostInput {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: form.description.trim() || null,
    body: form.body.trim() || null,
    coverUrl: form.coverUrl.trim() || null,
    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    status: form.status,
    isExternal: form.isExternal,
    sourceUrl: form.isExternal ? form.sourceUrl.trim() || null : null,
    sourceName: form.isExternal ? form.sourceName.trim() || null : null,
    authorName: form.isExternal ? form.authorName.trim() || null : null,
    authorUrl: form.isExternal ? form.authorUrl.trim() || null : null,
    excerptOnly: form.isExternal ? form.excerptOnly : false
  }
}

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  formError.value = ''
  try {
    const body = buildPayload()
    if (editingId.value) {
      await $fetch<{ post: Post }>(`/api/admin/posts/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch<{ post: Post }>('/api/admin/posts', { method: 'POST', body })
    }
    modalOpen.value = false
    await refresh()
    toast.add({ title: editingId.value ? 'Post updated' : 'Post created', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    formError.value = errMessage(e, 'Could not save the post.')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(post: Post) {
  busy.value = post.id
  try {
    const status: 'draft' | 'published' = post.status === 'published' ? 'draft' : 'published'
    await $fetch<{ post: Post }>(`/api/admin/posts/${post.id}`, { method: 'PATCH', body: { status } satisfies PostInput })
    await refresh()
    toast.add({ title: status === 'published' ? 'Published' : 'Moved to draft', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Could not update status', description: errMessage(e, 'Please try again.'), color: 'error' })
  } finally {
    busy.value = ''
  }
}

async function remove(post: Post) {
  if (confirmDeleteId.value !== post.id) {
    confirmDeleteId.value = post.id
    return
  }
  busy.value = post.id
  try {
    await $fetch<{ ok: true }>(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
    confirmDeleteId.value = ''
    await refresh()
    toast.add({ title: 'Post deleted', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Could not delete', description: errMessage(e, 'Please try again.'), color: 'error' })
  } finally {
    busy.value = ''
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <ClientOnly>
      <div
        v-if="!isAdmin"
        class="mx-auto max-w-md rounded-2xl border border-default bg-elevated/40 p-8 text-center"
      >
        <UIcon
          name="i-lucide-shield-x"
          class="mx-auto mb-3 size-8 text-muted"
        />
        <h1 class="text-lg font-semibold text-highlighted">
          Admins only
        </h1>
        <p class="mt-1 text-sm text-muted">
          You don't have access to this page.
        </p>
      </div>

      <div v-else>
        <UButton
          :to="localePath('/admin')"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="link"
          size="sm"
          class="mb-4 -ms-2"
        >
          Back to admin
        </UButton>

        <div class="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <UIcon
              name="i-lucide-newspaper"
              class="size-6 text-primary"
            />
            <h1 class="text-2xl font-bold text-highlighted">
              Blog posts
            </h1>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              {{ posts.length }}
            </UBadge>
          </div>
          <UButton
            icon="i-lucide-plus"
            @click="openCreate"
          >
            New post
          </UButton>
        </div>

        <div
          v-if="pending"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="size-8 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!posts.length"
          class="rounded-2xl border border-dashed border-default p-10 text-center"
        >
          <UIcon
            name="i-lucide-file-plus-2"
            class="mx-auto mb-3 size-8 text-muted"
          />
          <p class="font-medium text-highlighted">
            No posts yet
          </p>
          <p class="mt-1 text-sm text-muted">
            Write an original article, or curate one from the community with full credit to its author.
          </p>
          <UButton
            icon="i-lucide-plus"
            class="mt-5"
            @click="openCreate"
          >
            Create the first post
          </UButton>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="post in posts"
            :key="post.id"
            class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-default p-4"
          >
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-highlighted">{{ post.title }}</span>
                <UBadge
                  :color="post.status === 'published' ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ post.status }}
                </UBadge>
                <UBadge
                  v-if="post.is_external"
                  color="primary"
                  variant="subtle"
                  size="sm"
                  icon="i-lucide-users"
                >
                  Community
                </UBadge>
              </div>
              <p class="mt-1 truncate text-xs text-dimmed">
                /blog/{{ post.slug }} · updated {{ fmtDate(post.updated_at) }}
              </p>
              <p
                v-if="post.is_external"
                class="mt-1 text-xs text-muted"
              >
                By {{ post.author_name || 'Unknown' }}<span v-if="post.source_name"> · {{ post.source_name }}</span>
                <a
                  v-if="post.source_url"
                  :href="post.source_url"
                  target="_blank"
                  rel="noopener"
                  class="ml-1 text-primary hover:underline"
                >source</a>
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                :color="post.status === 'published' ? 'neutral' : 'success'"
                variant="soft"
                size="sm"
                :icon="post.status === 'published' ? 'i-lucide-eye-off' : 'i-lucide-send'"
                :loading="busy === post.id"
                @click="toggleStatus(post)"
              >
                {{ post.status === 'published' ? 'Unpublish' : 'Publish' }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-pencil"
                @click="openEdit(post)"
              >
                Edit
              </UButton>
              <UButton
                color="error"
                :variant="confirmDeleteId === post.id ? 'soft' : 'ghost'"
                size="sm"
                icon="i-lucide-trash-2"
                :disabled="busy === post.id"
                @click="remove(post)"
              >
                {{ confirmDeleteId === post.id ? 'Click again to confirm' : 'Delete' }}
              </UButton>
            </div>
          </div>
        </div>

        <UModal
          v-model:open="modalOpen"
          :title="editingId ? 'Edit post' : 'New post'"
          description="Posts are stored in Supabase and rendered on the blog."
          :ui="{ content: 'max-w-2xl' }"
        >
          <template #body>
            <form
              class="space-y-5"
              @submit.prevent="save"
            >
              <UFormField
                label="Title"
                required
              >
                <UInput
                  v-model="form.title"
                  placeholder="e.g. Five SAQL patterns worth knowing"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Slug"
                help="Leave blank to derive it from the title."
              >
                <UInput
                  v-model="form.slug"
                  placeholder="auto-derived-from-title"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Description">
                <UTextarea
                  v-model="form.description"
                  :rows="2"
                  autoresize
                  placeholder="One-line summary shown on cards and in search results."
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Cover URL">
                <UInput
                  v-model="form.coverUrl"
                  type="url"
                  placeholder="https://…"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Tags"
                help="Comma-separated, e.g. saql, dashboards, einstein"
              >
                <UInput
                  v-model="form.tags"
                  placeholder="saql, dashboards"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                label="Body (Markdown)"
                help="Markdown is rendered on the blog page."
              >
                <UTextarea
                  v-model="form.body"
                  :rows="12"
                  placeholder="## Heading&#10;&#10;Write the post in Markdown…"
                  class="w-full font-mono text-sm"
                />
              </UFormField>

              <UFormField label="Status">
                <USelect
                  v-model="form.status"
                  :items="statusItems"
                  class="w-full"
                />
              </UFormField>

              <div class="rounded-xl border border-default p-4">
                <USwitch
                  v-model="form.isExternal"
                  label="External / community post"
                  description="Turn this on when the article was written by someone else."
                />

                <div
                  v-if="form.isExternal"
                  class="mt-4 space-y-4 border-t border-default pt-4"
                >
                  <p class="text-xs text-muted">
                    Curated posts must credit the original author and link back to the source. We host an excerpt
                    here and send readers to the original article for the full piece.
                  </p>

                  <UFormField
                    label="Original author name"
                    required
                  >
                    <UInput
                      v-model="form.authorName"
                      placeholder="e.g. Jane Doe"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Author profile URL">
                    <UInput
                      v-model="form.authorUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/…"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Publication / source name">
                    <UInput
                      v-model="form.sourceName"
                      placeholder="e.g. Salesforce Ben"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Original article URL"
                    required
                  >
                    <UInput
                      v-model="form.sourceUrl"
                      type="url"
                      placeholder="https://…"
                      class="w-full"
                    />
                  </UFormField>

                  <UCheckbox
                    v-model="form.excerptOnly"
                    label="Excerpt only"
                    description="Publish a short excerpt here rather than the full article."
                  />
                </div>
              </div>

              <p
                v-if="formError"
                class="text-sm text-error"
              >
                {{ formError }}
              </p>
            </form>
          </template>

          <template #footer>
            <div class="flex w-full justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="modalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                :loading="saving"
                :disabled="!canSave"
                @click="save"
              >
                {{ editingId ? 'Save changes' : 'Create post' }}
              </UButton>
            </div>
          </template>
        </UModal>
      </div>
    </ClientOnly>
  </UContainer>
</template>
