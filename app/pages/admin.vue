<script setup lang="ts">
/**
 * /admin — users, roles and the moderation queue.
 *
 * Deliberately NOT translated. Every other user-facing string on this site
 * lives in i18n/locales/en.json and is machine-translated into eleven
 * languages; this screen is an internal tool with one operator, and putting
 * it through that pipeline would mean ~60 more keys translated into languages
 * nobody will administer the site in.
 *
 * The page is also not the security boundary. It asks /api/admin/me to decide
 * whether to render, but every route it calls re-checks the role server-side —
 * anything decided here can be skipped by not running the client.
 */
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: 'Admin',
  robots: 'noindex, nofollow'
})

const tab = ref<'users' | 'queue'>('queue')

const { data: me } = await useLazyAsyncData('admin-me', () =>
  $fetch<{ signedIn: boolean, role: string | null, email?: string }>('/api/admin/me'), {
  server: false,
  default: () => ({ signedIn: false, role: null as string | null, email: undefined as string | undefined })
})

const isAdmin = computed(() => me.value?.role === 'admin')
const isModerator = computed(() => me.value?.role === 'admin' || me.value?.role === 'moderator')

interface AdminUser {
  id: string
  email: string
  name: string | null
  createdAt: string
  emailVerified: boolean
  role: string
  points: number
  lessonsDone: number
  pendingSubmissions: number
  isDemo: boolean
  pro: boolean
  // True when the role comes from the ADMIN_EMAILS allowlist rather than
  // app.user_role — writing a role for them would be overridden by the env.
  roleLocked: boolean
}

interface QueueItem {
  id: number
  kind: string
  title: string
  url: string | null
  description: string
  tags: string[]
  imageUrl: string | null
  status: string
  createdAt: string
  submittedBy: { name: string | null, email: string | null }
}

const users = ref<AdminUser[]>([])
const queue = ref<QueueItem[]>([])
const queueStatus = ref<'pending' | 'approved' | 'rejected'>('pending')
const busy = ref(false)
const error = ref('')

async function loadUsers() {
  if (!isAdmin.value) return
  try {
    const r = await $fetch<{ users: AdminUser[] }>('/api/admin/users')
    users.value = r.users
  } catch (e) { error.value = msg(e) }
}

async function loadQueue() {
  if (!isModerator.value) return
  try {
    const r = await $fetch<{ submissions: QueueItem[] }>('/api/admin/submissions', {
      query: { status: queueStatus.value }
    })
    queue.value = r.submissions
  } catch (e) { error.value = msg(e) }
}

function msg(e: unknown) {
  return (e as { statusMessage?: string })?.statusMessage || 'Something went wrong.'
}

watch(isModerator, ok => ok && loadQueue(), { immediate: true })
watch(isAdmin, ok => ok && loadUsers(), { immediate: true })
watch(queueStatus, loadQueue)

async function setRole(u: AdminUser, role: string) {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'PATCH', body: { userId: u.id, role } })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

async function togglePro(u: AdminUser) {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'PATCH', body: { userId: u.id, pro: !u.pro } })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

