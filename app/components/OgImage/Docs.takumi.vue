<script setup lang="ts">
/**
 * The share card (1200×630) every page gets through defineOgImage('Docs', …),
 * in the site's own look: a navy title band, the logo, an uppercase label
 * (the section, or what the page is), the title, one line of description,
 * and a footer with the domain and a short spec pill. A rising bar chart on
 * the right is the brand motif. Inline styles only: the Takumi renderer does
 * not run the site's CSS.
 */
defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  headline?: string
  title?: string
  description?: string
  /** Small label on the right of the footer, e.g. "60 questions · 105 min". */
  spec?: string
}>()

const C = { navy: '#032D60', deep: '#001A3E', signal: '#0176D3', sky: '#1B96FF', frost: '#7CBEFF', white: '#FFFFFF', soft: '#C9DDF4', line: '#1D4A80' }
const heading = computed(() => (props.title ?? '').replace(/\s+—\s+coming soon$/i, ''))
const size = computed(() => heading.value.length > 64 ? 52 : heading.value.length > 38 ? 62 : 74)
const bars = [120, 190, 160, 250, 300]
</script>

<template>
  <div :style="{ width: '100%', height: '100%', display: 'flex', background: `linear-gradient(135deg, ${C.navy} 0%, ${C.deep} 100%)`, position: 'relative', overflow: 'hidden' }">
    <!-- The brand motif: a rising bar chart, bottom right -->
    <div :style="{ position: 'absolute', right: '64px', bottom: '118px', display: 'flex', alignItems: 'flex-end', gap: '18px', opacity: 0.9 }">
      <div
        v-for="(h, i) in bars"
        :key="i"
        :style="{ width: '46px', height: `${h}px`, borderRadius: '6px 6px 0 0', background: i === bars.length - 1 ? C.sky : i % 2 ? C.signal : C.line }"
      />
    </div>

    <div :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '60px 72px 52px' }">
      <!-- Logo -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
        <div :style="{ width: '56px', height: '56px', borderRadius: '10px', background: C.white, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '5px', paddingBottom: '13px' }">
          <div :style="{ width: '9px', height: '14px', borderRadius: '2px', background: C.frost }" />
          <div :style="{ width: '9px', height: '22px', borderRadius: '2px', background: C.sky }" />
          <div :style="{ width: '9px', height: '30px', borderRadius: '2px', background: C.signal }" />
        </div>
        <div :style="{ display: 'flex', gap: '10px', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.01em' }">
          <span :style="{ color: C.white }">CRM Analytics</span>
          <span :style="{ color: C.frost }">Academy</span>
        </div>
      </div>

      <!-- Body -->
      <div :style="{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '730px' }">
        <span
          v-if="headline"
          :style="{ fontSize: '22px', fontWeight: 700, color: C.frost, letterSpacing: '0.12em', textTransform: 'uppercase' }"
        >{{ headline }}</span>
        <span :style="{ fontSize: `${size}px`, fontWeight: 800, color: C.white, lineHeight: 1.06, letterSpacing: '-0.025em' }">{{ heading }}</span>
        <span
          v-if="description"
          :style="{ fontSize: '28px', lineHeight: 1.35, color: C.soft, lineClamp: 2, textOverflow: 'ellipsis', overflow: 'hidden' }"
        >{{ description }}</span>
      </div>

      <!-- Footer -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '18px', borderTop: `2px solid ${C.line}`, paddingTop: '22px' }">
        <span :style="{ fontSize: '22px', fontWeight: 600, color: C.white, letterSpacing: '0.04em' }">crmanalytics.imswarnil.com</span>
        <span :style="{ flex: 1 }" />
        <span :style="{ fontSize: '20px', fontWeight: 700, color: C.white, background: C.signal, padding: '8px 16px', borderRadius: '6px', letterSpacing: '0.08em' }">{{ spec || 'FREE TO START · 7 LANGUAGES' }}</span>
      </div>
    </div>
  </div>
</template>
