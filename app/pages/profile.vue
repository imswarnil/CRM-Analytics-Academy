<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const client = useDb()
const { user, profile, displayName, refresh } = useProfile()

useSeoMeta({ title: 'Your profile — CRM Analytics Academy', robots: 'noindex' })

const form = reactive({ full_name: '', username: '', bio: '' })
const saving = ref(false)
const savedAt = ref(0)
const error = ref('')

// Seed the form once the profile has loaded.
watch(profile, (p) => {
  if (p) {
    form.full_name = p.full_name ?? ''
    form.username = p.username ?? ''
    form.bio = p.bio ?? ''
  }
}, { immediate: true })

async function save() {
  if (!user.value) return
  saving.value = true
  error.value = ''
  const { error: err } = await client
    .from('profiles')
    .update({
      full_name: form.full_name.trim() || null,
      username: form.username.trim() || null,
      bio: form.bio.trim() || null
    })
    .eq('id', user.value.id)

  if (err) {
    error.value = err.code === '23505' ? 'That username is already taken.' : err.message
  } else {
    await refresh()
    savedAt.value = Date.now()
  }
  saving.value = false
}

// --- AI assistant settings (stored in this browser, never on our servers) ---
const ai = useAiSettings()
const aiForm = reactive({ provider: ai.settings.value.provider, model: ai.settings.value.model, apiKey: ai.settings.value.apiKey })
const aiSaved = ref(0)
const providerItems = ai.providers.map(p => ({ label: p.label, value: p.id }))
const currentProvider = computed(() => ai.providers.find(p => p.id === aiForm.provider) ?? ai.providers[0]!)

watchEffect(() => {
  aiForm.provider = ai.settings.value.provider
  aiForm.model = ai.settings.value.model
  aiForm.apiKey = ai.settings.value.apiKey
})

function saveAi() {
  ai.save({ provider: aiForm.provider, model: aiForm.model.trim(), apiKey: aiForm.apiKey.trim() })
  aiSaved.value = Date.now()
}
function clearAi() {
  ai.clearKey()
  aiForm.apiKey = ''
  aiSaved.value = Date.now()
}
</script>

<template>
  <UContainer class="max-w-2xl py-10 sm:py-14">
    <div class="mb-8 flex items-center gap-4">
      <UAvatar
        :src="profile?.avatar_url || undefined"
        :alt="displayName"
        size="xl"
        icon="i-lucide-user"
      />
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          {{ displayName }}
        </h1>
        <p class="text-sm text-muted">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="save"
    >
      <UFormField
        label="Full name"
        name="full_name"
      >
        <UInput
          v-model="form.full_name"
          placeholder="Your name"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Username"
        name="username"
        help="Shown on your comments, resources, and projects."
      >
        <UInput
          v-model="form.username"
          placeholder="username"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Bio"
        name="bio"
      >
        <UTextarea
          v-model="form.bio"
          :rows="3"
          autoresize
          placeholder="A little about you and your CRM Analytics journey…"
          class="w-full"
        />
      </UFormField>

      <div class="flex items-center gap-3">
        <UButton
          type="submit"
          :loading="saving"
          color="primary"
        >
          Save changes
        </UButton>
        <Transition
          enter-active-class="transition"
          enter-from-class="opacity-0"
          leave-active-class="transition"
          leave-to-class="opacity-0"
        >
          <span
            v-if="savedAt"
            :key="savedAt"
            class="text-sm text-success"
          >Saved ✓</span>
        </Transition>
      </div>

      <p
        v-if="error"
        class="text-sm text-error"
      >
        {{ error }}
      </p>
    </form>

    <!-- AI assistant: bring your own model + key -->
    <section class="mt-12 rounded-2xl border border-default bg-elevated/30 p-6">
      <div class="flex items-center gap-2.5">
        <div class="flex size-9 items-center justify-center rounded-full bg-primary/10">
          <UIcon
            name="i-lucide-sparkles"
            class="size-4.5 text-primary"
          />
        </div>
        <div>
          <h2 class="font-semibold text-highlighted">
            AI assistant
          </h2>
          <p class="text-xs text-muted">
            Choose your AI model and use your own API key across the site's chat.
          </p>
        </div>
      </div>

      <div class="mt-6 space-y-5">
        <UFormField
          label="Provider"
          name="ai_provider"
        >
          <USelect
            v-model="aiForm.provider"
            :items="providerItems"
            value-key="value"
            class="w-full sm:max-w-xs"
          />
        </UFormField>

        <UFormField
          label="Model"
          name="ai_model"
          :help="`Default: ${currentProvider.defaultModel}`"
        >
          <UInput
            v-model="aiForm.model"
            :placeholder="currentProvider.defaultModel"
            class="w-full sm:max-w-md"
          />
        </UFormField>

        <UFormField
          label="API key"
          name="ai_key"
        >
          <UInput
            v-model="aiForm.apiKey"
            type="password"
            placeholder="Paste your API key"
            autocomplete="off"
            class="w-full sm:max-w-md"
          />
          <template #help>
            <span>
              Get a key from
              <a
                :href="currentProvider.keyUrl"
                target="_blank"
                rel="noopener"
                class="text-primary hover:underline"
              >{{ currentProvider.label }}</a>
              <span v-if="currentProvider.note"> · {{ currentProvider.note }}</span>.
            </span>
          </template>
        </UFormField>

        <p class="rounded-lg bg-default px-3 py-2.5 text-xs text-muted">
          🔒 Your key is saved only in this browser and sent directly to your chosen provider when you chat. It is never stored on our servers. Leave it blank to use the site's shared model.
        </p>

        <div class="flex items-center gap-3">
          <UButton
            color="primary"
            :loading="false"
            @click="saveAi"
          >
            Save AI settings
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            @click="clearAi"
          >
            Clear key
          </UButton>
          <Transition
            enter-active-class="transition"
            enter-from-class="opacity-0"
            leave-active-class="transition"
            leave-to-class="opacity-0"
          >
            <span
              v-if="aiSaved"
              :key="aiSaved"
              class="text-sm text-success"
            >Saved ✓</span>
          </Transition>
        </div>
      </div>
    </section>
  </UContainer>
</template>
