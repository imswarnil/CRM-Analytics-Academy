<script setup lang="ts">
import { AUTHOR } from '~/data/author'

/**
 * "Who teaches this" on the home page: the real work history, from the same
 * facts the About page uses. The portrait is Swarnil's own GitHub avatar;
 * if it fails to load, the frame falls back to his initials.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const photoFailed = ref(false)
</script>

<template>
  <section class="mx-auto max-w-(--ui-container) px-4 py-20 sm:px-6 lg:px-8">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
      <div>
        <p class="eyebrow">
          {{ t('home.author.eyebrow') }}
        </p>
        <BpFigure
          :caption="t('home.author.figure')"
          :spec="AUTHOR.place"
          shadow
          class="mt-4"
        >
          <div class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-5 p-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <div class="relative aspect-square overflow-hidden border-[1.5px] border-(--ink) bg-(--signal)">
              <img
                v-if="!photoFailed"
                :src="AUTHOR.avatar"
                :alt="AUTHOR.name"
                width="288"
                height="288"
                loading="lazy"
                class="size-full object-cover"
                @error="photoFailed = true"
              >
              <span
                v-else
                class="flex size-full items-center justify-center text-4xl font-black tracking-[-0.04em] text-white"
              >{{ AUTHOR.initials }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="text-2xl font-extrabold tracking-[-0.02em] text-(--ink)">
                {{ AUTHOR.name }}
              </h3>
              <p class="mono-label mt-1">
                {{ AUTHOR.role }} · {{ AUTHOR.company }}
              </p>
              <div class="mt-4 flex flex-wrap gap-1.5">
                <UButton
                  v-for="s in AUTHOR.social.slice(0, 4)"
                  :key="s.key"
                  :to="s.url"
                  target="_blank"
                  :icon="s.icon"
                  :aria-label="s.label"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  square
                />
              </div>
            </div>
          </div>
          <ol class="border-t-[1.5px] border-(--ink)">
            <li
              v-for="r in AUTHOR.roles"
              :key="r.company"
              class="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 border-b border-dashed border-(--line) px-5 py-2.5 last:border-b-0"
            >
              <span
                class="font-mono text-[11px]"
                :class="r.current ? 'font-semibold text-(--signal)' : 'text-(--ink2)'"
              >{{ r.years }}</span>
              <span class="min-w-0 truncate text-sm text-(--ink)"><strong class="font-bold">{{ r.title }}</strong> · {{ r.company }}</span>
            </li>
          </ol>
        </BpFigure>
      </div>

      <div>
        <h2 class="bp-h2">
          {{ t('home.author.title') }}
        </h2>
        <p class="bp-lead mt-5">
          {{ AUTHOR.lede }}
        </p>
        <ul class="mt-8 space-y-3">
          <li
            v-for="(h, i) in AUTHOR.highlights"
            :key="i"
            class="flex gap-3 border-[1.5px] border-(--ink) bg-(--card) p-4"
          >
            <span class="font-mono text-xs font-semibold text-(--signal)">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="text-[15px] leading-relaxed text-(--ink2)">{{ h }}</span>
          </li>
        </ul>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            :to="localePath('/about')"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ t('home.author.more') }}
          </UButton>
          <UButton
            :to="AUTHOR.social[1]!.url"
            target="_blank"
            color="neutral"
            variant="outline"
            icon="i-simple-icons-linkedin"
          >
            {{ t('home.author.connect') }}
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
