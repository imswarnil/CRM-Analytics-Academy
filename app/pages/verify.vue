<script setup lang="ts">
const title = 'Verify a certificate — CRM Analytics Academy'
const description = 'Confirm that a CRM Analytics Academy certificate is genuine. Enter its certificate number to see who it was issued to, the course, and the issue date.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const route = useRoute()

interface Result {
  valid: boolean
  code?: string
  name?: string
  course?: string
  avgScore?: number | null
  issuedAt?: string
}

const code = ref(typeof route.query.code === 'string' ? route.query.code : '')
const result = ref<Result | null>(null)
const loading = ref(false)
const checked = ref(false)

async function verify() {
  const c = code.value.trim()
  if (!c) return
  loading.value = true
  try {
    result.value = await $fetch<Result>('/api/verify-certificate', { query: { code: c } })
  } catch {
    result.value = { valid: false }
  } finally {
    loading.value = false
    checked.value = true
  }
}

const issued = computed(() =>
  result.value?.issuedAt ? new Date(result.value.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
)

// Auto-verify when arriving via a shared ?code= link.
onMounted(() => {
  if (code.value) verify()
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-default">
      <div class="absolute inset-0 bg-grid" />
      <div class="absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <UContainer class="relative py-14 text-center sm:py-20">
        <UBadge
          color="primary"
          variant="subtle"
          size="lg"
          class="mb-6 rounded-full"
        >
          <UIcon
            name="i-lucide-badge-check"
            class="mr-1 size-4"
          />
          Certificate verification
        </UBadge>
        <h1 class="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-highlighted sm:text-5xl">
          Verify a <span class="text-gradient">certificate</span>
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Enter a certificate number to confirm it's genuine and see who earned it.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-12 sm:py-16">
      <div class="mx-auto max-w-xl">
        <form
          class="flex flex-col gap-3 sm:flex-row"
          @submit.prevent="verify"
        >
          <UInput
            v-model="code"
            placeholder="e.g. CRMA-9F3A-71QD"
            icon="i-lucide-hash"
            size="lg"
            class="flex-1 font-mono"
            autocapitalize="characters"
          />
          <UButton
            type="submit"
            size="lg"
            icon="i-lucide-search"
            :loading="loading"
            :disabled="!code.trim()"
            class="rounded-lg font-semibold"
          >
            Verify
          </UButton>
        </form>

        <!-- Result -->
        <div
          v-if="checked && result"
          class="mt-8"
        >
          <!-- Valid -->
          <div
            v-if="result.valid"
            class="overflow-hidden rounded-2xl border border-success/40 bg-success/5"
          >
            <div class="flex items-center gap-3 border-b border-success/20 bg-success/10 px-6 py-4">
              <UIcon
                name="i-lucide-badge-check"
                class="size-7 text-success"
              />
              <div>
                <p class="font-bold text-success">
                  Verified certificate
                </p>
                <p class="text-xs text-muted">
                  This certificate was issued by CRM Analytics Academy.
                </p>
              </div>
            </div>
            <dl class="divide-y divide-default">
              <div class="flex items-center justify-between gap-4 px-6 py-3.5">
                <dt class="text-sm text-muted">
                  Issued to
                </dt>
                <dd class="text-right font-semibold text-highlighted">
                  {{ result.name }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-6 py-3.5">
                <dt class="text-sm text-muted">
                  Course
                </dt>
                <dd class="text-right font-medium text-default">
                  {{ result.course }}
                </dd>
              </div>
              <div
                v-if="result.avgScore != null"
                class="flex items-center justify-between gap-4 px-6 py-3.5"
              >
                <dt class="text-sm text-muted">
                  Average score
                </dt>
                <dd class="text-right font-medium text-default">
                  {{ result.avgScore }}/100
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-6 py-3.5">
                <dt class="text-sm text-muted">
                  Issue date
                </dt>
                <dd class="text-right font-medium text-default">
                  {{ issued }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-6 py-3.5">
                <dt class="text-sm text-muted">
                  Certificate no.
                </dt>
                <dd class="text-right font-mono font-semibold text-highlighted">
                  {{ result.code }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Invalid -->
          <div
            v-else
            class="flex flex-col items-center gap-3 rounded-2xl border border-error/40 bg-error/5 py-12 text-center"
          >
            <UIcon
              name="i-lucide-circle-x"
              class="size-9 text-error"
            />
            <div>
              <p class="font-bold text-error">
                No certificate found
              </p>
              <p class="mx-auto mt-1 max-w-sm text-sm text-muted">
                We couldn't find a certificate with that number. Double-check the code — it looks like
                <span class="font-mono">CRMA-XXXX-XXXX</span>.
              </p>
            </div>
          </div>
        </div>

        <p
          v-else
          class="mt-8 text-center text-sm text-muted"
        >
          The certificate number is printed on the certificate, formatted like
          <span class="font-mono text-default">CRMA-XXXX-XXXX</span>.
        </p>
      </div>

      <AdUnit
        placement="betweenSections"
        class="mx-auto my-12 max-w-3xl"
      />
    </UContainer>
  </div>
</template>
