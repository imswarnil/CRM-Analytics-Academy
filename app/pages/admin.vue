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
            Moderation queue
          </h1>
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
          v-else
          class="space-y-10"
        >
          <!-- Pending resources -->
          <section>
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
          <section>
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
