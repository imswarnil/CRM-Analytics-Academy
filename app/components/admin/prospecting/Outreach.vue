<script setup lang="ts">
/**
 * /admin → Integrations: the outreach mailbox. SMTP (Hostinger) or n8n as the
 * transport, a connection check (EHLO + AUTH only), a test email to yourself,
 * and the n8n inbound webhook's last event. Secrets are never shown.
 */
interface Outreach {
  transport: 'smtp' | 'n8n'
  ready: boolean
  problem: string | null
  from: string | null
  smtp: { host: string, port: number, user: string } | null
  n8nSend: boolean
  inboundConfigured: boolean
  lastInbound: { type: string, matchedBy: string | null, at: string, week: number } | null
}
const { data, refresh } = await useLazyAsyncData('prospect-outreach', () => $fetch<{ outreach: Outreach }>('/api/admin/prospecting/status'), { server: false })
const o = computed(() => data.value?.outreach)
const busy = ref<string | null>(null)
const result = ref<{ ok: boolean, text: string, transcript?: string[] } | null>(null)
async function run(action: 'check' | 'test') {
  busy.value = action
  result.value = null
  try {
    const r = await $fetch<{ ok: boolean, error?: string, to?: string, transport?: string, detail?: string, transcript?: string[] }>('/api/admin/prospecting/outreach', { method: 'POST', body: { action } })
    result.value = r.ok
      ? { ok: true, text: action === 'check' ? 'Connected: EHLO and AUTH accepted.' : `Sent to ${r.to} via ${r.transport} (${r.detail}). Check its SPF/DKIM/DMARC headers.`, transcript: r.transcript }
      : { ok: false, text: r.error ?? 'Failed' }
  } catch (e) {
    result.value = { ok: false, text: (e as { statusMessage?: string }).statusMessage ?? String(e) }
  } finally {
    busy.value = null
    await refresh()
  }
}
</script>

<template>
  <section class="mb-6 rounded-[6px] border border-(--line) bg-(--card) p-5">
    <div class="flex flex-wrap items-center gap-3">
      <span class="flex size-9 items-center justify-center rounded-[6px] bg-(--ice) text-(--signal)">
        <UIcon
          name="i-lucide-mail-plus"
          class="size-5"
        />
      </span>
      <h3 class="flex-1 font-semibold text-(--ink)">
        Outreach mailbox
      </h3>
      <span
        class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.09em]"
        :class="o?.ready ? 'bg-success/10 text-success' : 'bg-(--paper) text-(--ink2)'"
      >{{ !o ? '…' : o.ready ? `On · ${o.transport}` : 'Not set up' }}</span>
      <UButton
        size="sm"
        variant="outline"
        icon="i-lucide-plug-zap"
        :loading="busy === 'check'"
        :disabled="!o?.smtp"
        @click="run('check')"
      >
        Check SMTP
      </UButton>
      <UButton
        size="sm"
        icon="i-lucide-send"
        :loading="busy === 'test'"
        :disabled="!o?.ready"
        @click="run('test')"
      >
        Send test email to myself
      </UButton>
    </div>
    <p class="mt-3 text-sm text-(--ink2)">
      Prospecting sequences are sent from your own mailbox: Hostinger SMTP straight from the Worker (default), or n8n's
      SMTP node with OUTREACH_TRANSPORT=n8n. n8n watches the inbox over IMAP and posts replies and bounces back, signed.
      The site's own emails keep using Resend; outreach never does.
    </p>
    <dl
      v-if="o"
      class="mt-3 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2"
    >
      <div>
        <dt class="inline text-(--ink2)">
          From:
        </dt><dd class="inline font-mono">
          {{ o.from ?? 'OUTREACH_FROM not set' }}
        </dd>
      </div>
      <div>
        <dt class="inline text-(--ink2)">
          SMTP:
        </dt><dd class="inline font-mono">
          {{ o.smtp ? `${o.smtp.user} @ ${o.smtp.host}:${o.smtp.port}` : 'SMTP_USER / SMTP_PASS not set' }}
        </dd>
      </div>
      <div>
        <dt class="inline text-(--ink2)">
          n8n send webhook:
        </dt><dd class="inline">
          {{ o.n8nSend ? 'set' : 'not set' }}{{ o.transport === 'n8n' ? ' (in use)' : '' }}
        </dd>
      </div>
      <div>
        <dt class="inline text-(--ink2)">
          n8n inbound:
        </dt><dd class="inline">
          {{ !o.inboundConfigured ? 'N8N_WEBHOOK_SECRET not set' : o.lastInbound ? `last ${o.lastInbound.type} ${new Date(o.lastInbound.at).toLocaleString()}${o.lastInbound.matchedBy ? ` (matched by ${o.lastInbound.matchedBy})` : ' (unmatched)'} · ${o.lastInbound.week} this week` : 'no events yet' }}
        </dd>
      </div>
    </dl>
    <p
      v-if="o?.problem"
      class="mt-2 text-xs text-(--label)"
    >
      {{ o.problem }} — see docs/PROSPECTING.md.
    </p>
    <p
      v-if="result"
      class="mt-2 text-xs"
      :class="result.ok ? 'text-success' : 'text-error'"
    >
      {{ result.text }}
    </p>
    <pre
      v-if="result?.transcript?.length"
      class="mt-2 max-h-40 overflow-auto rounded-[4px] bg-(--paper) p-2 text-[11px] text-(--ink2)"
    >{{ result.transcript.join('\n') }}</pre>
  </section>
</template>
