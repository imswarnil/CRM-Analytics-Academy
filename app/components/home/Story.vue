<script setup lang="ts">
/**
 * The home hero's right side: what you will build, told as a short story in
 * five animated frames, like a video — progress bars on top, autoplay, tap a
 * bar to jump, pause on hover. Every frame is drawn in HTML/SVG (no video
 * file, nothing fetched): data in → a recipe shapes it → SAQL asks it → a
 * dashboard shows it → AI predicts and explains it. Reduced motion: frames
 * still change, nothing moves inside them.
 */
const { t } = useI18n()
const FRAMES = ['data', 'recipe', 'saql', 'dashboard', 'ai'] as const
const MS = 4800

const at = ref(0)
const paused = ref(false)
const tick = ref(0) // restarts the progress animation
let timer: ReturnType<typeof setTimeout> | undefined
let started = 0
let left = MS
function schedule(ms = MS) {
  clearTimeout(timer)
  started = Date.now()
  left = ms
  timer = setTimeout(() => go(at.value + 1), ms)
}
function go(i: number) {
  at.value = (i + FRAMES.length) % FRAMES.length
  tick.value++
  if (!paused.value) schedule()
}
function pause(p: boolean) {
  if (p === paused.value) return
  paused.value = p
  if (p) {
    clearTimeout(timer)
    left = Math.max(400, left - (Date.now() - started))
  } else {
    schedule(left)
  }
}
onMounted(() => schedule())
onBeforeUnmount(() => clearTimeout(timer))

const bars = [38, 62, 48, 80, 66, 92]
const SAQL = ['q = load "opportunities";', 'q = filter q by StageName != "Closed Lost";', 'q = group q by Region;', 'q = foreach q generate Region,', '    sum(Amount) as pipeline;']
</script>

