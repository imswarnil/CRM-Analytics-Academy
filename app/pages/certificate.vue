<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, displayName } = useProfile()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({ title: 'Your certificate — CRM Analytics Academy', robots: 'noindex' })

interface Certificate {
  code: string
  name: string
  course: string
  avg_score: number | null
  issued_at: string
}
interface CertResponse {
  eligible: boolean
  certMinScore: number
  certificate: Certificate | null
}
const { data: dash } = await useAsyncData<CertResponse | null>(
  'certificate',
  () => $fetch('/api/certificate'),
  { server: false, watch: [user] }
)
const cert = computed(() => dash.value?.certificate ?? null)
const verifyUrl = computed(() => cert.value ? `${SITE.url}/verify?code=${cert.value.code}` : `${SITE.url}/verify`)

const canvas = ref<HTMLCanvasElement | null>(null)

const issuedDate = computed(() =>
  cert.value ? new Date(cert.value.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
)

function draw() {
  const el = canvas.value
  const c = cert.value
  if (!el || !c) return
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
  ctx.fillText(c.name, cx, 424)

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
  ctx.fillText(c.course, cx, 556)

  ctx.fillStyle = '#3E3E3C'
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.fillText(`with an average score of ${c.avg_score}/100`, cx, 604)

  // Brand
  ctx.textAlign = 'center'
  ctx.fillStyle = '#032D60'
  ctx.font = '700 24px system-ui, sans-serif'
  ctx.fillText('CRM Analytics Academy', cx, 672)

  // Footer: certificate number + issue date (left), verification (right)
  ctx.fillStyle = '#032D60'
  ctx.font = '700 20px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`Certificate No. ${c.code}`, 120, 730)
  ctx.fillStyle = '#706E6B'
  ctx.font = '400 18px system-ui, sans-serif'
  ctx.fillText(`Issued ${issuedDate.value}`, 120, 758)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#706E6B'
  ctx.font = '400 18px system-ui, sans-serif'
  ctx.fillText('Verify this certificate at', W - 120, 730)
  ctx.fillStyle = '#0176D3'
  ctx.font = '600 18px system-ui, sans-serif'
  ctx.fillText('crmanalytics.imswarnil.com/verify', W - 120, 758)
}

const shareText = computed(() => `I earned my ${cert.value?.course ?? 'CRM Analytics'} certificate at CRM Analytics Academy! 🎓`)

function download() {
  const el = canvas.value
  if (!el) return
  const link = document.createElement('a')
  link.download = `crm-analytics-certificate-${cert.value?.code ?? 'certificate'}.png`
  link.href = el.toDataURL('image/png')
  link.click()
}

async function share() {
  const text = shareText.value
  const url = verifyUrl.value
  // Prefer sharing the PNG file if supported.
  try {
    const el = canvas.value
    if (el && navigator.canShare) {
      const blob: Blob | null = await new Promise(res => el.toBlob(res, 'image/png'))
      if (blob) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My certificate', text: `${text} Verify: ${url}` })
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

function shareLinkedIn() {
  const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl.value)}`
  window.open(u, '_blank', 'noopener,width=640,height=640')
}

function shareX() {
  const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(verifyUrl.value)}`
  window.open(u, '_blank', 'noopener,width=640,height=640')
}

async function copyCode() {
  if (!cert.value) return
  await navigator.clipboard?.writeText(cert.value.code).catch(() => {})
  toast.add({ title: 'Certificate number copied', color: 'success', icon: 'i-lucide-copy' })
}

onMounted(() => refreshNuxtData('certificate'))

watch([dash, cert], () => nextTick(draw))
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto max-w-3xl">
      <template v-if="dash === null || dash?.eligible === false">
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
          <NuxtLink
            :to="localePath('/verify')"
            class="text-xs text-muted hover:text-primary"
          >
            Verify a certificate →
          </NuxtLink>
        </div>
      </template>

      <template v-else-if="cert">
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

        <!-- Certificate number + verification -->
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-default bg-elevated/40 p-5 sm:flex-row sm:justify-between">
          <div class="text-center sm:text-left">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Certificate number
            </p>
            <button
              type="button"
              class="group mt-1 inline-flex items-center gap-2 font-mono text-lg font-bold text-highlighted hover:text-primary"
              title="Copy certificate number"
              @click="copyCode"
            >
              {{ cert.code }}
              <UIcon
                name="i-lucide-copy"
                class="size-4 text-dimmed group-hover:text-primary"
              />
            </button>
            <p class="mt-1 text-xs text-muted">
              Issued {{ issuedDate }} · anyone can
              <NuxtLink
                :to="localePath('/verify') + `?code=${cert.code}`"
                class="text-primary hover:underline"
              >verify it</NuxtLink>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-simple-icons-linkedin"
              square
              size="lg"
              aria-label="Share on LinkedIn"
              @click="shareLinkedIn"
            />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-simple-icons-x"
              square
              size="lg"
              aria-label="Share on X"
              @click="shareX"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
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
