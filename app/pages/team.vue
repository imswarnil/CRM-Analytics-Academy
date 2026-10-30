<script setup lang="ts">
/**
 * /team — seats in an organisation. A learner enters the join code their
 * company, team or university was given; while the org has seats, they are
 * Pro. The org's admin sees the code, the seats in use and each member's
 * progress, and can free a seat. Organisations are created in /admin from a
 * seats request on /pro.
 */
definePageMeta({ middleware: 'auth' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { load } = useProgress()

interface Member { userId: string, role: string, joinedAt: string, name: string | null, email: string | null, lessons: number, points: number }
interface Org { name: string, kind: string, seats: number, used: number, expiresAt: string | null, role: string, joinCode: string | null, members: Member[] }
const { data, refresh } = await useLazyAsyncData('my-org', () => $fetch<{ org: Org | null }>('/api/org').then(r => r.org), { server: false })

const code = ref(String(route.query.code ?? ''))
const busy = ref(false)
const error = ref('')
async function join() {
  busy.value = true
  error.value = ''
  try {
    await $fetch('/api/org/join', { method: 'POST', body: { code: code.value } })
    useNuxtApp().$track?.('org_join')
    await Promise.all([refresh(), load()])
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  } finally {
    busy.value = false
  }
}
async function remove(m: Member) {
  error.value = ''
  try {
    await $fetch('/api/org/members', { method: 'DELETE', body: { userId: m.userId } })
    await refresh()
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
  }
}
const joinLink = computed(() => (data.value?.joinCode ? `${SITE.url}${localePath('/team')}?code=${data.value.joinCode}` : ''))
const copied = ref(false)
async function copy() {
  await navigator.clipboard.writeText(joinLink.value).catch(() => null)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

useSeoMeta({ title: () => t('team.title'), robots: 'noindex' })
</script>

<template>
  <div>
    <BpPageHeader
      sheet="SHEET 10 / SEATS"
      :title="t('team.title')"
      :lead="t('team.lead')"
    />

    <div class="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="error"
      />

      <!-- No seat yet: join -->
      <form
        v-if="!data"
        class="space-y-4 border-[1.5px] border-(--ink) bg-(--card) p-6"
        @submit.prevent="join"
      >
        <UFormField
          :label="t('team.code')"
          :hint="t('team.codeHint')"
        >
          <UInput
            v-model="code"
            size="xl"
            class="w-full font-mono uppercase tracking-[.2em]"
            maxlength="9"
            autocomplete="off"
            required
          />
        </UFormField>
        <UButton
          type="submit"
          size="xl"
          icon="i-lucide-key-round"
          :loading="busy"
        >
          {{ t('team.join') }}
        </UButton>
        <p class="text-sm text-(--ink2)">
          {{ t('team.noCode') }}
          <NuxtLink
            :to="`${localePath('/pro')}?product=seats#request`"
            class="font-semibold text-(--signal) hover:underline"
          >{{ t('team.request') }}</NuxtLink>
        </p>
      </form>

      <!-- A seat -->
      <template v-else>
        <section class="border-[1.5px] border-(--ink) bg-(--card)">
          <header class="flex flex-wrap items-center gap-3 border-b-[1.5px] border-(--ink) bg-(--ice) px-6 py-4">
            <UIcon
              name="i-lucide-building-2"
              class="size-6 text-(--signal)"
            />
            <p class="text-xl font-bold text-(--ink)">
              {{ data.name }}
            </p>
            <span class="font-mono text-[11px] uppercase tracking-[.1em] text-(--ink2)">{{ t(`plans.kind.${data.kind}`) }}</span>
            <span class="ms-auto font-mono text-sm tabular-nums text-(--ink)">{{ t('team.seats', { used: data.used, seats: data.seats }) }}</span>
          </header>
          <div class="space-y-2 p-6">
            <p class="flex items-center gap-2 font-semibold text-(--ink)">
              <UIcon
                name="i-lucide-badge-check"
                class="size-5 text-(--signal)"
              />{{ t('team.youArePro') }}
            </p>
            <p
              v-if="data.expiresAt"
              class="text-sm text-(--ink2)"
            >
              {{ t('team.until', { date: new Date(data.expiresAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) }) }}
            </p>
          </div>
        </section>

        <!-- The org's admin -->
        <section
          v-if="data.role === 'admin'"
          class="border-[1.5px] border-(--ink) bg-(--card)"
        >
          <header class="border-b-[1.5px] border-(--ink) px-6 py-3">
            <p class="eyebrow">
              {{ t('team.adminTitle') }}
            </p>
          </header>
          <div class="space-y-3 p-6">
            <p class="text-(--ink2)">
              {{ t('team.share') }}
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <code class="select-all border-[1.5px] border-(--signal) px-3 py-1.5 font-mono text-lg tracking-[.2em] text-(--signal)">{{ data.joinCode }}</code>
              <UButton
                variant="outline"
                color="neutral"
                :icon="copied ? 'i-lucide-check' : 'i-lucide-link'"
                @click="copy"
              >
                {{ t('team.copyLink') }}
              </UButton>
            </div>
          </div>
          <table class="w-full border-t-[1.5px] border-(--line) text-sm">
            <thead class="font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)">
              <tr>
                <th class="px-6 py-2 text-start">
                  {{ t('team.member') }}
                </th>
                <th class="px-3 py-2 text-end">
                  {{ t('team.lessons') }}
                </th>
                <th class="px-3 py-2 text-end">
                  {{ t('team.points') }}
                </th>
                <th class="px-6 py-2" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in data.members"
                :key="m.userId"
                class="border-t border-dashed border-(--line)"
              >
                <td class="px-6 py-2">
                  <span class="block font-semibold text-(--ink)">{{ m.name ?? '—' }}</span>
                  <span class="block font-mono text-xs text-(--ink2)">{{ m.email }}</span>
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ m.lessons }}
                </td>
                <td class="px-3 py-2 text-end tabular-nums">
                  {{ m.points }}
                </td>
                <td class="px-6 py-2 text-end">
                  <UButton
                    v-if="m.role !== 'admin'"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-user-minus"
                    @click="remove(m)"
                  >
                    {{ t('team.free') }}
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>
    </div>
  </div>
</template>
