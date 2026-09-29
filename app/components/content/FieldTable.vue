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
  measure: 'text-(--signal) border border-(--signal)',
  dimension: 'text-(--ink) border border-(--ink)',
  date: 'text-(--ink) bg-(--ice) border border-(--ink)',
  key: 'text-(--paper) bg-(--ink) border border-(--ink)'
}
const badge = (role?: string) => COLOURS[role ?? ''] ?? 'text-(--ink2) border border-(--line)'
</script>

<template>
  <div class="not-prose my-8 overflow-hidden border-[1.5px] border-(--ink)">
    <div
      v-if="dataset"
      class="flex flex-wrap items-baseline justify-between gap-2 border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2.5"
    >
      <p class="flex items-center gap-2 font-mono text-xs font-semibold text-(--ink)">
        <UIcon
          name="i-lucide-file-spreadsheet"
          class="size-4 text-(--signal)"
        />
        {{ dataset }}
      </p>
      <p
        v-if="grain"
        class="text-xs text-(--ink2)"
      >
        {{ grain }}
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-(--paper) font-mono text-[10px] uppercase tracking-[.1em] text-(--ink2)">
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
        <tbody class="divide-y divide-dashed divide-(--line)">
          <tr
            v-for="(f, i) in fields"
            :key="i"
            class="align-top"
          >
            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] font-medium text-(--ink)">
              {{ f.name }}
            </td>
            <td class="whitespace-nowrap px-4 py-2.5">
              <span
                class="px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em]"
                :class="badge(f.role)"
              >{{ f.role || f.type || '—' }}</span>
              <span
                v-if="f.role && f.type"
                class="ml-1.5 text-xs text-(--ink2)"
              >{{ f.type }}</span>
            </td>
            <td class="px-4 py-2.5 text-(--ink2)">
              {{ f.note }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
