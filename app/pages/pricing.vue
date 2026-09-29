<script setup lang="ts">
/**
 * Pro plans. The free course stays free — Pro unlocks the lessons and videos
 * marked Pro, and pays for the rest. Checkout is Dodo Payments; the grant
 * happens in the webhook, never on the return redirect.
 */
defineI18nRoute({ locales: ['en'] })

const title = 'Pro — CRM Analytics Academy'
const description = 'Unlock every Pro lesson, quiz and lesson video on CRM Analytics Academy. Monthly or once, and the rest of the course stays free.'
useSeoMeta({ title, ogTitle: title, description, ogDescription: description })
defineOgImage('Docs', { title, description })

const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { pro } = useProgress()

const plans = [
  {
    key: 'monthly',
    name: 'Pro Monthly',
    price: '$9',
    per: 'per month',
    blurb: 'Everything in Pro, month to month. Cancel any time from your dashboard.',
    highlight: false
  },
  {
    key: 'lifetime',
    name: 'Pro Lifetime',
    price: '$99',
    per: 'once',
    blurb: 'Everything in Pro, for good — including every Pro lesson added later.',
    highlight: true
  }
] as const

const features = [
  'Every lesson marked Pro, with its quiz and interview questions',
  'Lesson videos, in your language as recordings are added',
  'Progress, points and the leaderboard, as on the free course',
  'Every free lesson stays free — Pro pays for them'
]

const busy = ref('')
const error = ref('')

async function buy(plan: 'monthly' | 'lifetime') {
  if (!isSignedIn.value) {
    await navigateTo(localePath('/sign-in'))
    return
  }
  busy.value = plan
  error.value = ''
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', { method: 'POST', body: { plan } })
    window.location.href = url
  } catch (e) {
    error.value = (e as { statusMessage?: string }).statusMessage || 'Checkout could not start. Please try again.'
    busy.value = ''
  }
}
</script>

<template>
  <div>
    <section class="bg-brand-wash border-b border-default">
      <UContainer class="py-14 text-center sm:py-20">
        <p class="im-meta text-primary">
          CRM Analytics Academy Pro
        </p>
        <h1 class="mx-auto mt-3 max-w-2xl text-4xl font-bold tracking-tighter text-highlighted sm:text-5xl text-balance">
          Go further, and keep the course free for everyone
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg text-muted text-pretty">
          Most of the course is free and always will be. Pro unlocks the lessons and videos marked
          Pro, and it is what pays for the rest.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-14">
      <ClientOnly>
        <UAlert
          v-if="pro"
          class="mx-auto mb-8 max-w-3xl"
          color="success"
          variant="subtle"
          icon="i-lucide-badge-check"
          title="You have Pro"
          description="Every Pro lesson is unlocked. Manage your plan from your dashboard."
        />
      </ClientOnly>

      <div class="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
        <article
          v-for="p in plans"
          :key="p.key"
          class="relative flex flex-col rounded-2xl border bg-default p-6"
          :class="p.highlight ? 'border-primary ring-1 ring-primary' : 'border-default'"
        >
          <UBadge
            v-if="p.highlight"
            class="absolute -top-3 left-6"
          >
            Best value
          </UBadge>
          <h2 class="text-lg font-semibold text-highlighted">
            {{ p.name }}
          </h2>
          <p class="mt-4">
            <span class="text-4xl font-bold tracking-tight text-highlighted">{{ p.price }}</span>
            <span class="ms-1.5 text-sm text-muted">{{ p.per }}</span>
          </p>
          <p class="mt-3 flex-1 text-sm text-muted">
            {{ p.blurb }}
          </p>
          <UButton
            block
            size="lg"
            class="mt-6"
            :variant="p.highlight ? 'solid' : 'outline'"
            :color="p.highlight ? 'primary' : 'neutral'"
            :loading="busy === p.key"
            :disabled="Boolean(busy) || pro"
            @click="buy(p.key)"
          >
            {{ pro ? 'You have Pro' : isSignedIn ? `Get ${p.name}` : 'Sign in to continue' }}
          </UButton>
        </article>
      </div>

      <p
        v-if="error"
        class="mt-4 text-center text-sm text-error"
      >
        {{ error }}
      </p>

      <ul class="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
        <li
          v-for="f in features"
          :key="f"
          class="flex gap-2.5 text-sm text-toned"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-0.5 size-4 shrink-0 text-primary"
          />
          {{ f }}
        </li>
      </ul>

      <p class="mx-auto mt-10 max-w-xl text-center text-xs text-muted">
        Payments are handled by Dodo Payments, the merchant of record, so tax and invoices are
        taken care of. Access is granted the moment your payment is confirmed.
      </p>
    </UContainer>
  </div>
</template>
