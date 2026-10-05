<script setup lang="ts">
/**
 * Sign in and sign up.
 *
 * One component because the two screens differ by one field and one verb, and
 * keeping them apart is how the error handling and the demo affordance drift
 * out of step.
 */
const props = defineProps<{
  mode: 'sign-in' | 'sign-up'
}>()

const { signIn, signUp, signInAsDemo, pending } = useAuth()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const name = ref('')
const error = ref('')
// Set when sign-up succeeds but Neon Auth wants the address verified first,
// so there is an account but no session yet. That is not an error.
const verifyEmail = ref(false)

const isSignUp = computed(() => props.mode === 'sign-up')

/**
 * Where to land afterwards. Only same-origin paths are honoured: taking
 * `?redirect=` at face value turns every sign-in link into an open redirect,
 * which is a phishing primitive — the attacker sends a genuine link to your
 * domain and the user arrives on theirs still trusting the address bar.
 */
const passQuery = computed(() => (route.query.redirect ? { redirect: String(route.query.redirect) } : {}))

const benefits = computed(() => [
  { icon: 'i-lucide-chart-no-axes-column-increasing', text: t('auth.benefitProgress') },
  { icon: 'i-lucide-messages-square', text: t('auth.benefitDiscuss') },
  { icon: 'i-lucide-list-checks', text: t('auth.benefitQuizzes') },
  { icon: 'i-lucide-badge-check', text: t('auth.benefitFree') }
])

const redirectTo = computed(() => {
  const raw = String(route.query.redirect ?? '')
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : localePath('/dashboard')
})

async function submit() {
  error.value = ''
  try {
    const user = isSignUp.value
      ? await signUp(email.value, password.value, name.value)
      : await signIn(email.value, password.value)

    if (!user && isSignUp.value) {
      verifyEmail.value = true
      return
    }
    if (!user) throw new Error('no session')
    await router.push(redirectTo.value)
  } catch (e) {
    const message = apiError(e)
    if (isSignUp.value && message) {
      error.value = message
      return
    }
    // Deliberately not "no account with that email" — telling an attacker
    // which addresses are registered is free account enumeration.
    error.value = isSignUp.value ? t('auth.errSignUp') : t('auth.errSignIn')
  }
}

async function demo() {
  error.value = ''
  try {
    await signInAsDemo()
    await router.push(redirectTo.value)
  } catch {
    error.value = t('auth.errDemo')
  }
}
</script>

<template>
  <!-- Blueprint auth: a graph-paper sheet with one ink-framed card on it —
       what an account gets you on the left, the form on the right. -->
  <div class="graph-paper flex min-h-[calc(100vh-var(--ui-header-height))] items-center justify-center p-4 sm:p-10">
    <div class="crosshair grid w-full max-w-4xl border-[1.5px] border-(--ink) bg-(--card) shadow-[10px_10px_0_var(--ice)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside class="graph-paper-navy hidden flex-col justify-between gap-8 border-e-[1.5px] border-(--ink) p-8 text-white md:flex">
        <div>
          <NuxtLink
            :to="localePath('/')"
            class="mb-8 block"
          >
            <AppLogo class="text-white" />
          </NuxtLink>
          <p class="font-mono text-[11px] uppercase tracking-[.14em] text-(--glow)">
            {{ t('auth.asideMeta') }}
          </p>
          <h2 class="mt-3 text-2xl font-extrabold tracking-[-0.02em]">
            {{ t('auth.asideTitle') }}
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-white/75">
            {{ t('auth.asideText') }}
          </p>
        </div>
        <ul class="space-y-3">
          <li
            v-for="b in benefits"
            :key="b.icon"
            class="flex items-start gap-3 text-sm text-white/90"
          >
            <UIcon
              :name="b.icon"
              class="mt-0.5 size-4 shrink-0 text-(--glow)"
            />
            {{ b.text }}
          </li>
        </ul>
      </aside>

      <div class="space-y-6 p-6 sm:p-8">
        <div>
          <NuxtLink
            :to="localePath('/')"
            class="mb-6 block md:hidden"
          >
            <AppLogo />
          </NuxtLink>
          <p class="eyebrow">
            {{ isSignUp ? t('auth.eyebrowSignUp') : t('auth.eyebrowSignIn') }}
          </p>
          <h1 class="bp-h3 mt-2 text-(--ink)">
            {{ isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle') }}
          </h1>
          <p class="mt-2 text-sm text-(--ink2)">
            {{ isSignUp ? t('auth.signUpDesc') : t('auth.signInDesc') }}
          </p>
        </div>

        <UAlert
          v-if="verifyEmail"
          color="primary"
          variant="subtle"
          icon="i-lucide-mail-check"
          :title="t('auth.verifyTitle')"
          :description="t('auth.verifyDesc', { email })"
        />

        <form
          v-else
          class="space-y-4"
          @submit.prevent="submit"
        >
          <UFormField
            v-if="isSignUp"
            :label="t('auth.name')"
            name="name"
          >
            <UInput
              v-model="name"
              autocomplete="name"
              size="lg"
              class="w-full"
              required
            />
          </UFormField>

          <UFormField
            :label="t('auth.email')"
            name="email"
          >
            <UInput
              v-model="email"
              type="email"
              autocomplete="email"
              size="lg"
              class="w-full"
              required
            />
          </UFormField>

          <UFormField
            :label="t('auth.password')"
            name="password"
            :hint="isSignUp ? t('auth.passwordHint') : undefined"
          >
            <UInput
              v-model="password"
              type="password"
              :autocomplete="isSignUp ? 'new-password' : 'current-password'"
              size="lg"
              class="w-full"
              :minlength="isSignUp ? 8 : undefined"
              required
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
            :description="error"
          />

          <UButton
            type="submit"
            block
            size="lg"
            :loading="pending"
            :icon="isSignUp ? 'i-lucide-user-plus' : 'i-lucide-log-in'"
            :label="isSignUp ? t('auth.submitSignUp') : t('auth.submitSignIn')"
          />
        </form>

        <!-- The demo is the secondary path: below the form, so the screen has
             one primary action. It is read-only (no comments, no progress). -->
        <div class="border-t border-dashed border-(--line) pt-4 text-center">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-(--ink2) hover:text-(--signal)"
            :disabled="pending"
            @click="demo"
          >
            <UIcon
              name="i-lucide-eye"
              class="size-4"
            />
            {{ t('auth.demoCta') }}
          </button>
        </div>

        <p class="text-center font-mono text-[11px] uppercase tracking-[.08em] text-(--ink2)">
          <template v-if="isSignUp">
            {{ t('auth.haveAccount') }}
            <ULink
              :to="{ path: localePath('/sign-in'), query: passQuery }"
              class="font-semibold text-(--signal)"
            >{{ t('auth.signInLink') }}</ULink>
          </template>
          <template v-else>
            {{ t('auth.noAccount') }}
            <ULink
              :to="{ path: localePath('/sign-up'), query: passQuery }"
              class="font-semibold text-(--signal)"
            >{{ t('auth.signUpLink') }}</ULink>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
