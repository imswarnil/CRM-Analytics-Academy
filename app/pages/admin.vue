<script setup lang="ts">
import type { FeedbackThread } from '~/components/FeedbackThreadList.vue'

definePageMeta({ middleware: 'auth' })

const { isAdmin } = useProfile()

useSeoMeta({ title: 'Admin — CRM Analytics Academy', robots: 'noindex' })

interface Author {
  username: string | null
  full_name: string | null
  linkedin_url: string | null
}
interface ResourceItem {
  id: string
  title: string
  url: string
  description: string | null
  category: string | null
  status: string
  created_at: string
  profiles: Author | null
}
const { data, pending, refresh } = await useAsyncData<{ resources: ResourceItem[] }>(
  'admin-queue',
  () => $fetch('/api/admin/queue'),
  { server: false, watch: [isAdmin] }
)

const { data: feedbackData, refresh: refreshFeedback } = await useAsyncData<{ feedback: FeedbackThread[], isAdmin: boolean }>(
  'admin-feedback',
  () => $fetch('/api/feedback/list'),
  { server: false, watch: [isAdmin], default: () => ({ feedback: [], isAdmin: false }) }
)
const openFeedback = computed(() => feedbackData.value?.feedback.filter(f => f.status === 'open').length || 0)

interface Overview {
  stats: { totalUsers: number, newUsers7d: number, activeUsers7d: number, pendingResources: number, openFeedback: number, comments: number, votes: number, approvedResources: number }
  weekly: { label: string, signups: number, active: number }[]
  recentUsers: { id: string, name: string, email: string | null, isAdmin: boolean, created_at: string | null, last_sign_in_at: string | null }[]
}
const { data: overview } = await useAsyncData<Overview | null>(
  'admin-overview',
  () => $fetch('/api/admin/overview'),
  { server: false, watch: [isAdmin] }
)
const weeklyMax = computed(() => Math.max(1, ...(overview.value?.weekly.map(w => Math.max(w.active, w.signups)) ?? [1])))

function fmtWhen(iso: string | null) {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86400000
  if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))}m ago`
  if (diff < day) return `${Math.round(diff / 3600000)}h ago`
  if (diff < 7 * day) return `${Math.round(diff / day)}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const busy = ref('')

async function moderate(table: 'resources', id: string, status: 'approved' | 'rejected') {
  busy.value = id
  try {
    await $fetch('/api/admin/moderate', { method: 'POST', body: { table, id, status } })
    await refresh()
  } finally {
    busy.value = ''
  }
}

