<script setup lang="ts">
/**
 * Renders one sponsor creative, filling whatever box its parent reserved.
 *
 * The SAME component draws the live slot and the studio's previews, so what a
 * sponsor sees while editing is exactly what readers get. Layout adapts to
 * the box through container queries (`@container`), not the viewport, so a
 * 300×250 square in a 220px rail scales down instead of reflowing.
 *
 * `href` is set for the live slot (the click-counting redirect); without it
 * the creative is inert, as in a preview.
 */
import type { PartnerCreative } from '#shared/utils/partner'

const props = withDefaults(defineProps<{
  creative: Pick<PartnerCreative, 'format' | 'mode' | 'imageUrl' | 'imageMobileUrl' | 'logoUrl' | 'headline' | 'body' | 'cta' | 'theme' | 'alt' | 'sponsor'>
  href?: string | null
  /** Leaderboard image only: force the desktop or phone picture (previews). */
  variant?: 'auto' | 'desktop' | 'mobile'
}>(), { href: null, variant: 'auto' })

const c = computed(() => props.creative)

const tone = computed(() => {
  switch (c.value.theme) {
    case 'navy': return { box: 'graph-paper-navy text-white', sub: 'text-white/75', cta: 'bg-(--glow) text-(--navy)', logo: 'border-white/70 bg-white/10' }
    case 'signal': return { box: 'bg-(--signal) text-white', sub: 'text-white/85', cta: 'bg-white text-(--signal)', logo: 'border-white/70 bg-white/10' }
    default: return { box: 'graph-paper-fine bg-(--card) text-(--ink)', sub: 'text-(--ink2)', cta: 'bg-(--signal) text-white', logo: 'border-(--ink) bg-(--ice)' }
  }
})

const initial = computed(() => (c.value.sponsor || c.value.headline || '?').trim().charAt(0).toUpperCase())
const { t } = useI18n()
const ctaText = computed(() => c.value.cta || t('sponsor.slot.defaultCta'))
const desktopSrc = computed(() => c.value.imageUrl ?? '')
const mobileSrc = computed(() => c.value.imageMobileUrl || c.value.imageUrl || '')
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'sponsored noopener' : undefined"
    class="@container group relative block h-full w-full overflow-hidden border-[1.5px] border-(--ink)"
    :class="c.mode === 'image' ? 'bg-(--card)' : tone.box"
  >
    <!-- ============ Image creatives ============ -->
    <template v-if="c.mode === 'image' && c.imageUrl">
      <picture
        v-if="c.format === 'leaderboard' && variant === 'auto'"
        class="block h-full w-full"
      >
        <source
          media="(max-width: 639px)"
          :srcset="mobileSrc"
        >
        <img
          :src="desktopSrc"
          :alt="c.alt || c.sponsor"
          loading="lazy"
          decoding="async"
          class="block h-full w-full object-contain"
        >
      </picture>
      <img
        v-else
        :src="c.format === 'leaderboard' && variant === 'mobile' ? mobileSrc : desktopSrc"
        :alt="c.alt || c.sponsor"
        loading="lazy"
        decoding="async"
        class="block h-full w-full object-contain"
      >
    </template>

    <!-- ============ Designed: leaderboard ============ -->
    <div
      v-else-if="c.format === 'leaderboard'"
      class="flex h-full items-center gap-3 px-3 @md:gap-4 @md:px-4"
    >
      <span
        class="flex size-11 flex-none items-center justify-center overflow-hidden border-[1.5px] @md:size-14"
        :class="tone.logo"
      >
        <img
          v-if="c.logoUrl"
          :src="c.logoUrl"
          alt=""
          class="h-full w-full object-contain"
        >
        <span
          v-else
          class="text-lg font-black"
        >{{ initial }}</span>
      </span>
      <span class="min-w-0 flex-1">
        <span class="line-clamp-2 text-[15px] leading-tight font-black tracking-[-0.02em] @md:line-clamp-1 @md:text-[20px]">{{ c.headline }}</span>
        <span
          v-if="c.body"
          class="mt-0.5 hidden text-[12.5px] leading-snug @md:line-clamp-1"
          :class="tone.sub"
        >{{ c.body }}</span>
      </span>
      <span
        class="hidden flex-none border-[1.5px] border-current px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.08em] @md:inline-block"
        :class="tone.cta"
      >{{ ctaText }} →</span>
    </div>

    <!-- ============ Designed: square ============ -->
    <div
      v-else-if="c.format === 'square'"
      class="flex h-full flex-col p-[6cqw]"
    >
      <span
        class="flex size-[16cqw] flex-none items-center justify-center overflow-hidden border-[1.5px]"
        :class="tone.logo"
      >
        <img
          v-if="c.logoUrl"
          :src="c.logoUrl"
          alt=""
          class="h-full w-full object-contain"
        >
        <span
          v-else
          class="text-[8cqw] font-black"
        >{{ initial }}</span>
      </span>
      <span class="mt-[4cqw] line-clamp-3 text-[8cqw] leading-[1.05] font-black tracking-[-0.03em]">{{ c.headline }}</span>
      <span
        v-if="c.body"
        class="mt-[2.5cqw] line-clamp-3 text-[4.6cqw] leading-snug"
        :class="tone.sub"
      >{{ c.body }}</span>
      <span
        class="mt-auto self-start border-[1.5px] border-current px-[3.5cqw] py-[1.8cqw] font-mono text-[3.8cqw] font-semibold uppercase tracking-[.08em]"
        :class="tone.cta"
      >{{ ctaText }} →</span>
    </div>

    <!-- ============ Text ============ -->
    <div
      v-else
      class="flex h-full items-start gap-3 p-3 @md:gap-4 @md:p-4"
    >
      <span
        class="flex size-12 flex-none items-center justify-center overflow-hidden border-[1.5px]"
        :class="tone.logo"
      >
        <img
          v-if="c.logoUrl"
          :src="c.logoUrl"
          alt=""
          class="h-full w-full object-contain"
        >
        <span
          v-else
          class="text-lg font-black"
        >{{ initial }}</span>
      </span>
      <span class="flex min-w-0 flex-1 flex-col self-stretch">
        <span class="line-clamp-1 text-[15px] font-black tracking-[-0.01em] @md:text-base">{{ c.headline }}</span>
        <span
          v-if="c.body"
          class="mt-0.5 line-clamp-2 text-[13px] leading-snug"
          :class="tone.sub"
        >{{ c.body }}</span>
        <span class="mt-auto font-mono text-[11px] font-semibold uppercase tracking-[.08em] group-hover:underline">{{ ctaText }} →</span>
      </span>
    </div>
  </component>
</template>
