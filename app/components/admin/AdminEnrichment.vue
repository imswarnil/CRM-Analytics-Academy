<script setup lang="ts">
/**
 * One person's first-party enrichment (server/utils/enrich.ts): score and
 * grade with every reason, company from the email domain, location and
 * network at their last event, product signals, Salesforce sync state.
 */
import type { LeadEnrichment, LeadSyncState } from '~~/shared/types/gtm'

const props = defineProps<{ enrichment: LeadEnrichment | null, sync?: LeadSyncState | null }>()
const open = ref(false)

const gradeClass = computed(() => ({
  Hot: 'bg-error/10 text-error',
  Warm: 'bg-warning/10 text-warning',
  Cold: 'bg-(--paper) text-(--ink2)'
}[props.enrichment?.grade ?? 'Cold'] ?? 'bg-(--paper) text-(--ink2)'))

const s = computed(() => props.enrichment?.signals ?? {})
const signalLine = computed(() => {
  const x = s.value as Record<string, number | string | boolean | null | { name?: string }>
  if (!Object.keys(x).length) return 'No account'
  return [
    x.plan && x.plan !== 'free' ? `Pro (${x.plan})` : 'Free',
    `${x.lessons ?? 0} lessons`,
    `${x.streak ?? 0}-day streak`,
    `${x.activeDays30 ?? 0} active days/30`,
    x.exams ? `${x.exams} exams, best ${x.bestExamPct}%` : '',
    x.checkouts ? `${x.checkouts} checkout(s)` : '',
    x.org && typeof x.org === 'object' ? `seat at ${x.org.name}` : '',
    typeof x.lastActive === 'string' ? `last active ${x.lastActive.slice(0, 10)}` : ''
  ].filter(Boolean).join(' · ')
})
const place = computed(() => [props.enrichment?.city, props.enrichment?.region, props.enrichment?.country].filter(Boolean).join(', '))
const date = (d: string) => new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <div class="mt-3 rounded-[6px] border border-(--line) bg-(--paper) p-3 text-xs">
    <p
      v-if="!enrichment"
      class="text-(--ink2)"
    >
      Not enriched yet (enrichment runs after the next event, or after the migration is applied).
    </p>
    <template v-else>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          class="rounded-full px-2 py-0.5 font-bold uppercase tracking-[.09em]"
          :class="gradeClass"
        >{{ enrichment.grade }} · {{ enrichment.score }}</span>
        <span class="text-(--ink2)">fit {{ enrichment.fit }} · engagement {{ enrichment.engagement }}</span>
        <img
          v-if="enrichment.logo && enrichment.domainKind === 'business'"
          :src="enrichment.logo"
          alt=""
          class="size-4 rounded-[2px]"
          referrerpolicy="no-referrer"
          loading="lazy"
        >
        <span
          v-if="enrichment.company"
          class="font-semibold text-(--ink)"
        >{{ enrichment.company }}</span>
        <a
          v-if="enrichment.website"
          :href="enrichment.website"
          target="_blank"
          rel="noopener noreferrer"
          class="text-(--signal) hover:underline"
        >{{ enrichment.emailDomain }}</a>
        <span v-else-if="enrichment.emailDomain">{{ enrichment.emailDomain }}</span>
        <span class="rounded-[4px] border border-(--line) px-1.5 text-(--ink2)">{{ enrichment.domainKind ?? 'unknown' }} email</span>
        <a
          v-if="enrichment.linkedin"
          :href="enrichment.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-(--signal) hover:underline"
        >LinkedIn</a>
      </div>
      <p class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-(--ink2)">
        <span v-if="place">{{ place }}<template v-if="enrichment.timezone"> ({{ enrichment.timezone }})</template></span>
        <span v-if="enrichment.networkOrg">network {{ enrichment.networkOrg }} · {{ enrichment.networkKind }}</span>
        <span v-if="enrichment.firstTouch">first touch {{ enrichment.firstTouch }}</span>
        <span v-if="enrichment.lastEvent">last event {{ enrichment.lastEvent }}</span>
        <span v-if="enrichment.enrichedAt">enriched {{ date(enrichment.enrichedAt) }}</span>
      </p>
      <p class="mt-1 text-(--ink)">
        {{ signalLine }}
      </p>
      <p
        v-if="enrichment.description"
        class="mt-1 line-clamp-2 text-(--ink2)"
      >
        {{ enrichment.description }}
      </p>
      <button
        type="button"
        class="mt-1.5 text-(--signal) hover:underline"
        @click="open = !open"
      >
        {{ open ? 'Hide' : 'Why this score' }}
      </button>
      <ul
        v-if="open"
        class="mt-1 space-y-0.5"
      >
        <li
          v-for="r in enrichment.reasons"
          :key="r.why"
          class="flex gap-2"
        >
          <span
            class="w-8 text-right font-mono tabular-nums"
            :class="r.points < 0 ? 'text-error' : 'text-(--ink)'"
          >{{ r.points > 0 ? '+' : '' }}{{ r.points }}</span>
          <span class="w-20 text-(--ink2)">{{ r.kind }}</span>
          <span class="text-(--ink)">{{ r.why }}</span>
        </li>
        <li
          v-if="!enrichment.reasons.length"
          class="text-(--ink2)"
        >
          No signals yet.
        </li>
      </ul>
    </template>
    <p
      v-if="sync !== undefined"
      class="mt-1.5 font-mono text-[11px]"
      :class="!sync ? 'text-(--ink2)' : sync.status === 'ok' ? 'text-(--signal)' : 'text-error'"
    >
      Account sync: {{ sync ? `${sync.status} · ${date(sync.at)}${sync.sfId ? ` · ${sync.sfId}` : ''}` : 'not synced' }}
    </p>
  </div>
</template>
