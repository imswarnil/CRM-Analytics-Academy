<script setup lang="ts">
/**
 * "Credits & sources" at the end of a lesson: every third-party video, post,
 * article, image or dataset the lesson embeds or builds on, with its author
 * and a link to the original. The lesson's own embedded video is listed too
 * when it is someone else's.
 */
import type { LessonCreditItem, VideoCredit } from '~/composables/useLessonCredits'

const props = defineProps<{
  credits: LessonCreditItem[]
  video?: VideoCredit | null
}>()
const { t } = useI18n()

const ICONS: Record<string, string> = {
  video: 'i-lucide-video',
  post: 'i-lucide-pen-line',
  article: 'i-lucide-newspaper',
  image: 'i-lucide-image',
  dataset: 'i-lucide-database'
}

const items = computed<LessonCreditItem[]>(() => {
  const list = [...props.credits]
  const v = props.video
  // The header video is credited under the embed; list it here as well unless
  // the author already did.
  if (v && !list.some(c => c.url === v.url || c.url.includes(v.url.split('v=')[1] ?? '\u0000'))) {
    list.unshift({ kind: 'video', title: v.title ?? 'YouTube', author: v.author, authorUrl: v.authorUrl ?? undefined, url: v.url })
  }
  return list
})
</script>

<template>
  <section
    v-if="items.length"
    class="my-10 border-[1.5px] border-(--ink) bg-(--card)"
    aria-labelledby="lesson-credits"
  >
    <h2
      id="lesson-credits"
      class="border-b-[1.5px] border-(--ink) bg-(--ice) px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-(--ink)"
    >
      {{ t('credits.title') }}
    </h2>
    <ol class="divide-y divide-dashed divide-(--line)">
      <li
        v-for="(c, i) in items"
        :key="`${c.url}-${i}`"
        class="flex gap-3 px-4 py-3"
      >
        <UIcon
          :name="ICONS[c.kind] ?? 'i-lucide-link'"
          class="mt-0.5 size-4 flex-none text-(--signal)"
        />
        <div class="min-w-0 text-sm">
          <p class="text-(--ink)">
            <span class="me-1.5 font-mono text-[10px] uppercase tracking-[.08em] text-(--ink2)">{{ t(`credits.kinds.${c.kind}`) }}</span>
            <a
              :href="c.url"
              target="_blank"
              rel="noopener"
              class="font-semibold underline-offset-4 hover:text-(--signal) hover:underline"
            >{{ c.title }} ↗</a>
          </p>
          <p class="mt-0.5 text-(--ink2)">
            {{ t('credits.by') }}
            <a
              v-if="c.authorUrl"
              :href="c.authorUrl"
              target="_blank"
              rel="noopener"
              class="font-medium text-(--ink) hover:text-(--signal)"
            >{{ c.author }}</a>
            <span
              v-else
              class="font-medium text-(--ink)"
            >{{ c.author }}</span>
            <template v-if="c.license">
              · {{ t('credits.license', { license: c.license }) }}
            </template>
          </p>
          <p
            v-if="c.note"
            class="mt-1 text-(--ink2)"
          >
            {{ c.note }}
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>