<template>
  <figure
    class="story relative overflow-hidden rounded-3xl border border-(--line) bg-white shadow-[0_30px_60px_-30px_rgb(15_23_42/0.35)]"
    :aria-label="t('home.story.label')"
    @mouseenter="pause(true)"
    @mouseleave="pause(false)"
  >
    <!-- Progress, like a story -->
    <div class="absolute inset-x-4 top-3 z-20 flex gap-1.5">
      <button
        v-for="(f, i) in FRAMES"
        :key="f"
        type="button"
        class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
        :aria-label="t(`home.story.${f}.title`)"
        @click="go(i)"
      >
        <span
          :key="`${tick}-${i}`"
          class="block h-full rounded-full bg-[#2563eb]"
          :class="i < at ? 'w-full' : i === at ? 'story-fill' : 'w-0'"
          :style="i === at ? { animationDuration: `${MS}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined"
        />
      </button>
    </div>
    <button
      type="button"
      class="absolute end-3 top-6 z-20 flex size-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow"
      :aria-label="paused ? 'Play' : 'Pause'"
      @click="pause(!paused)"
    >
      <UIcon
        :name="paused ? 'i-lucide-play' : 'i-lucide-pause'"
        class="size-3.5"
      />
    </button>

    <!-- The frame -->
    <div class="relative h-[19rem] bg-gradient-to-br from-slate-50 to-blue-50/60 sm:h-[21rem]">
      <Transition
        name="story"
        mode="out-in"
      >
        <!-- 1 · Data in -->
        <div
          v-if="FRAMES[at] === 'data'"
          key="data"
          class="absolute inset-0 flex items-center justify-center gap-6 px-8"
        >
          <div class="flex flex-col gap-3">
            <div class="story-pop flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md">
              <UIcon
                name="i-simple-icons-salesforce"
                class="size-6 text-[#00a1e0]"
              /><span class="text-sm font-bold text-slate-700">Opportunity</span>
            </div>
            <div
              class="story-pop flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md"
              style="animation-delay: 0.2s"
            >
              <UIcon
                name="i-lucide-file-spreadsheet"
                class="size-6 text-[#059669]"
              /><span class="text-sm font-bold text-slate-700">targets.csv</span>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span
              v-for="n in 3"
              :key="n"
              class="story-dot size-2 rounded-full bg-[#2563eb]"
              :style="{ animationDelay: `${n * 0.18}s` }"
            />
          </div>
          <div
            class="story-pop flex flex-col items-center"
            style="animation-delay: 0.5s"
          >
            <UIcon
              name="i-lucide-database"
              class="size-16 text-[#2563eb]"
            />
            <span class="mt-2 rounded-full bg-[#2563eb] px-2.5 py-0.5 text-xs font-bold text-white">dataset · 10,000 rows</span>
          </div>
        </div>

        <!-- 2 · Recipe -->
        <div
          v-else-if="FRAMES[at] === 'recipe'"
          key="recipe"
          class="absolute inset-0 flex items-center justify-center px-6"
        >
          <svg
            viewBox="0 0 360 160"
            class="w-full max-w-md"
            aria-hidden="true"
          >
            <path
              d="M86 52 C120 52 120 80 150 80 M86 112 C120 112 120 80 150 80 M222 80 L262 80"
              fill="none"
              stroke="#cbd5e1"
              stroke-width="3"
            />
            <path
              class="story-wire"
              d="M86 52 C120 52 120 80 150 80 M86 112 C120 112 120 80 150 80 M222 80 L262 80"
              fill="none"
              stroke="#7c3aed"
              stroke-width="3"
              stroke-dasharray="6 10"
            />
            <g
              v-for="(n, i) in [{ x: 14, y: 32, c: '#2563eb', l: 'Opps' }, { x: 14, y: 92, c: '#2563eb', l: 'Accounts' }, { x: 150, y: 60, c: '#059669', l: 'Join' }, { x: 262, y: 60, c: '#db2777', l: 'Group' }]"
              :key="n.l"
              class="story-pop"
              :style="{ animationDelay: `${i * 0.15}s` }"
            >
              <rect
                :x="n.x"
                :y="n.y"
                width="72"
                height="40"
                rx="10"
                fill="white"
                :stroke="n.c"
                stroke-width="2"
              />
              <text
                :x="n.x + 36"
                :y="n.y + 25"
                text-anchor="middle"
                font-size="13"
                font-weight="700"
                :fill="n.c"
              >{{ n.l }}</text>
            </g>
          </svg>
        </div>

        <!-- 3 · SAQL -->
        <div
          v-else-if="FRAMES[at] === 'saql'"
          key="saql"
          class="absolute inset-0 flex items-center justify-center px-8"
        >
          <div class="w-full max-w-sm overflow-hidden rounded-xl bg-[#0f172a] shadow-xl">
            <div class="flex gap-1.5 px-3 py-2">
              <span class="size-2.5 rounded-full bg-[#fb7185]" /><span class="size-2.5 rounded-full bg-[#fbbf24]" /><span class="size-2.5 rounded-full bg-[#34d399]" />
            </div>
            <pre class="px-4 pb-4 font-mono text-[12.5px] leading-6 text-slate-200"><span
              v-for="(l, i) in SAQL"
              :key="i"
              class="story-type block"
              :style="{ animationDelay: `${i * 0.45}s` }"
            >{{ l }}</span></pre>
          </div>
        </div>

        <!-- 4 · Dashboard -->
        <div
          v-else-if="FRAMES[at] === 'dashboard'"
          key="dashboard"
          class="absolute inset-0 grid grid-cols-[1fr_auto] gap-3 p-8 pt-12"
        >
          <div class="flex flex-col rounded-xl bg-white p-3 shadow-md">
            <span class="text-xs font-bold text-slate-500">Pipeline by region</span>
            <div class="mt-auto flex h-36 items-end gap-2">
              <span
                v-for="(h, i) in bars"
                :key="i"
                class="story-bar flex-1 rounded-t-md"
                :style="{ height: `${h}%`, animationDelay: `${i * 0.1}s`, background: i === bars.length - 1 ? '#2563eb' : '#bfdbfe' }"
              />
            </div>
          </div>
          <div class="flex w-28 flex-col gap-3">
            <div
              v-for="(k, i) in [{ l: 'Won', v: '$172K', c: '#059669' }, { l: 'Win rate', v: '58%', c: '#7c3aed' }]"
              :key="k.l"
              class="story-pop rounded-xl bg-white p-3 shadow-md"
              :style="{ animationDelay: `${0.3 + i * 0.2}s` }"
            >
              <span class="block text-[11px] font-bold text-slate-500">{{ k.l }}</span>
              <span
                class="block text-xl font-bold"
                :style="{ color: k.c }"
              >{{ k.v }}</span>
            </div>
          </div>
        </div>

        <!-- 5 · AI -->
        <div
          v-else
          key="ai"
          class="absolute inset-0 flex flex-col justify-center gap-3 px-8 pt-6"
        >
          <div class="story-pop ms-auto max-w-[80%] rounded-2xl rounded-br-sm bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white shadow-md">
            {{ t('home.story.ai.ask') }}
          </div>
          <div
            class="story-pop flex max-w-[88%] gap-2.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-md"
            style="animation-delay: 0.6s"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="mt-0.5 size-5 shrink-0 text-[#7c3aed]"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-700">
                {{ t('home.story.ai.answer') }}
              </p>
              <div class="mt-2 space-y-1">
                <div
                  v-for="(p, i) in [{ l: 'Acme renewal', v: 82 }, { l: 'Bluefin expansion', v: 64 }, { l: 'Dune training', v: 31 }]"
                  :key="p.l"
                  class="flex items-center gap-2 text-[11px] text-slate-500"
                >
                  <span class="w-24 truncate">{{ p.l }}</span>
                  <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span
                    class="story-grow block h-full rounded-full bg-[#7c3aed]"
                    :style="{ width: `${p.v}%`, animationDelay: `${0.9 + i * 0.15}s` }"
                  /></span>
                  <span class="w-7 text-end font-bold text-slate-700">{{ p.v }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Caption -->
    <figcaption class="border-t border-(--line) px-5 py-4">
      <p class="font-medium text-[11px] font-bold text-[#2563eb]">
        {{ at + 1 }} / {{ FRAMES.length }} · {{ t('home.story.step') }}
      </p>
      <Transition
        name="story"
        mode="out-in"
      >
        <div :key="FRAMES[at]">
          <p class="mt-1 text-lg font-bold text-(--ink)">
            {{ t(`home.story.${FRAMES[at]}.title`) }}
          </p>
          <p class="text-sm text-(--ink2)">
            {{ t(`home.story.${FRAMES[at]}.body`) }}
          </p>
        </div>
      </Transition>
    </figcaption>
  </figure>
</template>

<style scoped>
.story-fill { width: 0; animation: fill linear forwards; }
@keyframes fill { to { width: 100%; } }
.story-enter-active, .story-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.story-enter-from { opacity: 0; transform: translateY(10px); }
.story-leave-to { opacity: 0; transform: translateY(-10px); }
.story-pop { animation: pop 0.5s cubic-bezier(0.3, 1.5, 0.5, 1) both; }
@keyframes pop { from { opacity: 0; transform: scale(0.85) translateY(8px); } }
.story-dot { animation: dot 1s ease-in-out infinite; }
@keyframes dot { 50% { transform: translateX(10px); opacity: 0.3; } }
.story-wire { animation: wire 1s linear infinite; }
@keyframes wire { to { stroke-dashoffset: -32; } }
.story-type { opacity: 0; clip-path: inset(0 100% 0 0); animation: type 0.5s steps(24) forwards; }
@keyframes type { to { opacity: 1; clip-path: inset(0 0 0 0); } }
.story-bar { transform-origin: bottom; animation: bar 0.6s cubic-bezier(0.3, 1.3, 0.5, 1) both; }
@keyframes bar { from { transform: scaleY(0); } }
.story-grow { transform-origin: left; animation: grow 0.7s ease-out both; }
@keyframes grow { from { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) {
  .story-pop, .story-dot, .story-wire, .story-type, .story-bar, .story-grow { animation: none; opacity: 1; clip-path: none; }
  .story-enter-active, .story-leave-active { transition: none; }
}
</style>
