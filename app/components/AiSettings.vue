<script setup lang="ts">
const { settings, save, clearKey, providers } = useAiSettings()

const open = ref(false)
const form = reactive({ useOwnKey: settings.value.useOwnKey, provider: settings.value.provider, model: settings.value.model, apiKey: settings.value.apiKey })

// Reset the form to the saved values each time the modal opens.
watch(open, (isOpen) => {
  if (isOpen) {
    form.useOwnKey = settings.value.useOwnKey
    form.provider = settings.value.provider
    form.model = settings.value.model
    form.apiKey = settings.value.apiKey
  }
})

const modeItems = [
  { label: 'Site default', value: false },
  { label: 'My own key', value: true }
]
const providerItems = computed(() => providers.map(p => ({ label: p.label, value: p.id })))
const current = computed(() => providers.find(p => p.id === form.provider) ?? providers[0]!)

function onSave() {
  save({ useOwnKey: form.useOwnKey, provider: form.provider, model: form.model.trim(), apiKey: form.apiKey.trim() })
  open.value = false
}
function onClear() {
  clearKey()
  form.apiKey = ''
  form.useOwnKey = false
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="AI settings"
    description="Use your own AI model. Your key is stored only in this browser and sent directly to your provider."
  >
    <UButton
      icon="i-lucide-settings-2"
      color="neutral"
      variant="ghost"
      size="xs"
      aria-label="AI settings"
    />

    <template #body>
      <div class="space-y-4">
        <UFormField
          label="Which AI to use"
          name="mode"
        >
          <USelect
            v-model="form.useOwnKey"
            :items="modeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <template v-if="form.useOwnKey">
          <UFormField
            label="Provider"
            name="provider"
          >
            <USelect
              v-model="form.provider"
              :items="providerItems"
              value-key="value"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Model"
            name="model"
            :help="`Default: ${current.defaultModel}`"
          >
            <UInput
              v-model="form.model"
              :placeholder="current.defaultModel"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="API key"
            name="apiKey"
          >
            <UInput
              v-model="form.apiKey"
              type="password"
              placeholder="Paste your API key"
              autocomplete="off"
              class="w-full"
            />
            <template #help>
              <span>
                Get a key from
                <a
                  :href="current.keyUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-primary hover:underline"
                >{{ current.label }}</a>
                <span v-if="current.note"> · {{ current.note }}</span>.
              </span>
            </template>
          </UFormField>
        </template>

        <p class="rounded-lg bg-elevated/60 px-3 py-2 text-xs text-muted">
          🔒 With <strong>your own key</strong>, it's stored only in this browser, sent directly to your provider, and has no question limit. <strong>Site default</strong> uses the shared (rate-limited) model.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="onClear"
        >
          Clear key
        </UButton>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            @click="open = false"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            size="sm"
            @click="onSave"
          >
            Save
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
