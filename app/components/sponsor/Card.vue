<script setup lang="ts">
/**
 * A sponsor's creative, in each format the Academy serves. One component draws
 * the live placements (SponsorBanner) and every preview in the sponsor's
 * studio, so what they design is exactly what runs.
 *
 *   bar    under the navbar on every page (desktop and phone)
 *   card   at the end of each lesson, after the body
 *   tile   under the lesson's table of contents
 *
 * Everything inside is the sponsor's: photo, logo, title, tagline,
 * description, price or offer, website, button, colours, layout, corners and
 * font. The "Sponsored" label is always the Academy's.
 */
export interface Creative {
  logo?: string
  photo?: string
  headline?: string
  tagline?: string
  body?: string
  price?: string
  website?: string
  cta?: string
  url?: string
  bg?: string
  fg?: string
  accent?: string
  layout?: string
  radius?: string
  font?: string
}
const props = withDefaults(defineProps<{
  company: string
  creative: Creative
  format?: 'bar' | 'card' | 'tile'
  preview?: boolean
  /** Phone-width bar (for the studio preview; live, the bar adapts itself). */
  narrow?: boolean
}>(), { format: 'bar', preview: false, narrow: false })
const emit = defineEmits<{ click: [] }>()
const { t } = useI18n()

const c = computed(() => props.creative)
const FONT: Record<string, string> = { serif: 'ui-serif, Georgia, "Times New Roman", serif', mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
const R: Record<string, { box: string, btn: string }> = {
  square: { box: '0px', btn: '0px' },
  rounded: { box: '16px', btn: '10px' },
  pill: { box: '22px', btn: '999px' }
}
const r = computed(() => R[c.value.radius ?? ''] ?? R.square!)
const style = computed(() => ({
  'background': c.value.bg || '#0c1b33',
  'color': c.value.fg || '#ffffff',
  'fontFamily': FONT[c.value.font ?? ''],
  '--sp-accent': c.value.accent || '#2f5bea',
  '--sp-btn-r': r.value.btn
}))
const title = computed(() => c.value.headline || props.company)
const site = computed(() => c.value.website || (c.value.url ? c.value.url.replace(/^https?:\/\//, '').split('/')[0] : ''))
const layout = computed(() => (c.value.photo ? c.value.layout || 'image' : 'text'))
const href = computed(() => (props.preview ? undefined : c.value.url))
</script>

<template>
  <!-- BAR: one line under the navbar -->
  <div
    v-if="props.format === 'bar'"
    class="sp-bar flex min-h-12 items-center gap-3 px-4 py-2 sm:px-6"
    :class="props.narrow ? 'sp-narrow' : ''"
    :style="style"
  >
    <span class="sp-label shrink-0">{{ t('sponsor.label') }}</span>
    <img
      v-if="c.logo"
      :src="c.logo"
      :alt="props.company"
      class="h-7 w-auto max-w-24 shrink-0 object-contain"
      loading="lazy"
    >
    <p class="min-w-0 flex-1 truncate text-sm">
      <span class="font-bold">{{ title }}</span>
      <span
        v-if="c.tagline || c.body"
        class="sp-wide opacity-80"
      > — {{ c.tagline || c.body }}</span>
    </p>
    <span
      v-if="c.price"
      class="sp-wide sp-price shrink-0"
    >{{ c.price }}</span>
    <a
      v-if="c.cta && c.url"
      :href="href"
      target="_blank"
      rel="sponsored noopener"
      class="sp-btn shrink-0"
      @click="emit('click')"
    >{{ c.cta }}</a>
  </div>

  <!-- CARD (end of lesson) and TILE (beside the contents) -->
  <article
    v-else
    class="sp-box relative overflow-hidden"
    :class="[`sp-${props.format}`, `sp-l-${layout}`]"
    :style="{ ...style, borderRadius: r.box }"
  >
    <span class="sp-label absolute end-3 top-3 z-10">{{ t('sponsor.label') }}</span>
    <div
      v-if="layout !== 'text'"
      class="sp-photo"
    >
      <img
        :src="c.photo"
        :alt="title"
        loading="lazy"
      >
    </div>
    <div class="sp-body flex min-w-0 flex-col gap-2">
      <div class="flex items-center gap-2.5">
        <img
          v-if="c.logo"
          :src="c.logo"
          :alt="props.company"
          class="h-8 w-auto max-w-24 object-contain"
          loading="lazy"
        >
        <span class="min-w-0">
          <span class="block truncate text-[13px] font-semibold opacity-90">{{ props.company }}</span>
          <span
            v-if="site"
            class="block truncate text-[11px] opacity-60"
          >{{ site }}</span>
        </span>
      </div>
      <h3 class="sp-title font-extrabold leading-tight tracking-[-0.01em]">
        {{ title }}
      </h3>
      <p
        v-if="c.tagline"
        class="sp-tagline font-semibold"
      >
        {{ c.tagline }}
      </p>
      <p
        v-if="c.body"
        class="sp-desc opacity-80"
      >
        {{ c.body }}
      </p>
      <div
        v-if="c.price || (c.cta && c.url)"
        class="mt-auto flex flex-wrap items-center gap-3 pt-2"
      >
        <span
          v-if="c.price"
          class="sp-price"
        >{{ c.price }}</span>
        <a
          v-if="c.cta && c.url"
          :href="href"
          target="_blank"
          rel="sponsored noopener"
          class="sp-btn"
          :class="props.format === 'tile' ? 'w-full text-center' : ''"
          @click="emit('click')"
        >{{ c.cta }} →</a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.sp-label {
  border: 1px solid currentColor;
  padding: 1px 6px;
  font: 600 9px/1.4 ui-monospace, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}
.sp-btn {
  display: inline-block;
  background: var(--sp-accent);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 7px 14px;
  border-radius: var(--sp-btn-r);
  text-decoration: none;
  transition: filter 0.2s, transform 0.2s;
}
.sp-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
.sp-price {
  font-weight: 800;
  font-size: 13px;
  padding: 3px 9px;
  border-radius: var(--sp-btn-r);
  background: color-mix(in srgb, var(--sp-accent) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--sp-accent) 55%, transparent);
}
@media (max-width: 639px) { .sp-wide { display: none; } }
.sp-narrow .sp-wide { display: none; }
.sp-box { border: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
.sp-photo { overflow: hidden; }
.sp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sp-body { padding: 18px 20px 20px; }
.sp-title { font-size: 22px; }
.sp-tagline { font-size: 15px; color: var(--sp-accent); filter: brightness(1.25); }
.sp-desc { font-size: 14px; line-height: 1.5; }
/* Card: photo on top, or beside the text from 40rem. */
.sp-card.sp-l-image .sp-photo { aspect-ratio: 21 / 8; }
.sp-card.sp-l-side { display: grid; grid-template-columns: 1fr; }
.sp-card.sp-l-side .sp-photo { aspect-ratio: 16 / 9; }
@media (min-width: 40rem) {
  .sp-card.sp-l-side { grid-template-columns: 2fr 3fr; }
  .sp-card.sp-l-side .sp-photo { aspect-ratio: auto; min-height: 100%; }
}
/* Tile: narrow column, photo always on top. */
.sp-tile .sp-photo { aspect-ratio: 16 / 10; }
.sp-tile .sp-body { padding: 14px 16px 16px; }
.sp-tile .sp-title { font-size: 18px; }
.sp-tile .sp-desc { font-size: 13px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>
