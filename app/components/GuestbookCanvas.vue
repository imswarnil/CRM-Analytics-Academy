<script setup lang="ts">
// A small pointer-drawing pad for the guestbook. Parent calls toDataURL()/clear()
// via a template ref. Draws on a white background so exported PNGs look right in
// both themes.
const COLORS = ['#0f172a', '#1d4ed8', '#0ea5e9', '#16a34a', '#f59e0b', '#dc2626', '#9333ea', '#ec4899']
const WIDTH = 640
const HEIGHT = 300

const canvas = ref<HTMLCanvasElement | null>(null)
const color = ref(COLORS[1] as string)
const size = ref(3)
const dirty = ref(false)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false

function paintBackground() {
  if (!ctx) return
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  el.width = WIDTH
  el.height = HEIGHT
  ctx = el.getContext('2d')
  if (ctx) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    paintBackground()
  }
})

function pos(e: PointerEvent) {
  const el = canvas.value!
  const rect = el.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) / rect.width) * WIDTH,
    y: ((e.clientY - rect.top) / rect.height) * HEIGHT
  }
}

function start(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  canvas.value?.setPointerCapture(e.pointerId)
  const p = pos(e)
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
}

function move(e: PointerEvent) {
  if (!drawing || !ctx) return
  const p = pos(e)
  ctx.strokeStyle = color.value
  ctx.lineWidth = size.value
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  dirty.value = true
}

function end() {
  drawing = false
}

function clear() {
  paintBackground()
  dirty.value = false
}

function toDataURL(): string | null {
  if (!dirty.value || !canvas.value) return null
  return canvas.value.toDataURL('image/png')
}

defineExpose({ clear, toDataURL, dirty })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3 pb-3">
      <div class="flex items-center gap-1.5">
        <button
          v-for="c in COLORS"
          :key="c"
          type="button"
          class="size-6 rounded-full ring-2 ring-offset-2 ring-offset-default transition"
          :class="color === c ? 'ring-primary' : 'ring-transparent hover:ring-default'"
          :style="{ backgroundColor: c }"
          :aria-label="`Colour ${c}`"
          @click="color = c"
        />
      </div>
      <div class="flex items-center gap-1.5">
        <button
          v-for="s in [2, 4, 8]"
          :key="s"
          type="button"
          class="flex size-6 items-center justify-center rounded-md border transition"
          :class="size === s ? 'border-primary text-primary' : 'border-default text-muted hover:text-default'"
          :aria-label="`Brush ${s}`"
          @click="size = s"
        >
          <span
            class="rounded-full bg-current"
            :style="{ width: `${s + 1}px`, height: `${s + 1}px` }"
          />
        </button>
      </div>
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-eraser"
        class="ml-auto"
        @click="clear"
      >
        Clear
      </UButton>
    </div>
    <canvas
      ref="canvas"
      class="aspect-[64/30] w-full cursor-crosshair touch-none rounded-xl border border-default bg-white"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="end"
      @pointerleave="end"
    />
  </div>
</template>