const authorName = (a: Author | null) => a?.full_name || a?.username || 'Unknown'
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
        <div class="mb-8 flex items-center gap-2.5">
          <UIcon
            name="i-lucide-shield-check"
            class="size-6 text-primary"
          />
          <h1 class="text-2xl font-bold text-highlighted">
            Admin dashboard
          </h1>
        </div>

        <!-- Overview -->
        <section
          v-if="overview"
          class="mb-10 space-y-6"
        >
          <!-- Headline stats -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-2xl border border-default bg-default p-5">
              <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                <UIcon
                  name="i-lucide-users"
                  class="size-4 text-primary"
                />
                Users
              </div>
              <p class="mt-2 text-3xl font-bold text-highlighted">
                {{ overview.stats.totalUsers }}
              </p>
              <p class="mt-1.5 text-xs text-success">
                +{{ overview.stats.newUsers7d }} new this week
              </p>
            </div>

            <div class="rounded-2xl border border-default bg-default p-5">
              <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                <UIcon
                  name="i-lucide-activity"
                  class="size-4 text-primary"
                />
                Active (7d)
              </div>
              <p class="mt-2 text-3xl font-bold text-highlighted">
                {{ overview.stats.activeUsers7d }}
              </p>
              <p class="mt-1.5 text-xs text-dimmed">
                signed in this week
              </p>
            </div>

            <a
              href="#resources"
              class="rounded-2xl border p-5 transition"
              :class="overview.stats.pendingResources
                ? 'border-warning/40 bg-warning/5 hover:border-warning'
                : 'border-default bg-default hover:border-primary/40'"
            >
              <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                <UIcon
                  name="i-lucide-clock-alert"
                  class="size-4"
                  :class="overview.stats.pendingResources ? 'text-warning' : 'text-primary'"
                />
                Pending approvals
              </div>
              <p
                class="mt-2 text-3xl font-bold"
                :class="overview.stats.pendingResources ? 'text-warning' : 'text-highlighted'"
              >
                {{ overview.stats.pendingResources }}
              </p>
              <p class="mt-1.5 text-xs text-dimmed">
                {{ overview.stats.pendingResources ? 'Review resources below →' : 'All caught up' }}
              </p>
            </a>

            <a
              href="#feedback"
              class="rounded-2xl border p-5 transition"
              :class="overview.stats.openFeedback
                ? 'border-primary/40 bg-primary/5 hover:border-primary'
                : 'border-default bg-default hover:border-primary/40'"
            >
              <div class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                <UIcon
                  name="i-lucide-message-square-heart"
                  class="size-4 text-primary"
                />
                Open feedback
              </div>
              <p class="mt-2 text-3xl font-bold text-highlighted">
                {{ overview.stats.openFeedback }}
              </p>
              <p class="mt-1.5 text-xs text-dimmed">
                awaiting a reply
              </p>
            </a>
          </div>

          <!-- Secondary counts -->
          <div class="flex flex-wrap gap-2">
            <UBadge
              color="neutral"
              variant="subtle"
              class="rounded-full"
            >
              <UIcon
                name="i-lucide-library-big"
                class="mr-1 size-3.5"
              />{{ overview.stats.approvedResources }} approved resources
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              class="rounded-full"
            >
              <UIcon
                name="i-lucide-heart"
                class="mr-1 size-3.5"
              />{{ overview.stats.votes }} votes
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              class="rounded-full"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="mr-1 size-3.5"
              />{{ overview.stats.comments }} comments
            </UBadge>
          </div>

          <!-- Trend + recent users -->
          <div class="grid gap-6 lg:grid-cols-3">
            <!-- Weekly activity chart -->
            <div class="rounded-2xl border border-default bg-default p-5 lg:col-span-2">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="flex items-center gap-2 font-semibold text-highlighted">
                  <UIcon
                    name="i-lucide-chart-column"
                    class="size-5 text-primary"
                  />
                  Last 7 weeks
                </h2>
                <div class="flex items-center gap-4 text-xs text-muted">
                  <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-primary" />Logged in</span>
                  <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-secondary" />New sign-ups</span>
                </div>
              </div>
              <div class="flex h-44 items-end gap-2 sm:gap-4">
                <div
                  v-for="w in overview.weekly"
                  :key="w.label"
                  class="flex flex-1 flex-col items-center gap-2"
                >
                  <div class="flex w-full flex-1 items-end justify-center gap-1">
                    <div
                      class="w-1/2 rounded-t bg-primary transition-all duration-700"
                      :style="{ height: `${Math.max(w.active ? 6 : 0, (w.active / weeklyMax) * 100)}%` }"
                      :title="`${w.active} logged in`"
                    />
                    <div
                      class="w-1/2 rounded-t bg-secondary transition-all duration-700"
                      :style="{ height: `${Math.max(w.signups ? 6 : 0, (w.signups / weeklyMax) * 100)}%` }"
                      :title="`${w.signups} new`"
                    />
                  </div>
                  <span class="text-[11px] text-dimmed">{{ w.label }}</span>
                </div>
              </div>
            </div>

            <!-- Recent users -->
            <div class="rounded-2xl border border-default bg-default p-5">
              <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
                <UIcon
                  name="i-lucide-user-plus"
                  class="size-5 text-primary"
                />
                New users
              </h2>
              <ul class="space-y-3">
                <li
                  v-for="u in overview.recentUsers"
                  :key="u.id"
                  class="flex items-center gap-3"
                >
                  <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                    {{ u.name.slice(0, 2) }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="flex items-center gap-1.5 truncate text-sm font-medium text-highlighted">
                      {{ u.name }}
                      <UBadge
                        v-if="u.isAdmin"
                        color="primary"
                        variant="subtle"
                        size="sm"
                      >
                        admin
                      </UBadge>
                    </p>
                    <p class="truncate text-xs text-dimmed">
                      {{ u.email }}
                    </p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-xs text-muted">
                      joined {{ fmtWhen(u.created_at) }}
                    </p>
                    <p class="text-[11px] text-dimmed">
                      seen {{ fmtWhen(u.last_sign_in_at) }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

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
          v-else
          class="space-y-10"
        >
          <!-- Pending resources -->
          <section id="resources">
            <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-library-big"
                class="size-5 text-primary"
              />
              Resources
              <UBadge
                color="warning"
                variant="subtle"
              >
                {{ data?.resources.length || 0 }}
              </UBadge>
            </h2>
            <div
              v-if="data?.resources.length"
              class="space-y-3"
            >
              <div
                v-for="r in data.resources"
                :key="r.id"
                class="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-default p-4"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <a
                      :href="r.url"
                      target="_blank"
                      class="font-medium text-default hover:text-primary"
                    >{{ r.title }}</a>
                    <UBadge
                      v-if="r.category"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    >
                      {{ r.category }}
                    </UBadge>
                  </div>
                  <p
                    v-if="r.description"
                    class="mt-1 text-sm text-muted"
                  >
                    {{ r.description }}
                  </p>
                  <p class="mt-1 truncate text-xs text-dimmed">
                    {{ r.url }} · by {{ authorName(r.profiles) }}
                    <a
                      v-if="r.profiles?.linkedin_url"
                      :href="r.profiles.linkedin_url"
                      target="_blank"
                      rel="noopener"
                      class="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
                    >
                      <UIcon
                        name="i-simple-icons-linkedin"
                        class="size-3"
                      />LinkedIn
                    </a>
                  </p>
                </div>
                <div class="flex gap-2">
                  <UButton
                    color="success"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-check"
                    :loading="busy === r.id"
                    @click="moderate('resources', r.id, 'approved')"
                  >
                    Approve
                  </UButton>
                  <UButton
                    color="error"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-x"
                    :disabled="busy === r.id"
                    @click="moderate('resources', r.id, 'rejected')"
                  >
                    Reject
                  </UButton>
                </div>
              </div>
            </div>
            <p
              v-else
              class="text-sm text-muted"
            >
              No resources awaiting review.
            </p>
          </section>

          <!-- Feedback -->
          <section id="feedback">
            <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-message-square-heart"
                class="size-5 text-primary"
              />
              Feedback
              <UBadge
                color="warning"
                variant="subtle"
              >
                {{ openFeedback }} open
              </UBadge>
            </h2>
            <FeedbackThreadList
              v-if="feedbackData?.feedback.length"
              :items="feedbackData.feedback"
              admin
              @refresh="refreshFeedback"
            />
            <p
              v-else
              class="text-sm text-muted"
            >
              No feedback yet.
            </p>
          </section>

          <!-- Full data manager: view/edit/delete any row in any table -->
          <section>
            <h2 class="mb-4 flex items-center gap-2 font-semibold text-highlighted">
              <UIcon
                name="i-lucide-database"
                class="size-5 text-primary"
              />
              Data manager
            </h2>
            <AdminDataManager />
          </section>
        </div>
      </div>
    </ClientOnly>
  </UContainer>
</template>
