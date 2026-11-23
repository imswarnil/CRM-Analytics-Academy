<script setup lang="ts">
/** /admin → Integrations: connect the Gmail mailbox outreach is sent from (OAuth, gmail.send + gmail.readonly). */
const route = useRoute()
const { data, refresh } = await useLazyAsyncData('prospect-gmail', () => $fetch<{ gmail: { configured: boolean, email: string | null, status: string | null, connectedAt: string | null, redirectUri: string } }>('/api/admin/prospecting/status'), { server: false })
const result = computed(() => (typeof route.query.gmail === 'string' ? route.query.gmail : null))
async function disconnect() {
  if (!confirm('Disconnect Gmail? Sequences stop sending until you connect again.')) return
  await $fetch('/api/admin/prospecting/gmail/disconnect', { method: 'POST' })
  await refresh()
}
</script>

<template>
  <section class="mb-6 rounded-[6px] border border-(--line) bg-(--card) p-5">
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex size-9 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
        <UIcon
          name="i-simple-icons-gmail"
          class="size-5"
        />
      </span>
      <h3 class="flex-1 font-semibold text-(--ink)">
        Gmail (outreach mailbox)
      </h3>
      <span
        class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
        :class="data?.gmail.email && data.gmail.status === 'ok' ? 'bg-success/10 text-success' : 'bg-(--paper) text-(--ink2)'"
      >{{ data?.gmail.email ? (data.gmail.status === 'ok' ? 'Connected' : data.gmail.status) : 'Not connected' }}</span>
      <UButton
        v-if="data?.gmail.configured"
        size="sm"
        :to="'/api/admin/prospecting/gmail/connect'"
        external
        icon="i-lucide-link"
      >
        {{ data?.gmail.email ? 'Reconnect' : 'Connect Gmail' }}
      </UButton>
      <UButton
        v-if="data?.gmail.email"
        size="sm"
        variant="ghost"
        color="neutral"
        @click="disconnect"
      >
        Disconnect
      </UButton>
    </div>
    <p class="mt-3 text-sm text-(--ink2)">
      Prospecting sequences send from this mailbox through the Gmail API and read its threads for replies and bounces.
      The site's own emails keep using Resend; outreach never does.
    </p>
    <p
      v-if="data?.gmail.email"
      class="mt-2 text-xs text-(--label)"
    >
      {{ data.gmail.email }} · connected {{ data.gmail.connectedAt ? new Date(data.gmail.connectedAt).toLocaleDateString() : '' }} · token sealed with the site secret
    </p>
    <p
      v-else-if="data && !data.gmail.configured"
      class="mt-2 text-xs text-(--label)"
    >
      Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (docs/PROSPECTING.md). Authorised redirect URI: <code>{{ data.gmail.redirectUri }}</code>
    </p>
    <p
      v-if="result"
      class="mt-2 text-xs"
      :class="result === 'connected' ? 'text-success' : 'text-error'"
    >
      {{ result === 'connected' ? 'Gmail connected.' : `Gmail connect failed: ${result}` }}
    </p>
  </section>
</template>
