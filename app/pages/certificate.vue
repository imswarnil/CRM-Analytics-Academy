<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, displayName } = useProfile()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({ title: 'Your certificate — CRM Analytics Academy', robots: 'noindex' })

interface Progress {
  avgScore: number | null
  certificateEligible: boolean
  certMinScore: number
}
const { data: dash } = await useAsyncData<Progress | null>(
  'certificate',
  () => $fetch('/api/dashboard'),
  { server: false, watch: [user] }
)

const canvas = ref<HTMLCanvasElement | null>(null)
const issued = ref('')

function draw() {
  const el = canvas.value
  if (!el || !dash.value?.certificateEligible) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  const W = 1200
  const H = 848
  el.width = W
  el.height = H

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#F7FBFF')
  bg.addColorStop(1, '#EAF3FF')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Outer frame
  ctx.strokeStyle = '#0176D3'
  ctx.lineWidth = 8
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.strokeStyle = '#7AB8FF'
  ctx.lineWidth = 2
  ctx.strokeRect(44, 44, W - 88, H - 88)

  const cx = W / 2
  ctx.textAlign = 'center'

  // Seal
  ctx.beginPath()
  ctx.arc(cx, 168, 46, 0, Math.PI * 2)
  ctx.fillStyle = '#0176D3'
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = '700 46px system-ui, sans-serif'
  ctx.fillText('✓', cx, 184)

  // Heading
  ctx.fillStyle = '#014486'
  ctx.font = '800 46px system-ui, sans-serif'
  ctx.fillText('CERTIFICATE OF COMPLETION', cx, 288)

  ctx.fillStyle = '#706E6B'
  ctx.font = '400 22px system-ui, sans-serif'
  ctx.fillText('This certifies that', cx, 344)

  // Name
  ctx.fillStyle = '#032D60'
  ctx.font = '700 60px Georgia, serif'
  ctx.fillText(displayName.value || 'Learner', cx, 424)

  // Underline under name
  ctx.strokeStyle = '#ADD4FF'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 260, 452)
  ctx.lineTo(cx + 260, 452)
  ctx.stroke()

  ctx.fillStyle = '#706E6B'
  ctx.font = '400 22px system-ui, sans-serif'
  ctx.fillText('has successfully completed the course', cx, 504)

  ctx.fillStyle = '#0176D3'
  ctx.font = '700 38px system-ui, sans-serif'
  ctx.fillText('CRM Analytics Foundations', cx, 556)

  ctx.fillStyle = '#3E3E3C'
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.fillText(`with an average score of ${dash.value.avgScore}/100`, cx, 604)

  // Footer row
  ctx.fillStyle = '#706E6B'
  ctx.font = '400 20px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Issued ${issued.value}`, 120, 736)
  ctx.textAlign = 'right'
  ctx.fillText('crmanalytics.imswarnil.com', W - 120, 736)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#032D60'
  ctx.font = '700 24px system-ui, sans-serif'
  ctx.fillText('CRM Analytics Academy', cx, 700)
}

function download() {
  const el = canvas.value
  if (!el) return
  const link = document.createElement('a')
  link.download = 'crm-analytics-foundations-certificate.png'
  link.href = el.toDataURL('image/png')
  link.click()
}

async function share() {
  const url = 'https://crmanalytics.imswarnil.com'
  const text = `I completed the CRM Analytics Foundations course at CRM Analytics Academy! 🎓`
  // Prefer sharing the PNG file if supported.
  try {
    const el = canvas.value
    if (el && navigator.canShare) {
      const blob: Blob | null = await new Promise(res => el.toBlob(res, 'image/png'))
      if (blob) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My certificate', text })
          return
        }
      }
    }
    if (navigator.share) {
      await navigator.share({ title: 'CRM Analytics Academy', text, url })
      return
    }
    throw new Error('no share')
  } catch {
    await navigator.clipboard?.writeText(`${text} ${url}`).catch(() => {})
    toast.add({ title: 'Copied to clipboard', color: 'success', icon: 'i-lucide-copy' })
  }
}

onMounted(() => {
  refreshNuxtData('certificate')
  issued.value = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

watch([dash, displayName, issued], () => nextTick(draw))
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto max-w-3xl">
      <template v-if="dash === null || dash?.certificateEligible === false">
        <div class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-default py-16 text-center">
          <UIcon
            name="i-lucide-lock"
            class="size-10 text-muted"
          />
          <div>
            <h1 class="text-xl font-bold text-highlighted">
              Certificate not unlocked yet
            </h1>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Complete every lesson and score {{ dash?.certMinScore ?? 75 }}%+ on the graded quizzes to earn your shareable certificate.
            </p>
          </div>
          <UButton
            :to="localePath('/foundations')"
            color="primary"
            icon="i-lucide-book-open"
          >
            Continue the course
          </UButton>
        </div>
      </template>

      <template v-else-if="dash">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold text-highlighted sm:text-3xl">
            Congratulations, {{ displayName }}! 🎉
          </h1>
          <p class="mt-1 text-sm text-muted">
            You’ve earned your CRM Analytics Foundations certificate.
          </p>
        </div>

        <div class="overflow-hidden rounded-2xl border border-default shadow-lg">
          <canvas
            ref="canvas"
            class="h-auto w-full"
          />
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <UButton
            color="primary"
            icon="i-lucide-download"
            size="lg"
            @click="download"
          >
            Download PNG
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-share-2"
            size="lg"
            @click="share"
          >
            Share
          </UButton>
        </div>
      </template>
    </div>
  </UContainer>
</template>
