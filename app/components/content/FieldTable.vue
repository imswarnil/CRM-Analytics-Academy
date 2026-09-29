<script setup lang="ts">
/**
 * A field reference for one dataset.
 *
 * Every lesson that builds on the Academy warehouse has to tell the reader which
 * columns exist and, more importantly, which ones are dimensions and which are
 * measures — because in CRM Analytics that distinction decides what you can
 * group by and what you can aggregate, and getting it wrong is the single most
 * common beginner error. So `role` is a required-feeling field, rendered as a
 * badge, rather than a note in prose.
 *
 * ::field-table
 * ---
 * dataset: opportunities.csv
 * fields:
 *   - name: Amount
 *     type: numeric
 *     role: measure
 *     note: ARR in USD. Equals the sum of the opportunity's line items.
 * ---
 * ::
 */
defineProps<{
  fields: {
    name: string
    type?: string
    /** dimension | measure | date | key — drives the badge colour. */
    role?: string
    note?: string
  }[]
  dataset?: string
  /** Optional row count / grain reminder under the heading. */
  grain?: string
}>()

const COLOURS: Record<string, string> = {
  measure: 'text-primary bg-primary/10',
  dimension: 'text-secondary bg-secondary/10',
  date: 'text-success bg-success/10',
  key: 'text-warning bg-warning/10'
}
const badge = (role?: string) => COLOURS[role ?? ''] ?? 'text-muted bg-elevated'
</script>

<template>
  <div class="not-prose my-8 overflow-hidden rounded-xl border border-default">
    <div
      v-if="dataset"
      class="flex flex-wrap items-baseline justify-between gap-2 border-b border-default bg-elevated/50 px-4 py-2.5"
    >
      <p class="flex items-center gap-2 font-mono text-xs font-semibold text-highlighted">
        <UIcon
          name="i-lucide-file-spreadsheet"
          class="size-4 text-primary"
        />
        {{ dataset }}
      </p>
      <p
        v-if="grain"
        class="text-xs text-muted"
      >
        {{ grain }}
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-elevated/25 text-xs uppercase tracking-wide text-dimmed">
          <tr>
            <th
              scope="col"
              class="px-4 py-2 font-medium"
            >
              Field
            </th>
            <th
              scope="col"
              class="px-4 py-2 font-medium"
            >
              Role
            </th>
            <th
              scope="col"
              class="px-4 py-2 font-medium"
            >
              Notes
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr
            v-for="(f, i) in fields"
            :key="i"
            class="align-top"
          >
            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] font-medium text-highlighted">
              {{ f.name }}
            </td>
            <td class="whitespace-nowrap px-4 py-2.5">
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="badge(f.role)"
              >{{ f.role || f.type || '—' }}</span>
              <span
                v-if="f.role && f.type"
                class="ml-1.5 text-xs text-dimmed"
              >{{ f.type }}</span>
            </td>
            <td class="px-4 py-2.5 text-muted">
              {{ f.note }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
