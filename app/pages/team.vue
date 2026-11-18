<script setup lang="ts">
/**
 * /team — Teams & institutions. Without a seat: enter the join code your
 * company, college or team gave you. With one: your organisation; its admins
 * also see the join code, seats in use and the members (and can free seats).
 */
definePageMeta({ middleware: 'auth' })

interface Member { userId: string, name: string | null, email: string, role: string, lessons: number, joinedAt: string }
interface Org { name: string, kind: string, seats: number, used: number, active: boolean, expiresAt: string | null, role: string, joinCode: string | null, domain: string | null, autoJoin?: boolean, invites?: string[], members: Member[] }

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { load: loadProgress } = useProgress()
const { data, refresh } = useLazyFetch<{ org: Org | null }>('/api/org', { server: false })
const code = ref(String(route.query.code ?? '').toUpperCase())
const joining = ref(false)
const error = ref('')

async function join() {
  joining.value = true
  error.value = ''
  try {
    await $fetch('/api/org/join', { method: 'POST', body: { code: code.value } })
    await Promise.all([refresh(), loadProgress()])
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    joining.value = false
  }
}
const inviteText = ref('')
const inviteMsg = ref('')
async function invite() {
  inviteMsg.value = ''
  try {
    const res = await $fetch<{ added: number }>('/api/org/invite', { method: 'POST', body: { emails: inviteText.value } })
    inviteMsg.value = t('team.invited', { n: res.added })
    inviteText.value = ''
    await refresh()
  } catch (e) {
    inviteMsg.value = apiError(e) || t('contrib.err.generic')
  }
}
async function withdraw(email: string) {
  await $fetch('/api/org/invite', { method: 'DELETE', body: { email } })
  await refresh()
}
async function remove(m: Member) {
  await $fetch('/api/org/members', { method: 'DELETE', body: { userId: m.userId } })
  await refresh()
}
const copied = ref(false)
async function copyLink() {
  if (!data.value?.org?.joinCode) return
  await navigator.clipboard.writeText(`${SITE.url}${localePath('/team')}?code=${data.value.org.joinCode}`)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

useSeoMeta({ title: () => t('team.title'), robots: 'noindex' })
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-5 px-4 py-14">
    <header>
      <p class="eyebrow">
        {{ t('plans.teams.name') }}
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-(--ink)">
        {{ data?.org ? data.org.name : t('team.title') }}
      </h1>
    </header>

    <!-- No seat yet: join with a code -->
    <section
      v-if="data && !data.org"
      class="rounded-[6px] border border-(--line) bg-(--card) p-6"
    >
      <p class="text-(--ink2)">
        {{ t('team.lead') }}
      </p>
      <form
        class="mt-5 flex flex-wrap gap-3"
        @submit.prevent="join"
      >
        <UInput
          v-model="code"
          :placeholder="t('team.codePlaceholder')"
          size="lg"
          class="w-56 font-mono uppercase"
          maxlength="8"
          required
        />
        <UButton
          type="submit"
          size="lg"
          :loading="joining"
          icon="i-lucide-log-in"
        >
          {{ t('team.join') }}
        </UButton>
      </form>
      <UAlert
        v-if="error"
        class="mt-4"
        color="error"
        variant="subtle"
        :description="error"
      />
      <p class="mt-6 text-sm text-(--ink2)">
        {{ t('team.noCode') }}
        <NuxtLink
          :to="{ path: localePath('/pro'), hash: '#teams' }"
          class="font-semibold text-(--signal) hover:underline"
        >{{ t('team.request') }}</NuxtLink>
      </p>
    </section>

    <!-- A member -->
    <template v-else-if="data?.org">
      <section class="rounded-[6px] border border-(--line) bg-(--card) p-6">
        <p class="flex items-center gap-2 font-semibold text-(--ink)">
          <UIcon
            :name="data.org.active ? 'i-lucide-badge-check' : 'i-lucide-circle-alert'"
            class="size-5"
            :class="data.org.active ? 'text-(--signal)' : 'text-warning'"
          />{{ data.org.active ? t('team.active') : t('team.ended') }}
        </p>
        <p class="mt-1 text-sm text-(--ink2)">
          {{ t(`plans.kind.${data.org.kind}`) }} · {{ t('team.seatsUsed', { used: data.org.used, seats: data.org.seats }) }}
        </p>
      </section>

      <!-- Its admin -->
      <section
        v-if="data.org.joinCode"
        class="rounded-[6px] border border-(--line) bg-(--card)"
      >
        <div class="flex flex-wrap items-center gap-3 border-b border-(--line) p-6">
          <div class="flex-1">
            <p class="mono-label">
              {{ t('team.codeLabel') }}
            </p>
            <p class="mt-1 font-mono text-2xl font-bold tracking-[.12em] text-(--ink)">
              {{ data.org.joinCode }}
            </p>
            <p
              v-if="data.org.domain"
              class="mt-1 text-xs text-(--ink2)"
            >
              {{ t('team.domainOnly', { domain: data.org.domain }) }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
            @click="copyLink"
          >
            {{ copied ? t('team.copied') : t('team.copyLink') }}
          </UButton>
        </div>
        <form
          class="space-y-2 border-b border-(--line) p-6"
          @submit.prevent="invite"
        >
          <p class="mono-label">
            {{ t('team.assign') }}
          </p>
          <p class="text-sm text-(--ink2)">
            {{ t('team.assignHint') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <UTextarea
              v-model="inviteText"
              :rows="2"
              autoresize
              :placeholder="t('team.emailsPlaceholder')"
              class="min-w-0 flex-1"
            />
            <UButton
              type="submit"
              icon="i-lucide-send"
            >
              {{ t('team.assignButton') }}
            </UButton>
          </div>
          <p
            v-if="inviteMsg"
            class="text-sm text-(--ink2)"
          >
            {{ inviteMsg }}
          </p>
          <ul
            v-if="data.org.invites?.length"
            class="flex flex-wrap gap-2 pt-1"
          >
            <li
              v-for="em in data.org.invites"
              :key="em"
              class="flex items-center gap-1 rounded-full border border-(--line) bg-(--paper) py-0.5 ps-3 pe-1 text-xs text-(--ink)"
            >
              {{ em }}
              <button
                type="button"
                class="flex size-5 items-center justify-center rounded-full text-(--ink2) hover:bg-(--line)"
                :aria-label="t('team.withdraw')"
                @click="withdraw(em)"
              >
                <UIcon
                  name="i-lucide-x"
                  class="size-3"
                />
              </button>
            </li>
          </ul>
        </form>
        <ul class="divide-y divide-(--line)">
          <li
            v-for="m in data.org.members"
            :key="m.userId"
            class="flex flex-wrap items-center gap-3 px-6 py-3"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-(--ink)">
                {{ m.name || m.email }}
              </p>
              <p class="truncate text-xs text-(--ink2)">
                {{ m.email }} · {{ t('team.lessons', { n: m.lessons }) }}
              </p>
            </div>
            <span
              v-if="m.role === 'admin'"
              class="mono-label"
            >{{ t('team.admin') }}</span>
            <UButton
              v-else
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-user-minus"
              @click="remove(m)"
            >
              {{ t('team.remove') }}
            </UButton>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
