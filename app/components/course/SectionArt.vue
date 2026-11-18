<script setup lang="ts">
/**
 * A small drawn illustration for each course section (keys from
 * app/data/roadmap.ts). Inline SVG coloured by the site tokens, so it follows
 * light/dark, costs no request and stays crisp at any size. Decorative.
 */
defineProps<{ section: string }>()
</script>

<template>
  <svg
    viewBox="0 0 160 96"
    class="section-art"
    aria-hidden="true"
    fill="none"
  >
    <rect
      width="160"
      height="96"
      rx="6"
      class="bg"
    />
    <!-- 01 data model: three objects joined -->
    <g v-if="section === 's01'">
      <rect
        x="14"
        y="20"
        width="40"
        height="52"
        rx="3"
        class="card"
      />
      <rect
        x="14"
        y="20"
        width="40"
        height="11"
        rx="3"
        class="head"
      />
      <rect
        x="106"
        y="14"
        width="40"
        height="34"
        rx="3"
        class="card"
      />
      <rect
        x="106"
        y="14"
        width="40"
        height="11"
        rx="3"
        class="head"
      />
      <rect
        x="106"
        y="56"
        width="40"
        height="28"
        rx="3"
        class="card"
      />
      <rect
        x="106"
        y="56"
        width="40"
        height="11"
        rx="3"
        class="soft"
      />
      <path
        d="M54 40h22a6 6 0 0 0 6-6v-4a6 6 0 0 1 6-6h18M54 56h28a6 6 0 0 1 6 6v6h18"
        class="link"
      />
      <circle
        cx="54"
        cy="40"
        r="2.5"
        class="dot"
      /><circle
        cx="54"
        cy="56"
        r="2.5"
        class="dot"
      />
      <path
        d="M20 40h22M20 48h28M20 56h18M20 64h24"
        class="line"
      />
    </g>
    <!-- 02 GTM: funnel -->
    <g v-else-if="section === 's02'">
      <rect
        x="22"
        y="16"
        width="116"
        height="13"
        rx="3"
        class="soft"
      />
      <rect
        x="34"
        y="34"
        width="92"
        height="13"
        rx="3"
        class="mid"
      />
      <rect
        x="46"
        y="52"
        width="68"
        height="13"
        rx="3"
        class="head"
      />
      <rect
        x="58"
        y="70"
        width="44"
        height="13"
        rx="3"
        class="strong"
      />
    </g>
    <!-- 03 data architecture: source → recipe → dataset -->
    <g v-else-if="section === 's03'">
      <ellipse
        cx="30"
        cy="30"
        rx="14"
        ry="5"
        class="card"
      />
      <path
        d="M16 30v34c0 3 6 5 14 5s14-2 14-5V30"
        class="card"
      />
      <rect
        x="66"
        y="34"
        width="28"
        height="28"
        rx="14"
        class="head"
      />
      <rect
        x="112"
        y="24"
        width="34"
        height="48"
        rx="3"
        class="card"
      />
      <path
        d="M118 36h22M118 46h22M118 56h14"
        class="line"
      />
      <path
        d="M46 48h18M96 48h14"
        class="link"
      />
      <path
        d="M60 44l4 4-4 4M106 44l4 4-4 4"
        class="link"
      />
    </g>
    <!-- 04 dashboards: KPI tiles + bars -->
    <g v-else-if="section === 's04'">
      <rect
        x="12"
        y="12"
        width="40"
        height="22"
        rx="3"
        class="card"
      />
      <rect
        x="60"
        y="12"
        width="40"
        height="22"
        rx="3"
        class="card"
      />
      <rect
        x="108"
        y="12"
        width="40"
        height="22"
        rx="3"
        class="card"
      />
      <path
        d="M18 27h16M66 27h20M114 27h12"
        class="line-strong"
      />
      <rect
        x="12"
        y="42"
        width="136"
        height="42"
        rx="3"
        class="card"
      />
      <rect
        x="22"
        y="64"
        width="10"
        height="14"
        rx="1.5"
        class="mid"
      />
      <rect
        x="38"
        y="58"
        width="10"
        height="20"
        rx="1.5"
        class="mid"
      />
      <rect
        x="54"
        y="61"
        width="10"
        height="17"
        rx="1.5"
        class="mid"
      />
      <rect
        x="70"
        y="52"
        width="10"
        height="26"
        rx="1.5"
        class="mid"
      />
      <rect
        x="86"
        y="55"
        width="10"
        height="23"
        rx="1.5"
        class="mid"
      />
      <rect
        x="102"
        y="48"
        width="10"
        height="30"
        rx="1.5"
        class="strong"
      />
      <path
        d="M120 74l8-10 8 4 6-14"
        class="link"
      />
    </g>
    <!-- 05 bindings: two charts reacting to one selection -->
    <g v-else-if="section === 's05'">
      <rect
        x="12"
        y="16"
        width="56"
        height="64"
        rx="3"
        class="card"
      />
      <rect
        x="20"
        y="26"
        width="40"
        height="9"
        rx="2"
        class="soft"
      />
      <rect
        x="20"
        y="40"
        width="40"
        height="9"
        rx="2"
        class="strong"
      />
      <rect
        x="20"
        y="54"
        width="40"
        height="9"
        rx="2"
        class="soft"
      />
      <rect
        x="92"
        y="16"
        width="56"
        height="64"
        rx="3"
        class="card"
      />
      <circle
        cx="120"
        cy="48"
        r="18"
        class="soft"
      />
      <path
        d="M120 30a18 18 0 0 1 17 24l-17-6z"
        class="strong-fill"
      />
      <path
        d="M62 44h22"
        class="link"
      /><path
        d="M80 40l4 4-4 4"
        class="link"
      />
    </g>
    <!-- 06 sharing + embedding: a dashboard inside a record page -->
    <g v-else-if="section === 's06'">
      <rect
        x="14"
        y="12"
        width="132"
        height="72"
        rx="3"
        class="card"
      />
      <rect
        x="14"
        y="12"
        width="132"
        height="12"
        rx="3"
        class="soft"
      />
      <circle
        cx="22"
        cy="18"
        r="2"
        class="dot"
      /><circle
        cx="29"
        cy="18"
        r="2"
        class="dot"
      />
      <path
        d="M22 34h38M22 42h30M22 50h34"
        class="line"
      />
      <rect
        x="70"
        y="32"
        width="66"
        height="44"
        rx="3"
        class="head"
      />
      <rect
        x="78"
        y="56"
        width="8"
        height="14"
        rx="1.5"
        class="white"
      />
      <rect
        x="92"
        y="48"
        width="8"
        height="22"
        rx="1.5"
        class="white"
      />
      <rect
        x="106"
        y="42"
        width="8"
        height="28"
        rx="1.5"
        class="white"
      />
      <rect
        x="120"
        y="52"
        width="8"
        height="18"
        rx="1.5"
        class="white"
      />
    </g>
    <!-- 07 advanced: query + prediction curve -->
    <g v-else>
      <rect
        x="12"
        y="14"
        width="64"
        height="68"
        rx="3"
        class="card"
      />
      <path
        d="M20 26h30M20 36h44M26 46h34M26 56h24M20 66h38"
        class="line"
      />
      <path
        d="M88 76c14-2 18-40 32-44s18 14 26 10"
        class="link"
      />
      <path
        d="M88 76c14-2 18-30 32-32s18 6 26 2"
        class="dash"
      />
      <circle
        cx="120"
        cy="32"
        r="3.5"
        class="dot"
      />
      <path
        d="M140 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
        class="strong-fill"
      />
    </g>
  </svg>
</template>

<style scoped>
.section-art { display: block; height: auto; }
.bg { fill: var(--ice); }
.card { fill: var(--card); stroke: var(--line); stroke-width: 1; }
.head { fill: var(--signal); }
.soft { fill: var(--frost); }
.mid { fill: var(--tide); opacity: .55; }
.strong { fill: var(--signal); }
.strong-fill { fill: var(--signal); }
.white { fill: #fff; }
.dot { fill: var(--signal); }
.line { stroke: var(--line); stroke-width: 3; stroke-linecap: round; }
.line-strong { stroke: var(--signal); stroke-width: 4; stroke-linecap: round; }
.link { stroke: var(--signal); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.dash { stroke: var(--tide); stroke-width: 2; stroke-dasharray: 4 4; stroke-linecap: round; }
</style>