async function review(item: QueueItem, action: 'approve' | 'reject' | 'delete') {
  // Deleting destroys the row and the person is never told why — reserved for
  // spam, and worth a confirm because rejection is almost always the right
  // action instead.
  if (action === 'delete' && !confirm(`Permanently delete "${item.title}"? Rejecting instead keeps it and tells the author why.`)) return
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/submissions', { method: 'PATCH', body: { id: item.id, action } })
    await loadQueue()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

/* --- Create user -------------------------------------------------------- */
const newUser = reactive({ email: '', name: '', role: 'learner' })
const created = ref<{ email: string, temporaryPassword: string } | null>(null)

async function createUser() {
  busy.value = true
  error.value = ''
  created.value = null
  try {
    created.value = await $fetch('/api/admin/users', { method: 'POST', body: { ...newUser } })
    Object.assign(newUser, { email: '', name: '', role: 'learner' })
    await loadUsers()
  } catch (e) {
    error.value = msg(e)
  } finally {
    busy.value = false
  }
}

const roles = ['learner', 'moderator', 'admin']
</script>

<template>
  <div>
    <!-- Signed in but not an admin: say nothing useful. The API returns 404
         for the same reason — a 403 confirms the screen exists. -->
    <UContainer
      v-if="me?.signedIn && !isModerator"
      class="py-20 text-center"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
        404
      </p>
      <p class="mt-2 text-muted">
        Not found.
      </p>
    </UContainer>

    <UContainer v-else-if="isModerator">
      <UPageHeader
        :title="tab === 'queue' ? 'Moderation' : 'Users & Roles'"
        :description="tab === 'queue' ? 'Community submissions awaiting review.' : 'Accounts, roles and access.'"
      >
        <template #headline>
          <nav
            class="flex items-center gap-2"
            aria-label="Admin sections"
          >
            <UButton
              icon="i-lucide-inbox"
              size="sm"
              :color="tab === 'queue' ? 'primary' : 'neutral'"
              :variant="tab === 'queue' ? 'soft' : 'ghost'"
              @click="tab = 'queue'"
            >
              Moderation
              <UBadge
                v-if="queue.length && queueStatus === 'pending'"
                :label="String(queue.length)"
                size="sm"
              />
            </UButton>
            <UButton
              v-if="isAdmin"
              icon="i-lucide-users"
              size="sm"
              :color="tab === 'users' ? 'primary' : 'neutral'"
              :variant="tab === 'users' ? 'soft' : 'ghost'"
              @click="tab = 'users'"
            >
              Users & Roles
            </UButton>
          </nav>
        </template>

        <template #links>
          <div class="text-end text-xs text-muted">
            <span class="block max-w-56 truncate font-medium text-highlighted">{{ me?.email }}</span>
            <span class="block">role {{ me?.role }}</span>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <p
          v-if="error"
          class="mb-4 text-sm text-error"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- ============================ QUEUE ============================ -->
        <section v-if="tab === 'queue'">
          <div class="mb-4 flex gap-2">
            <UButton
              v-for="s in (['pending', 'approved', 'rejected'] as const)"
              :key="s"
              :label="s"
              :color="queueStatus === s ? 'primary' : 'neutral'"
              :variant="queueStatus === s ? 'soft' : 'outline'"
              size="xs"
              @click="queueStatus = s"
            />
          </div>

          <p
            v-if="!queue.length"
            class="py-12 text-center text-sm text-muted"
          >
            Nothing {{ queueStatus }}.
          </p>

          <ul class="space-y-4">
            <li
              v-for="item in queue"
              :key="item.id"
            >
              <UCard>
                <div class="flex flex-col gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge
                      :label="item.kind"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    />
                    <span class="text-xs font-semibold uppercase tracking-wide text-dimmed">{{ item.submittedBy.email || 'unknown' }}</span>
                  </div>

                  <p class="font-semibold text-highlighted">
                    {{ item.title }}
                  </p>

                  <!-- rel="noopener nofollow" and no target-blank trust: this is an
                     unreviewed link submitted by a stranger. -->
                  <a
                    v-if="item.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener nofollow ugc"
                    class="text-sm text-primary break-all"
                  >{{ item.url }}</a>

                  <p class="whitespace-pre-line text-sm text-muted">
                    {{ item.description }}
                  </p>

                  <p
                    v-if="item.tags.length"
                    class="flex flex-wrap gap-1"
                  >
                    <UBadge
                      v-for="tg in item.tags"
                      :key="tg"
                      :label="tg"
                      color="neutral"
                      variant="outline"
                      size="sm"
                    />
                  </p>
                </div>

                <template #footer>
                  <div class="flex flex-wrap items-center gap-2">
                    <UButton
                      label="Approve"
                      icon="i-lucide-check"
                      size="sm"
                      :disabled="busy || item.status === 'approved'"
                      @click="review(item, 'approve')"
                    />
                    <UButton
                      label="Reject"
                      icon="i-lucide-x"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      :disabled="busy || item.status === 'rejected'"
                      @click="review(item, 'reject')"
                    />
                    <UButton
                      label="Delete"
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="sm"
                      class="ms-auto"
                      :disabled="busy"
                      @click="review(item, 'delete')"
                    />
                  </div>
                </template>
              </UCard>
            </li>
          </ul>
        </section>

        <!-- ============================ USERS ============================ -->
        <section v-else-if="tab === 'users' && isAdmin">
          <UCard class="mb-8">
            <div class="flex flex-col gap-2">
              <p class="font-semibold text-highlighted">
                Create a user
              </p>
              <div class="grid gap-3 sm:grid-cols-4">
                <UInput
                  v-model="newUser.email"
                  type="email"
                  placeholder="email"
                />
                <UInput
                  v-model="newUser.name"
                  type="text"
                  placeholder="name (optional)"
                />
                <USelect
                  v-model="newUser.role"
                  :items="roles"
                />
                <UButton
                  label="Create"
                  icon="i-lucide-user-plus"
                  :disabled="busy || !newUser.email"
                  @click="createUser"
                />
              </div>

              <!-- Shown once. There is no email sending on this site, so this is
                 the only time the password is visible. -->
              <div
                v-if="created"
                class="mt-4 space-y-2 rounded-lg border border-default bg-elevated p-4"
              >
                <p class="font-semibold text-highlighted">
                  Created {{ created.email }}
                </p>
                <p class="text-sm text-muted">
                  Temporary password — copy it now, it is not stored and will not
                  be shown again:
                </p>
                <code>{{ created.temporaryPassword }}</code>
              </div>
            </div>
          </UCard>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[52rem] border-collapse text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="px-2 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    User
                  </th>
                  <th class="px-2 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted">
                    Role
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Points
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Lessons
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Queue
                  </th>
                  <th class="px-2 py-2 text-end text-xs font-semibold uppercase tracking-wide text-muted">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="u in users"
                  :key="u.id"
                  class="border-b border-default"
                >
                  <td class="px-2 py-3">
                    <span class="font-medium text-highlighted">{{ u.name || '—' }}</span>
                    <span class="block text-xs text-muted">{{ u.email }}</span>
                  </td>
                  <td class="px-2 py-3">
                    <select
                      class="rounded-md border border-default bg-default px-2 py-1 text-sm disabled:opacity-50"
                      :value="u.role"
                      :disabled="busy || u.isDemo || u.roleLocked"
                      @change="setRole(u, ($event.target as HTMLSelectElement).value)"
                    >
                      <option
                        v-for="r in roles"
                        :key="r"
                        :value="r"
                      >
                        {{ r }}
                      </option>
                    </select>
                    <!-- Say why it is disabled. A dead control with no
                       explanation reads as a bug. -->
                    <span
                      v-if="u.roleLocked"
                      class="mt-1 block text-xs text-muted"
                    >set by ADMIN_EMAILS</span>
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.points }}
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.lessonsDone }}
                  </td>
                  <td class="px-2 py-3 text-end tabular-nums">
                    {{ u.pendingSubmissions || '' }}
                  </td>
                  <td class="px-2 py-3 text-end">
                    <UButton
                      :label="u.pro ? 'Pro' : 'Free'"
                      :color="u.pro ? 'primary' : 'neutral'"
                      :variant="u.pro ? 'soft' : 'outline'"
                      size="xs"
                      :disabled="busy"
                      @click="togglePro(u)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </UPageBody>
    </UContainer>
  </div>
</template>
