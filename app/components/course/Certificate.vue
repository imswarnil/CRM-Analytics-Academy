<script setup lang="ts">
/**
 * The practice-exam certificate: a certificate sheet with a guilloche border,
 * the learner's name, the score, a credential id, a signature line and an
 * embossed circular stamp. CRM Analytics Academy's own credential — never
 * Salesforce's name or logo — and `sample` adds a watermark for the preview.
 * Pure SVG/CSS, prints cleanly.
 */
const props = withDefaults(defineProps<{
  name?: string
  score?: number | null
  date?: string | null
  credential?: string
  sample?: boolean
}>(), { name: '', score: null, date: null, credential: '', sample: false })

const { t, locale } = useI18n()
const when = computed(() => new Date(props.date ?? Date.now()).toLocaleDateString(locale.value, { year: 'numeric', month: 'long', day: 'numeric' }))
const id = computed(() => props.credential || 'CRMA-PX1-2026-0001')
</script>

<template>
  <figure
    class="cert relative overflow-hidden rounded-[6px] bg-white text-[#032D60]"
    :aria-label="t('cert.paper.title')"
  >
    <!-- guilloche-style double border -->
    <div class="pointer-events-none absolute inset-2.5 rounded-[3px] border-2 border-[#0176D3]/70" />
    <div class="pointer-events-none absolute inset-4 rounded-[2px] border border-[#0176D3]/30" />
    <svg
      class="pointer-events-none absolute inset-0 size-full opacity-[.06]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="cert-wave"
          width="28"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 7 Q7 0 14 7 T28 7"
            fill="none"
            stroke="#0176D3"
            stroke-width="1"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#cert-wave)"
      />
    </svg>

    <div class="relative px-7 pt-8 pb-7 sm:px-10">
      <div class="flex items-center gap-2.5">
        <AppLogo compact />
      </div>

      <p class="mt-6 text-[11px] font-bold uppercase tracking-[.2em] text-[#5C5A57]">
        {{ t('cert.paper.kicker') }}
      </p>
      <p class="mt-1 text-2xl font-bold leading-tight sm:text-[1.75rem]">
        {{ t('cert.paper.title') }}
      </p>

      <p class="mt-5 text-sm text-[#5C5A57]">
        {{ t('cert.paper.awarded') }}
      </p>
      <p class="cert-name mt-1 border-b border-[#032D60]/20 pb-2 text-3xl sm:text-4xl">
        {{ name || t('cert.paper.yourName') }}
      </p>

      <dl class="mt-5 grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt class="font-bold uppercase tracking-[.12em] text-[#5C5A57]">
            {{ t('cert.paper.score') }}
          </dt>
          <dd class="mt-0.5 text-base font-bold tabular-nums">
            {{ score != null ? `${score}%` : '—' }}
          </dd>
        </div>
        <div>
          <dt class="font-bold uppercase tracking-[.12em] text-[#5C5A57]">
            {{ t('cert.paper.date') }}
          </dt>
          <dd class="mt-0.5 text-sm font-semibold">
            {{ when }}
          </dd>
        </div>
        <div>
          <dt class="font-bold uppercase tracking-[.12em] text-[#5C5A57]">
            {{ t('cert.paper.id') }}
          </dt>
          <dd class="mt-0.5 font-mono text-[11px] font-semibold">
            {{ id }}
          </dd>
        </div>
      </dl>

      <div class="mt-6 flex items-end justify-between gap-4">
        <div class="min-w-0">
          <p class="cert-sign text-2xl leading-none">
            Swarnil Singhai
          </p>
          <p class="mt-1 border-t border-[#032D60]/30 pt-1 text-[11px] text-[#5C5A57]">
            {{ t('cert.paper.signer') }}
          </p>
        </div>

        <!-- The stamp -->
        <svg
          viewBox="0 0 120 120"
          class="cert-stamp size-24 shrink-0 sm:size-28"
          aria-hidden="true"
        >
          <defs>
            <path
              id="cert-ring"
              d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"
            />
          </defs>
          <circle
            cx="60"
            cy="60"
            r="57"
            fill="none"
            stroke="#0176D3"
            stroke-width="3"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#0176D3"
            stroke-width="1"
            stroke-dasharray="2 3"
          />
          <circle
            cx="60"
            cy="60"
            r="33"
            fill="#0176D3"
            fill-opacity=".1"
            stroke="#0176D3"
            stroke-width="1.5"
          />
          <text
            font-size="9.5"
            font-weight="700"
            letter-spacing="2.2"
            fill="#0176D3"
          >
            <textPath href="#cert-ring">CRM ANALYTICS ACADEMY · PRACTICE · PASSED ·</textPath>
          </text>
          <g transform="translate(46 44)">
            <rect
              x="0"
              y="14"
              width="7"
              height="14"
              rx="1.5"
              fill="#7CBEFF"
            />
            <rect
              x="10"
              y="7"
              width="7"
              height="21"
              rx="1.5"
              fill="#1B96FF"
            />
            <rect
              x="20"
              y="0"
              width="7"
              height="28"
              rx="1.5"
              fill="#0176D3"
            />
          </g>
          <text
            x="60"
            y="86"
            text-anchor="middle"
            font-size="8"
            font-weight="700"
            letter-spacing="1.5"
            fill="#032D60"
          >2026</text>
        </svg>
      </div>

      <p class="mt-5 text-[10px] leading-snug text-[#5C5A57]">
        {{ t('cert.paper.note') }}
      </p>
    </div>

    <span
      v-if="sample"
      class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] text-6xl font-black tracking-[.2em] text-[#0176D3]/10 select-none sm:text-7xl"
      aria-hidden="true"
    >{{ t('cert.paper.sample') }}</span>
  </figure>
</template>

<style scoped>
.cert { border: 1px solid #dddbda; }
.cert-name { font-family: 'Caveat', 'Kalam', cursive; font-weight: 700; color: #032d60; }
.cert-sign { font-family: 'Caveat', cursive; color: #0b3b78; }
.cert-stamp { transform: rotate(-12deg); }
@media (prefers-reduced-motion: no-preference) {
  .cert-stamp { animation: stamp-in .6s cubic-bezier(.3, 1.6, .5, 1) .3s both; }
}
@keyframes stamp-in {
  from { opacity: 0; transform: rotate(-30deg) scale(1.6); }
  to { opacity: 1; transform: rotate(-12deg) scale(1); }
}
</style>
