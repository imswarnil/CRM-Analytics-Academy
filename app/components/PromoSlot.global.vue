<script setup lang="ts">
/**
 * One AdSense unit in a Blueprint frame: an "Advertisement" label, the size
 * written like a drawing spec, crop marks at the corners. The box is reserved
 * from the first render (unit.minHeight), so nothing below it moves when the
 * creative arrives.
 *
 * A new unit is requested on every page: parents render this with the route as
 * part of their key, so navigating remounts it and pushes a fresh <ins>.
 * In `nuxt dev` no request is made; a labelled placeholder shows the box.
 *
 * Registered globally (.global) so lesson bodies can use it — see
 * withInArticlePromos in app/utils/promo.ts.
 */
import { PROMO_CLIENT, PROMO_UNITS, promoAllowed, type PromoUnit, type PromoUnitName } from '~/utils/promo'

const props = withDefaults(defineProps<{
  unit: PromoUnitName
  /** Hide the label row (the floating bar has its own chrome). */
  bare?: boolean
}>(), { bare: false })

const route = useRoute()
const u = computed<PromoUnit>(() => PROMO_UNITS[props.unit])
const allowed = computed(() => promoAllowed(route.path))
const dev = import.meta.dev
const box = ref<HTMLElement | null>(null)

onMounted(() => {
  if (dev || !allowed.value) return
  // The library is loaded once from <head> (nuxt.config); each mounted <ins>
  // asks it for one creative.
  try {
    const w = window as unknown as { adsbygoogle?: unknown[] }
    ;(w.adsbygoogle = w.adsbygoogle || []).push({})
  } catch {
    // A blocked or failed unit leaves an empty, labelled box — never an error.
  }
})

const style = computed(() => {
  const size = u.value.size
  return size
    ? { display: 'inline-block', width: `${size[0]}px`, height: `${size[1]}px` }
    : { display: 'block' }
})
</script>

<template>
  <aside
    v-if="allowed"
    class="promo-slot crosshair relative mx-auto w-full"
    :class="bare ? '' : 'my-8 border-[1.5px] border-(--ink) bg-(--card) p-3'"
    :style="u.size && !bare ? { maxWidth: `${u.size[0] + 26}px` } : undefined"
    aria-label="Advertisement"
  >
    <p
      v-if="!bare"
      class="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[.14em] text-(--ink2)"
    >
      <span>Advertisement</span>
      <span>{{ u.label }}</span>
    </p>
    <div
      ref="box"
      class="graph-paper-fine flex items-center justify-center overflow-hidden"
      :style="{ minHeight: `${u.minHeight}px` }"
    >
      <span
        v-if="dev"
        class="font-mono text-[10px] uppercase tracking-[.12em] text-(--ink2)"
      >{{ unit }} · {{ u.slot }}</span>
      <ins
        v-else
        class="adsbygoogle"
        :style="style"
        :data-ad-client="PROMO_CLIENT"
        :data-ad-slot="u.slot"
        :data-ad-format="u.format"
        :data-ad-layout="u.layout"
        :data-full-width-responsive="!u.size && u.format !== 'fluid' && u.format !== 'autorelaxed' ? 'true' : undefined"
      />
    </div>
  </aside>
</template>
