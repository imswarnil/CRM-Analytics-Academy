<script setup lang="ts">
/**
 * /sponsor — sponsor the Academy. Who reads it, where a sponsor appears, and
 * a short request (POST /api/leads, product `sponsorship` → Salesforce). The
 * owner replies with dates and a price; nothing is sold self-serve.
 */
const { t, locale } = useI18n()
const { user } = useAuth()

const PLACES = ['lessons', 'start', 'home', 'newsletter'] as const
const form = reactive({ company: '', email: '', message: '', website: '' })
watch(user, u => (form.email ||= u?.email ?? ''), { immediate: true })
const token = ref('')
const human = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const sent = ref(false)
const error = ref('')
async function send() {
  error.value = ''
  if (!token.value) {
    error.value = t('human.wait')
    return
  }
  sending.value = true
  try {
    const source = (useNuxtApp().$firstTouch as (() => string) | undefined)?.() ?? ''
    await $fetch('/api/leads', { method: 'POST', body: { product: 'sponsorship', company: form.company, email: form.email, message: form.message, website: form.website, token: token.value, locale: locale.value, source, landing: '/sponsor' } })
    sent.value = true
  } catch (e) {
    error.value = apiError(e) || t('contrib.err.generic')
    human.value?.reset()
  } finally {
    sending.value = false
  }
}

const title = computed(() => t('sponsor.seoTitle'))
const description = computed(() => t('sponsor.seoDesc'))
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
</script>

<template>
  <div>
    <section class="border-b border-(--line) bg-(--navy) text-white">
      <div class="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <p class="text-xs font-bold uppercase tracking-[.09em] text-blueprint-300">
          {{ t('sponsor.eyebrow') }}
        </p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {{ t('sponsor.title') }}
        </h1>
        <p class="mt-4 text-lg text-white/75">
          {{ t('sponsor.lead') }}
        </p>
      </div>
    </section>

    <div class="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section>
        <p class="mono-label">
          {{ t('sponsor.whereTitle') }}
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="p in PLACES"
            :key="p"
            class="flex gap-3 rounded-[6px] border border-(--line) bg-(--card) p-4"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-0.5 size-5 shrink-0 text-(--signal)"
            />
            <div>
              <p class="font-semibold text-(--ink)">
                {{ t(`sponsor.where.${p}.title`) }}
              </p>
              <p class="text-sm text-(--ink2)">
                {{ t(`sponsor.where.${p}.body`) }}
              </p>
            </div>
          </li>
        </ul>
        <p class="mt-4 text-sm text-(--ink2)">
          {{ t('sponsor.rules') }}
        </p>
      </section>

      <section class="rounded-[6px] border border-(--line) bg-(--card) p-6">
        <p class="mono-label">
          {{ t('sponsor.formTitle') }}
        </p>
        <p
          v-if="sent"
          class="mt-4 text-(--ink)"
        >
          {{ t('store.sentBody') }}
        </p>
        <form
          v-else
          class="mt-4 grid gap-3"
          @submit.prevent="send"
        >
          <input
            v-model="form.website"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="absolute -left-[9999px] size-px opacity-0"
          >
          <UInput
            v-model="form.company"
            :placeholder="t('sponsor.company')"
            size="lg"
            required
          />
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="t('store.f.email')"
            size="lg"
            autocomplete="email"
            required
          />
          <UTextarea
            v-model="form.message"
            :placeholder="t('sponsor.message')"
            :rows="3"
            autoresize
          />
          <HumanCheck
            ref="human"
            v-model="token"
          />
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
          />
          <UButton
            type="submit"
            size="lg"
            :loading="sending"
            icon="i-lucide-send"
            class="justify-center"
          >
            {{ t('sponsor.send') }}
          </UButton>
        </form>
      </section>
    </div>
  </div>
</template>
