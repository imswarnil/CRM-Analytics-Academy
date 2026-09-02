<script setup lang="ts">
/**
 * Newsletter signup band. Posts to /api/newsletter, which forwards to the
 * Ghost site's members API — Ghost sends the double-opt-in email, so the
 * only states this form needs are "sent" and "try again".
 */
const { t } = useI18n()

const email = ref('')
const pending = ref(false)
const state = ref<'idle' | 'success' | 'error'>('idle')

async function subscribe() {
  if (pending.value || !email.value) return
  pending.value = true
  state.value = 'idle'
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: email.value } })
    state.value = 'success'
    email.value = ''
  } catch {
    state.value = 'error'
  }
  pending.value = false
}
</script>

<template>
  <section class="border-y border-default bg-primary/5">
    <UContainer class="py-12 sm:py-14">
      <div class="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 max-lg:hidden">
            <UIcon
              name="i-lucide-mail"
              class="size-6 text-primary"
            />
          </div>
          <div>
            <h2 class="text-xl font-bold text-highlighted sm:text-2xl">
              {{ t('newsletter.title') }}
            </h2>
            <p class="mt-1 max-w-md text-sm text-muted">
              {{ t('newsletter.subtitle') }}
            </p>
          </div>
        </div>

        <form
          class="w-full max-w-sm shrink-0"
          @submit.prevent="subscribe"
        >
          <div class="flex gap-2">
            <UInput
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              required
              icon="i-lucide-at-sign"
              :placeholder="t('newsletter.placeholder')"
              class="flex-1"
              size="lg"
            />
            <UButton
              type="submit"
              size="lg"
              :loading="pending"
              trailing-icon="i-lucide-send"
            >
              {{ t('newsletter.button') }}
            </UButton>
          </div>
          <p
            v-if="state === 'success'"
            class="mt-2 text-sm text-success"
          >
            {{ t('newsletter.success') }}
          </p>
          <p
            v-else-if="state === 'error'"
            class="mt-2 text-sm text-error"
          >
            {{ t('newsletter.error') }}
          </p>
        </form>
      </div>
    </UContainer>
  </section>
</template>
