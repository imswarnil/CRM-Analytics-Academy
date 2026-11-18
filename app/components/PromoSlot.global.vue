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
 * Fixed sizes that do not fit the column swap to a responsive unit first.
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
// The unit actually requested: the one asked for, or its responsive
// counterpart when a fixed size is wider than the space it landed in (a
// 728×90 in a phone column, a 336×280 in a narrow sidebar).
const active = ref<PromoUnitName>(props.unit)
const ready = ref(false)
const u = computed<PromoUnit>(() => PROMO_UNITS[active.value])
const promoFree = usePromoFree()
const allowed = computed(() => promoAllowed(route.path) && !promoFree.value)
const dev = import.meta.dev
const box = ref<HTMLElement | null>(null)

function fitUnit(width: number): PromoUnitName {
  const size = PROMO_UNITS[props.unit].size
  if (!size || size[0] <= width) return props.unit
  if (size[1] > size[0] * 1.5) return 'vertical'
  return size[0] / size[1] >= 3 ? 'horizontal' : 'square'
}

// A unit is requested only when it comes near the screen: pages load faster,
// and every impression is a viewable one (which is what advertisers pay for).
// If AdSense has nothing to show, the frame collapses instead of sitting empty.
const shown = ref(false)
const unfilled = ref(false)
const ins = ref<HTMLElement | null>(null)
let io: IntersectionObserver | undefined
let mo: MutationObserver | undefined

function request() {
  try {
    const w = window as unknown as { adsbygoogle?: unknown[] }
    ;(w.adsbygoogle = w.adsbygoogle || []).push({})
  } catch {
    // A blocked or failed unit simply stays collapsed — never an error.
  }
}

onMounted(() => {
  active.value = fitUnit(box.value?.clientWidth || window.innerWidth)
  ready.value = true
  if (dev || !allowed.value || !box.value) return
  io = new IntersectionObserver(async (entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    io?.disconnect()
    shown.value = true
    await nextTick()
    if (ins.value) {
      mo = new MutationObserver(() => {
        if (ins.value?.dataset.adStatus === 'unfilled') unfilled.value = true
      })
      mo.observe(ins.value, { attributes: true, attributeFilter: ['data-ad-status'] })
    }
    request()
  }, { rootMargin: '600px 0px' })
  io.observe(box.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  mo?.disconnect()
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
    v-if="allowed && !unfilled"
    class="promo-slot relative mx-auto w-full"
    :class="bare ? '' : 'my-8 rounded-[6px] border border-(--line) bg-(--card) p-3'"
    :style="u.size && !bare ? { maxWidth: `${u.size[0] + 26}px` } : undefined"
    aria-label="Advertisement"
  >
    <p
      v-if="!bare"
      class="mb-2 text-[10px] font-bold uppercase tracking-[.09em] text-(--label)"
    >
      Advertisement
    </p>
    <div
      ref="box"
      class="flex items-center justify-center overflow-hidden"
      :style="{ minHeight: `${u.minHeight}px` }"
    >
      <span
        v-if="dev"
        class="font-medium text-[11px] text-(--ink2)"
      >{{ unit }} · {{ u.slot }}</span>
      <ins
        v-else-if="ready && shown"
        ref="ins"
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
