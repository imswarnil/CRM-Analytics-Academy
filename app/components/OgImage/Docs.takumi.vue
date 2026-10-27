<script setup lang="ts">
/**
 * The share card (1200×600) every page gets through defineOgImage('Docs', …):
 * a Blueprint drawing sheet — paper ground, ink frame with crop marks, the
 * logo, a mono eyebrow (the section, or what the page is), the title, and the
 * description in readable ink. Inline styles only: the Takumi renderer does
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

const C = { paper: '#F4F7FB', ice: '#DDEBFA', ink: '#0C1B33', ink2: '#4A5B78', signal: '#2F5BEA', line: '#C3D2E6', frost: '#A8CCF2', tide: '#3D8BD9' }
const heading = computed(() => (props.title ?? '').replace(/\s+—\s+coming soon$/i, ''))
const size = computed(() => heading.value.length > 60 ? 50 : heading.value.length > 36 ? 60 : 70)
</script>

<template>
  <div :style="{ width: '100%', height: '100%', display: 'flex', background: C.paper, padding: '28px', position: 'relative' }">
    <div :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, border: `4px solid ${C.ink}`, background: '#FBFCFE', padding: '48px 56px', boxShadow: `14px 14px 0 ${C.signal}` }">
      <!-- Header: logo + site -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
        <svg
          width="52"
          height="52"
          viewBox="0 0 512 512"
        ><rect
          x="40"
          y="40"
          width="432"
          height="432"
          :fill="C.paper"
          :stroke="C.ink"
          stroke-width="28"
        /><rect
          x="128"
          y="292"
          width="64"
          height="100"
          :fill="C.frost"
        /><rect
          x="224"
          y="224"
          width="64"
          height="168"
          :fill="C.tide"
        /><rect
          x="320"
          y="140"
          width="64"
          height="252"
          :fill="C.signal"
        /></svg>
        <div :style="{ display: 'flex', gap: '10px', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em' }">
          <span :style="{ color: C.ink }">CRM Analytics</span>
          <span :style="{ color: C.signal }">Academy</span>
        </div>
      </div>

      <!-- Body -->
      <div :style="{ display: 'flex', flexDirection: 'column', gap: '18px' }">
        <span
          v-if="headline"
          :style="{ fontSize: '22px', fontWeight: 600, color: C.signal, letterSpacing: '0.14em', textTransform: 'uppercase' }"
        >FIG. — {{ headline }}</span>
        <span :style="{ fontSize: `${size}px`, fontWeight: 800, color: C.ink, lineHeight: 1.05, letterSpacing: '-0.03em' }">{{ heading }}</span>
        <span
          v-if="description"
          :style="{ fontSize: '27px', lineHeight: 1.35, color: C.ink2, lineClamp: 2, textOverflow: 'ellipsis', overflow: 'hidden' }"
        >{{ description }}</span>
      </div>

      <!-- Footer rule -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '18px', borderTop: `2px dashed ${C.line}`, paddingTop: '18px' }">
        <span :style="{ fontSize: '20px', fontWeight: 600, color: C.ink, letterSpacing: '0.08em' }">crmanalytics.imswarnil.com</span>
        <span :style="{ flex: 1 }" />
        <span :style="{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', background: C.signal, padding: '6px 14px', letterSpacing: '0.08em' }">{{ spec || 'FREE · 12 LANGUAGES' }}</span>
      </div>
    </div>
  </div>
</template>
